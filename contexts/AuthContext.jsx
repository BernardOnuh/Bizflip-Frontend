import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import axios from 'axios';

// Using proxied API URL from Next.js config
const API_URL = '/api';

// Create the auth context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Auth state
  const [authToken, setAuthToken] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authInProgress, setAuthInProgress] = useState(false);
  
  // Ref to track initialization
  const initializationComplete = useRef(false);
  const signaturePending = useRef(false);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    // Increase timeout to handle slow network connections
    timeout: 15000
  });

  // Add auth token to requests if available
  api.interceptors.request.use(
    (config) => {
      if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      // If we have a wallet address, we can use that as basic user info
      if (address) {
        setUser({ address });
      }
    }
    
    // Mark initialization as complete
    initializationComplete.current = true;
  }, [address]);

  // Handle account changes
  useEffect(() => {
    if (isConnected && !authToken && !loading && initializationComplete.current) {
      // Only start auth if we're not already in progress
      if (!authInProgress && !signaturePending.current) {
        startAuthFlow();
      }
    }

    // Clear auth state when disconnected
    if (!isConnected && authToken) {
      logout();
    }
  }, [isConnected, address, authToken, loading]);

  // Start the authentication flow
  const startAuthFlow = async () => {
    if (!address || authInProgress) return;
    
    setAuthInProgress(true);
    setError(null);
    
    try {
      console.log('Starting authentication flow for address:', address);
      
      // Request authentication message
      const message = await requestAuthMessage();
      
      // If we have a message, proceed to sign
      if (message) {
        await signAndVerify();
      }
    } catch (err) {
      console.error("Authentication flow error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setAuthInProgress(false);
    }
  };

  // Request authentication message from backend
  const requestAuthMessage = async () => {
    if (!address) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Requesting auth message for address:', address);
      
      const response = await api.post('/user/', {
        address: address
      });
      
      console.log('Auth message received:', response.data);
      const message = response.data.message;
      setAuthMessage(message);
      return message;
    } catch (err) {
      // Enhanced error handling
      let errorMessage = "Failed to get authentication message";
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        console.error('Auth message API error:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        // Request made but no response received
        errorMessage = "No response from authentication server";
        console.error('Auth message network error:', err.request);
      } else {
        // Something else went wrong
        errorMessage = err.message || "Unknown error";
        console.error('Auth message error:', err);
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign message and verify with backend
  const signAndVerify = async () => {
    if (!authMessage || !address) {
      setError('No authentication message or wallet address');
      return null;
    }

    // Prevent multiple signature requests
    if (signaturePending.current) {
      console.log('Signature already pending, skipping');
      return null;
    }

    setLoading(true);
    setError(null);
    signaturePending.current = true;

    try {
      console.log('Signing message:', authMessage);
      
      // Request signature from wallet with a timeout
      const signPromise = signMessageAsync({
        message: authMessage,
      });
      
      // Add a timeout to handle when wallet UIs are stuck
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Signature request timed out. Please try again.")), 30000);
      });
      
      // Race the signature against the timeout
      const signature = await Promise.race([signPromise, timeoutPromise]);

      console.log('Signature obtained, verifying with backend...');

      // Verify signature with backend
      const verifyResponse = await api.put('/user/verify', {
        address: address,
        signature: signature
      });

      console.log('Verification successful:', verifyResponse.data);

      // Store the JWT token
      const token = verifyResponse.data.token;
      setAuthToken(token);
      localStorage.setItem('authToken', token);
      
      // Reset auth message
      setAuthMessage(null);
      
      // Set basic user data instead of fetching from endpoint
      setUser({ 
        address,
        isAuthenticated: true,
        // You can add any additional fields available in the verify response
        ...(verifyResponse.data.user || {})
      });
      
      return token;
    } catch (err) {
      console.error('Signature/verification error:', err);
      
      let errorMessage;
      
      // Handle user rejection separately
      if (err.code === 4001 || err.message?.includes('rejected')) {
        errorMessage = "Signature request was declined. Please try again.";
      } else if (err.message?.includes('timed out')) {
        errorMessage = "Signature request timed out. Please try again.";
      } else if (err.response) {
        // Backend verification error
        errorMessage = err.response.data?.error || "Signature verification failed";
      } else {
        errorMessage = err.message || "An error occurred during authentication";
      }
      
      setError(errorMessage);
      // Clear auth message if signing failed
      setAuthMessage(null);
      return null;
    } finally {
      setLoading(false);
      signaturePending.current = false;
    }
  };

  // Manually trigger authentication (for retry button)
  const triggerAuthentication = async () => {
    if (authInProgress || !address) return;
    
    // Clear any previous errors
    setError(null);
    
    // Start fresh auth flow
    await startAuthFlow();
  };

  // Logout function
  const logout = () => {
    // Disconnect wallet
    disconnect();
    
    // Clear all auth state
    setAuthToken(null);
    setAuthMessage(null);
    setUser(null);
    
    // Remove from localStorage
    localStorage.removeItem('authToken');
    
    console.log('User logged out');
  };

  // Context value
  const value = {
    isAuthenticated: !!authToken,
    authToken,
    user,
    loading,
    error,
    authMessage,
    signAndVerify,
    logout,
    requestAuthMessage,
    triggerAuthentication
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}