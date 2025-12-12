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
    
    let isValidOTP = false;
    
    // If test mode and OTP is 123456, accept it immediately
    if (isTestMode && otp === '123456') {
      console.log(`Test OTP 123456 accepted for ${phone} (test mode - no Supabase check needed)`);
      isValidOTP = true;
    } else if (!supabase) {
      // No Supabase configured - only accept test OTP
      if (otp === '123456') {
        console.log(`Test OTP 123456 accepted for ${phone} (no Supabase configured)`);
        isValidOTP = true;
      } else {
        return res.status(400).json({ error: 'Invalid OTP. Use 123456 for testing or configure Supabase.' });
      }
    } else {
      // Verify OTP from database (only if Supabase is configured)
      // Use maybeSingle() instead of single() to handle 0 rows gracefully
      const { data: authData, error: authError } = await supabase
        .from('restaurant_auth')
        .select('*')
        .eq('phone', phone)
        .maybeSingle(); // Use maybeSingle() to handle 0 rows

      if (authError) {
        console.error('Supabase query error:', authError);
        // If query fails but test mode, allow 123456
        if (isTestMode && otp === '123456') {
          console.log(`Test OTP 123456 accepted for ${phone} (Supabase query failed)`);
          isValidOTP = true;
        } else {
          return res.status(404).json({ error: 'OTP not found. Please request a new OTP.' });
        }
      } else if (!authData) {
        // OTP not found in database - this could mean:
        // 1. DB save failed (common issue we're debugging)
        // 2. OTP expired or already used
        // 3. Wrong phone number
        console.warn(`OTP not found in database for phone ${phone}, OTP: ${otp}`);
        console.warn('This could mean: DB save failed, OTP expired, or wrong phone number');
        
        if (isTestMode && otp === '123456') {
          console.log(`Test OTP 123456 accepted for ${phone} (no DB entry found)`);
          isValidOTP = true;
        } else {
          // OTP not in DB - provide helpful error message
          // NOTE: For production, we should reject OTPs not in DB for security
          // For now, we're debugging DB save issues
          return res.status(404).json({ 
            error: 'OTP not found in database. This may mean the OTP wasn\'t saved during the send step. Please request a new OTP.',
            debug: {
              phone: phone,
              otpProvided: otp,
              suggestion: 'Check Vercel function logs for Supabase errors when sending OTP. If send-otp returned an OTP in the response, the database save likely failed.',
              action: 'Request a new OTP and check Vercel logs for database errors'
            }
          });
        }
      } else {
        // Check if OTP is expired
        if (authData.otp_expires_at && new Date(authData.otp_expires_at) < new Date()) {
          return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }
        
        // Verify OTP matches
        if (authData.otp_code === otp) {
          isValidOTP = true;
        } else {
          return res.status(400).json({ error: 'Invalid OTP' });
        }
      }
    }
    
    // Final check - if still not valid, reject
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    // Get or create restaurant (use in-memory storage if Supabase not configured)
    let restaurant = null;
    
    if (supabase) {
      let { data, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('phone', phone)
        .maybeSingle(); // Use maybeSingle() to handle 0 rows

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
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    
    // Return proper JSON error response
    try {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      });
    } catch (responseError) {
      // If we can't even send JSON, something is very wrong
      console.error('Failed to send error response:', responseError);
      return res.status(500).send('Internal server error');
    }
  }
}

function generateSessionToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

