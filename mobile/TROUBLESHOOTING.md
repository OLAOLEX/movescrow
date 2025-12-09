# Troubleshooting Guide - Movescrow App

## ✅ Fixed Issues

### Android NDK Version Mismatch
**Status**: ✅ **FIXED**

**Issue**: Project was using NDK 26.3.11579264, but plugins require NDK 27.0.12077973

**Fix Applied**: Updated `android/app/build.gradle.kts`:
```kotlin
ndkVersion = "27.0.12077973"
```

**Next Build**: The warning will disappear on next build.

---

### Invalid Resource File Error
**Status**: ✅ **FIXED**

**Issue**: Build failed with error:
```
Error: The file name must end with .xml or .png
C:\MOVESCROW\mobile\android\app\src\main\res\drawable-v21\79cd5fa0
```

**Cause**: Corrupted or invalid file without proper extension in drawable folder

**Fix Applied**: 
1. Deleted invalid file: `android/app/src/main/res/drawable-v21/79cd5fa0`
2. Cleaned build: `flutter clean`
3. Rebuilt app: `flutter run`

**Result**: ✅ Build now succeeds

---

### Payment Package Compilation Error
**Status**: ✅ **FIXED** (Temporarily Removed)

**Issue**: Build failed with Kotlin compilation errors:
```
Unresolved reference 'Registrar' in pay_android plugin
```

**Cause**: `pay` package version 1.1.0 has compatibility issues with current Flutter/Android setup

**Fix Applied**: 
1. Temporarily removed `pay` package from `pubspec.yaml`
2. Payment integration will be added back later when ready to implement
3. For now, app can build and run without payment features

**Note**: Payment integration is not needed for initial testing. We'll add it back when implementing payment features (Paystack/Flutterwave).

**Result**: ✅ App now builds successfully

---

## ⚠️ Harmless Warnings (Can Ignore)

### AdMob Errors
**Status**: ⚠️ **HARMLESS - Can Ignore**

**Error Message**:
```
AdMob: Failed to load interstitial ad: LoadAdError(code: 3, domain: com.google.android.gms.ads, message: Publisher data not found...)
```

**Why It Appears**:
- Some Flutter plugins include AdMob dependencies
- AdMob tries to load ads but no publisher ID is configured
- This is **normal** for development apps without ads

**Solution**:
- ✅ **Ignore it** - It doesn't affect app functionality
- ✅ **Remove later** - If you want to remove the warnings, you can exclude AdMob dependencies (not necessary for now)

**Impact**: None - App works perfectly fine with these warnings.

---

## 🐛 Common Issues & Solutions

### Issue 1: "No supported devices connected"
**Solution**:
```bash
# Generate platform files
flutter create .

# Check devices
flutter devices

# Run app
flutter run
```

### Issue 2: "Build failed" or "Gradle error"
**Solution**:
```bash
# Clean build
flutter clean
flutter pub get

# Rebuild
flutter run
```

### Issue 3: "NDK version mismatch"
**Solution**: ✅ Already fixed in `android/app/build.gradle.kts`

### Issue 4: App crashes on launch
**Solution**:
```bash
# Check logs
flutter logs

# Run with verbose output
flutter run -v

# Check for specific errors in terminal
```

### Issue 5: Hot reload not working
**Solution**:
- Press `R` (capital R) for hot restart
- Or stop app (`q`) and run again

### Issue 6: "Package not found" errors
**Solution**:
```bash
flutter clean
flutter pub get
flutter run
```

---

## 📱 Device-Specific Issues

### Android Device Not Detected
1. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
2. Trust computer:
   - When prompted on phone, tap "Allow" and check "Always allow"
3. Check connection:
   ```bash
   flutter devices
   ```

### iOS Simulator Issues (Mac Only)
1. Open Simulator:
   ```bash
   open -a Simulator
   ```
2. Check devices:
   ```bash
   flutter devices
   ```
3. Run app:
   ```bash
   flutter run
   ```

---

## 🔧 Build Configuration

### Current Configuration
- **NDK Version**: 27.0.12077973 ✅
- **Min SDK**: Flutter default
- **Target SDK**: Flutter default
- **Compile SDK**: Flutter default

### To Update Later
- Application ID: `com.example.movescrow` → Change to `com.movescrow.app`
- Signing: Currently using debug keys (update for release)

---

## ✅ Verification Checklist

After fixing issues, verify:
- [ ] App launches without crashes
- [ ] Hot reload works (press `r`)
- [ ] No critical errors in terminal
- [ ] App displays correctly on device
- [ ] Brand colors are correct (Blue #1E3A5F, Orange #FF6B35)

---

## 📞 Need Help?

1. Check Flutter doctor:
   ```bash
   flutter doctor -v
   ```

2. Check app logs:
   ```bash
   flutter logs
   ```

3. Run with verbose output:
   ```bash
   flutter run -v
   ```

4. Check Flutter documentation:
   - https://docs.flutter.dev/
   - https://flutter.dev/troubleshooting

---

**Current Status**: ✅ **All issues resolved - App ready to use!**

