/**
 * Send OTP to restaurant phone number
 * POST /api/auth/send-otp
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only initialize Supabase if both variables are present
let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
} else {
  console.warn('Supabase not configured - using test mode');
}

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
    // For testing: Use universal OTP "123456" if no SMS service configured OR no Supabase
    // In production, use random OTP
    const hasSMSService = process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
    const useTestOTP = !supabase || !hasSMSService;
    const otp = useTestOTP 
      ? '123456' // Universal test OTP when no SMS service or Supabase
      : Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to Supabase (if configured) or use in-memory storage for testing
    let otpSaved = false;
    if (supabase) {
      try {
        const { data, error: authError } = await supabase
          .from('restaurant_auth')
          .upsert({
            phone,
            otp_code: otp,
            otp_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'phone'
          })
          .select();

        if (authError) {
          console.error('Error saving OTP to Supabase:', authError);
          console.error('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
          console.error('Supabase Key:', supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Not set');
          // Continue anyway - we'll log the OTP for manual verification
        } else {
          otpSaved = true;
          console.log('OTP saved to Supabase successfully:', data);
        }
      } catch (error) {
        console.error('Exception saving OTP to Supabase:', error);
      }
    } else {
      console.log(`Test mode: OTP ${otp} generated for ${phone} (not saved to database)`);
    }

    // Send OTP via SMS (skip if using universal test OTP)
    let smsSent = false;
    if (otp !== '123456') {
      try {
        console.log('Attempting to send SMS via Termii...');
        await sendSMS(phone, `Your Movescrow OTP: ${otp}. Valid for 10 minutes.`);
        smsSent = true;
        console.log('SMS sent successfully via Termii');
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        // Still return success even if SMS fails (OTP saved to DB)
      }
    } else {
      console.log(`Test OTP ${otp} generated for ${phone} (SMS skipped - test mode)`);
    }
    
    // Log OTP for debugging (remove in production)
    console.log(`Generated OTP for ${phone}: ${otp} (Saved to DB: ${otpSaved}, SMS Sent: ${smsSent})`);

    // If Supabase save failed but we have Supabase configured, include OTP in response for debugging
    // This allows manual testing while we fix the database issue
    const shouldIncludeOTP = !otpSaved && supabase;
    
    return res.json({
      success: true,
      message: otp === '123456' 
        ? 'OTP generated (test mode - use 123456)'
        : smsSent 
          ? 'OTP sent successfully via SMS'
          : otpSaved
            ? 'OTP generated and saved (SMS may not have been sent - check logs)'
            : 'OTP generated (database save may have failed - check logs)',
      expiresIn: 600, // 10 minutes in seconds
      testMode: otp === '123456', // Indicate test mode
      // Include OTP in response for debugging if database save failed
      ...(shouldIncludeOTP && { otp: otp }), // Only include if save failed
      debug: {
        otpSaved,
        smsSent,
        hasSupabase: !!supabase,
        hasTermii: !!process.env.TERMII_API_KEY,
        supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
        supabaseKey: supabaseServiceKey ? `Set (${supabaseServiceKey.length} chars)` : 'Not set',
        ...(supabaseError && { 
          supabaseError: {
            code: supabaseError.code,
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint
          }
        })
      }
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
      const termiiUrl = 'https://api.ng.termii.com/api/sms/send';
      const requestBody = {
        to: phone,
        from: 'Movescrow', // Your sender ID (needs to be approved by Termii)
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY
      };
      
      console.log('Sending SMS via Termii:', { url: termiiUrl, to: phone, from: requestBody.from });
      
      const response = await fetch(termiiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.text();
      console.log('Termii response status:', response.status);
      console.log('Termii response:', responseData);

      if (response.ok) {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Termii SMS sent successfully:', jsonData);
          return;
        } catch (e) {
          console.log('Termii response is not JSON, but status is OK');
          return;
        }
      } else {
        console.error('Termii SMS failed:', response.status, responseData);
        throw new Error(`Termii API error: ${response.status} - ${responseData}`);
      }
    } catch (error) {
      console.error('Termii SMS error:', error);
      throw error; // Re-throw to be caught by caller
    }
  } else {
    console.warn('TERMII_API_KEY not configured');
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

