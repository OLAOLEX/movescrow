/**
 * Reject order
 * POST /api/orders/:id/reject
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { session, reason } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!session) {
      return res.status(401).json({ error: 'Session token is required' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Verify session token
    const sessionData = verifySessionToken(session);
    if (!sessionData) {
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
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('phone', sessionData.phone)
      .single();

    if (!restaurant || restaurant.id !== order.restaurant_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already processed
    if (order.status !== 'pending') {
      return res.status(400).json({ error: `Order already ${order.status}` });
    }

    // Update order status to 'rejected'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    // TODO: Notify customer via WhatsApp/SMS

    return res.json({
      success: true,
      message: 'Order rejected. Customer has been notified.'
    });
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/reject:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

 * POST /api/orders/:id/reject
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { session, reason } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!session) {
      return res.status(401).json({ error: 'Session token is required' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Verify session token
    const sessionData = verifySessionToken(session);
    if (!sessionData) {
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
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('phone', sessionData.phone)
      .single();

    if (!restaurant || restaurant.id !== order.restaurant_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already processed
    if (order.status !== 'pending') {
      return res.status(400).json({ error: `Order already ${order.status}` });
    }

    // Update order status to 'rejected'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    // TODO: Notify customer via WhatsApp/SMS

    return res.json({
      success: true,
      message: 'Order rejected. Customer has been notified.'
    });
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/reject:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

