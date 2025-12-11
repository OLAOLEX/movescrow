# WhatsApp Message Template Setup for Buttons

## 🎯 Why Templates Are Needed

WhatsApp Business API **requires message templates** for buttons in business-initiated messages (outside 24-hour customer service window).

Interactive buttons without templates only work when:
- Customer messages you first
- Within 24-hour window after customer message

---

## ✅ Solution: Create Message Template with Button

### Step 1: Create Template in Meta Developer Console

1. **Go to Meta Developer Console:**
   - https://developers.facebook.com
   - Select your app
   - Go to **WhatsApp** → **Message Templates**

2. **Create New Template:**
   - Click **"Create Template"**
   - Select **Category:** `UTILITY`
   - **Name:** `order_notification` (no spaces, lowercase)
   - **Language:** `English`

3. **Add Body:**
   ```
   🍽️ *New Order Received!*
   
   📦 Order: {{1}}
   👤 Customer: {{2}}
   💰 Amount: ₦{{3}}
   
   Tap the button below to view and manage your order.
   ```
   
   **Variables:**
   - `{{1}}` = Order Reference (e.g., ORD-001)
   - `{{2}}` = Customer Code
   - `{{3}}` = Total Amount

4. **Add Button:**
   - Click **"Add Button"**
   - Select **"URL Button"**
   - **Button Text:** `View Order` (max 20 characters)
   - **URL:** `https://movescrow.vercel.app/restaurant/auth.html?token={{4}}&order={{5}}`
   
   **Variables:**
   - `{{4}}` = Magic link token
   - `{{5}}` = Order ID

5. **Submit for Approval:**
   - Review template
   - Click **"Submit"**
   - Wait for approval (usually 1-3 days)

---

### Step 2: Update Code to Use Template

Once approved, update `web/api/notifications/send-order.js`:

```javascript
// Replace sendWhatsApp call with template
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
      type: 'template',
      template: {
        name: 'order_notification',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: order.order_ref },
              { type: 'text', text: order.customer_code },
              { type: 'text', text: parseFloat(order.total_amount || 0).toLocaleString() }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              {
                type: 'text',
                text: token // Magic link token
              }
            ]
          }
        ]
      }
    })
  }
);
```

---

## 📋 Template Approval Checklist

- [ ] Template created in Meta Developer Console
- [ ] Category: UTILITY
- [ ] Body includes variables ({{1}}, {{2}}, {{3}})
- [ ] URL button added with variables
- [ ] Template submitted for approval
- [ ] Template approved (check status in console)
- [ ] Code updated to use template
- [ ] Tested with real message

---

## ⏱️ Timeline

- **Template Creation:** 10 minutes
- **Meta Approval:** 1-3 business days
- **Code Update:** 30 minutes
- **Testing:** 15 minutes

**Total:** ~4 days (mostly waiting for approval)

---

## 🚀 Current Workaround

Until template is approved, we're using:
- ✅ Clean formatted message
- ✅ Short, clickable link
- ✅ Opens in WhatsApp's in-app browser
- ✅ Works immediately (no approval needed)

**UX is still great!** The link works perfectly, just not displayed as a button yet.

---

## ✅ After Template Approval

Once template is approved:
1. Update code to use template
2. Test with real message
3. Button will appear! 🎉

---

**Action:** Create template now, update code once approved! 🚀

