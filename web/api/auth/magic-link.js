/**
 * Generate magic link for restaurant authentication
 * POST /api/auth/magic-link
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
    const { restaurantId, orderId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
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
  } catch (error) {
    console.error('Error in magic-link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

