# Movescrow API Test Script for PowerShell
# Usage: .\test-api.ps1

# Configuration
$baseUrl = "https://movescrow.vercel.app"
$restaurantId = "c18cc33b-cd8c-4049-8a28-9412b29c851c"
$orderId = "03772f87-7318-4358-9af1-9935f221dfe8"

Write-Host "=== Movescrow API Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Send Order Notification
Write-Host "1. Testing Send Order Notification..." -ForegroundColor Yellow

$body = @{
    restaurantId = $restaurantId
    orderId = $orderId
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/notifications/send-order" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 2: Webhook Verification
Write-Host "2. Testing Webhook Verification..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=movescrow00secret&hub.challenge=test123" `
        -Method GET `
        -ErrorAction Stop
    
    Write-Host "✅ Success! Challenge: $($response.Content)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan

