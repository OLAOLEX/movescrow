/**
 * WhatsApp Flow endpoint - Returns order URL with session token
 * POST /api/flows/order-url
 * Called by WhatsApp Flow with order_id and flow_token
 */
import { createClient } from '@supabase/supabase-js';
import { generateSessionToken, verifySessionToken } from '../utils/session-token.js';

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
  // WhatsApp Flow endpoint format
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // WhatsApp Flow sends data in this format
    const { order_id, flow_token } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Verify flow_token (optional - extra security)
    // For now, we'll just use order_id

    // Get order and restaurant
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('restaurant_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, phone')
      .eq('id', order.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Generate session token
    const sessionToken = generateSessionToken(restaurant.phone, order_id, 24);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save session
    await supabase
      .from('restaurant_sessions')
      .insert({
        restaurant_id: restaurant.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    // Return URL for Flow to use
    const baseUrl = process.env.APP_URL || 'https://movescrow.com';
    const orderUrl = `${baseUrl}/restaurant/order.html?session=${encodeURIComponent(sessionToken)}&order=${order_id}`;

    // WhatsApp Flow expects this format
    return res.json({
      order_url: orderUrl
    });
  } catch (error) {
    console.error('Error in flow order-url:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

