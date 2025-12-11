/**
 * WhatsApp Business API Webhook Handler
 * GET /api/whatsapp/webhook - Webhook verification
 * POST /api/whatsapp/webhook - Receive messages
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Verify token from Meta Developer Console
// Default: movescrow00secret (you can override via env var)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'movescrow00secret';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Webhook verification (GET request)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    } else {
      console.error('Webhook verification failed');
      return res.status(403).send('Forbidden');
    }
  }

  // Handle incoming messages (POST request)
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Verify this is a WhatsApp Business API webhook
      if (body.object !== 'whatsapp_business_account') {
        return res.status(400).json({ error: 'Invalid webhook object' });
      }

      // Process each entry
      for (const entry of body.entry || []) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.value.messages) {
            // Handle incoming messages
            await handleIncomingMessages(change.value.messages, change.value.contacts);
          }

          if (change.value.statuses) {
            // Handle message status updates (sent, delivered, read)
            await handleMessageStatuses(change.value.statuses);
          }
        }
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Handle incoming WhatsApp messages
 */
async function handleIncomingMessages(messages, contacts) {
  for (const message of messages) {
    const fromNumber = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;
    const timestamp = parseInt(message.timestamp) * 1000; // Convert to milliseconds

    // Get contact name if available
    const contact = contacts?.find(c => c.wa_id === fromNumber);
    const contactName = contact?.profile?.name || fromNumber;

    console.log(`Received message from ${fromNumber}: ${messageText}`);

    // Find restaurant or customer by phone number
    // Try restaurant first
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .or(`phone.eq.${fromNumber},whatsapp_phone.eq.${fromNumber}`)
      .single();

    if (restaurant) {
      // Message from restaurant - find active order to link to
      // For now, we'll need order context from the message or link
      // This is a simplified version - you may need to enhance based on your flow
      console.log(`Message from restaurant ${restaurant.id}`);
      
      // TODO: Link message to order (might need order ID in message or context)
      continue;
    }

    // Try to find customer order by phone
    const { data: activeOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_whatsapp', fromNumber)
      .in('status', ['pending', 'awaiting_payment', 'paid', 'preparing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (activeOrder) {
      // Save message to chat_messages table
      await supabase
        .from('chat_messages')
        .insert({
          order_id: activeOrder.id,
          from_number: fromNumber,
          to_number: activeOrder.restaurant_id, // Will need restaurant phone
          message_text: messageText,
          message_type: 'text',
          whatsapp_message_id: messageId,
          direction: 'inbound',
          created_at: new Date(timestamp).toISOString()
        });

      // Update order's last message timestamp
      await supabase
        .from('orders')
        .update({
          last_message_at: new Date(timestamp).toISOString(),
          unread_messages_count: activeOrder.unread_messages_count + 1
        })
        .eq('id', activeOrder.id);

      console.log(`Message saved for order ${activeOrder.id}`);
    } else {
      console.log(`No active order found for ${fromNumber}`);
    }
  }
}

/**
 * Handle message status updates
 */
async function handleMessageStatuses(statuses) {
  for (const status of statuses) {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed

    // Update message status in database if needed
    await supabase
      .from('chat_messages')
      .update({
        message_status: statusType,
        updated_at: new Date().toISOString()
      })
      .eq('whatsapp_message_id', messageId);

    console.log(`Message ${messageId} status: ${statusType}`);
  }
}

