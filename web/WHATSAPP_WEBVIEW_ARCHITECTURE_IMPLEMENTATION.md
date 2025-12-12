# WhatsApp WebView Architecture - Complete Implementation Guide

## 🎯 **Architecture Overview**

**Recommended Setup:**
```
WhatsApp Message → Button → WebView (Real Web App) → Backend API → Database
```

**NOT:**
```
WhatsApp Message → WhatsApp Flow → Limited functionality
```

---

## 📋 **Table of Contents**

1. [Architecture Components](#architecture-components)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [WhatsApp Message Templates & Automation](#whatsapp-message-templates--automation)
4. [WebView Web App Setup](#webview-web-app-setup)
5. [Backend API Integration](#backend-api-integration)
6. [Deep Linking & Session Management](#deep-linking--session-management)
7. [Restaurant Messaging Automation](#restaurant-messaging-automation)
8. [Future Expansion (KYC/Onboarding)](#future-expansion-kyconboarding)

---

## 🏗️ **Architecture Components**

### **Layer 1: WhatsApp Business API**
- Sends messages to restaurants
- Provides buttons with deep links
- Handles incoming webhooks

### **Layer 2: WebView Web App**
- Real HTML/JS/CSS application
- Runs in WhatsApp's in-app browser
- Full API capabilities
- OAuth/session management

### **Layer 3: Backend API**
- RESTful API for all operations
- NIN/BVN verification integration
- Session management
- Database operations

---

## 🔧 **Step-by-Step Implementation**

---

## **STEP 1: WhatsApp Business API Setup**

### **1.1. Prerequisites**
- WhatsApp Business Account (via Meta Business)
- WhatsApp Business API access (Cloud API or On-Premises)
- Phone number verified
- Webhook URL configured

### **1.2. Install WhatsApp Business SDK**

**Node.js Example:**
```bash
npm install @whatsapp-business/sdk axios
```

**Python Example:**
```bash
pip install whatsapp-business-api python-dotenv
```

### **1.3. Environment Variables**

**`.env` file:**
```env
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_API_VERSION=v21.0
BASE_URL=https://yourdomain.com
WEBVIEW_BASE_URL=https://yourdomain.com/webview
```

---

## **STEP 2: Send WhatsApp Messages with Deep Link Buttons (Movescrow Flow)**

### **2.1. Function to Send New Order Request Notification**

**Node.js:**
```javascript
const axios = require('axios');

/**
 * Send new order request to restaurant (NO PRICING - restaurant will provide it)
 * Flow: Order Request → Accept/Reject → Pricing → Payment
 */
async function sendOrderRequestNotification(restaurantPhoneNumber, orderId, orderDetails) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  // Generate secure session token
  const sessionToken = generateSessionToken(restaurantPhoneNumber, orderId);
  
  // Deep link URL for WebView
  const deepLinkUrl = `${process.env.WEBVIEW_BASE_URL}/restaurant/order/${orderId}?session=${sessionToken}`;
  
  // Format order items list
  const itemsList = orderDetails.items
    .map(item => `• ${item.name} × ${item.quantity}`)
    .join('\n');
  
  const messagePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: restaurantPhoneNumber,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `🍽️ *Movescrow: New Order Request!*\n\n` +
              `*Order:* ${orderId}\n` +
              `*Customer:* ${orderDetails.customerCode}\n\n` +
              `*Items:*\n${itemsList}\n\n` +
              `*Delivery Address:*\n${orderDetails.deliveryAddress}\n\n` +
              (orderDetails.specialInstructions ? 
                `*Special Instructions:*\n${orderDetails.specialInstructions}\n\n` : '') +
              `Tap below to view and respond.`
      },
      action: {
        buttons: [
          {
            type: "url",
            title: "📋 View & Respond",
            url: deepLinkUrl
          }
        ]
      },
      footer: {
        text: "Movescrow"
      }
    }
  };
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Order request sent to restaurant:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending order request:', error.response?.data || error.message);
    throw error;
  }
}

// Generate secure session token (JWT)
function generateSessionToken(phoneNumber, orderId) {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  
  return jwt.sign(
    {
      phone: phoneNumber,
      orderId: orderId,
      type: 'restaurant_session',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    },
    secret
  );
}

module.exports = { sendOrderNotification };
```

**Python:**
```python
import requests
import jwt
import os
from datetime import datetime, timedelta

def send_order_notification(restaurant_phone_number, order_id, order_details):
    access_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
    phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
    
    # Generate secure session token
    session_token = generate_session_token(restaurant_phone_number, order_id)
    
    # Deep link URL
    deep_link_url = f"{os.getenv('WEBVIEW_BASE_URL')}/order/{order_id}?session={session_token}"
    
    message_payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": restaurant_phone_number,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": f"🍽️ New Order Received!\n\nOrder ID: {order_id}\nCustomer: {order_details['customer_name']}\nItems: {order_details['items']}\n\nTap below to view and manage this order."
            },
            "action": {
                "buttons": [
                    {
                        "type": "url",
                        "title": "📋 View Order",
                        "url": deep_link_url
                    }
                ]
            },
            "footer": {
                "text": "Movescrow"
            }
        }
    }
    
    try:
        response = requests.post(
            f"https://graph.facebook.com/v21.0/{phone_number_id}/messages",
            json=message_payload,
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error sending message: {e}')
        raise

def generate_session_token(phone_number, order_id):
    secret = os.getenv('JWT_SECRET')
    
    payload = {
        'phone': phone_number,
        'order_id': order_id,
        'type': 'restaurant_session',
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    
    return jwt.encode(payload, secret, algorithm='HS256')
```

---

## **STEP 3: WebView Web App Setup**

### **3.1. Project Structure**

```
webview-app/
├── index.html
├── order.html
├── styles/
│   └── main.css
├── scripts/
│   ├── api.js
│   ├── auth.js
│   └── order.js
├── assets/
│   └── images/
└── package.json
```

### **3.2. Main HTML (restaurant-order.html) - Movescrow Flow**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Management - Movescrow</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1>🍽️ New Order Request</h1>
            <div class="order-id" id="orderId">Loading...</div>
        </header>

        <!-- Order Details -->
        <section class="order-details" id="orderDetails">
            <div class="loading">Loading order details...</div>
        </section>

        <!-- Action Buttons (Only shown if order is pending) -->
        <section class="actions" id="actionButtons" style="display: none;">
            <button class="btn btn-accept" id="acceptBtn" onclick="acceptOrder()">
                ✅ Accept Order
            </button>
            <button class="btn btn-reject" id="rejectBtn" onclick="rejectOrder()">
                ❌ Reject Order
            </button>
        </section>

        <!-- Pricing Form (Shown after accept) -->
        <section class="pricing-section" id="pricingSection" style="display: none;">
            <h2>Set Price & Ready Time</h2>
            <div class="form-group">
                <label for="totalAmount">Total Amount (₦)</label>
                <input type="number" id="totalAmount" placeholder="e.g. 4700" required>
            </div>
            <div class="form-group">
                <label for="readyTime">Ready in (minutes)</label>
                <input type="number" id="readyTime" placeholder="e.g. 30" min="5" max="120" required>
            </div>
            <button class="btn btn-primary" onclick="submitPrice()">Confirm Price</button>
        </section>

        <!-- Order Status (If already processed) -->
        <section class="order-status" id="orderStatus" style="display: none;">
            <div class="status-badge" id="statusBadge"></div>
            <div class="status-message" id="statusMessage"></div>
        </section>

        <!-- Status Messages -->
        <div class="message" id="message"></div>
    </div>

    <script src="scripts/auth.js"></script>
    <script src="scripts/api.js"></script>
    <script src="scripts/restaurant-order.js"></script>
</body>
</html>
```

### **3.3. Authentication & Session (auth.js)**

```javascript
// Extract session token from URL
function getSessionToken() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('session');
}

// Verify session token
async function verifySession() {
  const token = getSessionToken();
  if (!token) {
    window.location.href = '/error?msg=No session token';
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      throw new Error('Invalid session');
    }

    const data = await response.json();
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('restaurantId', data.restaurant_id);
    localStorage.setItem('phoneNumber', data.phone);
    
    return data;
  } catch (error) {
    console.error('Session verification failed:', error);
    window.location.href = '/error?msg=Session expired';
    return null;
  }
}

// Get order ID from URL
function getOrderId() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const session = await verifySession();
  if (session) {
    loadOrderDetails();
  }
});
```

### **3.4. API Client (api.js)**

```javascript
const API_BASE_URL = 'https://yourdomain.com/api/v1';

// API helper functions
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('sessionToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// API endpoints
const API = {
  getOrder: (orderId) => apiRequest(`/orders/${orderId}`),
  
  acceptOrder: (orderId, data) => 
    apiRequest(`/orders/${orderId}/accept`, 'POST', data),
  
  rejectOrder: (orderId, reason) => 
    apiRequest(`/orders/${orderId}/reject`, 'POST', { reason }),
  
  setPrice: (orderId, price, readyTime) => 
    apiRequest(`/orders/${orderId}/set-price`, 'POST', { price, ready_time: readyTime }),
  
  updateStatus: (orderId, status) => 
    apiRequest(`/orders/${orderId}/status`, 'POST', { status }),
  
  // Future: KYC/Onboarding APIs
  verifyNIN: (nin) => apiRequest('/verification/nin', 'POST', { nin }),
  verifyBVN: (bvn) => apiRequest('/verification/bvn', 'POST', { bvn }),
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Handle file upload separately
  }
};

// Export for use in other scripts
window.API = API;
```

### **3.5. Order Management (order.js)**

```javascript
// Load order details
async function loadOrderDetails() {
  const orderId = getOrderId();
  const orderIdElement = document.getElementById('orderId');
  
  try {
    orderIdElement.textContent = `Order #${orderId}`;
    
    const order = await API.getOrder(orderId);
    displayOrderDetails(order);
    
    // Check if already accepted/rejected
    if (order.status === 'accepted') {
      showPriceForm(order);
    } else if (order.status === 'rejected') {
      showRejectedMessage();
    }
  } catch (error) {
    showMessage('Failed to load order details', 'error');
    console.error(error);
  }
}

// Display order details
function displayOrderDetails(order) {
  const container = document.getElementById('orderDetails');
  
  container.innerHTML = `
    <div class="order-info">
      <div class="info-row">
        <span class="label">Customer:</span>
        <span class="value">${order.customer_name} (${order.customer_code})</span>
      </div>
      <div class="info-row">
        <span class="label">Items:</span>
        <span class="value">${order.items}</span>
      </div>
      <div class="info-row">
        <span class="label">Special Instructions:</span>
        <span class="value">${order.special_instructions || 'None'}</span>
      </div>
      <div class="info-row">
        <span class="label">Delivery Address:</span>
        <span class="value">${order.delivery_address}</span>
      </div>
    </div>
  `;
}

// Accept order
async function acceptOrder() {
  const orderId = getOrderId();
  
  try {
    // Show price form
    showPriceForm();
  } catch (error) {
    showMessage('Failed to accept order', 'error');
  }
}

// Show price form
function showPriceForm(order = null) {
  const container = document.getElementById('orderDetails');
  
  container.innerHTML += `
    <div class="price-form" id="priceForm">
      <h3>Set Price & Ready Time</h3>
      <div class="form-group">
        <label for="totalAmount">Total Amount (₦)</label>
        <input type="number" id="totalAmount" placeholder="e.g. 4700" required>
      </div>
      <div class="form-group">
        <label for="readyTime">Ready in (minutes)</label>
        <input type="number" id="readyTime" placeholder="e.g. 30" min="5" max="120" required>
      </div>
      <button class="btn btn-primary" onclick="submitPrice()">Confirm Price</button>
    </div>
  `;
  
  // Hide accept/reject buttons
  document.getElementById('acceptBtn').style.display = 'none';
  document.getElementById('rejectBtn').style.display = 'none';
}

// Submit price
async function submitPrice() {
  const orderId = getOrderId();
  const totalAmount = document.getElementById('totalAmount').value;
  const readyTime = document.getElementById('readyTime').value;
  
  if (!totalAmount || !readyTime) {
    showMessage('Please fill all fields', 'error');
    return;
  }
  
  try {
    const result = await API.setPrice(orderId, parseFloat(totalAmount), parseInt(readyTime));
    showMessage('✅ Order accepted! Price set successfully.', 'success');
    
    // Notify customer via WhatsApp (backend handles this)
    setTimeout(() => {
      window.location.href = '/success?orderId=' + orderId;
    }, 2000);
  } catch (error) {
    showMessage('Failed to set price', 'error');
  }
}

// Reject order
async function rejectOrder() {
  const orderId = getOrderId();
  
  // Show rejection reason form
  const reason = prompt('Please enter reason for rejection:\n1. Item finished\n2. Restaurant closed\n3. Kitchen busy\n4. Minimum order not met\n5. Other');
  
  if (!reason) return;
  
  try {
    await API.rejectOrder(orderId, reason);
    showMessage('❌ Order rejected. Customer has been notified.', 'success');
    
    setTimeout(() => {
      window.close(); // Close webview
    }, 2000);
  } catch (error) {
    showMessage('Failed to reject order', 'error');
  }
}

// Show message
function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message message-${type}`;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}
```

### **3.6. CSS Styles (styles/main.css)**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.order-id {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.order-info {
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 20px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-accept {
  background: #28a745;
  color: white;
}

.btn-accept:hover {
  background: #218838;
}

.btn-reject {
  background: #dc3545;
  color: white;
}

.btn-reject:hover {
  background: #c82333;
}

.btn-primary {
  background: #007bff;
  color: white;
  width: 100%;
  margin-top: 20px;
}

.price-form {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.message {
  display: none;
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  text-align: center;
}

.message-success {
  background: #d4edda;
  color: #155724;
}

.message-error {
  background: #f8d7da;
  color: #721c24;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
```

---

## **STEP 4: Backend API Integration**

### **4.1. Express.js Backend Example**

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const { sendOrderNotification } = require('./whatsapp');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Verify session token
app.post('/api/v1/auth/verify', (req, res) => {
  const { token } = req.body;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify restaurant exists and token is valid
    // Check database, etc.
    
    res.json({
      restaurant_id: decoded.restaurant_id,
      phone: decoded.phone,
      order_id: decoded.order_id
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get order details
app.get('/api/v1/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Verify token and get restaurant info
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Fetch order from database
  const order = await db.orders.findOne({
    id: orderId,
    restaurant_phone: decoded.phone
  });
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  res.json(order);
});

// Accept order (Movescrow: Accept WITHOUT price first)
app.post('/api/v1/orders/:orderId/accept', async (req, res) => {
  const { orderId } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Verify restaurant owns this order
  const order = await db.orders.findOne({ id: orderId });
  if (order.restaurant_phone !== decoded.phone) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  // Update order status to 'accepted' (price will be set separately)
  await db.orders.update(orderId, { 
    status: 'accepted',
    accepted_at: new Date()
  });
  
  // Notify customer that order was accepted (but waiting for price)
  await notifyCustomer(order.customer_phone, {
    type: 'order_accepted_waiting_price',
    order_id: orderId,
    restaurant_name: order.restaurant_name
  });
  
  res.json({ success: true, message: 'Order accepted. Please set price.' });
});

// Set price (Movescrow: Restaurant provides price after accepting)
app.post('/api/v1/orders/:orderId/set-price', async (req, res) => {
  const { orderId } = req.params;
  const { price, ready_time } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Verify restaurant owns this order
  const order = await db.orders.findOne({ id: orderId });
  if (order.restaurant_phone !== decoded.phone) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  if (order.status !== 'accepted') {
    return res.status(400).json({ message: 'Order must be accepted first' });
  }
  
  // Update order with price and ready time
  await db.orders.update(orderId, {
    price: parseFloat(price),
    ready_time: parseInt(ready_time),
    status: 'payment_pending', // Now waiting for customer payment
    price_set_at: new Date()
  });
  
  // Format items for customer message
  const itemsList = order.items
    .map(item => `${item.name} × ${item.quantity}`)
    .join('\n');
  
  // Notify customer with price (Movescrow format)
  await notifyCustomerPriceSet(order.customer_phone, {
    order_id: orderId,
    items: itemsList,
    total_price: price,
    ready_time: ready_time,
    delivery_address: order.delivery_address
  });
  
  res.json({ success: true });
});

// Reject order (Movescrow: With reason)
app.post('/api/v1/orders/:orderId/reject', async (req, res) => {
  const { orderId } = req.params;
  const { reason, additional_message } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Verify restaurant owns this order
  const order = await db.orders.findOne({ id: orderId });
  if (order.restaurant_phone !== decoded.phone) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const rejectionReasons = {
    'item_finished': 'Item finished',
    'restaurant_closed': 'Restaurant closed',
    'kitchen_busy': 'Kitchen busy',
    'minimum_order': 'Minimum order not met',
    'menu_unavailable': 'Menu/item unavailable',
    'other': additional_message || 'Other'
  };
  
  const reasonText = rejectionReasons[reason] || reason;
  
  await db.orders.update(orderId, {
    status: 'rejected',
    rejection_reason: reason,
    rejection_details: reasonText + (additional_message ? ` - ${additional_message}` : ''),
    rejected_at: new Date()
  });
  
  // Notify customer with rejection reason
  await notifyCustomerRejected(order.customer_phone, {
    order_id: orderId,
    reason: reasonText
  });
  
  res.json({ success: true });
});

// Future: NIN verification endpoint
app.post('/api/v1/verification/nin', async (req, res) => {
  const { nin } = req.body;
  
  // Call NIN verification API (OnePipe, Dojah, etc.)
  const result = await verifyNIN(nin);
  
  res.json(result);
});

// Future: BVN verification endpoint
app.post('/api/v1/verification/bvn', async (req, res) => {
  const { bvn } = req.body;
  
  // Call BVN verification API
  const result = await verifyBVN(bvn);
  
  res.json(result);
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
```

---

## **STEP 5: Restaurant Messaging Automation (Movescrow Flow)**

### **5.1. Trigger Order Request Notification (NO PRICE)**

```javascript
// When customer places order request (Movescrow flow)
async function handleNewOrderRequest(order) {
  // 1. Save order to database (status: 'pending', NO price yet)
  await db.orders.create({
    id: order.id,
    restaurant_phone: order.restaurant_phone,
    customer_name: order.customer_name,
    customer_code: order.customer_code,
    items: order.items, // Array of {name, quantity}
    delivery_address: order.delivery_address,
    special_instructions: order.special_instructions,
    status: 'pending', // Waiting for restaurant accept/reject
    price: null, // NO price initially
    created_at: new Date()
  });
  
  // 2. Send WhatsApp notification to restaurant (with deep link)
  await sendOrderRequestNotification(
    order.restaurant_phone,
    order.id,
    {
      customerName: order.customer_name,
      customerCode: order.customer_code,
      items: order.items, // Array format
      deliveryAddress: order.delivery_address,
      specialInstructions: order.special_instructions
    }
  );
  
  // 3. Log notification
  console.log(`Order request sent to restaurant: ${order.restaurant_phone}`);
}
```

### **5.2. Follow-up Messages (Reminder if No Response)**

```javascript
// If restaurant doesn't respond within 5 minutes
setTimeout(async () => {
  const order = await db.orders.findOne({ id: orderId });
  
  if (order.status === 'pending') {
    const sessionToken = generateSessionToken(order.restaurant_phone, orderId);
    const deepLinkUrl = `${WEBVIEW_BASE_URL}/restaurant/order/${orderId}?session=${sessionToken}`;
    
    await sendWhatsAppMessage(order.restaurant_phone, {
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: `⏰ Reminder: You have a new order request waiting!\n\nOrder ID: ${orderId}\nCustomer: ${order.customer_code}\n\nPlease tap below to view and respond.`
        },
        action: {
          buttons: [{
            type: "url",
            title: "📋 View & Respond",
            url: deepLinkUrl
          }]
        }
      }
    });
  }
}, 5 * 60 * 1000); // 5 minutes
```

### **5.3. Customer Notification Messages (Movescrow Format)**

```javascript
// When restaurant accepts (without price yet)
async function notifyCustomerOrderAccepted(order) {
  await sendWhatsAppMessage(order.customer_phone, {
    type: "text",
    text: `✅ Order Accepted!\n\nOrder ID: ${order.id}\n\nRestaurant has accepted your order and is setting the price.\n\nYou'll receive the total shortly!`
  });
}

// When restaurant sets price (Movescrow format)
async function notifyCustomerPriceSet(order) {
  const itemsList = order.items
    .map(item => `• ${item.name} × ${item.quantity}`)
    .join('\n');
  
  // Calculate breakdown (Movescrow format)
  const foodAmount = order.price;
  const platformFee = Math.round(order.price * 0.05); // 5% platform fee
  const deliveryFee = 500; // Fixed delivery fee (or calculate)
  const totalAmount = foodAmount + platformFee + deliveryFee;
  
  await sendWhatsAppMessage(order.customer_phone, {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `✅ Order Accepted!\n\nOrder ID: ${order.id}\n\nItems:\n${itemsList}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*Breakdown:*\nFood: ₦${foodAmount.toLocaleString()}\nPlatform Fee (5%): ₦${platformFee.toLocaleString()}\nDelivery Fee: ₦${deliveryFee.toLocaleString()}\n\n*Total: ₦${totalAmount.toLocaleString()}*\n\nReady in: ${order.ready_time} minutes\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      },
      action: {
        buttons: [{
          type: "url",
          title: `💳 Pay ₦${totalAmount.toLocaleString()}`,
          url: `${CUSTOMER_APP_URL}/orders/${order.id}/pay`
        }]
      }
    }
  });
}

// When restaurant rejects (Movescrow format)
async function notifyCustomerRejected(order) {
  await sendWhatsAppMessage(order.customer_phone, {
    type: "text",
    text: `❌ Order Rejected\n\nOrder ID: ${order.id}\n\nReason: ${order.rejection_details || order.rejection_reason}\n\nWould you like to:\n• Order something else?\n• Try another restaurant?\n\nReply with "help" for support.`
  });
}

// When payment is confirmed (Movescrow format)
async function notifyCustomerPaymentConfirmed(order) {
  await sendWhatsAppMessage(order.customer_phone, {
    type: "text",
    text: `✅ Payment Received!\n\nAmount: ₦${order.total_amount.toLocaleString()}\nOrder ID: ${order.id}\n\nPayment is secure and held in Movescrow Secure escrow.\n\nRestaurant has been notified.\nYour order will be ready in ${order.ready_time} minutes! 🍽️`
  });
  
  // Also notify restaurant
  await notifyRestaurantPaymentReceived(order);
}

// When restaurant marks "Almost Ready" (Movescrow format)
async function notifyCustomerAlmostReady(order) {
  await sendWhatsAppMessage(order.customer_phone, {
    type: "text",
    text: `⏰ Almost Ready!\n\nOrder ID: ${order.id}\n\nYour food will be ready in about 5 minutes.\n\nA mover will be assigned shortly! 🚀`
  });
}

// When mover is assigned
async function notifyCustomerMoverAssigned(order, mover) {
  await sendWhatsAppMessage(order.customer_phone, {
    type: "text",
    text: `🚚 Mover Assigned!\n\nOrder ID: ${order.id}\n\nMover: ${mover.name}\nRating: ⭐ ${mover.rating}\nETA: ${mover.eta} minutes\n\nYour order is on the way!`
  });
}
```

### **5.4. Restaurant Notification Messages (Movescrow Format)**

```javascript
// When payment is received (to restaurant)
async function notifyRestaurantPaymentReceived(order) {
  const itemsList = order.items
    .map(item => `• ${item.name} × ${item.quantity}`)
    .join('\n');
  
  const platformFee = Math.round(order.price * 0.05);
  const restaurantEarnings = order.price - platformFee;
  
  await sendWhatsAppMessage(order.restaurant_phone, {
    type: "text",
    text: `💰 Payment Received!\n\nOrder ID: ${order.id}\n\nAmount: ₦${order.total_amount.toLocaleString()}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*Breakdown:*\nFood: ₦${order.price.toLocaleString()}\nPlatform Fee (5%): ₦${platformFee.toLocaleString()}\nDelivery Fee: ₦${order.delivery_fee.toLocaleString()}\n\n*Your Earnings: ₦${restaurantEarnings.toLocaleString()}*\n(Will be paid after delivery)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPlease prepare the order.\nReady time: ${order.ready_time} minutes`
  });
}

// When mover is assigned (to restaurant)
async function notifyRestaurantMoverAssigned(order, mover, pickupCode) {
  await sendWhatsAppMessage(order.restaurant_phone, {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `🚚 Mover Assigned!\n\nOrder ID: ${order.id}\n\nMover: ${mover.name}\nRating: ⭐ ${mover.rating}\nETA: ${mover.eta} minutes\n\n*Pickup Code: ${pickupCode}*\n(Valid for 2 hours)\n\n⚠️ IMPORTANT: Customer must authorize pickup before you release order.\n\nTap below to view mover details and verification system.`
      },
      action: {
        buttons: [{
          type: "url",
          title: "🔐 Verify Pickup",
          url: `${WEBVIEW_BASE_URL}/restaurant/order/${order.id}/verify?session=${generateSessionToken(order.restaurant_phone, order.id)}`
        }]
      }
    }
  });
}

// When order is marked "Almost Ready" (automated if enabled)
async function notifyMoverAlmostReady(order, mover) {
  await sendWhatsAppMessage(mover.phone, {
    type: "text",
    text: `⏰ Order Almost Ready!\n\nOrder ID: ${order.id}\n\nRestaurant: ${order.restaurant_name}\nLocation: ${order.restaurant_address}\n\nFood will be ready in about 5 minutes.\nPlease start heading to the restaurant!`
  });
}
```

---

## **STEP 6: Deep Linking & Session Management**

### **6.1. Generate Secure Deep Links**

```javascript
function generateDeepLink(orderId, restaurantPhone) {
  const sessionToken = jwt.sign(
    {
      phone: restaurantPhone,
      order_id: orderId,
      type: 'restaurant_session',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    },
    JWT_SECRET
  );
  
  return `${WEBVIEW_BASE_URL}/order/${orderId}?session=${sessionToken}`;
}
```

### **6.2. Session Verification Middleware**

```javascript
function verifySession(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.session = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Use in routes
app.get('/api/v1/orders/:orderId', verifySession, async (req, res) => {
  // req.session contains decoded token data
  const order = await getOrder(req.params.orderId, req.session.phone);
  res.json(order);
});
```

---

## **STEP 7: Future Expansion (KYC/Onboarding)**

### **7.1. Add KYC Pages to WebView**

**Add to webview-app/kyc.html:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>KYC Verification - Movescrow</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="container">
        <h1>Complete Verification</h1>
        
        <!-- NIN Verification -->
        <section class="kyc-section">
            <h2>Verify NIN</h2>
            <input type="text" id="ninInput" placeholder="Enter NIN">
            <button onclick="verifyNIN()">Verify NIN</button>
        </section>
        
        <!-- BVN Verification -->
        <section class="kyc-section">
            <h2>Verify BVN</h2>
            <input type="text" id="bvnInput" placeholder="Enter BVN">
            <button onclick="verifyBVN()">Verify BVN</button>
        </section>
        
        <!-- Document Upload -->
        <section class="kyc-section">
            <h2>Upload ID Document</h2>
            <input type="file" id="documentInput" accept="image/*">
            <button onclick="uploadDocument()">Upload</button>
        </section>
        
        <!-- Selfie Verification -->
        <section class="kyc-section">
            <h2>Take Selfie</h2>
            <video id="video" autoplay></video>
            <button onclick="captureSelfie()">Capture</button>
            <canvas id="canvas" style="display:none"></canvas>
        </section>
    </div>
    
    <script src="scripts/kyc.js"></script>
</body>
</html>
```

### **7.2. KYC JavaScript (kyc.js)**

```javascript
// Verify NIN
async function verifyNIN() {
  const nin = document.getElementById('ninInput').value;
  
  if (!nin) {
    alert('Please enter NIN');
    return;
  }
  
  try {
    const result = await API.verifyNIN(nin);
    
    if (result.verified) {
      showMessage('✅ NIN verified successfully!', 'success');
      // Save verification status
      await saveVerificationStatus('nin', true);
    } else {
      showMessage('❌ NIN verification failed', 'error');
    }
  } catch (error) {
    showMessage('Error verifying NIN', 'error');
  }
}

// Verify BVN
async function verifyBVN() {
  const bvn = document.getElementById('bvnInput').value;
  
  try {
    const result = await API.verifyBVN(bvn);
    
    if (result.verified) {
      showMessage('✅ BVN verified successfully!', 'success');
      await saveVerificationStatus('bvn', true);
    } else {
      showMessage('❌ BVN verification failed', 'error');
    }
  } catch (error) {
    showMessage('Error verifying BVN', 'error');
  }
}

// Upload document
async function uploadDocument() {
  const fileInput = document.getElementById('documentInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a file');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'id_document');
  
  try {
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('✅ Document uploaded successfully!', 'success');
    }
  } catch (error) {
    showMessage('Error uploading document', 'error');
  }
}

// Capture selfie
async function captureSelfie() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  
  // Access camera
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  
  // Capture on button click
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  // Convert to blob
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'selfie.jpg');
    formData.append('type', 'selfie');
    
    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        showMessage('✅ Selfie captured successfully!', 'success');
        stream.getTracks().forEach(track => track.stop()); // Stop camera
      }
    } catch (error) {
      showMessage('Error uploading selfie', 'error');
    }
  }, 'image/jpeg');
}
```

### **7.3. Send KYC Deep Link**

```javascript
// Send onboarding link to new user
async function sendOnboardingLink(userPhone) {
  const sessionToken = generateSessionToken(userPhone, 'onboarding');
  const deepLink = `${WEBVIEW_BASE_URL}/kyc?session=${sessionToken}`;
  
  await sendWhatsAppMessage(userPhone, {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "Welcome to Movescrow! 👋\n\nTo get started, please complete your verification.\n\nTap below to begin:"
      },
      action: {
        buttons: [{
          type: "url",
          title: "🔐 Start Verification",
          url: deepLink
        }]
      }
    }
  });
}
```

---

## 📋 **Complete Implementation Checklist**

- [ ] **Step 1:** Set up WhatsApp Business API account
- [ ] **Step 2:** Configure webhook for incoming messages
- [ ] **Step 3:** Set up backend API server
- [ ] **Step 4:** Create WebView web app (HTML/CSS/JS)
- [ ] **Step 5:** Implement deep linking with JWT tokens
- [ ] **Step 6:** Create order notification automation
- [ ] **Step 7:** Add restaurant messaging workflows
- [ ] **Step 8:** Test complete flow (order → notification → webview → action)
- [ ] **Step 9:** Add error handling and retries
- [ ] **Step 10:** (Future) Add KYC/onboarding pages

---

## 🎯 **Summary**

**This architecture provides:**
- ✅ Full control over UI/UX (real web app)
- ✅ Complete API integration capabilities
- ✅ Secure session management
- ✅ Future-proof for KYC/onboarding
- ✅ Professional fintech-grade solution

**WhatsApp is just the entry point** - the real magic happens in your WebView web app! 🚀

