# Quick Testing Guide - Movescrow App

## 🚀 Quick Start (5 Minutes)

### 1. Check Flutter is Working
```bash
flutter doctor
```

### 2. Navigate to Mobile Folder
```bash
cd mobile
```

### 3. Install Dependencies
```bash
flutter pub get
```

### 4. Check Available Devices
```bash
flutter devices
```

### 5. Run the App
```bash
flutter run
```

**That's it!** The app will launch on your device/emulator.

---

## 🔥 Hot Reload (No Reinstall!)

While app is running:

- Press `r` → Hot reload (instant UI updates)
- Press `R` → Hot restart (reset app state)
- Press `q` → Quit app

**Example:**
1. App is running
2. Change text in `lib/main.dart`
3. Save file
4. Press `r` in terminal
5. See changes instantly! ⚡

---

## 📱 Testing Options

### Option 1: Android Emulator (No Phone Needed)
```bash
# List emulators
flutter emulators

# Launch emulator
flutter emulators --launch <emulator-id>

# Run app
flutter run
```

### Option 2: Physical Android Phone
1. Enable USB Debugging: Settings → Developer Options → USB Debugging
2. Connect phone via USB
3. Run: `flutter run`

### Option 3: iOS Simulator (Mac Only)
```bash
# Open Simulator
open -a Simulator

# Run app
flutter run
```

---

## ✅ What to Test

### Current App Features:
- [ ] App launches successfully
- [ ] Home screen displays
- [ ] "Welcome to Movescrow" text visible
- [ ] "Get Started" button visible
- [ ] Brand colors correct (Blue #1E3A5F, Orange #FF6B35)
- [ ] Hot reload works (press `r`)

---

## 🐛 Troubleshooting

### "No devices found"
- Android: Enable USB Debugging
- Check: `flutter devices`
- Run: `flutter doctor`

### "Package not found"
```bash
flutter clean
flutter pub get
flutter run
```

### App crashes
- Check terminal for errors
- Run: `flutter logs`
- Run: `flutter run -v` (verbose)

---

## 📝 Quick Commands Reference

```bash
# Run app
flutter run

# Hot reload (while running)
Press 'r'

# Hot restart (while running)
Press 'R'

# Quit app
Press 'q'

# List devices
flutter devices

# Check Flutter setup
flutter doctor

# Clean build
flutter clean

# Get dependencies
flutter pub get

# Build APK
flutter build apk
```

---

**Remember:** You DON'T need to reinstall each time! Just press `r` for hot reload! 🔥


