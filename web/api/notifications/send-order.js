/**
 * Send order notification to restaurant (SMS/WhatsApp)
 * POST /api/notifications/send-order
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

    if (!restaurantId || !orderId) {
      return res.status(400).json({ error: 'Restaurant ID and Order ID are required' });
    }

    // Get restaurant and order details
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate magic link
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save session
    await supabase
      .from('restaurant_sessions')
      .insert({
        restaurant_id: restaurantId,
        token,
        expires_at: expiresAt.toISOString()
      });

    const baseUrl = process.env.APP_URL || 'https://movescrow.com';
    const magicLink = `${baseUrl}/restaurant/auth?token=${token}&order=${orderId}`;

    // Send notification based on preference
    const notificationPreference = restaurant.notification_preference || 'sms';
    let notificationSent = false;

    if (notificationPreference === 'sms' && restaurant.phone) {
      const message = `Movescrow: You have a new order!

Order: ${order.order_ref}
Customer: Order ${order.customer_code}
Amount: ₦${parseFloat(order.total_amount || 0).toLocaleString()}

View: ${magicLink}

Reply STOP to opt out`;

      try {
        await sendSMS(restaurant.phone, message);
        notificationSent = true;
      } catch (error) {
        console.error('SMS send error:', error);
      }
    }

    if ((notificationPreference === 'whatsapp' || !notificationSent) && restaurant.whatsapp_phone) {
      const message = `Movescrow: You have a new order!

Order: ${order.order_ref}
Customer: Order ${order.customer_code}
Amount: ₦${parseFloat(order.total_amount || 0).toLocaleString()}

View: ${magicLink}`;

      try {
        await sendWhatsApp(restaurant.whatsapp_phone, message);
        notificationSent = true;
      } catch (error) {
        console.error('WhatsApp send error:', error);
      }
    }

    if (!notificationSent) {
      return res.status(500).json({ error: 'Failed to send notification' });
    }

    return res.json({
      success: true,
      message: 'Notification sent',
      magicLink,
      method: notificationPreference
    });
  } catch (error) {
    console.error('Error in send-order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Send SMS using Termii or Twilio
 */
async function sendSMS(phone, message) {
  // Try Termii first (Nigerian SMS provider)
  if (process.env.TERMII_API_KEY) {
    try {
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          from: 'Movescrow',
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: process.env.TERMII_API_KEY
        })
      });

      if (response.ok) {
        return;
      }
    } catch (error) {
      console.error('Termii SMS error:', error);
    }
  }

  // Fallback to Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message
        })
      }
    );

    if (response.ok) {
      return;
    }
  }

  throw new Error('SMS service not configured');
}

/**
 * Send WhatsApp message using Meta API
 */
async function sendWhatsApp(phone, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API not configured');
  }

  // Format phone number (remove + and ensure international format)
  const formattedPhone = phone.replace(/^\+/, '').replace(/\s/g, '');

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

