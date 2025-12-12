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
    let supabaseError = null;
    if (supabase) {
      try {
        console.log('Attempting to save OTP to Supabase...');
        console.log('Phone:', phone);
        console.log('OTP:', otp);
        console.log('Expires at:', expiresAt.toISOString());
        
        // Try to upsert with updated_at, but handle gracefully if column doesn't exist
        const upsertData = {
          phone,
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString()
        };
        
        // Only include updated_at if column exists (handled by Supabase automatically)
        // If column doesn't exist, Supabase will ignore it
        try {
          upsertData.updated_at = new Date().toISOString();
        } catch (e) {
          // Ignore if date creation fails
        }
        
        const { data, error: authError } = await supabase
          .from('restaurant_auth')
          .upsert(upsertData, {
            onConflict: 'phone'
          })
          .select();

        if (authError) {
          supabaseError = authError;
          console.error('Error saving OTP to Supabase:', authError);
          console.error('Error code:', authError.code);
          console.error('Error message:', authError.message);
          console.error('Error details:', authError.details);
          console.error('Error hint:', authError.hint);
          console.error('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
          console.error('Supabase Key:', supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Not set');
          // Continue anyway - we'll return OTP in response for manual testing
        } else if (data) {
          otpSaved = true;
          console.log('OTP saved to Supabase successfully:', data);
        } else {
          console.warn('Supabase upsert returned no data and no error');
        }
      } catch (error) {
        supabaseError = error;
        console.error('Exception saving OTP to Supabase:', error);
        console.error('Exception stack:', error.stack);
      }
    } else {
      console.log(`Test mode: OTP ${otp} generated for ${phone} (not saved to database)`);
    }

    // Send OTP via SMS (skip if using universal test OTP)
    let smsSent = false;
    let smsError = null;
    if (otp !== '123456') {
      try {
        console.log('Attempting to send SMS via Termii...');
        await sendSMS(phone, `Your Movescrow OTP: ${otp}. Valid for 10 minutes.`);
        smsSent = true;
        console.log('SMS sent successfully via Termii');
      } catch (smsErrorCaught) {
        smsError = smsErrorCaught;
        console.error('Error sending SMS:', smsErrorCaught);
        console.error('SMS Error name:', smsErrorCaught.name);
        console.error('SMS Error message:', smsErrorCaught.message);
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
        termiiKeyLength: process.env.TERMII_API_KEY ? process.env.TERMII_API_KEY.length : 0,
        ...(supabaseError && { 
          supabaseError: {
            code: supabaseError.code,
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint
          }
        }),
        ...(smsError && {
          smsError: {
            name: smsError.name,
            message: smsError.message
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
    // Try sender IDs in order of preference
    // 1. Custom sender ID from env var (if set)
    // 2. "Movescrow" (needs approval)
    // 3. Default sender IDs that work without approval
    const senderIds = [
      process.env.TERMII_SENDER_ID, // Custom from env var
      'Movescrow', // Your brand name (needs approval)
      'Talert', // Default Termii sender ID (usually works)
      'SecureOTP', // Another default
      'N-Alert' // Nigerian default
    ].filter(Boolean); // Remove undefined values
    
    let lastError = null;
    
    // Try each sender ID until one works
    for (const senderId of senderIds) {
      try {
        const termiiUrl = 'https://api.ng.termii.com/api/sms/send';
        const requestBody = {
          to: phone,
          from: senderId,
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: process.env.TERMII_API_KEY
        };
      
        console.log(`Trying sender ID: ${senderId}`);
        console.log('URL:', termiiUrl);
        console.log('To:', phone);
        console.log('From:', senderId);
      
      const response = await fetch(termiiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

        const responseText = await response.text();
        console.log(`Termii response status for ${senderId}:`, response.status);
        console.log(`Termii response text:`, responseText);

        if (response.ok) {
          try {
            const jsonData = JSON.parse(responseText);
            // Check if response indicates success
            if (jsonData.code === 404 && jsonData.message && jsonData.message.includes('ApplicationSenderId not found')) {
              // This sender ID doesn't exist, try next one
              console.warn(`Sender ID "${senderId}" not found, trying next...`);
              lastError = new Error(`Sender ID "${senderId}" not approved: ${jsonData.message}`);
              continue; // Try next sender ID
            }
            console.log(`Termii SMS sent successfully using sender ID: ${senderId}`, jsonData);
            return; // Success!
          } catch (parseError) {
            // If status is OK but not JSON, assume success
            if (parseError.name === 'SyntaxError') {
              console.log(`Termii response is not JSON, but status is OK - assuming success with ${senderId}`);
              return; // Success!
            }
            throw parseError;
          }
        } else {
          // Parse error response
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            
            // If it's a sender ID not found error, try next sender ID
            if (response.status === 404 && errorData.message && errorData.message.includes('ApplicationSenderId not found')) {
              console.warn(`Sender ID "${senderId}" not found (404), trying next...`);
              lastError = new Error(`Sender ID "${senderId}" not approved: ${errorData.message}`);
              continue; // Try next sender ID
            }
            
            console.error(`Termii API error with ${senderId}:`, errorData);
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
          
          // If not a sender ID error, throw immediately (this should not be reached if continue was called above)
          // Only reach here if the error parsing failed or it's a different type of 404
          if (response.status === 404 && errorMessage.includes('ApplicationSenderId')) {
            // Sender ID error - continue to next one
            console.warn(`Sender ID "${senderId}" not found (404 from error message), trying next...`);
            lastError = new Error(`Sender ID "${senderId}" not approved: ${errorMessage}`);
            continue; // Try next sender ID
          } else {
            // Different error - throw immediately
            console.error('Termii SMS failed:', response.status, errorMessage);
            throw new Error(`Termii API error (${response.status}): ${errorMessage}`);
          }
        }
      } catch (error) {
        // Network or other errors - don't try other sender IDs
        console.error('Termii SMS error:', error);
        throw error;
      }
    }
    
    // If we get here, all sender IDs failed
    if (lastError) {
      console.error('All sender IDs failed. Last error:', lastError.message);
      throw new Error(`All Termii sender IDs failed. Last error: ${lastError.message}. Please approve "Movescrow" sender ID in Termii dashboard or set TERMII_SENDER_ID env var.`);
    }
    throw new Error('No sender IDs configured');
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

