/**
 * Get order details
 * GET /api/orders/:id?session=xxx
 */
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '../../utils/session-token.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const sessionToken = req.query.session;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!sessionToken) {
      return res.status(401).json({ error: 'Session token is required' });
    }

    // Verify session token
    const session = verifySessionToken(sessionToken);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify restaurant owns this order
    // Get restaurant by phone
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('phone', session.phone)
      .single();

    if (!restaurant || restaurant.id !== order.restaurant_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

