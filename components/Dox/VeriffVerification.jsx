// components/Dox/VeriffVerification.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';

const VeriffVerification = ({ onComplete }) => {
  const { address: account } = useAccount();
  const [veriffUrl, setVeriffUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Veriff session
  const createVeriffSession = async () => {
    try {
      setIsLoading(true);
      console.log("Creating Veriff session for address:", account);
      const response = await axios.get(`/api/veriff/create-session?userId=${account}`);
      console.log("Veriff session created:", response.data);
      
      // Store session data
      setVeriffUrl(response.data.sessionUrl);
      setSessionId(response.data.sessionId);
      setIsLoading(false);
    } catch (err) {
      console.error("Error creating Veriff session:", err);
      let errorMessage = "Failed to initialize verification";
      if (err.response && err.response.data) {
        errorMessage += `: ${err.response.data.details || err.response.data.error || err.message}`;
      } else {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Redirect to Veriff
  const handleStartVerification = () => {
    if (veriffUrl) {
      // Store session info in localStorage for retrieval after redirect
      localStorage.setItem('veriffSessionId', sessionId);
      
      // Redirect to Veriff verification URL
      window.location.href = veriffUrl;
    }
  };

  // Initialize
  useEffect(() => {
    if (!account) {
      setError("Please connect your wallet to continue with verification");
      setIsLoading(false);
      return;
    }

    createVeriffSession();
  }, [account]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <div className="text-white text-lg">Initializing verification service...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex justify-center items-center flex-col">
        <div className="bg-red-500/20 backdrop-blur-sm p-6 rounded-xl mb-6 max-w-lg">
          <div className="text-red-200 font-medium text-center">{error}</div>
        </div>
        <button 
          onClick={createVeriffSession}
          className="px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold cursor-pointer hover:bg-gray-100 transition transform hover:scale-105 shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] flex justify-center items-center">
      <div className="max-w-2xl w-full backdrop-blur-md bg-white/10 p-10 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Secure Identity Verification</h2>
          <p className="text-gray-200 text-lg">You'll be redirected to Veriff to complete the identity verification process.</p>
          <div className="flex flex-col space-y-4 mt-6">
            <div className="flex items-center bg-white/10 rounded-lg p-3">
              <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <span className="text-white text-sm">Have your government-issued ID ready</span>
            </div>
            <div className="flex items-center bg-white/10 rounded-lg p-3">
              <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-white text-sm">Ensure good lighting for camera verification</span>
            </div>
            <div className="flex items-center bg-white/10 rounded-lg p-3">
              <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-white text-sm">Process is secure and encrypted</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleStartVerification}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center"
        >
          Start Verification
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <p className="text-gray-300 text-xs text-center mt-6">
          By proceeding, you agree to our verification process and consent to the secure processing of your identity documents.
        </p>
      </div>
    </div>
  );
};

export default VeriffVerification;