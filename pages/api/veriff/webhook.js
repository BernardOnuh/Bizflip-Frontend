// pages/api/veriff/webhook.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the signature
    const signature = req.headers['x-hmac-signature'];
    const sharedSecretKey = process.env.VERIFF_SHARED_SECRET;
    
    // Create expected signature
    const hmac = crypto.createHmac('sha256', sharedSecretKey);
    hmac.update(JSON.stringify(req.body));
    const expectedSignature = hmac.digest('hex');
    
    // Validate signature
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Process webhook payload
    const { verification } = req.body;
    
    if (!verification) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    
    // Handle different verification statuses
    const { status, id, vendorData } = verification;
    console.log(`Verification ${id} for user ${vendorData} is now ${status}`);
    
    // Update user verification status in your database
    // ...
    
    // Return success response
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}