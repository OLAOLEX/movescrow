# 🔒 Securing Google Maps API Keys

## ⚠️ IMPORTANT SECURITY NOTICE

**API keys must NEVER be committed to version control!** This guide shows you how to secure your Google Maps API key.

## What Was Changed

1. **Android**: API key moved from `AndroidManifest.xml` to `local.properties` (which is gitignored)
2. **Dart Code**: API key moved from hardcoded strings to `lib/config/api_keys.dart` (which is gitignored)
3. **Template Files**: Created `.example` files for team members to use

## Setup Instructions

### Step 1: Regenerate Your Compromised API Key

⚠️ **DO THIS FIRST** - Your API key has been exposed and should be regenerated:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project: **My First Project (teak-sunup-479707-u2)**
3. Find the exposed API key: `AIzaSyBbYVUeFBtowWd_LAbMp_IBcwrz7FQRtWs`
4. Click **Edit** → **Regenerate Key**
5. Copy the new API key

### Step 2: Configure Android

1. Open `mobile/android/local.properties`
2. Add your new API key:
   ```properties
   MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
3. If `local.properties` doesn't exist, copy from `local.properties.example`:
   ```bash
   cp mobile/android/local.properties.example mobile/android/local.properties
   ```
4. The file is already in `.gitignore`, so it won't be committed

### Step 3: Configure Dart Code

**Option A: Update api_keys.dart (For Development)**
1. Open `mobile/lib/config/api_keys.dart`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your new API key
3. The file is in `.gitignore`, so it won't be committed

**Option B: Use Environment Variables (Recommended for Production)**
1. Run Flutter with:
   ```bash
   flutter run --dart-define=GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
2. Or set it in your IDE's run configuration

### Step 4: Restrict Your API Key

**CRITICAL**: Always restrict your API key in Google Cloud Console:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **API restrictions**, select:
   - ✅ Maps SDK for Android
   - ✅ Maps SDK for iOS
   - ✅ Geocoding API
   - ✅ Places API
   - ✅ Directions API
4. Under **Application restrictions**:
   - For Android: Add your app's package name: `com.movescrow.app`
   - For iOS: Add your app's bundle ID
5. Click **Save**

## Files Changed

### ✅ Now Secure (Gitignored)
- `mobile/android/local.properties` - Contains API key for Android builds
- `mobile/lib/config/api_keys.dart` - Contains API key for Dart code

### ✅ Template Files (Safe to Commit)
- `mobile/android/local.properties.example` - Template for Android setup
- `mobile/lib/config/api_keys.example.dart` - Template for Dart setup

### ✅ Updated Files
- `mobile/android/app/build.gradle.kts` - Reads API key from `local.properties`
- `mobile/android/app/src/main/AndroidManifest.xml` - Uses placeholder from Gradle
- `mobile/lib/screens/deliver_screen.dart` - Uses `ApiKeys.googleMapsApiKey`
- `mobile/lib/screens/location_edit_screen.dart` - Uses `ApiKeys.googleMapsApiKey`
- `.gitignore` - Added API key files

## Verification

After setup, verify everything works:

1. **Android Build**:
   ```bash
   cd mobile
   flutter build apk --debug
   ```
   Check that maps load correctly in the app.

2. **Check Git**:
   ```bash
   git status
   ```
   Verify that `local.properties` and `api_keys.dart` are NOT listed (they're gitignored).

## For Team Members

When setting up the project:

1. Copy `local.properties.example` to `local.properties` and add your API key
2. Copy `api_keys.example.dart` to `api_keys.dart` and add your API key
3. Both files are gitignored and won't be committed

## Production Deployment

For production builds (CI/CD), use environment variables:

```bash
flutter build apk --release --dart-define=GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY
```

Set `GOOGLE_MAPS_API_KEY` as a secret in your CI/CD system (GitHub Actions, GitLab CI, etc.).

## Need Help?

- [Google Maps API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Handling Compromised GCP Credentials](https://cloud.google.com/docs/authentication/troubleshooting-compromised-credentials)

