# Movescrow App Icon Setup Guide

## ✅ App Name Updated

The app name has been updated to **"Movescrow"** in:
- ✅ Android (AndroidManifest.xml)
- ✅ iOS (Info.plist)
- ✅ Application ID: `com.movescrow.app`

---

## 📱 App Icon Setup

### Current Status
- App name: **Movescrow** ✅
- App icon: Using default Flutter icon (needs to be replaced with Movescrow logo)

### To Set Custom App Icon

#### Option 1: Use Flutter Launcher Icons Package (Recommended)

1. **Add the package to `pubspec.yaml`:**
```yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1
```

2. **Configure in `pubspec.yaml`:**
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/images/movescrow-logo.jpeg"
  adaptive_icon_background: "#1E3A5F"  # Movescrow Blue
  adaptive_icon_foreground: "assets/images/movescrow-logo.jpeg"
```

3. **Run the generator:**
```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

#### Option 2: Manual Setup (Advanced)

Replace icon files in:
- **Android**: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- **iOS**: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

**Required Sizes:**
- Android: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
- iOS: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

---

## 🎨 Icon Requirements

### Android Adaptive Icon
- **Foreground**: Movescrow logo (transparent background recommended)
- **Background**: Movescrow Blue (#1E3A5F) or Orange (#FF6B35)

### iOS App Icon
- **Format**: PNG with transparency
- **Sizes**: Multiple sizes required (see above)
- **No rounded corners** (iOS adds them automatically)

---

## 📝 Quick Setup (Recommended)

1. **Install flutter_launcher_icons:**
```bash
cd mobile
flutter pub add --dev flutter_launcher_icons
```

2. **Add configuration to `pubspec.yaml`** (see Option 1 above)

3. **Generate icons:**
```bash
flutter pub run flutter_launcher_icons
```

4. **Rebuild app:**
```bash
flutter clean
flutter run
```

---

## ✅ Current Configuration

- **App Name**: Movescrow ✅
- **Package Name**: com.movescrow.app ✅
- **App Icon**: Default (needs custom icon setup)

---

**Note**: The logo file is at `assets/images/movescrow-logo.jpeg`. You may want to convert it to PNG format with transparent background for better icon quality.

