# Movescrow Onboarding Screen Design

## 🎨 Design Overview

Inspired by Munify app design, the onboarding screen features:
- **Logo centered** on first touch
- **4 animated progress bars** at top (like WhatsApp status)
- **Feature showcases** that animate and cycle through
- **Action buttons** at bottom (Create Account & Login)

---

## 📱 Screen Layout

### Top Section: Progress Bars
- 4 horizontal bars at the top
- Each bar represents one feature showcase
- Bars fill sequentially (like WhatsApp status)
- Color matches the current feature being shown

### Center Section: Logo & Features
1. **Logo** (centered, animated fade-in and scale)
2. **Feature Showcase** (cycles through 4 features):
   - Movescrow Trust
   - Peer-to-Peer
   - Real-Time Tracking
   - Secure Escrow

### Bottom Section: Action Buttons
- **Create Account** (Primary button - Blue)
- **Login** (Secondary button - Outlined)

---

## ✨ Animations

### Logo Animation
- Fade in from 0 to 1 opacity
- Scale from 0.8 to 1.0
- Duration: 1 second
- Curve: Ease out

### Progress Bars Animation
- Each bar fills sequentially
- Total duration: 3 seconds per feature
- Smooth linear animation
- Color changes based on current feature

### Feature Showcase Animation
- Fade in/out transition
- Slide up from bottom (30% offset)
- Cycles every 3 seconds
- Smooth transitions between features

---

## 🎯 Features Showcased

1. **Movescrow Trust** (Orange)
   - Icon: Verified User
   - Description: "Food-Safe Certified movers with enhanced security"

2. **Peer-to-Peer** (Blue)
   - Icon: People
   - Description: "Connect directly with trusted movers in your area"

3. **Real-Time Tracking** (Orange)
   - Icon: Location
   - Description: "GPS tracking and live updates for every delivery"

4. **Secure Escrow** (Blue)
   - Icon: Lock
   - Description: "Payments held safely until delivery is confirmed"

---

## 🎨 Brand Colors Used

- **Primary Blue**: `#1E3A5F` - Used for buttons and some features
- **Accent Orange**: `#FF6B35` - Used for progress bars and some features
- **White**: Background
- **Gray**: Progress bar backgrounds

---

## 📂 File Structure

```
mobile/lib/
├── screens/
│   └── onboarding_screen.dart  # Main onboarding screen
├── theme/
│   └── colors.dart             # Brand colors
└── main.dart                   # App entry point
```

---

## 🚀 Usage

The onboarding screen is now the default home screen. When users open the app:

1. **First Touch**: Logo appears centered with animation
2. **Progress Bars**: Start animating at top
3. **Features**: Cycle through automatically every 3 seconds
4. **User Action**: Can tap "Create Account" or "Login" at any time

---

## 🔄 Navigation

- **Create Account** → Navigates to `/register` (TODO: Create RegisterScreen)
- **Login** → Navigates to `/login` (TODO: Create LoginScreen)

---

## 🎬 Animation Timeline

```
0.0s  - Logo fades in and scales up
0.5s  - Progress bars start animating
0.5s  - First feature (Trust) appears
3.0s  - Second feature (P2P) appears
6.0s  - Third feature (Tracking) appears
9.0s  - Fourth feature (Escrow) appears
12.0s - Cycle repeats from first feature
```

---

## 💡 Customization

### Change Feature Duration
Edit `_startFeatureShowcase()` in `onboarding_screen.dart`:
```dart
Timer.periodic(const Duration(seconds: 3), ...)  // Change 3 to desired seconds
```

### Add More Features
Add to `_features` list in `_OnboardingScreenState`:
```dart
FeatureShowcase(
  title: 'Your Feature',
  description: 'Description here',
  icon: Icons.your_icon,
  color: MovescrowColors.primaryBlue,
),
```

### Change Animation Speed
Edit animation durations:
- Logo: `Duration(milliseconds: 1000)`
- Progress: `Duration(milliseconds: 3000)`
- Feature: `Duration(milliseconds: 600)`

---

## ✅ Status

- ✅ Logo centered with animation
- ✅ 4 progress bars at top (WhatsApp-style)
- ✅ Feature showcases with animations
- ✅ Create Account button
- ✅ Login button
- ⏳ Login screen (TODO)
- ⏳ Register screen (TODO)

---

**Design Inspired By**: Munify App  
**Pattern**: WhatsApp Status-style progress bars  
**Brand**: Movescrow (Blue #1E3A5F, Orange #FF6B35)

