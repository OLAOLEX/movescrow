# Simple Test Script - Send Order Notification
# Copy this entire file and run: .\test-notification.ps1

$restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
$orderId = "03772f87-7318-4358-9af1-9935f221dfe8"

Write-Host "Testing notification API..." -ForegroundColor Cyan

$body = @{
    restaurantId = $restaurantId
    orderId = $orderId
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://movescrow.vercel.app/api/notifications/send-order" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ ERROR" -ForegroundColor Red
    Write-Host ""
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error: $($errorObj.error)" -ForegroundColor Red
        if ($errorObj.details) {
            Write-Host "Details:" -ForegroundColor Yellow
            $errorObj.details | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        }
        if ($errorObj.config) {
            Write-Host ""
            Write-Host "Configuration Status:" -ForegroundColor Yellow
            Write-Host "  Termii: $($errorObj.config.hasTermii)" -ForegroundColor $(if ($errorObj.config.hasTermii) { "Green" } else { "Red" })
            Write-Host "  Twilio: $($errorObj.config.hasTwilio)" -ForegroundColor $(if ($errorObj.config.hasTwilio) { "Green" } else { "Red" })
            Write-Host "  WhatsApp: $($errorObj.config.hasWhatsApp)" -ForegroundColor $(if ($errorObj.config.hasWhatsApp) { "Green" } else { "Red" })
        }
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

