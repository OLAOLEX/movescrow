# Movescrow App Development Guide

## 🎯 Website vs Mobile App - Which First?

### Recommendation: **MOBILE APP FIRST** ✅

**Why Mobile App First:**
1. **Core Product**: Movescrow is a logistics marketplace - users need mobile app for:
   - Real-time GPS tracking
   - Push notifications
   - Camera access (photo proof)
   - Location services
   - Quick order placement on-the-go

2. **Market Reality**: 
   - 90%+ of users in Nigeria use mobile phones
   - Food delivery apps are mobile-first (Uber Eats, Chowdeck, Gokada)
   - Website would be secondary/optional

3. **Development Efficiency**:
   - Flutter allows you to build once, deploy to iOS + Android
   - Website can be built later (or use Flutter Web)

**Website Can Wait For:**
- Marketing landing page (simple HTML/CSS)
- Restaurant admin dashboard (can be web-based)
- Customer support portal

**Timeline Recommendation:**
- **Phase 1 (Month 1-3)**: Mobile app (iOS + Android)
- **Phase 2 (Month 4-6)**: Simple marketing website
- **Phase 3 (Month 7+)**: Admin dashboard (web)

---

## 📱 Testing Your Flutter App

### Current App Status
You have a basic Flutter app with:
- ✅ Home screen with welcome message
- ✅ Brand colors integrated (Blue #1E3A5F, Orange #FF6B35)
- ✅ Basic navigation structure
- ⏳ No backend connection yet

### Testing Options (NO REINSTALL NEEDED!)

#### Option 1: **Emulator/Simulator** (Recommended for Development)

**Android Emulator:**
```bash
# List available emulators
flutter emulators

# Launch emulator
flutter emulators --launch <emulator-id>

# Run app on emulator
cd mobile
flutter run
```

**iOS Simulator (macOS only):**
```bash
# Open iOS Simulator
open -a Simulator

# Run app
cd mobile
flutter run
```

**Advantages:**
- ✅ No physical phone needed
- ✅ Fast testing
- ✅ Easy to test different screen sizes
- ✅ Hot reload works perfectly

---

#### Option 2: **Physical Device via USB** (Best for Real Testing)

**Android:**
```bash
# Enable USB Debugging on your phone:
# Settings → Developer Options → USB Debugging

# Connect phone via USB
# Check if device is detected
flutter devices

# Run app on connected device
cd mobile
flutter run
```

**iOS (macOS only):**
```bash
# Connect iPhone via USB
# Trust computer on iPhone when prompted

# Run app
cd mobile
flutter run
```

**Advantages:**
- ✅ Real device testing
- ✅ Test GPS, camera, notifications
- ✅ Better performance testing
- ✅ Hot reload works (no reinstall needed!)

---

#### Option 3: **Wireless Debugging** (Android 11+)

```bash
# Connect via USB first, then:
adb tcpip 5555
adb connect <phone-ip-address>:5555

# Disconnect USB, run wirelessly
flutter run
```

---

## 🔥 Hot Reload & Hot Restart (NO REINSTALL!)

### What is Hot Reload?
Flutter's **Hot Reload** updates your app **instantly** without reinstalling!

**How to Use:**
1. Run app: `flutter run`
2. Make code changes
3. Press `r` in terminal (hot reload) or `R` (hot restart)
4. Changes appear **instantly** (1-2 seconds)

**Hot Reload vs Hot Restart:**
- **Hot Reload (`r`)**: Fast, keeps app state (for UI changes)
- **Hot Restart (`R`)**: Slower, resets app state (for logic changes)
- **Full Restart**: Stop app (`q`) and run again (only if needed)

**Example:**
```dart
// Change this in main.dart:
Text('Welcome to Movescrow')

// To this:
Text('Welcome to Movescrow - Testing!')

// Press 'r' in terminal → Changes appear instantly!
```

**You DON'T need to:**
- ❌ Reinstall app
- ❌ Rebuild APK
- ❌ Restart device
- ❌ Close and reopen app

**You just press `r` and it updates!**

---

## 🚀 Quick Start Testing Guide

### Step 1: Check Flutter Installation
```bash
flutter doctor
```
This shows what's installed and what's missing.

### Step 2: Install Dependencies
```bash
cd mobile
flutter pub get
```

### Step 3: Check Available Devices
```bash
flutter devices
```

**Output example:**
```
2 connected devices:
sdk gphone64 arm64 (mobile) • emulator-5554 • android-arm64  • Android 13
iPhone 14 Pro (mobile)      • ABC123       • ios            • com.apple.CoreSimulator.SimRuntime.iOS-16-0
```

### Step 4: Run App
```bash
# Run on first available device
flutter run

# Or specify device
flutter run -d emulator-5554  # Android emulator
flutter run -d ABC123          # iOS simulator
```

### Step 5: Test Hot Reload
1. App is running
2. Open `lib/main.dart` in editor
3. Change text: `'Welcome to Movescrow'` → `'Welcome to Movescrow - Updated!'`
4. Save file
5. Press `r` in terminal
6. See changes instantly!

---

## 📋 Testing Checklist

### Basic Testing
- [ ] App launches without errors
- [ ] Home screen displays correctly
- [ ] Brand colors are correct (Blue #1E3A5F, Orange #FF6B35)
- [ ] "Get Started" button is visible
- [ ] Hot reload works (press `r`)

### Device Testing
- [ ] Test on Android phone/emulator
- [ ] Test on iOS device/simulator (if available)
- [ ] Test different screen sizes
- [ ] Test in portrait and landscape

### Performance Testing
- [ ] App loads quickly (< 3 seconds)
- [ ] No lag when navigating
- [ ] Memory usage is reasonable

---

## 🛠️ Development Workflow

### Daily Development Process

1. **Start Development:**
   ```bash
   cd mobile
   flutter run
   ```

2. **Make Changes:**
   - Edit code in your IDE
   - Save file

3. **See Changes:**
   - Press `r` for hot reload (instant)
   - Or press `R` for hot restart (if needed)

4. **Test Features:**
   - Interact with app
   - Check if features work

5. **Debug Issues:**
   - Check terminal for errors
   - Use `flutter logs` to see app logs
   - Use breakpoints in IDE

6. **Stop App:**
   - Press `q` in terminal
   - Or close terminal

**You only need to reinstall if:**
- You add new native dependencies (rare)
- You change app configuration (AndroidManifest.xml, Info.plist)
- You want to test fresh install

---

## 📱 Building for Distribution

### Development Build (APK)
```bash
cd mobile
flutter build apk --debug
```
Output: `build/app/outputs/flutter-apk/app-debug.apk`

### Release Build (APK)
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

### Install APK on Phone
```bash
# Copy APK to phone, then install
# Or use adb:
adb install build/app/outputs/flutter-apk/app-release.apk
```

**Note:** For release builds, you need to:
1. Configure signing (Android)
2. Set up app icons
3. Configure app name, version, etc.

---

## 🐛 Common Issues & Solutions

### Issue 1: "No devices found"
**Solution:**
```bash
# For Android: Enable USB Debugging
# Settings → Developer Options → USB Debugging

# For iOS: Trust computer on iPhone
# Check flutter doctor for issues
flutter doctor
```

### Issue 2: "Package not found" errors
**Solution:**
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

### Issue 3: Hot reload not working
**Solution:**
- Press `R` (capital R) for hot restart
- Or stop app (`q`) and run again

### Issue 4: App crashes on launch
**Solution:**
```bash
# Check logs
flutter logs

# Run with verbose output
flutter run -v

# Check for errors in terminal
```

---

## 🎨 Testing UI Changes

### Test Brand Colors
```dart
// In lib/main.dart, try changing colors:
colorScheme: ColorScheme.fromSeed(
  seedColor: const Color(0xFF1E3A5F), // Movescrow Blue
  primary: const Color(0xFF1E3A5F),
  secondary: const Color(0xFFFF6B35), // Movescrow Orange
),
```

### Test Different Screens
Create a new screen file:
```dart
// lib/screens/login_screen.dart
import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Center(child: Text('Login Screen')),
    );
  }
}
```

Then navigate to it:
```dart
// In main.dart, update button:
onPressed: () {
  Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => LoginScreen()),
  );
},
```

Press `r` to see changes!

---

## 📊 Recommended Testing Strategy

### Phase 1: Basic App (Current)
- ✅ Test home screen
- ✅ Test navigation
- ✅ Test hot reload
- ✅ Test on emulator

### Phase 2: Core Features
- Test authentication screens
- Test order creation
- Test GPS tracking
- Test photo upload
- Test on real device

### Phase 3: Integration Testing
- Test API connections
- Test payment integration
- Test real-time tracking
- Test on multiple devices

### Phase 4: Pre-Launch
- Test on various Android versions
- Test on various iOS versions
- Test performance
- Test edge cases

---

## 🎯 Next Steps

1. **Test Current App:**
   ```bash
   cd mobile
   flutter run
   ```

2. **Try Hot Reload:**
   - Change text in `lib/main.dart`
   - Press `r` in terminal
   - See instant changes!

3. **Build First Screen:**
   - Create login/register screens
   - Test navigation
   - Test on emulator and real device

4. **Connect to Backend:**
   - Set up API service
   - Test API calls
   - Test error handling

---

## ✅ Summary

**Website vs App:** ✅ **MOBILE APP FIRST**

**Testing:** 
- ✅ Use emulator for quick testing
- ✅ Use real device for real-world testing
- ✅ **NO REINSTALL NEEDED** - Hot reload works!

**Workflow:**
1. Run `flutter run`
2. Make changes
3. Press `r` for hot reload
4. See changes instantly!

**You only reinstall when:**
- Adding new native dependencies
- Changing app configuration
- Building for distribution

---

**Ready to test?** Run `cd mobile && flutter run` and start developing! 🚀


