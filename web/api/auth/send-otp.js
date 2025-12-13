/**
 * Send OTP to restaurant phone number
 * POST /api/auth/send-otp
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
}

export default async function handler(req, res) {
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

    const USE_UNIVERSAL_TEST_OTP = true;
    const hasSMSService = process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const useTestOTP = USE_UNIVERSAL_TEST_OTP || !supabase || !hasSMSService;
    const otp = useTestOTP ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let otpSaved = false;
    let supabaseError = null;
    if (supabase) {
      try {
        const { data, error: authError } = await supabase
          .from('restaurant_auth')
          .upsert({
            phone,
            otp_code: otp,
            otp_expires_at: expiresAt.toISOString()
          }, {
            onConflict: 'phone'
          })
          .select();

        if (authError) {
          supabaseError = authError;
          console.error('Error saving OTP:', authError);
        } else if (data) {
          otpSaved = true;
        }
      } catch (error) {
        supabaseError = error;
        console.error('Exception saving OTP:', error);
      }
    }

    let smsSent = false;
    if (otp !== '123456') {
      try {
        await sendSMS(phone, `Your Movescrow OTP: ${otp}. Valid for 10 minutes.`);
        smsSent = true;
      } catch (smsError) {
        console.error('SMS error:', smsError);
      }
    }

    return res.json({
      success: true,
      message: otp === '123456' 
        ? 'OTP generated (test mode - use 123456)'
        : smsSent 
          ? 'OTP sent successfully via SMS'
          : otpSaved
            ? 'OTP generated and saved'
            : 'OTP generated',
      expiresIn: 600,
      testMode: otp === '123456'
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendSMS(phone, message) {
  if (process.env.TERMII_API_KEY) {
    const senderIds = [
      process.env.TERMII_SENDER_ID,
      'Movescrow',
      'Talert',
      'SecureOTP',
      'N-Alert'
    ].filter(Boolean);
    
    for (const senderId of senderIds) {
      try {
        const response = await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            from: senderId,
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: process.env.TERMII_API_KEY
          })
        });

        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData.code === 404 && jsonData.message?.includes('ApplicationSenderId not found')) {
            continue;
          }
          return;
        }
      } catch (error) {
        if (senderId === senderIds[senderIds.length - 1]) throw error;
        continue;
      }
    }
    throw new Error('All sender IDs failed');
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`
        },
        body: new URLSearchParams({
          To: phone,
          From: process.env.TWILIO_PHONE_NUMBER,
          Body: message
        })
      }
    );

    if (response.ok) return;
  }

  throw new Error('SMS service not configured');
}
