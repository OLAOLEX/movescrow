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

    // Generate deep link URL for WebView (must be whitelisted in Meta Business)
    const baseUrl = process.env.APP_URL || 'https://movescrow.com';
    const deepLinkUrl = `${baseUrl}/restaurant/order.html?session=${encodeURIComponent(sessionToken)}&order=${orderId}`;
    const magicLink = deepLinkUrl; // Keep for backward compatibility

    // Send notification based on preference (default to whatsapp if column doesn't exist)
    const notificationPreference = restaurant.notification_preference || (restaurant.whatsapp_phone ? 'whatsapp' : 'sms');
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

      const messageText = `🍽️ Movescrow: New Order Request!

📦 Order: ${order.order_ref || order.id}
👤 Customer: ${order.customer_code || order.customer_name || 'Customer'}

Items:
${itemsList}

${order.delivery_address ? `📍 Delivery: ${order.delivery_address}\n` : ''}${order.special_instructions ? `📝 Note: ${order.special_instructions}\n` : ''}
Tap below to view and respond:`;

      try {
        // Try WhatsApp Flow first (in-app WebView - requires Flow ID)
        const flowId = process.env.WHATSAPP_FLOW_ID;
        if (flowId) {
          // Generate flow token (secure token for this Flow session)
          const flowToken = generateSessionToken(restaurant.phone, orderId, 24);
          // Flow only accepts static data - order_id, not full URLs
          const flowParams = {
            order_id: orderId
          };
          
          const flowResult = await sendWhatsAppFlow(
            restaurant.whatsapp_phone,
            flowId,
            flowToken,
            flowParams
          );
          notificationSent = true;
          console.log('WhatsApp Flow sent successfully:', flowResult);
        } else {
          throw new Error('WHATSAPP_FLOW_ID not configured, trying CTA button');
        }
      } catch (flowError) {
        console.error('Flow failed, trying CTA URL button:', flowError.message);
        try {
          // Fallback to CTA URL button (works if domain whitelisted)
          const buttonResult = await sendWhatsAppWithButton(
            restaurant.whatsapp_phone,
            messageText,
            deepLinkUrl,
            `📋 View & Respond`
          );
          notificationSent = true;
          console.log('WhatsApp notification sent with CTA URL button:', buttonResult);
        } catch (buttonError) {
          console.error('CTA URL button failed, trying plain link:', buttonError.message);
          try {
            // Final fallback to plain text with link
            const messageWithLink = `${messageText}

👉 View and respond: ${magicLink}`;
            await sendWhatsApp(restaurant.whatsapp_phone, messageWithLink);
            notificationSent = true;
            console.log('WhatsApp notification sent with plain link');
          } catch (linkError) {
            console.error('Plain link also failed:', linkError);
            errorDetails.push(`WhatsApp failed: Flow(${flowError.message}), CTA(${buttonError.message}), Link(${linkError.message})`);
          }
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
  
  // Ensure button text is max 20 characters (WhatsApp limit for URL buttons)
  const trimmedButtonText = buttonText.substring(0, 20);
  
  // Extract domain for whitelist check
  const urlObj = new URL(buttonUrl);
  const domain = urlObj.hostname;

  // Use interactive message with URL button
  // This works within 24-hour window when customer has messaged you
  // IMPORTANT: The domain in buttonUrl MUST be whitelisted in Meta Business Manager
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
          type: 'cta_url',
          body: {
            text: messageText
          },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: trimmedButtonText,
              url: buttonUrl
            }
          }
        }
      })
    }
  );
  
  if (!response.ok) {
    const responseText = await response.text();
    console.log('WhatsApp API response status:', response.status);
    console.log('WhatsApp API error response:', responseText);
    
    let error;
    try {
      error = JSON.parse(responseText);
    } catch (e) {
      error = { error: { message: responseText } };
    }
    const errorText = JSON.stringify(error, null, 2);
    console.error('WhatsApp button API error:', errorText);
    
    // Check if token is expired
    if (error.error?.code === 190 || error.error?.error_subcode === 463) {
      throw new Error(`WhatsApp access token expired. Please update WHATSAPP_ACCESS_TOKEN in Vercel.`);
    }
    
    // Common error: domain not whitelisted or invalid format
    if (error.error?.code === 100) {
      if (error.error?.message?.includes('cta_url') || error.error?.message?.includes('interactive')) {
        throw new Error(`Invalid CTA URL format: ${error.error.message}`);
      }
      throw new Error(`Domain not whitelisted in Meta Business. Add ${new URL(buttonUrl).origin} to whitelisted domains.`);
    }
    
    // If button format fails, throw error to trigger fallback
    throw new Error(`WhatsApp button API error: ${error.error?.message || errorText}`);
  }

  const result = await response.json();
  console.log('WhatsApp API response status:', response.status);
  console.log('WhatsApp API success response:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Send WhatsApp Flow message (in-app WebView)
 * Requires Flow to be created and approved in Meta Business Manager
 */
async function sendWhatsAppFlow(phone, flowId, flowToken, params = {}) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API not configured');
  }

  // Format phone number
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
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'interactive',
        interactive: {
          type: 'flow',
          header: {
            type: 'text',
            text: 'Order Management'
          },
          body: {
            text: 'Tap below to view and manage your order:'
          },
          footer: {
            text: 'Movescrow'
          },
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_token: flowToken,
              flow_id: flowId,
              flow_cta: 'View Order',
              flow_action: 'navigate',
              flow_action_payload: {
                screen: 'order_screen',
                data: {
                  order_id: orderId  // Only static data allowed in Flow
                }
              }
            }
          }
        }
      })
    }
  );

  if (!response.ok) {
    const responseText = await response.text();
    let error;
    try {
      error = JSON.parse(responseText);
    } catch (e) {
      error = { error: { message: responseText } };
    }
    console.error('WhatsApp Flow API error:', JSON.stringify(error, null, 2));
    throw new Error(`WhatsApp Flow API error: ${error.error?.message || responseText}`);
  }

  const result = await response.json();
  console.log('WhatsApp Flow sent successfully:', JSON.stringify(result, null, 2));
  return result;
}

