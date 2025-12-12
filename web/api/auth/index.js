/**
 * Auth operations - Verify token (GET) and Generate magic link (POST)
 * GET /api/auth?token=xxx (verify token)
 * POST /api/auth/magic-link with body: { restaurantId: 'xxx', orderId: 'xxx' (optional) }
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
    console.error('Failed to create Supabase client:', error);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: Verify token
    if (req.method === 'GET') {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      if (!supabase) {
        return res.status(500).json({ error: 'Database not configured' });
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
    }

    // POST: Generate magic link
    if (req.method === 'POST') {
      // Check if it's a magic-link request (via path or body type)
      const path = req.url || '';
      const isMagicLink = path.includes('magic-link') || req.body.type === 'magic-link';

      if (!isMagicLink) {
        return res.status(400).json({ error: 'Invalid request. Use GET for verify-token or POST /api/auth/magic-link for magic-link' });
      }

      const { restaurantId, orderId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      if (!supabase) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      // Verify restaurant exists
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Generate magic link token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save session
      const { error: sessionError } = await supabase
        .from('restaurant_sessions')
        .insert({
          restaurant_id: restaurantId,
          token,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      // Generate magic link URL
      const baseUrl = process.env.APP_URL || 'https://movescrow.com';
      let magicLink = `${baseUrl}/restaurant/auth?token=${token}`;
      
      if (orderId) {
        magicLink += `&order=${orderId}`;
      }

      return res.json({
        success: true,
        magicLink,
        token,
        expiresAt: expiresAt.toISOString()
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/auth:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

