# Movescrow - Peer-to-Peer Logistics Marketplace

## 🚀 Project Overview

Movescrow is a peer-to-peer logistics marketplace connecting senders, movers, and restaurants for safe, verified food and package deliveries.

**Key Features:**

- 🍔 Food delivery with Food-Safe Certification
- 📦 Anonymous packaging system
- 🏪 Restaurant partnerships
- 💰 Escrow payment system
- 📍 Real-time GPS tracking

## 📁 Project Structure

```
movescrow/
├── backend/          # FastAPI backend
├── mobile/           # Flutter mobile app
├── web/              # Website (Coming Soon landing page)
├── docs/             # Documentation
└── README.md
```

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **Mobile**: Flutter (Dart)
- **Website**: HTML/CSS/JavaScript (Static site)
- **Database**: PostgreSQL
- **Payment**: Paystack/Flutterwave
- **Real-time**: Socket.IO / WebSockets

## 🌐 Website

The website is located in the `web/` folder. See [web/README.md](./web/README.md) for website details and [web/DEPLOYMENT_GUIDE.md](./web/DEPLOYMENT_GUIDE.md) for deployment instructions.

## 🎨 Brand Colors

- **Primary Blue**: `#1E3A5F` - Trust, reliability, professionalism
- **Accent Orange**: `#FF6B35` - Security, protection, energy
- **White**: `#FFFFFF` - Clarity, transparency

See [BRANDING.md](./BRANDING.md) for complete branding guidelines.

## 📋 Next Steps

1. ✅ Set up backend structure
2. ✅ Set up Flutter mobile app
3. ✅ Website landing page
4. ⏳ Configure database
5. ⏳ Integrate payment gateway
6. ⏳ Build core features

## 🚦 Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Mobile Setup

```bash
cd mobile
flutter pub get
flutter run
```

**🔥 Hot Reload**: While app is running, press `r` in terminal to see changes instantly (no reinstall needed!)

See [mobile/TESTING_GUIDE.md](./mobile/TESTING_GUIDE.md) for detailed testing instructions.

### Website Setup

The website files are in the `web/` folder. For deployment, see [web/DEPLOYMENT_GUIDE.md](./web/DEPLOYMENT_GUIDE.md).

## 📚 Documentation

### Business & Strategy
- [AI Business Review](./docs/AI_BUSINESS_REVIEW.md) - Comprehensive strategic analysis and recommendations
- [Order Flow Review](./docs/ORDER_FLOW_REVIEW.md) - Technical review of order flow design
- [Architecture Overview](./docs/ARCHITECTURE.md) - System architecture and design
- [API Design](./docs/API_DESIGN.md) - API specifications and endpoints

### App Development
- [App Development Guide](./docs/APP_DEVELOPMENT_GUIDE.md) - Complete guide to testing and development
- [Website vs App Strategy](./docs/WEBSITE_VS_APP.md) - Should you build website or app first?
- [Mobile Testing Guide](./mobile/TESTING_GUIDE.md) - Quick testing instructions

### Branding & Design
- [Branding Guidelines](./BRANDING.md) - Complete brand identity and guidelines
- [Brand Colors (Technical)](./docs/BRAND_COLORS.md) - Technical color specifications

### Development
- [Development Guide](./docs/DEVELOPMENT.md) - Setup and development workflow

---

**Status**: Project structure initialized - Ready for development
