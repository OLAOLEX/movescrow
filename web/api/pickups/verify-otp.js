/**
 * Verify OTP and mark pickup as verified
 * POST /api/pickups/verify-otp
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { pickup_id, otp_entered } = req.body;

    if (!pickup_id || !otp_entered) {
      return res.status(400).json({ error: 'Pickup ID and OTP required' });
    }

    // Get OTP from database
    const { data: otpRecord, error: otpError } = await supabase
      .from('pickup_otps')
      .select('*')
      .eq('pickup_id', pickup_id)
      .eq('otp_code', otp_entered)
      .single();

    if (otpError || !otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Check if already used
    if (otpRecord.used_at) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    // Mark OTP as used
    await supabase
      .from('pickup_otps')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    // Update pickup status
    await supabase
      .from('pickups')
      .update({ 
        status: 'otp_verified',
        otp_verified_at: new Date().toISOString()
      })
      .eq('id', pickup_id);

    return res.json({
      success: true,
      message: 'OTP verified. Please capture photo evidence.'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

