/**
 * Verify OTP and log in restaurant
 * POST /api/auth/verify-otp
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
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Check for test mode first (no Supabase or no SMS service)
    const hasSMSService = process.env.TERMII_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
    const isTestMode = !supabase || !hasSMSService;
    
    // If test mode and OTP is 123456, accept it immediately
    if (isTestMode && otp === '123456') {
      console.log(`Test OTP 123456 accepted for ${phone} (test mode - no Supabase check needed)`);
      // Skip database lookup, go straight to restaurant creation/login
    } else {
      // Verify OTP from database (only if Supabase is configured)
      if (!supabase) {
        return res.status(400).json({ error: 'Invalid OTP. Use 123456 for testing.' });
      }
      
      const { data: authData, error: authError } = await supabase
        .from('restaurant_auth')
        .select('*')
        .eq('phone', phone)
        .single();

      if (authError || !authData) {
        // If no data in DB but test mode, allow 123456
        if (isTestMode && otp === '123456') {
          console.log(`Test OTP 123456 accepted for ${phone} (no DB entry found)`);
        } else {
          return res.status(404).json({ error: 'OTP not found. Please request a new OTP.' });
        }
      } else {
        // Check if OTP is expired
        if (authData.otp_expires_at && new Date(authData.otp_expires_at) < new Date()) {
          return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }
        
        // Verify OTP matches
        if (authData.otp_code !== otp) {
          return res.status(400).json({ error: 'Invalid OTP' });
        }
      }
    }

    // Get or create restaurant (use in-memory storage if Supabase not configured)
    let restaurant = null;
    
    if (supabase) {
      let { data, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('phone', phone)
        .single();

      if (restaurantError || !data) {
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
          // Fall back to in-memory restaurant for testing
          restaurant = { id: `test-${Date.now()}`, phone, name: `Restaurant ${phone.slice(-4)}`, status: 'active' };
        } else {
          restaurant = newRestaurant;
        }
      } else {
        restaurant = data;
      }
    } else {
      // Test mode: create in-memory restaurant
      restaurant = {
        id: `test-${Date.now()}`,
        phone,
        name: `Restaurant ${phone.slice(-4)}`,
        status: 'active'
      };
      console.log('Test mode: Created in-memory restaurant:', restaurant);
    }

    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save session (if Supabase configured)
    if (supabase) {
      const { error: sessionError } = await supabase
        .from('restaurant_sessions')
        .insert({
          restaurant_id: restaurant.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        // Continue anyway for testing
      }

      // Clear OTP (optional, for security)
      await supabase
        .from('restaurant_auth')
        .update({ otp_code: null, otp_expires_at: null })
        .eq('phone', phone);
    } else {
      console.log('Test mode: Session token generated but not saved to database');
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

function generateSessionToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

