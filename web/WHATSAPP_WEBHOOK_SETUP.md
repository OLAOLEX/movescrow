# WhatsApp Webhook Setup Guide

## ✅ Webhook Configuration

Your WhatsApp Business API webhook has been configured with the following details:

- **Callback URL**: `https://movescrow.vercel.app/api/whatsapp/webhook`
- **Verify Token**: `movescrow00secret`

---

## 🔧 Environment Variable

Make sure to set this in your Vercel Dashboard → Settings → Environment Variables:

```env
WHATSAPP_VERIFY_TOKEN=movescrow00secret
```

**Note**: The webhook handler will use `movescrow00secret` as default if the env var is not set, but it's recommended to set it explicitly.

---

## ✅ Webhook Verification (GET Request)

When Meta verifies your webhook, it sends a GET request:

```
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=movescrow00secret&hub.challenge=random_string
```

**Expected Response**: Return the `hub.challenge` value (200 status)

The webhook handler already handles this correctly ✅

---

## 📨 Webhook Events (POST Request)

After verification, Meta will send POST requests for:

### 1. Incoming Messages

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Customer Name"
                },
                "wa_id": "2348000000000"
              }
            ],
            "messages": [
              {
                "from": "2348000000000",
                "id": "wamid.xxx",
                "timestamp": "1234567890",
                "text": {
                  "body": "Hello!"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Handler Action**: 
- Saves message to `chat_messages` table
- Links to active order by phone number
- Updates order's `last_message_at` and `unread_messages_count`

---

### 2. Message Status Updates

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "statuses": [
              {
                "id": "wamid.xxx",
                "status": "sent", // or "delivered", "read", "failed"
                "timestamp": "1234567890",
                "recipient_id": "2348000000000"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Handler Action**:
- Updates message status in `chat_messages` table

---

## 🧪 Testing Webhook

### 1. Test Webhook Verification

```bash
curl "https://movescrow.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=movescrow00secret&hub.challenge=test123"
```

**Expected Response**: `test123` (200 status)

---

### 2. Test Incoming Message (Simulate)

```bash
curl -X POST https://movescrow.vercel.app/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "contacts": [{
            "wa_id": "+2348000000000",
            "profile": {"name": "Test Customer"}
          }],
          "messages": [{
            "from": "+2348000000000",
            "id": "test_msg_123",
            "timestamp": "1234567890",
            "text": {"body": "Test message"},
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

**Expected Response**: `OK` (200 status)

**Check**: 
- Message saved to `chat_messages` table in Supabase
- Order's `last_message_at` updated (if order exists)

---

## 📋 Webhook Subscription

In Meta Developer Console → WhatsApp → Configuration:

**Subscribe to Fields**:
- ✅ `messages` (required)
  - Incoming messages
  - Message status updates

**Optional Fields**:
- `message_template_status_update` - Template message status
- `phone_number_name_update` - Phone number name changes
- `account_review_update` - Account review status

---

## 🔍 Monitoring Webhook

### View Webhook Logs in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. Click on `/api/whatsapp/webhook`
5. View logs and execution times

### View Webhook Logs in Meta Developer Console

1. Go to Meta Developer Console
2. Select your app
3. WhatsApp → Configuration → Webhook
4. Click "View webhook logs"

---

## 🐛 Troubleshooting

### Issue: Webhook Verification Fails

**Symptoms**: Meta shows "Webhook verification failed"

**Solutions**:
1. Check `WHATSAPP_VERIFY_TOKEN` matches exactly: `movescrow00secret`
2. Verify webhook URL is publicly accessible: `https://movescrow.vercel.app/api/whatsapp/webhook`
3. Check Vercel function logs for errors
4. Ensure function returns 200 status with challenge string

---

### Issue: Webhook Not Receiving Messages

**Symptoms**: Messages sent to WhatsApp Business number not appearing in database

**Solutions**:
1. Verify webhook is subscribed to `messages` field
2. Check Meta Developer Console → Webhook logs for incoming events
3. Check Vercel function logs for POST request handling
4. Verify phone number is registered/linked in Meta Console
5. Check Supabase `chat_messages` table for saved messages

---

### Issue: Messages Not Linking to Orders

**Symptoms**: Messages saved but `order_id` is null

**Solutions**:
1. Verify `customer_whatsapp` matches incoming `from` number in orders table
2. Check phone number format (should match exactly, including country code)
3. Verify order exists and status is active (pending, paid, preparing, etc.)

---

## ✅ Webhook Status Checklist

- [x] Webhook URL configured: `https://movescrow.vercel.app/api/whatsapp/webhook`
- [x] Verify token set: `movescrow00secret`
- [x] Webhook handler implemented: `/api/whatsapp/webhook.js`
- [x] GET request (verification) handler ✅
- [x] POST request (messages) handler ✅
- [ ] Webhook verified in Meta Developer Console
- [ ] Subscribed to `messages` field
- [ ] Test message received and saved to database
- [ ] Order linking working correctly

---

## 📚 Additional Resources

- [Meta Webhooks Documentation](https://developers.facebook.com/docs/graph-api/webhooks)
- [WhatsApp Cloud API Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Last Updated**: Configuration confirmed with Meta Developer Console  
**Webhook URL**: `https://movescrow.vercel.app/api/whatsapp/webhook`  
**Verify Token**: `movescrow00secret`

