# Quick WhatsApp Token Refresh - Just run this and enter values when prompted

Write-Host "=== WhatsApp Token Refresh ===" -ForegroundColor Cyan
Write-Host ""

# Get inputs
$AppId = Read-Host "Enter your App ID"
$AppSecret = Read-Host "Enter your App Secret" -AsSecureString
$AppSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AppSecret))
$ShortLivedToken = Read-Host "Enter your Short-Lived Token"

Write-Host ""
Write-Host "Exchanging token..." -ForegroundColor Yellow

$url = "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$AppId&client_secret=$AppSecretPlain&fb_exchange_token=$ShortLivedToken"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Long-lived token obtained!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token Details:" -ForegroundColor Cyan
    Write-Host "  Access Token: $($response.access_token)" -ForegroundColor White
    
    $days = [math]::Round($response.expires_in / 86400, 1)
    Write-Host "  Expires In: ~$days days" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📋 Copy this token and update in Vercel:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $response.access_token -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Details: $($errorObj.error.message)" -ForegroundColor Red
        } catch {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

