// pages/api/veriff/create-session.js
import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Simple payload based on successful Postman request
    const payload = {
      verification: {
        callback: "https://bizflip-o.vercel.app/verification-callback",
        person: {
          firstName: "Test",
          lastName: "User"
        },
        document: {
          type: "PASSPORT",
          country: "US"
        },
        vendorData: userId
      }
    };
    
    console.log("Veriff API Key:", process.env.VERIFF_API_KEY?.substring(0, 5) + "...");
    console.log("Veriff payload:", JSON.stringify(payload, null, 2));
    
    // Create HMAC signature
    const sharedSecretKey = process.env.VERIFF_SHARED_SECRET;
    const hmacSignature = crypto
      .createHmac('sha256', sharedSecretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    // Make request to Veriff API
    const response = await axios.post('https://stationapi.veriff.com/v1/sessions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': process.env.VERIFF_API_KEY,
        'X-HMAC-SIGNATURE': hmacSignature
      },
      // Add timeout to prevent hanging requests
      timeout: 10000
    });
    
    // Return the URL and session data
    return res.status(200).json({
      sessionUrl: response.data.verification.url,
      sessionId: response.data.verification.id,
      sessionToken: response.data.verification.sessionToken
    });
  } catch (error) {
    console.error('Veriff session creation error:', error);
    
    let errorDetails = "Unknown error";
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
      errorDetails = JSON.stringify(error.response.data);
    } else if (error.request) {
      console.error("No response received");
      errorDetails = "No response received from verification service";
    } else {
      console.error("Error message:", error.message);
      errorDetails = error.message;
    }
    
    return res.status(500).json({ 
      error: 'Failed to create verification session',
      details: errorDetails
    });
  }
}