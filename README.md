# Joke Generator (React UI + Python Login)

This project adds a modern React UI (React 19) with a FastAPI backend.

## What’s included

- React UI:
  - Login / Register
  - Random joke (logs to history)
  - Manage jokes (add / delete)
  - Statistics (top displayed jokes)
- Python auth:
  - JWT auth
  - Passwords hashed with `bcrypt`
  - SQLite user store (`backend/users.db`)

## Run backend

From the project root:

```bash
.venv/bin/python -m pip install -r backend/requirements.txt
./.venv/bin/uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

## Run frontend

```bash
cd frontend
npm run dev
```

The UI reads the API URL from `frontend/.env` (`VITE_API_BASE_URL`).

## Use the app

1. Open the React dev URL.
2. Register a new user.
3. Sign in and use the dashboard.

