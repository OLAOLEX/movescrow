# WhatsApp Buttons in 24-Hour Window

## ✅ How It Works

**Within 24-Hour Customer Service Window:**
- ✅ Interactive buttons work WITHOUT templates
- ✅ Can use `type: 'interactive'` with buttons
- ✅ Works when customer has messaged you first

**Outside 24-Hour Window:**
- ❌ Need message templates with buttons
- ❌ Requires Meta approval

---

## 🎯 Current Implementation

The code now:
1. **First tries** interactive button (works if in 24h window)
2. **Falls back** to plain text if button fails (outside 24h window or not initiated)

This way:
- ✅ Works perfectly in 24h window (buttons appear)
- ✅ Still works outside 24h window (plain text)
- ✅ Best of both worlds!

---

## 🧪 Testing in 24-Hour Window

### Step 1: Ensure You're in 24-Hour Window

1. Send a message FROM the restaurant's phone TO your WhatsApp Business number
   - Example: Restaurant sends "Hello" to your WhatsApp Business number
   - This starts the 24-hour window

2. Within 24 hours, send the order notification
   - The button should work!
   - No template needed

### Step 2: Test Order Notification

```powershell
$body = @{ restaurantId = "xxx"; orderId = "yyy" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
```

**Expected Result:**
- ✅ Message with button appears
- ✅ Button says "View Order ORD-xxx"
- ✅ Clicking button opens dashboard

---

## 📋 How Bots Like Banking Apps Work

### They Use Both Approaches:

1. **Within 24h Window:**
   - Use interactive buttons (no templates)
   - Fast, responsive
   - Buttons work immediately

2. **Outside 24h Window:**
   - Use message templates (pre-approved)
   - Templates have buttons built-in
   - Always work, even for new customers

### Example Flow:

**Customer messages bot:**
- Bot responds with interactive button (24h window active)

**Customer comes back next day:**
- Bot uses template with button (outside 24h window)
- Template was pre-approved, so it works

---

## 🔧 Our Implementation

### Current Status:

✅ **Tries button first** - Works if in 24h window
✅ **Falls back gracefully** - Plain text if outside window
✅ **No templates needed yet** - For testing/24h window

### Future Enhancement:

Once you have many customers:
1. Create message template with button
2. Get Meta approval
3. Use template for all messages (works always)
4. Keep interactive buttons for 24h window responses

---

## ✅ Quick Test

1. **Message your WhatsApp Business number** from restaurant phone
2. **Send order notification** (within 24h)
3. **Should see button!** 🎉

**If you see plain text:**
- Check if you're in 24h window
- Check Vercel logs for error details
- Button might have failed for other reason

---

## 🐛 Troubleshooting

### Button Still Shows as Plain Text?

**Check:**
1. ✅ Restaurant phone messaged your WhatsApp Business number first?
2. ✅ Within 24 hours of that message?
3. ✅ Phone number in Meta's allowed list?
4. ✅ Check Vercel function logs for errors

**Common Issues:**
- Not in 24h window → Will fallback to plain text (expected)
- Token expired → Update in Vercel
- Wrong button format → Should be fixed now

---

**The code now handles both scenarios automatically!** 🚀

