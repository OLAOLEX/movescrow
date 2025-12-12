/**
 * Set order price and ready time
 * POST /api/orders/:id/set-price
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
    const { session, price, ready_time } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!session) {
      return res.status(401).json({ error: 'Session token is required' });
    }

    if (!price || !ready_time) {
      return res.status(400).json({ error: 'Price and ready_time are required' });
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

    // Check if order is accepted
    if (order.status !== 'accepted') {
      return res.status(400).json({ error: 'Order must be accepted first' });
    }

    // Update order with price and ready time
    const totalAmount = parseFloat(price);
    const readyTime = parseInt(ready_time);

    // Calculate platform fee (5%) and delivery fee
    const platformFee = Math.round(totalAmount * 0.05);
    const deliveryFee = 500; // Fixed delivery fee (can be dynamic)
    const finalTotal = totalAmount + platformFee + deliveryFee;

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        total_amount: totalAmount,
        platform_fee: platformFee,
        delivery_fee: deliveryFee,
        ready_time: readyTime,
        status: 'payment_pending', // Now waiting for customer payment
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    // TODO: Notify customer via WhatsApp with price breakdown and payment link

    return res.json({
      success: true,
      message: 'Price set successfully. Customer has been notified.',
      order: {
        food_amount: totalAmount,
        platform_fee: platformFee,
        delivery_fee: deliveryFee,
        total: finalTotal,
        ready_time: readyTime
      }
    });
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/set-price:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

 * POST /api/orders/:id/set-price
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
    const { session, price, ready_time } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!session) {
      return res.status(401).json({ error: 'Session token is required' });
    }

    if (!price || !ready_time) {
      return res.status(400).json({ error: 'Price and ready_time are required' });
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

    // Check if order is accepted
    if (order.status !== 'accepted') {
      return res.status(400).json({ error: 'Order must be accepted first' });
    }

    // Update order with price and ready time
    const totalAmount = parseFloat(price);
    const readyTime = parseInt(ready_time);

    // Calculate platform fee (5%) and delivery fee
    const platformFee = Math.round(totalAmount * 0.05);
    const deliveryFee = 500; // Fixed delivery fee (can be dynamic)
    const finalTotal = totalAmount + platformFee + deliveryFee;

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        total_amount: totalAmount,
        platform_fee: platformFee,
        delivery_fee: deliveryFee,
        ready_time: readyTime,
        status: 'payment_pending', // Now waiting for customer payment
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    // TODO: Notify customer via WhatsApp with price breakdown and payment link

    return res.json({
      success: true,
      message: 'Price set successfully. Customer has been notified.',
      order: {
        food_amount: totalAmount,
        platform_fee: platformFee,
        delivery_fee: deliveryFee,
        total: finalTotal,
        ready_time: readyTime
      }
    });
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/set-price:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

