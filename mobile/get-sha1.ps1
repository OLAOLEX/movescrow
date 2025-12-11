# Quick SHA-1 Fingerprint Generator for Movescrow Android App
# Run: .\get-sha1.ps1

Write-Host "=== Movescrow SHA-1 Fingerprint Generator ===" -ForegroundColor Cyan
Write-Host ""

$debugKeystore = "$env:USERPROFILE\.android\debug.keystore"

# Method 1: Try debug keystore
if (Test-Path $debugKeystore) {
    Write-Host "Method 1: Getting SHA-1 from debug keystore..." -ForegroundColor Yellow
    Write-Host ""
    
    $result = keytool -list -v -keystore $debugKeystore -alias androiddebugkey -storepass android -keypass android 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $sha1 = $result | Select-String -Pattern "SHA1:" 
        if ($sha1) {
            Write-Host "✅ DEBUG SHA-1 Fingerprint:" -ForegroundColor Green
            Write-Host $sha1 -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "❌ Error reading keystore" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Debug keystore not found at: $debugKeystore" -ForegroundColor Yellow
    Write-Host ""
}

# Method 2: Try Gradle signing report
Write-Host "Method 2: Getting SHA-1 using Gradle signing report..." -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location $PSScriptRoot\android
    $gradleResult = .\gradlew signingReport 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $sha1Matches = $gradleResult | Select-String -Pattern "SHA1:\s+([A-F0-9:]+)" 
        
        if ($sha1Matches) {
            Write-Host "✅ SHA-1 Fingerprints Found:" -ForegroundColor Green
            Write-Host ""
            
            $sha1Matches | ForEach-Object {
                Write-Host $_.Line -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "Copy the SHA-1 values above (one for debug, one for release if configured)" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  No SHA-1 found in Gradle output" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Full Gradle output:" -ForegroundColor Yellow
            $gradleResult | Select-String -Pattern "(SHA|Variant|Config)" | Select-Object -First 20
        }
    } else {
        Write-Host "❌ Gradle command failed" -ForegroundColor Red
        Write-Host $gradleResult | Select-Object -Last 10
    }
} catch {
    Write-Host "❌ Error running Gradle: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Package Name ===" -ForegroundColor Cyan
Write-Host "com.movescrow.app" -ForegroundColor White
Write-Host ""
Write-Host "Use these values in Google Cloud Console API Key restrictions:" -ForegroundColor Yellow
Write-Host "1. Package name: com.movescrow.app" -ForegroundColor White
Write-Host "2. SHA-1: [Copy from above]" -ForegroundColor White
Write-Host ""

