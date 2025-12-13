/**
 * Verify OTP and log in restaurant
 * POST /api/auth/verify-otp
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const hasSMSService = process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const isTestMode = !supabase || !hasSMSService;
    
    let isValidOTP = false;
    
    if (isTestMode && otp === '123456') {
      isValidOTP = true;
    } else if (!supabase) {
      return res.status(400).json({ error: 'Invalid OTP. Use 123456 for testing.' });
    } else {
      const { data: authData, error: authError } = await supabase
        .from('restaurant_auth')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (authError || !authData) {
        if (isTestMode && otp === '123456') {
          isValidOTP = true;
        } else {
          return res.status(404).json({ error: 'OTP not found. Please request a new OTP.' });
        }
      } else {
        if (authData.otp_expires_at && new Date(authData.otp_expires_at) < new Date()) {
          return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }
        isValidOTP = authData.otp_code === otp;
        if (!isValidOTP) {
          return res.status(400).json({ error: 'Invalid OTP' });
        }
      }
    }
    
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    let restaurant = null;
    
    if (supabase) {
      let { data, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (restaurantError || !data) {
        const { data: newRestaurant, error: createError } = await supabase
          .from('restaurants')
          .insert({
            phone,
            name: `Restaurant ${phone.slice(-4)}`,
            status: 'active'
          })
          .select()
          .single();

        restaurant = createError 
          ? { id: `test-${Date.now()}`, phone, name: `Restaurant ${phone.slice(-4)}`, status: 'active' }
          : newRestaurant;
      } else {
        restaurant = data;
      }
    } else {
      restaurant = {
        id: `test-${Date.now()}`,
        phone,
        name: `Restaurant ${phone.slice(-4)}`,
        status: 'active'
      };
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (supabase) {
      await supabase.from('restaurant_sessions').insert({
        restaurant_id: restaurant.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });
      await supabase
        .from('restaurant_auth')
        .update({ otp_code: null, otp_expires_at: null })
        .eq('phone', phone);
    }

    return res.json({
      success: true,
      token: sessionToken,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        phone: restaurant.phone
      },
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
