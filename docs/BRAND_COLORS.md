# Movescrow Brand Colors - Technical Specifications

## Primary Brand Colors

### Dark Blue (Primary)
- **Hex**: `#1E3A5F` (approximate - adjust to match exact logo shade)
- **RGB**: `rgb(30, 58, 95)`
- **Usage**: Primary brand color, main UI elements, primary buttons, headers
- **CSS Variable**: `--color-primary-blue` or `--movescrow-blue`

### Orange (Secondary/Accent)
- **Hex**: `#FF6B35` (approximate - adjust to match exact logo shade)
- **RGB**: `rgb(255, 107, 53)`
- **Usage**: Security features, escrow indicators, important CTAs, accent elements
- **CSS Variable**: `--color-accent-orange` or `--movescrow-orange`

### White (Neutral)
- **Hex**: `#FFFFFF`
- **RGB**: `rgb(255, 255, 255)`
- **Usage**: Backgrounds, text on dark backgrounds, icons

## Color Implementation

### For Flutter (Mobile App)
```dart
class MovescrowColors {
  static const Color primaryBlue = Color(0xFF1E3A5F);
  static const Color accentOrange = Color(0xFFFF6B35);
  static const Color white = Color(0xFFFFFFFF);
  
  // Additional colors
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color darkGray = Color(0xFF333333);
  static const Color successGreen = Color(0xFF4CAF50);
  static const Color errorRed = Color(0xFFE53935);
}
```

### For CSS/Web (Backend Admin/Web)
```css
:root {
  --movescrow-blue: #1E3A5F;
  --movescrow-orange: #FF6B35;
  --movescrow-white: #FFFFFF;
  --movescrow-light-gray: #F5F5F5;
  --movescrow-dark-gray: #333333;
}
```

### For Python (Backend - if needed for reports/emails)
```python
MOVESCROW_COLORS = {
    'primary_blue': '#1E3A5F',
    'accent_orange': '#FF6B35',
    'white': '#FFFFFF',
    'light_gray': '#F5F5F5',
    'dark_gray': '#333333',
}
```

## Logo Color Breakdown

- **"Move" text**: Dark Blue (`#1E3A5F`)
- **"scrow" text**: Orange (`#FF6B35`)
- **"M" graphic**: Dark Blue (`#1E3A5F`)
- **Shield**: Orange (`#FF6B35`)
- **Keyhole icon**: White (`#FFFFFF`)

## Notes

⚠️ **Important**: The hex values provided are approximations based on the logo description. 
Please extract the exact color values from the original logo file (if available) and update these values accordingly.


