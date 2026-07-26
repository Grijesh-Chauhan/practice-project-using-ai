#!/usr/bin/env python3
"""Database seed script (scaffold).

Populate users, tickets, and comments after models and migrations exist.
Run from repository root:

    cd backend && uv run python ../scripts/seed_db.py
"""

from __future__ import annotations


def main() -> None:
    """Seed placeholder — implement after ORM models are available."""
    raise SystemExit(
        "seed_db.py is not implemented yet. "
        "Add models + Alembic migrations first, then seed demo data."
    )


if __name__ == "__main__":
    main()
