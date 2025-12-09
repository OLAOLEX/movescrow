# Getting SHA-1 Certificate Fingerprint for Android API Key Restrictions

You need the SHA-1 certificate fingerprint to restrict your Google Maps API key to your Android app.

## Your Package Name
```
com.movescrow.app
```

## Method 1: Get SHA-1 for Debug Build (Development)

**For Windows (PowerShell):**
```powershell
cd $env:USERPROFILE\.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For macOS/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Default credentials:**
- Keystore password: `android`
- Key password: `android`
- Alias: `androiddebugkey`

Look for the line that says `SHA1:` and copy the fingerprint (format: `XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX`)

## Method 2: Using Gradle (Recommended)

Navigate to your Android project directory and run:

**Windows:**
```powershell
cd mobile/android
.\gradlew signingReport
```

**macOS/Linux:**
```bash
cd mobile/android
./gradlew signingReport
```

This will show SHA-1 fingerprints for all build variants (debug, release, profile).

## Method 3: Using Flutter Command

```bash
cd mobile
flutter build apk --debug
```

Then check the output or use:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## Method 4: For Release Build (Production)

If you have a release keystore:

**Windows:**
```powershell
keytool -list -v -keystore path/to/your/release.keystore -alias your-key-alias
```

**macOS/Linux:**
```bash
keytool -list -v -keystore path/to/your/release.keystore -alias your-key-alias
```

You'll be prompted for the keystore password and key password.

## Quick PowerShell Script

Run this in PowerShell from the project root:

```powershell
$debugKeystore = "$env:USERPROFILE\.android\debug.keystore"
if (Test-Path $debugKeystore) {
    Write-Host "Getting SHA-1 fingerprint from debug keystore..." -ForegroundColor Green
    keytool -list -v -keystore $debugKeystore -alias androiddebugkey -storepass android -keypass android | Select-String -Pattern "SHA1:"
} else {
    Write-Host "Debug keystore not found at: $debugKeystore" -ForegroundColor Red
    Write-Host "Creating debug keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore $debugKeystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
    keytool -list -v -keystore $debugKeystore -alias androiddebugkey -storepass android -keypass android | Select-String -Pattern "SHA1:"
}
```

## What You Need for Google Cloud Console

1. **Package name:** `com.movescrow.app`
2. **SHA-1 fingerprint:** The fingerprint you got from above (format: `XX:XX:XX:XX:...`)

## Setting Up in Google Cloud Console

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **Application restrictions**, select **Android apps**
4. Click **Add an item**
5. Enter:
   - **Package name:** `com.movescrow.app`
   - **SHA-1 certificate fingerprint:** (paste the SHA-1 you got from above)
6. Click **Save**

## Important Notes

- **Debug fingerprint:** Use this for development/testing
- **Release fingerprint:** You'll need a separate one when you create a release keystore for production
- **Multiple fingerprints:** You can add multiple SHA-1 fingerprints for the same package name (useful if you have debug and release builds)
- **All team members:** Each developer needs to add their debug keystore's SHA-1 fingerprint

## Creating Release Keystore (For Production)

When ready for production:

```bash
keytool -genkey -v -keystore ~/movescrow-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias movescrow
```

Then configure it in `mobile/android/app/build.gradle.kts` and get its SHA-1 fingerprint.

