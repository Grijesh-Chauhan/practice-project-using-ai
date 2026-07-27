#!/usr/bin/env python3
"""Database seed script.

Milestone M3: seed users only (tickets/comments deferred to M8).

Run from repository root after migrations:

    cd backend && uv run alembic upgrade head
    cd backend && uv run python ../scripts/seed_db.py

Idempotent for users: upserts by email (updates name/role if the email exists).
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User

SEED_USERS: list[dict[str, str]] = [
    {
        "name": "Alice Agent",
        "email": "alice@example.com",
        "role": "agent",
    },
    {
        "name": "Bob Agent",
        "email": "bob@example.com",
        "role": "agent",
    },
    {
        "name": "Carol Admin",
        "email": "carol@example.com",
        "role": "admin",
    },
]


def seed_users(session: Session) -> int:
    """Insert or update the three demo users. Returns count of rows touched."""
    touched = 0
    for payload in SEED_USERS:
        existing = session.scalar(select(User).where(User.email == payload["email"]))
        if existing is None:
            session.add(
                User(
                    name=payload["name"],
                    email=payload["email"],
                    role=payload["role"],
                )
            )
            touched += 1
            continue

        changed = False
        if existing.name != payload["name"]:
            existing.name = payload["name"]
            changed = True
        if existing.role != payload["role"]:
            existing.role = payload["role"]
            changed = True
        if changed:
            touched += 1
    return touched


def main() -> None:
    """Seed demo users into the configured database."""
    with SessionLocal() as session:
        touched = seed_users(session)
        session.commit()
    print(f"Seed complete: users upserted/updated count={touched}")
    print("Note: tickets and comments seeding is deferred to Milestone M8.")


if __name__ == "__main__":
    main()
