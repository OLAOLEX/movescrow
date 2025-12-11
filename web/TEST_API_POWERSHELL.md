# Testing API Endpoints with PowerShell

## 🔧 PowerShell-Compatible Commands

### Test Webhook Verification (GET)

```powershell
curl.exe "https://movescrow.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=movescrow00secret&hub.challenge=test123"
```

**Expected Response:** `test123`

---

### Test Send OTP

```powershell
$body = @{
    phone = "+2348000000000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/auth/send-otp" -Method POST -Body $body -ContentType "application/json"
```

---

### Test Send Order Notification

```powershell
$body = @{
    restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
    orderId = "03772f87-7318-4358-9af1-9935f221dfe8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
```

**Or using curl.exe (if available):**

```powershell
curl.exe -X POST "https://movescrow.vercel.app/api/notifications/send-order" -H "Content-Type: application/json" -d '{\"restaurantId\":\"c18cc33b-cd8c-4049-8a28-9412b29c851c\",\"orderId\":\"03772f87-7318-4358-9af1-9935f221dfe8\"}'
```

---

### Test WhatsApp Send Message

```powershell
$body = @{
    to = "+2348000000000"
    message = "Hello from Movescrow!"
    orderId = "03772f87-7318-4358-9af1-9935f221dfe8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/whatsapp/send-message" -Method POST -Body $body -ContentType "application/json"
```

---

## 🐛 Troubleshooting "Internal Server Error"

If you get `{"error":"Internal server error"}`, check:

1. **Environment Variables Set?**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Make sure all required vars are set

2. **Check Function Logs:**
   - Vercel Dashboard → Project → Functions → `/api/notifications/send-order` → Logs
   - Look for specific error messages

3. **Missing Supabase?**
   - The API might need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Quick Test Script

Save this as `test-api.ps1`:

```powershell
# Test Send Order Notification
$restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
$orderId = "03772f87-7318-4358-9af1-9935f221dfe8"

$body = @{
    restaurantId = $restaurantId
    orderId = $orderId
} | ConvertTo-Json

Write-Host "Sending request..."
try {
    $response = Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
```

Run it:
```powershell
.\test-api.ps1
```

