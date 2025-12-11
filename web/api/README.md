# Movescrow Restaurant Dashboard API Routes

Vercel serverless functions for restaurant dashboard functionality.

## 📁 API Routes

### Authentication

#### `POST /api/auth/send-otp`
Send OTP to restaurant phone number.

**Request:**
```json
{
  "phone": "+2348000000000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

---

#### `POST /api/auth/verify-otp`
Verify OTP and create session.

**Request:**
```json
{
  "phone": "+2348000000000",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "session_token_here",
  "restaurant": {
    "id": "uuid",
    "name": "Restaurant Name",
    "phone": "+2348000000000"
  },
  "expiresAt": "2024-12-01T12:00:00Z"
}
```

---

#### `POST /api/auth/magic-link`
Generate magic link for restaurant authentication.

**Request:**
```json
{
  "restaurantId": "uuid",
  "orderId": "uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "magicLink": "https://movescrow.com/restaurant/auth?token=xxx&order=yyy",
  "token": "token_here",
  "expiresAt": "2024-12-01T12:00:00Z"
}
```

---

#### `GET /api/auth/verify-token`
Verify magic link token and get restaurant session.

**Request:**
```
GET /api/auth/verify-token?token=xxx
```

**Response:**
```json
{
  "success": true,
  "session": {
    "token": "token_here",
    "expiresAt": "2024-12-01T12:00:00Z"
  },
  "restaurant": {
    "id": "uuid",
    "name": "Restaurant Name",
    "phone": "+2348000000000"
  }
}
```

---

### Notifications

#### `POST /api/notifications/send-order`
Send order notification to restaurant (SMS/WhatsApp).

**Request:**
```json
{
  "restaurantId": "uuid",
  "orderId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent",
  "magicLink": "https://movescrow.com/restaurant/auth?token=xxx&order=yyy",
  "method": "sms"
}
```

---

### WhatsApp

#### `GET /api/whatsapp/webhook`
Webhook verification for Meta WhatsApp Business API.

**Request:**
```
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=yyy
```

**Response:**
```
challenge_string
```

---

#### `POST /api/whatsapp/webhook`
Receive incoming WhatsApp messages.

**Request:** (From Meta)
```json
{
  "object": "whatsapp_business_account",
  "entry": [...]
}
```

**Response:**
```
OK
```

---

#### `POST /api/whatsapp/send-message`
Send WhatsApp message.

**Request:**
```json
{
  "to": "+2348000000000",
  "message": "Hello!",
  "orderId": "uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "whatsapp_message_id",
  "result": {...}
}
```

---

### Orders

#### `GET /api/orders/messages`
Get chat messages for an order.

**Request:**
```
GET /api/orders/messages?orderId=uuid
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "from_number": "+2348000000000",
      "to_number": "+2348000000001",
      "message_text": "Hello!",
      "direction": "inbound",
      "created_at": "2024-12-01T12:00:00Z"
    }
  ]
}
```

---

#### `POST /api/orders/messages`
Send message in order chat.

**Request:**
```json
{
  "orderId": "uuid",
  "message": "Hello!",
  "fromNumber": "+2348000000000", // optional
  "token": "session_token" // optional for restaurant
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "order_id": "uuid",
    "message_text": "Hello!",
    "direction": "outbound",
    "created_at": "2024-12-01T12:00:00Z"
  }
}
```

---

## 🔧 Environment Variables

Required environment variables (set in Vercel Dashboard):

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# WhatsApp (Meta API)
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_VERIFY_TOKEN=xxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxx

# SMS Providers (choose one or both)
TERMII_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# App
APP_URL=https://movescrow.com
```

---

## 📦 Dependencies

These functions require:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0"
  }
}
```

Create a `package.json` in the `web/` directory if deploying to Vercel:

```json
{
  "name": "movescrow-web",
  "version": "1.0.0",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## 🧪 Testing

### Local Testing with Vercel CLI

```bash
npm install -g vercel
cd web
vercel dev
```

### Test Endpoints

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2348000000000"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2348000000000", "otp": "123456"}'
```

---

## 🚀 Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel Dashboard
4. Deploy!

Vercel will automatically detect and deploy all API routes in the `api/` directory.

