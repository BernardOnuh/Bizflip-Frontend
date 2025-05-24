import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import gesture from '../../public/images/imgs/gesture.png';
import swipe from '../../public/images/imgs/swipe.png';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '../Footer/footer';

const Hero = () => {
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { 
    isAuthenticated,
    loading, 
    error: authError, 
    signAndVerify, 
    authMessage,
    requestAuthMessage 
  } = useAuth();
  
  // Component state
  const [isClient, setIsClient] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clear errors when auth state changes
  useEffect(() => {
    if (isAuthenticated || !isConnected) {
      setShowError(false);
    }
  }, [isAuthenticated, isConnected]);

  // Handle pending navigation after authentication
  useEffect(() => {
    if (isAuthenticated && pendingNavigation && !loading) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [isAuthenticated, pendingNavigation, loading, router]);

  // Monitor auth errors
  useEffect(() => {
    if (authError) {
      setShowError(true);
      setErrorMessage(authError);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [authError]);

  // Main authentication flow
  const initiateAuth = useCallback(async (route) => {
    // Don't do anything if already authenticated
    if (isAuthenticated) {
      if (route) router.push(route);
      return;
    }

    try {
      setWalletLoading(true);
      
      // Step 1: If wallet not connected, connect it first
      if (!isConnected) {
        if (openConnectModal) {
          setPendingNavigation(route);
          openConnectModal();
        } else {
          throw new Error("Wallet connection not available. Please try again.");
        }
        return; // Exit and wait for connection
      }
      
      // Step 2: If connected but not authenticated, get auth message and sign
      if (isConnected && !isAuthenticated) {
        setPendingNavigation(route);
                
        // Authentication will happen automatically through useEffect in AuthContext
        // Just make sure we have the intended destination saved
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setShowError(true);
      setErrorMessage(err.message || "Failed to authenticate. Please try again.");
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setWalletLoading(false);
    }
  }, [isAuthenticated, isConnected, openConnectModal, router]);

  // Handle data fetching for connected wallet (original code)
  async function fetchData(account) {
    // const res = await getDox(account);
    // if (res.dox) {
    //   router.replace('/qna');
    // }
  }

  // Handler for wallet connection button
  const handleConnectWallet = () => {
    initiateAuth(); // No destination route needed
  };

  // Handle navigation to protected pages
  const handleProtectedNavigation = (route) => {
    initiateAuth(route);
  };

  return (
    <div className="absolute w-full h-screen top-0 pt-[75px] box-border">
      {isClient && isConnected ? (
        <div className="mx-auto bg-[url('/images/imgs/BizFlip.png')] bg-cover bg-center h-full min-h-[calc(100vh-80px)] relative z-10 md:bg-[url('/images/imgs/BizFlip.png')] sm:bg-[url('/images/imgs/BizFlip_Mobile.png')]">
          <div className="mx-auto max-w-[1200px] min-h-inherit w-[90%] flex items-center justify-center h-full bg-transparent flex-col">
            <div className="p-6 text-2xl text-[#f0f0f0] w-auto text-center font-extrabold leading-relaxed tracking-wide">
              Would you like to verify & dox your profile and become more trusted?
            </div>
            
            <div className="flex flex-row justify-center gap-6 p-4 mt-4">
              <button 
                onClick={() => handleProtectedNavigation('/dox')}
                disabled={loading || walletLoading}
                className={`px-8 py-3 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-none rounded-lg font-extrabold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${(loading || walletLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Authenticating...' : 'Dox'}
              </button>
              <button 
                onClick={() => handleProtectedNavigation('/qna')}
                disabled={loading || walletLoading}
                className={`px-8 py-3 cursor-pointer bg-[#f0f0f0] hover:bg-gray-200 border-none rounded-lg font-extrabold text-lg text-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${(loading || walletLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Authenticating...' : 'Maybe later'}
              </button>
            </div>
            
            {/* Authentication Status Indicators */}
            {(loading || walletLoading) && (
              <div className="mt-6 flex items-center justify-center text-white bg-blue-500/30 px-6 py-3 rounded-lg">
                <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loading ? 'Verifying signature...' : 'Connecting wallet...'}
              </div>
            )}
            
            {/* Error Message */}
            {showError && (
              <div className="mt-6 text-white bg-red-500/40 px-6 py-3 rounded-lg text-center max-w-md">
                <p className="font-medium">Authentication Error</p>
                <p className="text-sm mt-1">{errorMessage || "Something went wrong. Please try again."}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto bg-[url('/images/imgs/BizFlip.png')] bg-cover bg-center h-full min-h-[calc(100vh-80px)] relative z-10 md:bg-[url('/images/imgs/BizFlip.png')] sm:bg-[url('/images/imgs/BizFlip_Mobile.png')] flex items-center">
          <div className="mx-auto max-w-[1200px] w-[90%] flex items-center justify-center h-full bg-transparent flex-col">
            <div className="flex justify-center items-center h-[120px] mb-8">
              <Image 
                src={gesture} 
                alt="logo" 
                className="w-[35px] h-[40px] mt-[-40px] md:w-[35px] md:h-[40px] sm:w-[25px] sm:h-[30px]"
              />
              <p className="text-[#f0f0f0] text-[80px] font-extrabold p-2.5 md:text-[80px] sm:text-[42px] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Tap & Swipe
              </p>
              <Image 
                src={swipe} 
                alt="logo" 
                className="w-[35px] h-[40px] mt-[-40px] md:w-[35px] md:h-[40px] sm:w-[25px] sm:h-[30px]"
              />
            </div>
            <div className="mt-6 flex flex-col items-center">
              <button
                onClick={handleConnectWallet}
                disabled={loading || walletLoading}
                className={`px-12 py-6 bg-gradient-to-r from-[rgba(63,94,251,0.7)] to-[rgba(87,111,230,0.7)] hover:from-[#fc466b] hover:to-[#fd6d8f] rounded-[20px] cursor-pointer transition-all duration-500 text-white text-[28px] font-extrabold border-none shadow-[0px_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0px_10px_25px_rgba(0,0,0,0.5)] transform hover:scale-105 focus:outline-none tracking-wide ${(loading || walletLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading || walletLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : 'Connect Wallet'}
              </button>
              
              {/* Error Message */}
              {showError && (
                <div className="mt-6 text-white bg-red-500/40 px-6 py-3 rounded-lg text-center max-w-md">
                  <p className="font-medium">Authentication Error</p>
                  <p className="text-sm mt-1">{errorMessage || "Something went wrong. Please try again."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default Hero;