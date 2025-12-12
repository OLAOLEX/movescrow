# WhatsApp Flow Setup Guide

## Overview
WhatsApp Flows enable in-app WebView experiences (like fintech apps). This guide sets up Flow for order management.

## Prerequisites
1. Meta Business Manager access
2. WhatsApp Business API account
3. Domain verified and whitelisted (movescrow.com)

## Step 1: Create Flow JSON

Flow file created at: `web/flows/order-view.json`

This Flow:
- Opens order page in WhatsApp WebView
- Passes session token and order ID as parameters
- Renders full order management interface

## Step 2: Host Flow JSON

**Option A: Host on Vercel (Recommended)**
1. Deploy to Vercel
2. Flow URL: `https://movescrow.com/flows/order-view.json`
3. Ensure file is publicly accessible

**Option B: Host on CDN**
- Upload to S3/CloudFront
- Or use GitHub Pages

**Verify accessibility:**
```bash
curl https://movescrow.com/flows/order-view.json
```

## Step 3: Create Flow in Meta Business Manager

1. Go to **Meta Business Manager** → **WhatsApp** → **Flows**
2. Click **"Create Flow"**
3. **Flow Details:**
   - Name: `Order Management`
   - Description: `Restaurant order view and management`
   - Category: `Commerce`
4. **Flow JSON URL:** `https://movescrow.com/flows/order-view.json`
5. **Submit for Review** (can take 24-48 hours)
6. **Copy Flow ID** once approved

## Step 4: Update Environment Variables

Add to Vercel environment variables:
```
WHATSAPP_FLOW_ID=your_flow_id_here
```

## Step 5: Update Code

The `send-order.js` already includes `sendWhatsAppFlow()` function. It will:
- Send Flow message with order details
- Pass session token and order ID as parameters
- Opens in-app WebView within WhatsApp

## Step 6: Test

1. Send test order notification
2. Click Flow button in WhatsApp
3. Should open order page within WhatsApp (not external browser)

## Flow Parameters

The Flow receives:
- `{{1}}` = Order page URL with session token
- Format: `https://movescrow.com/restaurant/order.html?session=XXX&order=YYY`

## Troubleshooting

**Flow not showing:**
- Check Flow ID is correct
- Verify Flow status is "Approved" in Meta Business Manager
- Ensure Flow JSON is publicly accessible

**Opens in external browser:**
- Domain must be verified in Meta Business Manager
- Flow must be approved
- Check Flow JSON structure is valid

**Flow JSON validation:**
- Use Meta's Flow Builder to validate
- Or check Flow JSON format matches Meta's schema

## Alternative: Simplified Flow (If Complex One Fails)

Use this simpler Flow JSON if needed:

```json
{
  "version": "3.0",
  "screens": [
    {
      "id": "main",
      "title": "View Order",
      "data": {
        "url": "{{1}}"
      },
      "type": "NAVIGATE"
    }
  ]
}
```

## Next Steps

After Flow is approved:
1. Update `WHATSAPP_FLOW_ID` in Vercel
2. Test with real order
3. Monitor Flow analytics in Meta Business Manager

