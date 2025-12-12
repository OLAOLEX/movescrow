/**
 * Send order notification to restaurant (SMS/WhatsApp)
 * POST /api/notifications/send-order
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { generateSessionToken } from '../utils/session-token.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase only if credentials are available
let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

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

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' });
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

    // Generate secure session token for deep link
    const sessionToken = generateSessionToken(restaurant.phone, orderId, 24);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save session to database
    await supabase
      .from('restaurant_sessions')
      .insert({
        restaurant_id: restaurantId,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    // Generate deep link URL for WebView
    const baseUrl = process.env.APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.movescrow.com';
    const deepLinkUrl = `${baseUrl}/restaurant/order.html?session=${encodeURIComponent(sessionToken)}&order=${orderId}`;
    const magicLink = deepLinkUrl; // Keep for backward compatibility

    // Send notification based on preference
    const notificationPreference = restaurant.notification_preference || 'sms';
    let notificationSent = false;
    let errorDetails = [];

    if (notificationPreference === 'sms' && restaurant.phone) {
      const message = `Movescrow: New Order Request!

Order: ${order.order_ref || order.id}
Customer: ${order.customer_code || order.customer_name || 'Customer'}

View order and set price: ${magicLink}

Reply STOP to opt out`;

      try {
        await sendSMS(restaurant.phone, message);
        notificationSent = true;
        console.log('SMS notification sent successfully');
      } catch (error) {
        console.error('SMS send error:', error);
        errorDetails.push(`SMS failed: ${error.message}`);
      }
    } else if (notificationPreference === 'sms' && !restaurant.phone) {
      errorDetails.push('SMS preferred but restaurant phone not set');
    }

    if ((notificationPreference === 'whatsapp' || !notificationSent) && restaurant.whatsapp_phone) {
      // Format order items
      let itemsList = '';
      if (order.items && typeof order.items === 'string') {
        try {
          const items = JSON.parse(order.items);
          itemsList = items.map(item => `• ${item.name || item.item_name} × ${item.quantity}`).join('\n');
        } catch (e) {
          itemsList = order.items;
        }
      } else if (order.items && Array.isArray(order.items)) {
        itemsList = order.items.map(item => `• ${item.name || item.item_name} × ${item.quantity}`).join('\n');
      } else {
        itemsList = 'View order details';
      }

      const messageText = `🍽️ *Movescrow: New Order Request!*

📦 Order: *${order.order_ref || order.id}*
👤 Customer: ${order.customer_code || order.customer_name || 'Customer'}

*Items:*
${itemsList}

${order.delivery_address ? `📍 Delivery: ${order.delivery_address}\n` : ''}${order.special_instructions ? `📝 Note: ${order.special_instructions}\n` : ''}
Tap below to view and respond:`;

      try {
        // Try sending with interactive button first (works within 24-hour window)
        // If customer has messaged you before, buttons work without templates
        const buttonResult = await sendWhatsAppWithButton(
          restaurant.whatsapp_phone,
          messageText,
          deepLinkUrl,
          `📋 View & Respond`
        );
        notificationSent = true;
        console.log('WhatsApp notification sent successfully with button:', buttonResult);
      } catch (error) {
        console.error('WhatsApp button send error:', error.message);
        // Fallback to plain text if button fails (outside 24h window or not initiated)
        try {
          const fallbackMessage = `${messageText}

👉 ${magicLink}`;
          await sendWhatsApp(restaurant.whatsapp_phone, fallbackMessage);
          notificationSent = true;
          console.log('WhatsApp notification sent as fallback (plain text)');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          errorDetails.push(`WhatsApp failed: ${error.message}`);
        }
      }
    } else if ((notificationPreference === 'whatsapp' || !notificationSent) && !restaurant.whatsapp_phone) {
      errorDetails.push('WhatsApp preferred but restaurant WhatsApp phone not set');
    }

    if (!notificationSent) {
      return res.status(500).json({ 
        error: 'Failed to send notification',
        details: errorDetails,
        restaurant: {
          phone: restaurant.phone ? 'set' : 'missing',
          whatsapp_phone: restaurant.whatsapp_phone ? 'set' : 'missing',
          preference: notificationPreference
        },
        config: {
          hasTermii: !!process.env.TERMII_API_KEY,
          hasTwilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
          hasWhatsApp: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
        }
      });
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
    
    // Check if token is expired
    if (error.error?.code === 190 || error.error?.error_subcode === 463) {
      throw new Error(`WhatsApp access token expired. Please update WHATSAPP_ACCESS_TOKEN in Vercel. See FIX_WHATSAPP_TOKEN_EXPIRATION.md`);
    }
    
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Send WhatsApp message with interactive button (deep link)
 * Works within 24-hour customer service window (when user has messaged you first)
 */
async function sendWhatsAppWithButton(phone, messageText, buttonUrl, buttonText = 'View Order') {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API not configured');
  }

  // Format phone number (remove + and ensure international format)
  const formattedPhone = phone.replace(/^\+/, '').replace(/\s/g, '');
  
  // Ensure button text is max 20 characters (WhatsApp limit)
  const trimmedButtonText = buttonText.substring(0, 20);

  // Use interactive message with URL button
  // This works within 24-hour window when customer has messaged you
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
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: messageText
          },
          action: {
            buttons: [
              {
                type: 'url',
                url: buttonUrl,
                title: trimmedButtonText
              }
            ]
          }
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    const errorText = JSON.stringify(error, null, 2);
    console.error('WhatsApp button API error:', errorText);
    
    // Check if token is expired
    if (error.error?.code === 190 || error.error?.error_subcode === 463) {
      throw new Error(`WhatsApp access token expired. Please update WHATSAPP_ACCESS_TOKEN in Vercel. See FIX_WHATSAPP_TOKEN_EXPIRATION.md`);
    }
    
    // If button format fails, throw error to trigger fallback
    throw new Error(`WhatsApp button API error: ${error.error?.message || errorText}`);
  }

  return response.json();
}

