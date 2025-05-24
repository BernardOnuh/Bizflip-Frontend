// components/Dox/dox.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';

// Import VeriffVerification with dynamic loading to avoid SSR issues
const VeriffVerification = dynamic(
  () => import('./VeriffVerification'),
  { ssr: false }
);

export default function Dox() {
  const router = useRouter();
  const { address: account, isConnected } = useAccount();
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This effect runs once after mounting to indicate we're on the client
  useEffect(() => {
    setIsClient(true);
    
    // If the user is coming back from Veriff redirect with status in URL
    if (router.query.status) {
      handleVerificationCallback(router.query.status);
    }
  }, [router.query]);

  // Handler for verification completion
  const handleVerificationCallback = (status) => {
    setVerificationComplete(true);
    console.log("Verification completed with status:", status);
  };

  // Only render the actual UI contents after client-side hydration
  if (!isClient) {
    return (
      <div className="absolute w-full  h-screen top-0 pt-20 box-border">
        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 min-h-[calc(100vh-80px)] pb-12 relative z-10">
          <div className="max-w-6xl w-11/12 mx-auto flex items-center justify-center flex-col min-h-inherit mb-6 bg-transparent">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 ">Identity Verification</h1>
              <p className="text-white">Complete the verification process to continue</p>
            </div>
            <div className="w-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl">
              <div className="w-full h-80vh flex justify-center items-center">
                <div className="text-white">Loading verification service...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute w-full h-screen top-0 pt-20 box-border">
      <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 min-h-[calc(100vh-80px)] pb-12 relative z-10">
        <div className="max-w-6xl w-11/12 mx-auto flex items-center justify-center flex-col min-h-inherit mb-6 bg-transparent">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
            <p className="text-white">Complete the verification process to continue</p>
          </div>
          
          {!isConnected ? (
            <div className="w-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl text-center">
              <p className="text-white mb-4">Please connect your wallet to proceed with verification</p>
              {/* Your wallet connect button component here */}
              <button className="px-6 py-3 bg-white rounded-lg font-semibold hover:bg-gray-100 transition">
                Connect Wallet
              </button>
            </div>
          ) : verificationComplete ? (
            <div className="w-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl text-center">
              <div className="text-white mb-6">
                <h2 className="text-2xl font-bold mb-3">Verification Submitted</h2>
                <p>Your verification has been submitted successfully. We'll notify you once the review is complete.</p>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-white rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="w-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl">
              <VeriffVerification onComplete={handleVerificationCallback} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}