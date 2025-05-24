// pages/verification-callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function VerificationCallback() {
  const router = useRouter();
  
  useEffect(() => {
    if (router.isReady) {
      // Get status from URL parameters
      const { status, sessionId } = router.query;
      
      if (status && sessionId) {
        // This is a server-side callback, likely from non-iframe flow
        // Notify parent window if possible using postMessage
        if (window.opener) {
          window.opener.postMessage({ status, sessionId }, window.location.origin);
          window.close();
        } else {
          // Redirect back to verification page with status
          router.push({
            pathname: '/dox',
            query: { status, sessionId }
          });
        }
      }
    }
  }, [router.isReady, router.query]);
  
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Processing verification...</h2>
        <p>Please wait while we complete your verification.</p>
      </div>
    </div>
  );
}