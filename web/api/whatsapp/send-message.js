/**
 * Send WhatsApp message
 * POST /api/whatsapp/send-message
 */
import { createClient } from '@supabase/supabase-js';

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
    const { to, message, orderId } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return res.status(500).json({ error: 'WhatsApp API not configured' });
    }

    // Format phone number (remove + and ensure international format)
    const formattedPhone = to.replace(/^\+/, '').replace(/\s/g, '');

    // Send message via WhatsApp API
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
      console.error('WhatsApp API error:', error);
      return res.status(response.status).json({ error: 'Failed to send message', details: error });
    }

    const result = await response.json();
    const whatsappMessageId = result.messages?.[0]?.id;

    // Save message to database if orderId provided
    if (orderId && whatsappMessageId) {
      // Get order details to determine from/to numbers
      const { data: order } = await supabase
        .from('orders')
        .select('*, restaurants(*)')
        .eq('id', orderId)
        .single();

      if (order) {
        const fromNumber = order.restaurants?.whatsapp_phone || order.restaurants?.phone;
        
        await supabase
          .from('chat_messages')
          .insert({
            order_id: orderId,
            from_number: fromNumber,
            to_number: to,
            message_text: message,
            message_type: 'text',
            whatsapp_message_id: whatsappMessageId,
            direction: 'outbound',
            created_at: new Date().toISOString()
          });

        // Update order's last message timestamp
        await supabase
          .from('orders')
          .update({
            last_message_at: new Date().toISOString()
          })
          .eq('id', orderId);
      }
    }

    return res.json({
      success: true,
      messageId: whatsappMessageId,
      result
    });
  } catch (error) {
    console.error('Error in send-message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

