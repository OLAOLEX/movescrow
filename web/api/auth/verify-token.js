/**
 * Verify magic link token and get restaurant session
 * GET /api/auth/verify-token?token=xxx
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from('restaurant_sessions')
      .select('*, restaurants(*)')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from('restaurant_sessions')
        .delete()
        .eq('token', token);

      return res.status(401).json({ error: 'Token expired' });
    }

    // Get restaurant details
    const restaurant = session.restaurants;

    return res.json({
      success: true,
      session: {
        token: session.token,
        expiresAt: session.expires_at
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        phone: restaurant.phone,
        whatsapp_phone: restaurant.whatsapp_phone,
        address: restaurant.address
      }
    });
  } catch (error) {
    console.error('Error in verify-token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

