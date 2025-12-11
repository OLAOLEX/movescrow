# Restaurant Dashboard Architecture - WhatsApp Integration

## 🎯 Overview

Web-based restaurant dashboard that connects to Flutter app via WhatsApp Business API (Meta API).

## 📐 Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Flutter App   │────────▶│  WhatsApp Cloud  │────────▶│ Restaurant Web  │
│   (Customer)    │         │   API (Meta)     │         │    Dashboard    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                            │                            │
         │                            │                            │
         └────────────────────────────┴────────────────────────────┘
                                      │
                           ┌──────────────────┐
                           │    Supabase      │
                           │  (Database +     │
                           │   Real-time)     │
                           └──────────────────┘
```

## 🏗️ Tech Stack (FREE TIER)

### Frontend (Web Dashboard)
- **Framework**: Vanilla JS + HTML + CSS (or React if needed)
- **Hosting**: Vercel (FREE - 100GB bandwidth/month)
- **Real-time**: Supabase Realtime (FREE)

### Backend
- **Database**: Supabase PostgreSQL (FREE - 500MB, 2GB bandwidth)
- **Auth**: Supabase Auth (FREE - 50,000 MAU)
- **Storage**: Supabase Storage (FREE - 1GB)
- **Edge Functions**: Supabase Edge Functions (FREE - 500K invocations/month)
- **API**: Vercel Serverless Functions (FREE - 100GB bandwidth)

### WhatsApp Integration
- **WhatsApp Business API**: Meta Cloud API (FREE tier available)
- **Webhooks**: Vercel Serverless Functions
- **Message Handling**: Supabase Edge Functions

## 📊 Database Schema (Supabase)

### Tables

#### 1. `restaurants`
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  whatsapp_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- e.g., "ORD-12345"
  restaurant_id UUID REFERENCES restaurants(id),
  customer_id UUID, -- Flutter app user ID
  customer_whatsapp TEXT, -- Customer WhatsApp number
  items JSONB, -- Order items
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending', -- pending, paid, preparing, ready, picked_up, delivered, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  from_number TEXT NOT NULL, -- WhatsApp number (customer or restaurant)
  to_number TEXT NOT NULL,
  message_text TEXT,
  message_type TEXT DEFAULT 'text', -- text, image, document, button
  whatsapp_message_id TEXT, -- Meta API message ID
  direction TEXT NOT NULL, -- 'inbound' or 'outbound'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `restaurant_auth`
```sql
CREATE TABLE restaurant_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id),
  phone TEXT UNIQUE NOT NULL,
  magic_link_token TEXT UNIQUE,
  magic_link_expires_at TIMESTAMPTZ,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Message Flow

### 1. Customer Orders in Flutter App
```
Flutter App → Create Order in Supabase → 
Trigger WhatsApp Notification to Restaurant → 
Restaurant receives WhatsApp message with "View Order" button
```

### 2. Restaurant Clicks "View Order" Button
```
WhatsApp Button → Opens Web Dashboard (magic link auth) → 
Restaurant logs in → Views order → Can chat with customer
```

### 3. Chat Flow
```
Customer (Flutter) ↔ WhatsApp API ↔ Restaurant (Web Dashboard)
                    ↓
              Stored in Supabase
                    ↓
        Real-time sync to both sides
```

## 🔐 Authentication Flow

### Magic Link Login (Recommended)
1. Restaurant receives WhatsApp message with link
2. Click link → Redirects to `movescrow.com/restaurant/login?token=xxx`
3. Token validated → Auto-login → Dashboard

### OTP Login (Alternative)
1. Restaurant visits dashboard
2. Enter phone number → Receive OTP via WhatsApp
3. Enter OTP → Logged in

## 📱 WhatsApp Integration Points

### 1. Send Order Notification
```javascript
// Vercel Serverless Function
POST /api/whatsapp/send-order-notification
Body: { orderId, restaurantPhone, orderDetails }
```

### 2. Webhook Handler (Receive Messages)
```javascript
// Vercel Serverless Function
POST /api/whatsapp/webhook
Body: Meta webhook payload
```

### 3. Send Message from Dashboard
```javascript
// Supabase Edge Function or Vercel Function
POST /api/whatsapp/send-message
Body: { to, message, orderId }
```

## 🎨 Web Dashboard Structure

```
web/
├── index.html (Landing page)
├── restaurant/
│   ├── index.html (Dashboard home)
│   ├── login.html (Login page)
│   ├── orders.html (Orders list)
│   ├── chat.html (Chat interface)
│   ├── settings.html (Settings)
│   └── earnings.html (Earnings)
├── api/
│   ├── whatsapp/
│   │   ├── webhook.js (Meta webhook handler)
│   │   ├── send-message.js (Send WhatsApp message)
│   │   └── send-notification.js (Send order notification)
│   └── auth/
│       └── magic-link.js (Magic link validation)
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── vercel.json (Vercel config)
```

## 🔧 Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp Meta API
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# App URLs
APP_URL=https://www.movescrow.com
RESTAURANT_DASHBOARD_URL=https://www.movescrow.com/restaurant
```

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Create Supabase project
- [ ] Set up database tables
- [ ] Configure WhatsApp Business API
- [ ] Set up Vercel project
- [ ] Configure environment variables

### Phase 2: Authentication
- [ ] Magic link login page
- [ ] OTP login (alternative)
- [ ] Session management
- [ ] Protected routes

### Phase 3: Orders
- [ ] Orders list page
- [ ] Order details page
- [ ] Order status updates
- [ ] Real-time order updates

### Phase 4: WhatsApp Integration
- [ ] Webhook handler (receive messages)
- [ ] Send message function
- [ ] Send order notification
- [ ] Chat interface

### Phase 5: Chat Interface
- [ ] Chat UI (WhatsApp-like)
- [ ] Real-time message sync
- [ ] Send/receive messages
- [ ] Payment button detection

### Phase 6: Settings & Earnings
- [ ] Restaurant profile
- [ ] Banking details
- [ ] Earnings dashboard
- [ ] Payout requests

## 🚀 Free Tier Limits & Solutions

### Supabase Limits (FREE)
- ✅ 500MB database (enough for ~100K orders)
- ✅ 50K MAU (more than enough)
- ✅ 500K Edge Function invocations/month
- ⚠️ 2GB bandwidth/month (may need upgrade if popular)

**Solution**: Cache static assets on Vercel CDN

### Vercel Limits (FREE)
- ✅ 100GB bandwidth/month
- ✅ Unlimited serverless functions
- ✅ Automatic HTTPS
- ⚠️ 100GB bandwidth (should be enough for dashboard)

**Solution**: Use Supabase for heavy data, Vercel for API routes

### WhatsApp Business API
- ✅ FREE tier available (limited messages)
- ⚠️ Need business verification for full access

**Solution**: Start with free tier, upgrade when needed

## 🔗 Integration with Flutter App

### Real-time Sync via Supabase
```dart
// Flutter app subscribes to order updates
final subscription = supabase
  .from('orders')
  .stream(primaryKey: ['id'])
  .eq('customer_id', userId)
  .listen((orders) {
    // Update UI
  });
```

### Send Message to Restaurant
```dart
// Flutter app sends message via Supabase
await supabase.from('chat_messages').insert({
  'order_id': orderId,
  'from_number': customerWhatsApp,
  'to_number': restaurantWhatsApp,
  'message_text': message,
  'direction': 'outbound',
});
```

## 📝 Next Steps

1. **Set up Supabase**: Create project, configure tables
2. **Set up WhatsApp API**: Get access token, configure webhook
3. **Create web dashboard**: Build login, orders, chat pages
4. **Connect Flutter app**: Update app to use Supabase
5. **Test end-to-end**: Full order flow test


