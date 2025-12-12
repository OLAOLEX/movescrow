/**
 * Request OTP for pickup verification
 * POST /api/pickups/request-otp
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS/WhatsApp
async function sendOTP(contact, otp) {
  // Use Termii or WhatsApp API here
  const termiiKey = process.env.TERMII_API_KEY;
  if (termiiKey && contact.startsWith('+')) {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: contact,
        from: 'Movescrow',
        sms: `Your Movescrow pickup OTP: ${otp}. Valid for 5 minutes.`,
        type: 'plain',
        channel: 'generic',
        api_key: termiiKey
      })
    });
    return response.ok;
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { pickup_id, mover_id } = req.body;

    if (!pickup_id || !mover_id) {
      return res.status(400).json({ error: 'Pickup ID and Mover ID required' });
    }

    // Get pickup details
    const { data: pickup, error } = await supabase
      .from('pickups')
      .select('*, orders(*), releasers(*)')
      .eq('id', pickup_id)
      .single();

    if (error || !pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP
    await supabase
      .from('pickup_otps')
      .upsert({
        pickup_id,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    // Send OTP to releaser
    const releaserContact = pickup.releaser_contact || pickup.releasers?.phone;
    if (releaserContact) {
      await sendOTP(releaserContact, otp);
    }

    return res.json({
      success: true,
      expires_at: expiresAt.toISOString(),
      message: 'OTP sent to releaser'
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

