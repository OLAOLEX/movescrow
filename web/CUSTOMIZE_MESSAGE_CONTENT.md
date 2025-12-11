# Customize Order Notification Message Content

## 📝 Where to Edit Messages

Messages are defined in: `web/api/notifications/send-order.js`

---

## 💬 WhatsApp Message Format

**Location:** Lines 112-118

**Current Format:**
```javascript
const messageText = `🍽️ *New Order Received!*

📦 Order: *${order.order_ref}*
👤 Customer: ${order.customer_code}
💰 Amount: *₦${parseFloat(order.total_amount || 0).toLocaleString()}*

Tap the button below to view and manage this order:`;
```

**Variables Available:**
- `${order.order_ref}` - Order reference number (e.g., ORD-001)
- `${order.customer_code}` - Customer code/identifier
- `${parseFloat(order.total_amount || 0).toLocaleString()}` - Formatted order amount

---

## 📱 SMS Message Format

**Location:** Lines 89-97

**Current Format:**
```javascript
const message = `Movescrow: You have a new order!

Order: ${order.order_ref}
Customer: Order ${order.customer_code}
Amount: ₦${parseFloat(order.total_amount || 0).toLocaleString()}

View: ${magicLink}

Reply STOP to opt out`;
```

**Variables Available:**
- `${order.order_ref}` - Order reference number
- `${order.customer_code}` - Customer code
- `${parseFloat(order.total_amount || 0).toLocaleString()}` - Formatted amount
- `${magicLink}` - Authentication link to dashboard

---

## ✏️ How to Customize

### Example: Change WhatsApp Message

**Before:**
```javascript
const messageText = `🍽️ *New Order Received!*

📦 Order: *${order.order_ref}*
👤 Customer: ${order.customer_code}
💰 Amount: *₦${parseFloat(order.total_amount || 0).toLocaleString()}*

Tap the button below to view and manage this order:`;
```

**After (Customized):**
```javascript
const messageText = `🎉 *Hey! New order waiting for you!*

🆔 Order Number: *${order.order_ref}*
👥 Customer: ${order.customer_code}
💵 Total: *₦${parseFloat(order.total_amount || 0).toLocaleString()}*

🚀 Tap below to see details and start preparing!`;
```

---

### Example: Change SMS Message

**Before:**
```javascript
const message = `Movescrow: You have a new order!

Order: ${order.order_ref}
Customer: Order ${order.customer_code}
Amount: ₦${parseFloat(order.total_amount || 0).toLocaleString()}

View: ${magicLink}

Reply STOP to opt out`;
```

**After (Customized):**
```javascript
const message = `🎉 New order alert!

Order #${order.order_ref}
Customer: ${order.customer_code}
Total: ₦${parseFloat(order.total_amount || 0).toLocaleString()}

Open: ${magicLink}

Need help? Reply HELP`;
```

---

## 📋 Available Order Fields

You can access any field from the `order` object:

- `order.order_ref` - Order reference number
- `order.customer_code` - Customer identifier
- `order.total_amount` - Total order amount
- `order.status` - Order status
- `order.created_at` - Order creation time
- `order.restaurant_id` - Restaurant ID
- `order.customer_whatsapp` - Customer WhatsApp number
- And any other fields in your orders table

---

## 🎨 Formatting Tips

### WhatsApp (Supports Rich Text):
- Use `*bold*` for bold text
- Use `_italic_` for italic text
- Use `~strikethrough~` for strikethrough
- Emojis work: 🍽️ 📦 👤 💰 🎉 ✅

### SMS (Plain Text):
- No rich formatting
- Emojis work (but may not display on all devices)
- Keep it short (SMS has 160 character limit per message)

---

## 🧪 Test Your Changes

After editing, test the notification:

```powershell
$body = @{
    restaurantId = "your-restaurant-id"
    orderId = "your-order-id"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 📝 Quick Edit Guide

1. Open `web/api/notifications/send-order.js`
2. Find the message you want to change (lines 89-97 for SMS, 112-118 for WhatsApp)
3. Edit the template string
4. Save and commit
5. Test with real order

---

**Remember:** After editing, redeploy to Vercel or wait for auto-deploy to see changes!

