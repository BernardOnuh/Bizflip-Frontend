import axios from 'axios';

// Changed to use the proxied API URL through Next.js rewrites
const API_URL = '/api';

// Create auth-specific axios instance
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API service
const authService = {
  // Request authentication message
  requestAuthMessage: async (address) => {
    try {
      const response = await authAPI.post('/user/', { address });
      return response.data;
    } catch (error) {
      console.error('Error requesting auth message:', error);
      throw error.response?.data || error;
    }
  },

  // Verify signature
  verifySignature: async (address, signature) => {
    try {
      const response = await authAPI.put('/user/verify', { address, signature });
      return response.data;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error.response?.data || error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await authAPI.get('/user/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      if (error.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem('authToken');
      }
      throw error.response?.data || error;
    }
  },

  // Check if token is valid
  validateToken: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const response = await authAPI.get('/user/validate-token');
      return response.status === 200;
    } catch (error) {
      console.error('Error validating token:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
      return false;
    }
  },
};

export default authService;