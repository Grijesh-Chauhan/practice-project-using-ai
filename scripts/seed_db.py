#!/usr/bin/env python3
"""Database seed script.

Seeds three demo users and five sample tickets so a fresh clone has data
immediately after migrations (see docs/acceptance-criteria.md AC-051).

Run from repository root after migrations:

    cd backend && uv run alembic upgrade head
    cd backend && uv run python ../scripts/seed_db.py

Idempotent: users upsert by email; sample tickets are only inserted when the
tickets table is empty, so re-running never creates duplicates.
"""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.ticket import Ticket
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

# Sample tickets keyed by creator/assignee email (resolved to ids at seed time)
# to cover a spread of priorities and lifecycle statuses.
SEED_TICKETS: list[dict[str, str | None]] = [
    {
        "title": "Login page returns 500 error",
        "description": "Users cannot sign in; server throws an error on submit.",
        "priority": "high",
        "status": "Open",
        "created_by_email": "alice@example.com",
        "assigned_to_email": "bob@example.com",
    },
    {
        "title": "Add dark mode to dashboard",
        "description": "Requesting a dark theme option for the main dashboard.",
        "priority": "low",
        "status": "In Progress",
        "created_by_email": "alice@example.com",
        "assigned_to_email": "alice@example.com",
    },
    {
        "title": "Export report is missing totals row",
        "description": "The CSV export omits the summary totals at the bottom.",
        "priority": "medium",
        "status": "Resolved",
        "created_by_email": "bob@example.com",
        "assigned_to_email": "carol@example.com",
    },
    {
        "title": "Update onboarding documentation",
        "description": "Docs reference an old setup flow and need refreshing.",
        "priority": "low",
        "status": "Closed",
        "created_by_email": "carol@example.com",
        "assigned_to_email": None,
    },
    {
        "title": "Investigate duplicate notification emails",
        "description": "Some users report receiving the same email twice.",
        "priority": "high",
        "status": "Cancelled",
        "created_by_email": "bob@example.com",
        "assigned_to_email": "bob@example.com",
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


def seed_tickets(session: Session) -> int:
    """Insert sample tickets when the table is empty. Returns rows inserted."""
    existing = session.scalar(select(func.count()).select_from(Ticket))
    if existing:
        return 0

    users_by_email = {
        user.email: user.id for user in session.scalars(select(User)).all()
    }

    inserted = 0
    for payload in SEED_TICKETS:
        creator_email = payload["created_by_email"]
        assignee_email = payload["assigned_to_email"]
        created_by = users_by_email.get(creator_email) if creator_email else None
        if created_by is None:
            continue
        assigned_to = (
            users_by_email.get(assignee_email) if assignee_email else None
        )
        session.add(
            Ticket(
                title=payload["title"],
                description=payload["description"],
                priority=payload["priority"],
                status=payload["status"],
                created_by=created_by,
                assigned_to=assigned_to,
            )
        )
        inserted += 1
    return inserted


def main() -> None:
    """Seed demo users and sample tickets into the configured database."""
    with SessionLocal() as session:
        users_touched = seed_users(session)
        session.flush()
        tickets_inserted = seed_tickets(session)
        session.commit()
    print(f"Seed complete: users upserted/updated count={users_touched}")
    print(f"Sample tickets inserted count={tickets_inserted}")


if __name__ == "__main__":
    main()
