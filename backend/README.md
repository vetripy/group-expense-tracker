# Group Expense Tracker - Backend

FastAPI + MongoDB backend with JWT auth and clean architecture.

## Quick Start

```bash
# Create virtualenv and install
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Copy env and configure
cp .env.example .env

# Run (requires MongoDB on localhost:27017)
uvicorn main:app --reload
```

## Docker

```bash
# From project root
docker-compose up --build

# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login (returns tokens) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Current user (requires Bearer token) |
| GET | `/health` | Health check |
