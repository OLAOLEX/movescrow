# Google Maps API Setup Guide

## Overview
To enable Google Maps in the Movescrow Deliver screen, you need to:
1. Get a Google Maps API key
2. Configure it for Android
3. Configure it for iOS (if needed)
4. Add the key to your app

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android** (for Android)
   - **Maps SDK for iOS** (for iOS)
   - **Places API** (for location search/autocomplete)
   - **Directions API** (for route calculation)
   - **Geocoding API** (for address conversion)

4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. **Important**: Restrict your API key to:
   - Application restrictions: Android apps / iOS apps
   - API restrictions: Only the APIs you enabled above

## Step 2: Android Configuration

### Add API Key to AndroidManifest.xml

Open `mobile/android/app/src/main/AndroidManifest.xml` and add:

```xml
<manifest>
  <application>
    <!-- Add this inside <application> tag -->
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="YOUR_API_KEY_HERE"/>
  </application>
</manifest>
```

### Update build.gradle (if needed)

The `google_maps_flutter` package should already be in `pubspec.yaml`. Make sure your `android/app/build.gradle` has:

```gradle
android {
    compileSdkVersion 33  // or higher
    
    defaultConfig {
        minSdkVersion 21
        // ... other config
    }
}
```

## Step 3: iOS Configuration (if building for iOS)

### Add API Key to AppDelegate.swift

Open `mobile/ios/Runner/AppDelegate.swift` and add:

```swift
import UIKit
import Flutter
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

### Update Info.plist

Add location permissions to `mobile/ios/Runner/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby movers and calculate delivery routes</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location for real-time delivery tracking</string>
```

## Step 4: Update Code

Once the API key is configured, uncomment the Google Maps code in `deliver_screen.dart`:

```dart
// In _buildMapView(), replace the placeholder with:
GoogleMap(
  initialCameraPosition: CameraPosition(
    target: LatLng(6.5244, 3.3792), // Lagos coordinates
    zoom: 12,
  ),
  myLocationEnabled: true,
  myLocationButtonEnabled: false,
  markers: _buildMarkers(),
  polylines: _buildPolylines(),
  onMapCreated: (GoogleMapController controller) {
    // Store controller for later use
  },
)
```

## Step 5: Add Required Imports

In `deliver_screen.dart`, add:

```dart
import 'package:google_maps_flutter/google_maps_flutter.dart';
```

## Cost Considerations

- Google Maps has a **free tier** ($200/month credit)
- This typically covers:
  - ~28,000 map loads
  - ~40,000 directions requests
  - ~40,000 geocoding requests
- After free tier, pay-as-you-go pricing applies
- Monitor usage in Google Cloud Console

## Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific apps and APIs
2. **Use Environment Variables**: Don't commit API keys to version control
3. **Rotate Keys**: If a key is exposed, rotate it immediately
4. **Monitor Usage**: Set up billing alerts in Google Cloud Console

## Testing

1. Run `flutter clean`
2. Run `flutter pub get`
3. Run `flutter run`
4. The map should now display instead of the placeholder

## Troubleshooting

- **Map not showing**: Check API key is correct and APIs are enabled
- **"API key not valid"**: Verify key restrictions allow your app
- **Location not working**: Check location permissions in AndroidManifest.xml / Info.plist
- **Build errors**: Ensure `minSdkVersion` is 21+ for Android

