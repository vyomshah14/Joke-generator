from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from jose import JWTError, jwt

# Make root-level imports work when running from the `backend/` directory.
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.append(str(BACKEND_DIR))

from auth_store import UserStore  # noqa: E402
from joke_class import JokeManager  # noqa: E402
from joke_utils import count_jokes_from_log, format_joke, top_n_from_counts  # noqa: E402

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', '10080'))  # 7 days

bearer_scheme = HTTPBearer()


def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {
        'sub': subject,
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def make_error(detail: str, code: int = status.HTTP_401_UNAUTHORIZED) -> HTTPException:
    return HTTPException(status_code=code, detail=detail)


class AuthRequest(BaseModel):
    username: str
    password: str


class RegisterResponse(BaseModel):
    ok: bool
    message: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = 'Bearer'


class MeResponse(BaseModel):
    username: str


class AddJokeRequest(BaseModel):
    joke_text: str


class AddJokeResponse(BaseModel):
    added: bool
    message: str


class DeleteJokeResponse(BaseModel):
    removed: str


class RandomJokeResponse(BaseModel):
    joke: str


class StatsResponse(BaseModel):
    top: list[dict[str, Any]]


class JokesListResponse(BaseModel):
    jokes: list[str]


app = FastAPI(title='Joke Generator API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

store = UserStore(Path(__file__).resolve().parent / 'users.db')
jm = JokeManager()


def get_current_username(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> str:
    if not credentials:
        raise make_error('Missing token')
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise make_error('Invalid or expired token')

    username = payload.get('sub')
    if not isinstance(username, str) or not username.strip():
        raise make_error('Invalid token payload')

    # Ensure the user still exists.
    if store.get_username(username) is None:
        raise make_error('User no longer exists')

    return username


@app.get('/api/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/auth/register', response_model=RegisterResponse)
def register(req: AuthRequest) -> RegisterResponse:
    try:
        store.create_user(req.username, req.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return RegisterResponse(ok=True, message='Account created. Please login.')


@app.post('/api/auth/login', response_model=LoginResponse)
def login(req: AuthRequest) -> LoginResponse:
    if not store.verify_user(req.username, req.password):
        raise make_error('Invalid username or password')
    token = create_access_token(req.username.strip())
    return LoginResponse(access_token=token)


@app.get('/api/auth/me', response_model=MeResponse)
def me(username: str = Depends(get_current_username)) -> MeResponse:
    return MeResponse(username=username)


@app.get('/api/jokes/random', response_model=RandomJokeResponse)
def random_joke() -> RandomJokeResponse:
    # Log after generating so stats reflect actual usage.
    try:
        joke_text = jm.get_random_joke()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    jm.log_joke(format_joke(joke_text))
    return RandomJokeResponse(joke=joke_text)


@app.get('/api/jokes', response_model=JokesListResponse)
def list_jokes() -> JokesListResponse:
    return JokesListResponse(jokes=jm.show_jokes())


@app.post('/api/jokes', response_model=AddJokeResponse)
def add_joke(req: AddJokeRequest) -> AddJokeResponse:
    clean = format_joke(req.joke_text)
    added = jm.add_joke(clean)
    if added:
        return AddJokeResponse(added=True, message='Joke added successfully.')
    return AddJokeResponse(added=False, message='Joke already exists or is invalid.')


@app.delete('/api/jokes/{index}', response_model=DeleteJokeResponse)
def delete_joke(index: int) -> DeleteJokeResponse:
    try:
        removed = jm.remove_joke(index)
    except (IndexError, TypeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    return DeleteJokeResponse(removed=removed)


@app.get('/api/jokes/stats', response_model=StatsResponse)
def stats() -> StatsResponse:
    log_lines = jm.read_log()
    counts = count_jokes_from_log(log_lines)
    top = top_n_from_counts(counts, n=5)
    return StatsResponse(top=[{'joke': joke, 'count': count} for joke, count in top])


# Serve static frontend files
FRONTEND_DIR = ROOT_DIR / "frontend" / "dist"
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/{fallback_path:path}")
    def serve_frontend(fallback_path: str):
        if fallback_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend build files not found")

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
