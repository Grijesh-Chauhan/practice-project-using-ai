# Python Backend Standards

## Layout
`backend/app/{api,services,repositories,models,schemas,core,db}` — see `docs/directory-structure.md`.

## Patterns
- **API routes**: thin — validate input, call service, map response. No business logic.
- **Services**: business rules, state machine, orchestration. Raise domain exceptions.
- **Repositories**: SQLAlchemy queries only. No HTTP or Pydantic.
- **Schemas**: Pydantic v2 for request/response. Separate from ORM models.

## Dependency Injection
Use FastAPI `Depends()` for DB session, repositories, services. Wire in `api/deps.py`.

## State Machine
Implement in service layer. Single source of truth for allowed transitions. Return clear error on invalid transition.

## Database
- SQLAlchemy 2.x declarative style with `Mapped` types.
- Alembic for all schema changes. Never hand-edit production DB.
- SQLite file: `backend/data/tickets.db` (gitignored).

## Tooling
- UV for deps and scripts (`pyproject.toml`).
- Ruff (lint), Black (format), MyPy (types). Pre-commit runs all.
- Config via `pydantic-settings`; load from `.env` (use `.env.example`).

## Errors
- Domain errors → mapped to HTTP 400/404/409 in exception handlers.
- Never expose stack traces in API responses.

## Logging
Use stdlib `logging`. Log at INFO for requests; WARNING/ERROR for failures. No PII in logs.

## Tests
Pytest + HTTPX `AsyncClient` or `TestClient`. Integration tests for state machine are mandatory.
