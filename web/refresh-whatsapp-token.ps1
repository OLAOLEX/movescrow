# Refresh WhatsApp Long-Lived Token Script
# Usage: .\refresh-whatsapp-token.ps1

param(
    [string]$AppId = "",
    [string]$AppSecret = "",
    [string]$ShortLivedToken = ""
)

if (-not $AppId -or -not $AppSecret -or -not $ShortLivedToken) {
    Write-Host "Usage: .\refresh-whatsapp-token.ps1 -AppId 'YOUR_APP_ID' -AppSecret 'YOUR_APP_SECRET' -ShortLivedToken 'YOUR_SHORT_LIVED_TOKEN'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or set these variables in the script and run it." -ForegroundColor Yellow
    exit 1
}

$url = "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$AppId&client_secret=$AppSecret&fb_exchange_token=$ShortLivedToken"

Write-Host "=== WhatsApp Token Refresh ===" -ForegroundColor Cyan
Write-Host "Exchanging short-lived token for long-lived token..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "✅ SUCCESS! Long-lived token obtained!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token Details:" -ForegroundColor Cyan
    Write-Host "  Access Token: $($response.access_token)" -ForegroundColor White
    Write-Host "  Token Type: $($response.token_type)" -ForegroundColor White
    
    $days = [math]::Round($response.expires_in / 86400, 1)
    Write-Host "  Expires In: $($response.expires_in) seconds (~$days days)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the access token above" -ForegroundColor White
    Write-Host "2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables" -ForegroundColor White
    Write-Host "3. Update WHATSAPP_ACCESS_TOKEN with the new token" -ForegroundColor White
    Write-Host "4. Redeploy your project" -ForegroundColor White
    Write-Host ""
    Write-Host "New Token (copy this):" -ForegroundColor Cyan
    Write-Host $response.access_token -ForegroundColor Green -BackgroundColor Black
    
} catch {
    Write-Host "❌ ERROR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Details: $($errorObj.error.message)" -ForegroundColor Red
        } catch {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "Common Issues:" -ForegroundColor Yellow
    Write-Host "- Token already expired" -ForegroundColor White
    Write-Host "- Invalid App ID or App Secret" -ForegroundColor White
    Write-Host "- Token doesn't have required permissions" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

