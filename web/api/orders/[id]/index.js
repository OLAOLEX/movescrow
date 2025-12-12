/**
 * Order operations - GET order details and POST actions (accept/reject/set-price)
 * GET /api/orders/:id?session=xxx
 * POST /api/orders/:id with body: { action: 'accept'|'reject'|'set-price', session: 'xxx', ... }
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

// Common function to verify restaurant owns order
async function verifyOrderOwnership(orderId, sessionToken) {
  const session = verifySessionToken(sessionToken);
  if (!session) {
    return { error: 'Invalid or expired session token', status: 401 };
  }

  if (!supabase) {
    return { error: 'Database not configured', status: 500 };
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return { error: 'Order not found', status: 404, order: null };
  }

  // Verify restaurant owns this order
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('phone', session.phone)
    .single();

  if (!restaurant || restaurant.id !== order.restaurant_id) {
    return { error: 'Unauthorized', status: 403, order: null };
  }

  return { order, restaurant, session };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // GET: Return order details
    if (req.method === 'GET') {
      const sessionToken = req.query.session;

      if (!sessionToken) {
        return res.status(401).json({ error: 'Session token is required' });
      }

      const verification = await verifyOrderOwnership(id, sessionToken);
      if (verification.error) {
        return res.status(verification.status).json({ error: verification.error });
      }

      return res.json(verification.order);
    }

    // POST: Handle order actions (accept/reject/set-price)
    if (req.method === 'POST') {
      const { action, session, reason, price, ready_time } = req.body;

      if (!session) {
        return res.status(401).json({ error: 'Session token is required' });
      }

      if (!action) {
        return res.status(400).json({ error: 'Action is required (accept, reject, or set-price)' });
      }

      const verification = await verifyOrderOwnership(id, session);
      if (verification.error) {
        return res.status(verification.status).json({ error: verification.error });
      }

      const { order } = verification;

      // Handle different actions
      switch (action) {
        case 'accept':
          if (order.status !== 'pending') {
            return res.status(400).json({ error: `Order already ${order.status}` });
          }

          const { error: acceptError } = await supabase
            .from('orders')
            .update({
              status: 'accepted',
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (acceptError) {
            console.error('Error updating order:', acceptError);
            return res.status(500).json({ error: 'Failed to update order' });
          }

          return res.json({
            success: true,
            message: 'Order accepted. Please set the price.'
          });

        case 'reject':
          if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
          }

          if (order.status !== 'pending') {
            return res.status(400).json({ error: `Order already ${order.status}` });
          }

          const { error: rejectError } = await supabase
            .from('orders')
            .update({
              status: 'rejected',
              rejection_reason: reason,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (rejectError) {
            console.error('Error updating order:', rejectError);
            return res.status(500).json({ error: 'Failed to update order' });
          }

          // TODO: Notify customer via WhatsApp/SMS

          return res.json({
            success: true,
            message: 'Order rejected. Customer has been notified.'
          });

        case 'set-price':
          if (!price || !ready_time) {
            return res.status(400).json({ error: 'Price and ready_time are required' });
          }

          if (order.status !== 'accepted') {
            return res.status(400).json({ error: 'Order must be accepted first' });
          }

          const totalAmount = parseFloat(price);
          const readyTime = parseInt(ready_time);

          // Calculate platform fee (5%) and delivery fee
          const platformFee = Math.round(totalAmount * 0.05);
          const deliveryFee = 500; // Fixed delivery fee (can be dynamic)
          const finalTotal = totalAmount + platformFee + deliveryFee;

          const { error: priceError } = await supabase
            .from('orders')
            .update({
              total_amount: totalAmount,
              platform_fee: platformFee,
              delivery_fee: deliveryFee,
              ready_time: readyTime,
              status: 'payment_pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (priceError) {
            console.error('Error updating order:', priceError);
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

        default:
          return res.status(400).json({ error: 'Invalid action. Use: accept, reject, or set-price' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/orders/[id]:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
