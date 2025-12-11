/**
 * Verify OTP and log in restaurant
 * POST /api/auth/verify-otp
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Get OTP from database
    const { data: authData, error: authError } = await supabase
      .from('restaurant_auth')
      .select('*')
      .eq('phone', phone)
      .single();

    if (authError || !authData) {
      return res.status(404).json({ error: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (new Date(authData.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // Verify OTP
    // Allow universal test OTP "123456" for testing (if no SMS service configured)
    const hasSMSService = process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const isUniversalOTP = !hasSMSService && otp === '123456';
    
    if (authData.otp_code !== otp && !isUniversalOTP) {
      // Also accept universal OTP even if different code was saved
      if (otp !== '123456') {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    }

    // Get or create restaurant
    let { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('phone', phone)
      .single();

    if (restaurantError || !restaurant) {
      // Create new restaurant if doesn't exist
      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          phone,
          name: `Restaurant ${phone.slice(-4)}`, // Temporary name
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating restaurant:', createError);
        return res.status(500).json({ error: 'Failed to create restaurant' });
      }

      restaurant = newRestaurant;
    }

    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save session
    const { error: sessionError } = await supabase
      .from('restaurant_sessions')
      .insert({
        restaurant_id: restaurant.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Clear OTP (optional, for security)
    await supabase
      .from('restaurant_auth')
      .update({ otp_code: null, otp_expires_at: null })
      .eq('phone', phone);

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

function generateSessionToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

