from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Optional

import bcrypt


class UserStore:
    def __init__(self, db_path: str | Path):
        self.db_path = Path(db_path)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        # timeout makes concurrent requests less likely to fail
        return sqlite3.connect(self.db_path, timeout=10)

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                  username TEXT PRIMARY KEY,
                  password_hash TEXT NOT NULL
                );
                """
            )

    def create_user(self, username: str, password: str) -> None:
        if not username or not username.strip():
            raise ValueError('Username is required')
        if not password or len(password) < 4:
            raise ValueError('Password must be at least 4 characters')

        username = username.strip()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        with self._connect() as conn:
            cur = conn.execute('SELECT 1 FROM users WHERE username = ?', (username,))
            if cur.fetchone() is not None:
                raise ValueError('Username already exists')

            conn.execute(
                'INSERT INTO users(username, password_hash) VALUES(?, ?)',
                (username, password_hash),
            )

    def verify_user(self, username: str, password: str) -> bool:
        if not username or not password:
            return False
        username = username.strip()
        with self._connect() as conn:
            cur = conn.execute('SELECT password_hash FROM users WHERE username = ?', (username,))
            row = cur.fetchone()
        if not row:
            return False
        password_hash = row[0]
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception:
            return False

    def get_username(self, username: str) -> Optional[str]:
        username = username.strip()
        with self._connect() as conn:
            cur = conn.execute('SELECT username FROM users WHERE username = ?', (username,))
            row = cur.fetchone()
        return row[0] if row else None

