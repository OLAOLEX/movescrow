# Movescrow Mobile App

Flutter mobile application for the Movescrow peer-to-peer logistics marketplace.

## Setup

1. Ensure Flutter is installed:
```bash
flutter --version
```

2. Get dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## 🚀 Quick Testing (NO REINSTALL NEEDED!)

### Test Current App:
```bash
cd mobile
flutter run
```

### Hot Reload (Instant Updates):
- While app is running, make code changes
- Press `r` in terminal → Changes appear instantly!
- Press `R` for hot restart
- Press `q` to quit

**You DON'T need to reinstall each time!** Just press `r` for hot reload! 🔥

### Testing Options:
1. **Android Emulator** (No phone needed):
   ```bash
   flutter emulators --launch <emulator-id>
   flutter run
   ```

2. **Physical Android Phone**:
   - Enable USB Debugging
   - Connect via USB
   - Run: `flutter run`

3. **iOS Simulator** (Mac only):
   ```bash
   open -a Simulator
   flutter run
   ```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart              # App entry point
│   ├── theme/                 # Theme and colors
│   ├── models/                # Data models
│   ├── screens/               # UI screens
│   ├── widgets/               # Reusable widgets
│   ├── services/              # API services
│   ├── providers/             # State management
│   └── utils/                 # Utility functions
├── assets/                    # Images, fonts, etc.
└── pubspec.yaml              # Dependencies
```

## Brand Colors

- **Primary Blue**: `#1E3A5F` - Used for primary UI elements
- **Accent Orange**: `#FF6B35` - Used for security features and CTAs
- **White**: `#FFFFFF` - Backgrounds and contrast

See `lib/theme/colors.dart` for color definitions.

## Features to Implement

- [ ] User authentication (Login/Register)
- [ ] User roles (Sender, Mover, Restaurant)
- [ ] Food-Safe Certification display
- [ ] Anonymous packaging options
- [ ] Escrow payment system
- [ ] Real-time GPS tracking
- [ ] Restaurant listings
- [ ] Order creation and management
- [ ] Rating and review system
- [ ] Push notifications

## Development

### Running on specific device
```bash
flutter devices  # List available devices
flutter run -d <device-id>
```

### Building
```bash
# Android APK
flutter build apk

# iOS (macOS only)
flutter build ios
```

