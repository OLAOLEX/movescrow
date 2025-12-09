# Movescrow Backend

FastAPI backend for the Movescrow peer-to-peer logistics marketplace.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration (database, API keys, etc.)

5. Run the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── app/
│   ├── api/            # API routes
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   ├── core/           # Core configuration
│   └── utils/          # Utility functions
└── alembic/            # Database migrations
```

## Features to Implement

- [ ] User authentication (JWT)
- [ ] User roles (Sender, Mover, Restaurant)
- [ ] Food-Safe Certification system
- [ ] Anonymous packaging system
- [ ] Escrow payment system
- [ ] Real-time GPS tracking
- [ ] Restaurant partnerships
- [ ] Order management
- [ ] Rating and review system


