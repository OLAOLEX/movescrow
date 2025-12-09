# Clear Flutter Asset Cache

## 🔄 If Assets Not Updating

If you update an asset file (like SVG) but Flutter still shows the old version:

### Method 1: Full Clean (Recommended)
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

### Method 2: Delete Cache Directories
```bash
cd mobile
# Delete build cache
Remove-Item -Path "build" -Recurse -Force
Remove-Item -Path ".dart_tool" -Recurse -Force
flutter pub get
flutter run
```

### Method 3: Hot Restart (Not Hot Reload)
- Press `R` in terminal (capital R) for hot restart
- Or stop and restart the app completely

### Method 4: Uninstall and Reinstall
```bash
# Uninstall app from device
adb uninstall com.movescrow.app  # Android
# Then run again
flutter run
```

## ✅ Verification

After cleaning, verify:
1. Asset file is updated (check file timestamp)
2. `flutter clean` completed successfully
3. App rebuilt from scratch
4. New asset appears in app

---

**Note**: Hot reload (r) doesn't reload assets - you need hot restart (R) or full rebuild!

