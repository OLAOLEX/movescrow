/**
 * Send OTP to restaurant phone number
 * POST /api/auth/send-otp
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate 6-digit OTP
    // For testing: Use universal OTP "123456" if no SMS service configured
    // In production, use random OTP
    const hasSMSService = process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const otp = hasSMSService 
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456'; // Universal test OTP when no SMS service
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to Supabase
    const { error: authError } = await supabase
      .from('restaurant_auth')
      .upsert({
        phone,
        otp_code: otp,
        otp_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'phone'
      });

    if (authError) {
      console.error('Error saving OTP:', authError);
      return res.status(500).json({ error: 'Failed to save OTP' });
    }

    // Send OTP via SMS
    try {
      await sendSMS(phone, `Your Movescrow OTP: ${otp}. Valid for 10 minutes.`);
    } catch (smsError) {
      console.error('Error sending SMS:', smsError);
      // Still return success even if SMS fails (OTP saved to DB)
    }

    return res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Send SMS using Termii or Twilio
 */
async function sendSMS(phone, message) {
  // Try Termii first (Nigerian SMS provider)
  if (process.env.TERMII_API_KEY) {
    try {
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          from: 'Movescrow', // Your sender ID (needs to be approved by Termii)
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: process.env.TERMII_API_KEY
        })
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.error('Termii SMS error:', error);
    }
  }

  // Fallback to Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
          },
          body: new URLSearchParams({
            To: phone,
            From: fromNumber,
            Body: message
          })
        }
      );

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.error('Twilio SMS error:', error);
    }
  }

  // If both fail, log for manual sending
  console.log(`SMS not sent. Phone: ${phone}, Message: ${message}`);
}

