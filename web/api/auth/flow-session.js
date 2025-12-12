/**
 * Generate session token for Flow-based order access
 * POST /api/auth/flow-session
 * Body: { order_id, restaurant_phone }
 */
import { createClient } from '@supabase/supabase-js';
import { generateSessionToken } from '../utils/session-token.js';

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
    const { order_id, restaurant_phone } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get order and verify restaurant
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('restaurant_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get restaurant to verify phone if provided
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, phone')
      .eq('id', order.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // If phone provided, verify it matches
    if (restaurant_phone && restaurant.phone !== restaurant_phone) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate session token
    const sessionToken = generateSessionToken(restaurant.phone, order_id, 24);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save session to database
    await supabase
      .from('restaurant_sessions')
      .insert({
        restaurant_id: restaurant.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    // Generate redirect URL
    const baseUrl = process.env.APP_URL || 'https://movescrow.com';
    const redirectUrl = `${baseUrl}/restaurant/order.html?session=${encodeURIComponent(sessionToken)}&order=${order_id}`;

    return res.json({
      success: true,
      session_token: sessionToken,
      redirect_url: redirectUrl
    });
  } catch (error) {
    console.error('Error in flow-session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

