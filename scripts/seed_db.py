#!/usr/bin/env python3
"""Database seed script.

Seeds three demo users and ~1000 synthetic tickets spanning the past ~5 years
so dashboards and filters have realistic volume (see AC-051).

Run from repository root after migrations:

    cd backend && uv run alembic upgrade head
    cd backend && uv run python ../scripts/seed_db.py

Idempotent by default: users upsert by email; tickets are only inserted when the
tickets table is empty.

Force a full ticket reseed (deletes comments + tickets, then inserts synthetic data):

    cd backend && uv run python ../scripts/seed_db.py --force
"""

from __future__ import annotations

import argparse
import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.comment import Comment
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

TICKET_COUNT = 1000
HISTORY_DAYS = 365 * 5  # ~5 years
RANDOM_SEED = 42

TITLE_TEMPLATES = [
    "Login fails for {topic}",
    "Cannot reset password on {topic}",
    "Slow performance on {topic}",
    "Export CSV missing fields for {topic}",
    "UI glitch on {topic} page",
    "API timeout when loading {topic}",
    "Incorrect totals on {topic} report",
    "Notification emails duplicated for {topic}",
    "Permission error accessing {topic}",
    "Mobile layout broken on {topic}",
    "Search returns stale results for {topic}",
    "Attachment upload fails for {topic}",
    "Dark mode contrast issue on {topic}",
    "Webhook delivery failing for {topic}",
    "Dashboard widget empty for {topic}",
]

TOPICS = [
    "billing",
    "onboarding",
    "dashboard",
    "reports",
    "settings",
    "profile",
    "inbox",
    "calendar",
    "inventory",
    "checkout",
    "analytics",
    "integrations",
    "admin console",
    "notifications",
    "search",
]

PRIORITIES = ["low", "medium", "high"]
# Weighted toward resolved/closed for older historical volume.
STATUSES = ["Open", "In Progress", "Resolved", "Closed", "Cancelled"]
STATUS_WEIGHTS = [0.14, 0.18, 0.16, 0.42, 0.10]


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


def clear_tickets(session: Session) -> None:
    """Remove all comments and tickets (users are preserved)."""
    session.execute(delete(Comment))
    session.execute(delete(Ticket))
    session.flush()


def _pick_status(rng: random.Random, age_ratio: float) -> str:
    """Bias older tickets toward Closed/Resolved; newer toward Open/In Progress."""
    weights = list(STATUS_WEIGHTS)
    if age_ratio > 0.7:
        weights = [0.04, 0.08, 0.18, 0.60, 0.10]
    elif age_ratio < 0.2:
        weights = [0.28, 0.30, 0.14, 0.18, 0.10]
    return rng.choices(STATUSES, weights=weights, k=1)[0]


def seed_tickets(session: Session, *, force: bool = False) -> int:
    """Insert synthetic tickets when empty (or after --force). Returns rows inserted."""
    existing = session.scalar(select(func.count()).select_from(Ticket)) or 0
    if existing and not force:
        return 0
    if force:
        clear_tickets(session)

    users = list(session.scalars(select(User).order_by(User.id.asc())).all())
    if not users:
        return 0

    user_ids = [user.id for user in users]
    rng = random.Random(RANDOM_SEED)
    now = datetime.now(UTC)
    inserted = 0

    for index in range(TICKET_COUNT):
        age_days = rng.randint(0, HISTORY_DAYS)
        age_ratio = age_days / HISTORY_DAYS
        created_at = now - timedelta(
            days=age_days,
            hours=rng.randint(0, 23),
            minutes=rng.randint(0, 59),
        )
        # updated_at is at or after created_at (simulates later activity).
        update_lag_days = rng.randint(0, min(90, max(0, age_days)))
        updated_at = created_at + timedelta(
            days=update_lag_days,
            hours=rng.randint(0, 23),
        )
        if updated_at > now:
            updated_at = now

        topic = rng.choice(TOPICS)
        template = rng.choice(TITLE_TEMPLATES)
        title = template.format(topic=topic)
        status = _pick_status(rng, age_ratio)
        priority = rng.choices(PRIORITIES, weights=[0.35, 0.45, 0.20], k=1)[0]
        created_by = rng.choice(user_ids)
        assigned_to = None if rng.random() < 0.18 else rng.choice(user_ids)

        session.add(
            Ticket(
                title=title[:255],
                description=(
                    f"Synthetic ticket #{index + 1} about {topic}. "
                    f"Generated for dashboard/analytics testing. "
                    f"Priority={priority}, status={status}."
                ),
                priority=priority,
                status=status,
                created_by=created_by,
                assigned_to=assigned_to,
                created_at=created_at,
                updated_at=updated_at,
            )
        )
        inserted += 1
        if inserted % 200 == 0:
            session.flush()

    return inserted


def main() -> None:
    """Seed demo users and synthetic tickets into the configured database."""
    parser = argparse.ArgumentParser(description="Seed demo users and tickets")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing tickets/comments and reseed ~1000 synthetic tickets",
    )
    args = parser.parse_args()

    with SessionLocal() as session:
        users_touched = seed_users(session)
        session.flush()
        tickets_inserted = seed_tickets(session, force=args.force)
        session.commit()
    print(f"Seed complete: users upserted/updated count={users_touched}")
    print(f"Sample tickets inserted count={tickets_inserted}")
    if tickets_inserted == 0 and not args.force:
        print("Tip: tickets already exist. Re-run with --force to replace them.")


if __name__ == "__main__":
    main()
