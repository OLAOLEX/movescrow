# Restaurant Dashboard Setup Guide - In-App Browser Architecture

## 🎯 Overview

Complete setup guide for Movescrow Restaurant Dashboard using **in-app browser approach** with per-order chat threads, magic link authentication, and organized WhatsApp-like interface. This revolutionary approach enables easy restaurant onboarding without app installation.

## 💡 The Concept: In-App Browser Dashboard

### How It Works

**For Restaurants:**
1. Restaurant receives notification: "You have a new order! View"
2. Restaurant taps "View" button
3. In-app browser opens (like banking apps)
4. Shows Movescrow Restaurant Dashboard
5. WhatsApp-like chat interface
6. **Each order = separate chat thread** (organized, no confusion)
7. Easy to manage multiple orders

**For Customers:**
1. Customer messages restaurant in Movescrow app
2. Message sent via Movescrow backend
3. Restaurant receives notification
4. Restaurant views in dashboard
5. Restaurant responds
6. Customer sees response in app

**Key Benefits:**
- ✅ **Organized** - Each order = separate thread (no message mismatch)
- ✅ **Easy Onboarding** - No app installation needed, works in browser
- ✅ **Better UX** - Professional dashboard, not cluttered WhatsApp
- ✅ **Cost-Effective** - ₦0.51-₦5.05 per order
- ✅ **Scalable** - Works with any restaurant, globally

## 📋 Prerequisites

1. ✅ Meta WhatsApp Business API access (you mentioned you have this)
2. ✅ Supabase account (free tier)
3. ✅ Vercel account (free tier)
4. ✅ GitHub account (for deployment)

## 🗄️ Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Organization**: Your org (or create new)
   - **Name**: `movescrow-restaurant`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to Nigeria (e.g., Europe West)
   - **Pricing Plan**: Free
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### 1.2 Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run this:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants table (Enhanced)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  whatsapp_phone TEXT,
  address TEXT,
  description TEXT,
  coordinates POINT,
  
  -- Banking Details
  bank_account_number VARCHAR(20),
  bank_name VARCHAR(100),
  account_name VARCHAR(255),
  banking_verified BOOLEAN DEFAULT false,
  
  -- Settings
  notification_preference VARCHAR(20) DEFAULT 'sms', -- sms, whatsapp, push
  payout_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  minimum_payout DECIMAL(10,2) DEFAULT 1000.00,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, inactive
  verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (Enhanced with chat tracking)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  order_ref VARCHAR(20) UNIQUE NOT NULL, -- e.g., "ORD-789456"
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  customer_code VARCHAR(10) NOT NULL, -- e.g., "#12345" (for privacy)
  customer_whatsapp TEXT NOT NULL,
  items JSONB,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'awaiting_payment', 'paid', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
  
  -- Chat tracking (per-order thread)
  last_message_at TIMESTAMPTZ,
  unread_messages_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'button', 'system')),
  whatsapp_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant auth table (Magic link + OTP)
CREATE TABLE restaurant_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  magic_link_token TEXT UNIQUE,
  magic_link_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant sessions table (for magic link authentication)
CREATE TABLE restaurant_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_ref ON orders(order_ref);
CREATE INDEX idx_orders_customer_code ON orders(customer_code);
CREATE INDEX idx_chat_messages_order_id ON chat_messages(order_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_restaurant_auth_phone ON restaurant_auth(phone);
CREATE INDEX idx_restaurant_sessions_token ON restaurant_sessions(token);
CREATE INDEX idx_restaurant_sessions_restaurant ON restaurant_sessions(restaurant_id);
CREATE INDEX idx_restaurants_phone ON restaurants(phone);
CREATE INDEX idx_restaurants_status ON restaurants(status);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_auth ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth needs)
-- For now, allow all (you'll restrict later)
CREATE POLICY "Enable all for service role" ON restaurants FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON restaurant_auth FOR ALL USING (true);
```

### 1.3 Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `orders`
   - `chat_messages`

### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

## 🔔 Step 2: Set Up Notification System

### 2.1 Notification Options

**Option 1: SMS Notification (Recommended for Launch)**
- **Cost**: ₦2-₦5 per SMS
- **Reliability**: High
- **Works on**: Any phone
- **Message Format**:
```
Movescrow: You have a new order!

Order: ORD-789456
Customer: Order #12345

View: https://movescrow.com/restaurant/orders/ORD-789456

Reply STOP to opt out
```

**Option 2: WhatsApp Notification**
- **Cost**: ₦0.50-₦2 per message (or free with Meta API)
- **Reliability**: High
- **Works on**: Smartphones with WhatsApp
- **Message Format**:
```
Movescrow: You have a new order!

Order: ORD-789456
Customer: Order #12345

View: https://movescrow.com/restaurant/orders/ORD-789456
```

**Option 3: Push Notification (If Restaurant Has App)**
- **Cost**: Free
- **Reliability**: High (if app installed)
- **Works on**: iOS/Android with Movescrow app

### 2.2 SMS Provider Setup (Recommended)

**Option A: Termii (Nigerian SMS Provider)**
1. Sign up at https://termii.com
2. Get API key
3. Add to environment variables: `TERMII_API_KEY`

**Option B: Twilio**
1. Sign up at https://twilio.com
2. Get Account SID and Auth Token
3. Add to environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`

### 2.3 WhatsApp Business API Setup

1. Go to https://developers.facebook.com
2. Create/select your app
3. Add **WhatsApp** product
4. Get:
   - **Access Token**: `EAAxxxxx...`
   - **Phone Number ID**: `1234567890`
   - **Business Account ID**: `123456789`
   - **App ID** and **App Secret**

### 2.4 Set Up WhatsApp Webhook

1. In Meta Developer Console → WhatsApp → Configuration
2. Set **Webhook URL**: `https://movescrow.vercel.app/api/whatsapp/webhook`
3. Set **Verify Token**: `movescrow00secret`
4. Subscribe to: `messages`
5. Click **Verify and Save**

**✅ Webhook Configuration:**
- ✅ Callback URL: `https://movescrow.vercel.app/api/whatsapp/webhook`
- ✅ Verify Token: `movescrow00secret`

**Environment Variable:**
```env
WHATSAPP_VERIFY_TOKEN=movescrow00secret
```

**Note:** The webhook handler uses `movescrow00secret` as default, but you should still set it as an environment variable.

## 🔐 Step 3: Magic Link Authentication

### 3.1 How Magic Links Work

**Flow:**
1. Restaurant receives order notification with link
2. Link format: `https://movescrow.com/restaurant/auth?token=xxx&order=ORD-789456`
3. Restaurant clicks link → Auto-logged in
4. Session stored (24 hours)
5. Redirected to order chat

**Benefits:**
- ✅ No password needed
- ✅ One-click login
- ✅ Secure (token expires)
- ✅ Works on any device

### 3.2 Generate Magic Link Token

```javascript
// In your API route
const crypto = require('crypto');

function generateMagicLinkToken(restaurantId, orderId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Save to restaurant_sessions table
  // Return URL: https://movescrow.com/restaurant/auth?token=${token}&order=${orderId}
}
```

## 🚀 Step 4: Set Up Vercel

### 4.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 4.2 Create API Routes

Create these files in `web/api/`:

#### `web/api/auth/send-otp.js`
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Save OTP to Supabase
  await supabase
    .from('restaurant_auth')
    .upsert({
      phone,
      otp_code: otp,
      otp_expires_at: expiresAt.toISOString()
    });
  
  // Send OTP via SMS (using Termii or Twilio)
  // await sendSMS(phone, `Your Movescrow OTP: ${otp}`);
  
  res.json({ success: true, message: 'OTP sent' });
}
```

#### `web/api/auth/magic-link.js`
```javascript
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { restaurantId, orderId } = req.body;
  
  // Generate magic link token
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
  
  // Generate magic link URL
  const magicLink = `https://movescrow.com/restaurant/auth?token=${token}&order=${orderId}`;
  
  res.json({ success: true, magicLink });
}
```

#### `web/api/notifications/send-order.js`
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { restaurantId, orderId } = req.body;
  
  // Get restaurant and order details
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();
  
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  // Generate magic link
  const magicLink = await generateMagicLink(restaurantId, orderId);
  
  // Send notification based on preference
  if (restaurant.notification_preference === 'sms') {
    const message = `Movescrow: You have a new order!

Order: ${order.order_ref}
Customer: Order ${order.customer_code}

View: ${magicLink}

Reply STOP to opt out`;
    
    await sendSMS(restaurant.phone, message);
  } else if (restaurant.notification_preference === 'whatsapp') {
    const message = `Movescrow: You have a new order!

Order: ${order.order_ref}
Customer: Order ${order.customer_code}

View: ${magicLink}`;
    
    await sendWhatsApp(restaurant.whatsapp_phone, message);
  }
  
  res.json({ success: true });
}
```

#### `web/api/whatsapp/webhook.js`
```javascript
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  } else if (req.method === 'POST') {
    // Handle incoming messages
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
      // Process webhook events
      console.log('Webhook received:', body);
      
      // Handle message events
      if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
        const messages = body.entry[0].changes[0].value.messages;
        
        for (const message of messages) {
          // Save to Supabase
          // Notify restaurant dashboard
        }
      }
    }
    
    res.status(200).send('OK');
  } else {
    res.status(405).send('Method not allowed');
  }
}
```

### 4.3 Configure Environment Variables

Create `vercel.json` in `web/`:

```json
{
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "WHATSAPP_ACCESS_TOKEN": "@whatsapp-access-token",
    "WHATSAPP_PHONE_NUMBER_ID": "@whatsapp-phone-number-id",
    "WHATSAPP_VERIFY_TOKEN": "@whatsapp-verify-token",
    "WHATSAPP_BUSINESS_ACCOUNT_ID": "@whatsapp-business-account-id",
    "TERMII_API_KEY": "@termii-api-key",
    "TWILIO_ACCOUNT_SID": "@twilio-account-sid",
    "TWILIO_AUTH_TOKEN": "@twilio-auth-token"
  },
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

Set these in Vercel Dashboard → Settings → Environment Variables.

## 💬 Step 5: Per-Order Chat Threads Architecture

### 5.1 Chat Thread Design

**Key Concept:** Each order has its own separate chat thread
- No message confusion
- Clear order history
- Easy to manage multiple orders
- WhatsApp-like interface but organized

**URL Structure:**
- Dashboard: `https://movescrow.com/restaurant/dashboard`
- Order Chat: `https://movescrow.com/restaurant/orders/ORD-789456`
- Settings: `https://movescrow.com/restaurant/settings`

### 5.2 Chat Interface Features

**Per-Order Thread:**
- Messages grouped by `order_id`
- Real-time updates via Supabase Realtime
- Message history per order
- File attachments support
- Payment notifications (system messages)
- Order status updates

**Message Types:**
- `text` - Regular messages
- `image` - Photo attachments
- `document` - File attachments
- `button` - Interactive buttons
- `system` - Payment/status notifications

## 🔧 Step 6: Configure Web App

### 6.1 Update Environment Variables

In `web/restaurant/app.js`, update:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

Or use environment variables if using a build tool.

### 6.2 Update API Base URL

In `web/restaurant/app.js`:
```javascript
const API_BASE_URL = 'https://your-vercel-url.vercel.app/api';
```

## 💰 Step 7: Cost Analysis

### 7.1 Notification Costs

**SMS (Recommended):**
- Per SMS: ₦2-₦5
- Per order: 1 SMS = ₦2-₦5
- 1,000 orders/month = ₦2,000-₦5,000/month

**WhatsApp (Alternative):**
- Per message: ₦0.50-₦2 (or free with Meta API)
- Per order: 1 message = ₦0.50-₦2
- 1,000 orders/month = ₦500-₦2,000/month

**Push Notification (If App):**
- Per notification: ₦0 (free)

### 7.2 Web Dashboard Costs

- Hosting (Vercel): ₦0 (free tier) or ₦10K-₦50K/month (pro)
- Domain: ₦5K/year
- SSL: ₦0 (Let's Encrypt free)
- **Total: ₦0-₦50K/month**

### 7.3 Total Cost per Order

- Notification: ₦0.50-₦5
- Dashboard: ₦0.01-₦0.05 (hosting divided by orders)
- **Total: ₦0.51-₦5.05 per order**

**Very affordable!**

## 🧪 Step 8: Test Integration

### 8.1 Test Supabase Connection

1. Open `web/restaurant/index.html` in browser
2. Open DevTools Console
3. Check for Supabase connection errors

### 8.2 Test WhatsApp Webhook

1. Send a test message to your WhatsApp Business number
2. Check Vercel logs for webhook events
3. Check Supabase database for new messages

### 8.3 Test Order Flow

1. Create a test order in Supabase with:
   - `order_ref`: "ORD-789456"
   - `customer_code`: "#12345"
   - `restaurant_id`: (your test restaurant)
2. Check if it appears in dashboard
3. Test chat functionality
4. Test magic link authentication

### 8.4 Test Magic Link

1. Generate magic link via API
2. Open link in browser
3. Verify auto-login works
4. Verify redirect to order chat

1. Create a test order in Supabase
2. Check if it appears in dashboard
3. Test chat functionality

## 📱 Step 9: Connect Flutter App (In-App Browser)

### 6.1 Install Supabase Flutter Package

```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0
```

### 6.2 Initialize Supabase in Flutter

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

await Supabase.initialize(
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
);
```

### 9.1 Open Dashboard in WebView

```dart
import 'package:webview_flutter/webview_flutter.dart';

// When restaurant needs to view order
void openRestaurantDashboard(String orderId, String magicLinkToken) {
  final url = 'https://movescrow.com/restaurant/auth?token=$magicLinkToken&order=$orderId';
  
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => Scaffold(
        appBar: AppBar(title: Text('Restaurant Dashboard')),
        body: WebView(
          initialUrl: url,
          javascriptMode: JavascriptMode.unrestricted,
        ),
      ),
    ),
  );
}
```

### 9.2 Create Order from Flutter

```dart
// Generate order reference and customer code
final orderRef = 'ORD-${DateTime.now().millisecondsSinceEpoch}';
final customerCode = '#${userId.toString().substring(0, 5)}';

final order = await Supabase.instance.client
  .from('orders')
  .insert({
    'order_number': orderRef,
    'order_ref': orderRef,
    'restaurant_id': restaurantId,
    'customer_id': userId,
    'customer_code': customerCode,
    'customer_whatsapp': userPhone,
    'items': orderItems,
    'total_amount': totalAmount,
    'status': 'pending',
    'payment_status': 'pending',
  });

// Send notification to restaurant with magic link
await sendRestaurantNotification(restaurantId, order.id);
```

## 🎯 Next Steps

1. ✅ Complete API route implementations
2. ✅ Implement magic link authentication
3. ✅ Set up SMS/WhatsApp notification service
4. ✅ Implement per-order chat threads
5. ✅ Add order status updates
6. ✅ Add payment integration
7. ✅ Set up earnings dashboard
8. ✅ Add banking details form
9. ✅ Implement WebView in Flutter app
10. ✅ Test end-to-end flow

## 🎨 Dashboard Features to Implement

### Phase 1: Core Features
- ✅ Restaurant login (magic link + OTP)
- ✅ Order list view (active orders)
- ✅ Per-order chat interface
- ✅ Real-time message updates
- ✅ Order status management

### Phase 2: Enhanced Features
- ✅ Banking details management
- ✅ Earnings dashboard
- ✅ Payout requests
- ✅ Notification preferences
- ✅ Restaurant profile settings

### Phase 3: Advanced Features
- ✅ Analytics dashboard
- ✅ Order history with search
- ✅ File attachments in chat
- ✅ PWA support (installable)
- ✅ Multi-language support

## 🐛 Troubleshooting

### Supabase Connection Issues
- Check API keys are correct
- Verify RLS policies allow access
- Check CORS settings

### WhatsApp Webhook Issues
- Verify webhook URL is publicly accessible
- Check verify token matches
- Review Meta Developer Console webhook logs

### Real-time Not Working
- Enable replication in Supabase
- Check channel subscriptions in code
- Verify WebSocket connections

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Vercel Docs: https://vercel.com/docs
- Termii SMS API: https://termii.com/docs
- Twilio SMS API: https://www.twilio.com/docs/sms
- WebView Flutter: https://pub.dev/packages/webview_flutter

## ✅ Advantages of This Architecture

1. **Organized Chat Threads**
   - Each order = separate thread
   - No message confusion
   - Easy to manage multiple orders
   - Clear order history

2. **Easy Onboarding**
   - No app installation needed
   - Works in browser
   - Simple registration (2-3 minutes)
   - Banking details in same interface

3. **Better UX**
   - Professional dashboard
   - Not cluttered (unlike WhatsApp)
   - Order management features
   - Earnings tracking

4. **Scalability**
   - Works with any restaurant
   - No app distribution needed
   - Easy updates (web-based)
   - Cross-platform (iOS, Android, Web)

5. **Cost-Effective**
   - SMS notifications: ₦2-₦5 per order
   - OR WhatsApp: ₦0.50-₦2 (or free)
   - Web hosting: ₦0-₦50K/month
   - Total: ₦0.51-₦5.05 per order


