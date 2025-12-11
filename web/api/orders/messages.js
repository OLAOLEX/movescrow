/**
 * Get chat messages for an order
 * GET /api/orders/messages?orderId=xxx
 * POST /api/orders/messages - Send message
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Retrieve messages
  if (req.method === 'GET') {
    try {
      const { orderId } = req.query;

      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }

      return res.json({
        success: true,
        messages: messages || []
      });
    } catch (error) {
      console.error('Error in GET messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST: Send message
  if (req.method === 'POST') {
    try {
      const { orderId, message, fromNumber, token } = req.body;

      if (!orderId || !message) {
        return res.status(400).json({ error: 'Order ID and message are required' });
      }

      // Verify authentication token
      let restaurantId = null;
      if (token) {
        const { data: session } = await supabase
          .from('restaurant_sessions')
          .select('restaurant_id')
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .single();
        
        if (session) {
          restaurantId = session.restaurant_id;
        }
      }

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, restaurants(*)')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Determine from and to numbers
      const restaurantPhone = order.restaurants?.whatsapp_phone || order.restaurants?.phone;
      const customerPhone = order.customer_whatsapp;

      // Determine sender (restaurant or customer)
      const isRestaurant = restaurantId && restaurantId === order.restaurant_id;
      const actualFromNumber = fromNumber || (isRestaurant ? restaurantPhone : customerPhone);
      const toNumber = isRestaurant ? customerPhone : restaurantPhone;

      // Save message to database
      const { data: savedMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          order_id: orderId,
          from_number: actualFromNumber,
          to_number: toNumber,
          message_text: message,
          message_type: 'text',
          direction: isRestaurant ? 'outbound' : 'inbound',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving message:', saveError);
        return res.status(500).json({ error: 'Failed to save message' });
      }

      // Update order's last message timestamp
      await supabase
        .from('orders')
        .update({
          last_message_at: new Date().toISOString(),
          unread_messages_count: isRestaurant ? 0 : (order.unread_messages_count || 0) + 1
        })
        .eq('id', orderId);

      // Send via WhatsApp if restaurant is sending
      if (isRestaurant && process.env.WHATSAPP_ACCESS_TOKEN) {
        try {
          await sendWhatsAppMessage(toNumber, message);
          
          // Update message with WhatsApp ID if available
          // (You'd need to store this from WhatsApp response)
        } catch (whatsappError) {
          console.error('WhatsApp send error:', whatsappError);
          // Continue even if WhatsApp fails - message is saved
        }
      }

      return res.json({
        success: true,
        message: savedMessage
      });
    } catch (error) {
      console.error('Error in POST messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Send WhatsApp message
 */
async function sendWhatsAppMessage(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API not configured');
  }

  const formattedPhone = to.replace(/^\+/, '').replace(/\s/g, '');

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

