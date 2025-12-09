# Movescrow Development Guide

## Getting Started

### Prerequisites
- Python 3.10+
- Flutter 3.0+
- PostgreSQL 14+
- Node.js (for Socket.IO if needed)

### Initial Setup

1. **Clone and navigate to project**
```bash
cd MOVESCROW
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit .env with your settings
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb movescrow_db

# Run migrations (when available)
alembic upgrade head
```

4. **Mobile Setup**
```bash
cd mobile
flutter pub get
```

## Development Workflow

### Backend Development
1. Start the development server:
```bash
cd backend
uvicorn main:app --reload
```

2. API documentation available at:
   - Swagger: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

3. Run tests (when available):
```bash
pytest
```

### Mobile Development
1. Start the app:
```bash
cd mobile
flutter run
```

2. Hot reload is enabled by default

3. Run tests:
```bash
flutter test
```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use Black for formatting (when configured)

### Dart (Mobile)
- Follow Dart style guide
- Use `flutter analyze` to check code
- Maximum line length: 80 characters

## Git Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit
3. Push to remote: `git push origin feature/feature-name`
4. Create pull request

## Testing

### Backend
- Unit tests for services
- Integration tests for API endpoints
- Use pytest framework

### Mobile
- Unit tests for business logic
- Widget tests for UI components
- Integration tests for user flows

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `PAYSTACK_SECRET_KEY` - Paystack API key
- `FLUTTERWAVE_SECRET_KEY` - Flutterwave API key

### Mobile
- API base URL configuration
- Payment gateway keys (securely stored)

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API keys secured
- [ ] CORS configured for production
- [ ] SSL certificates installed
- [ ] Error logging configured
- [ ] Performance monitoring set up


