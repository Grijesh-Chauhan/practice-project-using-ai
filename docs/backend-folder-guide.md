# Backend Folder Guide

**Audience:** Phase 3 implementers  
**Canonical tree:** [directory-structure.md](./directory-structure.md)

Explains **why** each backend directory exists and **which files** belong there. Do not invent parallel layouts.

---

## `backend/` (root)

**Why:** Isolated Python project (UV + `pyproject.toml`) for the FastAPI app.

| File | Belongs here |
|------|----------------|
| `pyproject.toml` | Deps, Ruff/Black/MyPy/Pytest config |
| `alembic.ini` | Alembic config (DB URL may come from env) |
| `.env` | Local secrets/config (gitignored) |
| `.env.example` | Committed placeholders — [configuration-strategy.md](./configuration-strategy.md) |
| `README` (optional) | Backend-specific notes; root README remains primary |

---

## `backend/app/`

**Why:** Application package imported as `app` (e.g. `uvicorn app.main:app`).

| File | Purpose |
|------|---------|
| `main.py` | App factory/entry: middleware, routers, handlers, startup logging |
| `__init__.py` | Package marker (keep empty or version constant only) |

---

## `backend/app/api/`

**Why:** HTTP boundary only.

### `api/deps.py`
- `get_db`, repository/service factories, `X-User-Id` helpers
- No business rules beyond parsing/required-header checks that map to 400

### `api/v1/router.py`
- Includes endpoint routers with prefix `/api/v1` (or included under app with that prefix)

### `api/v1/endpoints/`
| File | Contains |
|------|----------|
| `tickets.py` | Ticket routes; **register export before `{id}`** |
| `users.py` | `GET /users` |
| `comments.py` | `POST /tickets/{id}/comments` (or mount equivalently) |
| `health.py` | Optional — often `GET /health` is registered in `main.py` instead |

**Belongs:** route functions, `response_model`, status codes, `Depends`.  
**Does not belong:** SQLAlchemy queries, transition maps, `session.commit()`.

---

## `backend/app/core/`

**Why:** Cross-cutting, framework-agnostic-ish utilities shared by layers.

| File | Contains |
|------|----------|
| `config.py` | `pydantic-settings` Settings class |
| `exceptions.py` | Domain exception hierarchy |
| `logging.py` | Logging configuration helper |
| `csv_export.py` (optional) | Pure CSV string builder for tickets |

**Does not belong:** FastAPI routes, ORM models, repository queries.

---

## `backend/app/db/`

**Why:** Engine and session lifecycle isolated from domain code.

| File | Contains |
|------|----------|
| `base.py` | Declarative `Base` (and metadata import target for Alembic) |
| `session.py` | `create_engine`, `SessionLocal`, `get_session` generator used by deps |

See [database-strategy.md](./database-strategy.md).

---

## `backend/app/models/`

**Why:** SQLAlchemy ORM entities = persistence shape.

| File | Entity |
|------|--------|
| `user.py` | `User` |
| `ticket.py` | `Ticket` |
| `comment.py` | `Comment` |
| `__init__.py` | Import all models so Alembic/metadata see them |

**Belongs:** `Mapped` columns, `relationship`, `back_populates`.  
**Does not belong:** Pydantic, HTTP, transition logic.

Schema details: [data-model.md](./data-model.md).

---

## `backend/app/schemas/`

**Why:** API contract types (Pydantic v2), separate from ORM.

| File | Typical models |
|------|----------------|
| `ticket.py` | Create, Update, StatusBody, TicketRead, TicketDetail, TicketList |
| `comment.py` | CommentCreate, CommentRead |
| `user.py` | UserRead |
| `common.py` (optional) | ErrorResponse, pagination helpers |

**Belongs:** Field constraints matching [api-contract.md](./api-contract.md).  
**Does not belong:** DB sessions, business orchestration.

---

## `backend/app/repositories/`

**Why:** All SQL lives here.

| File | Owns |
|------|------|
| `ticket_repository.py` | Ticket CRUD, filters (`q`, status, priority, …), export query |
| `comment_repository.py` | Comment insert / list-by-ticket |
| `user_repository.py` | User list / get-by-id |

**Belongs:** `select()`, `flush()`, query composition.  
**Does not belong:** `commit()`, HTTP, ALLOWED_TRANSITIONS.

---

## `backend/app/services/`

**Why:** Domain use cases and transaction ownership.

| File | Owns |
|------|------|
| `ticket_service.py` | Ticket use cases + **state machine** |
| `comment_service.py` | Add comment |
| `user_service.py` | Optional list/require user |

**Belongs:** Orchestration, domain exceptions, `commit`/`rollback`.  
**Does not belong:** FastAPI `Request`, raw SQL text, response dict shaping beyond ORM/DTO.

Module APIs: [backend-module-design.md](./backend-module-design.md).

---

## `backend/alembic/`

**Why:** Versioned schema migrations.

| Path | Purpose |
|------|---------|
| `env.py` | Bind metadata, online/offline migrations |
| `script.py.mako` | Revision template |
| `versions/*.py` | One concern per revision; initial creates users/tickets/comments |

**Does not belong:** Application runtime business logic (prefer `scripts/seed_db.py` for demo data).

---

## `backend/data/`

**Why:** Local SQLite file location (`tickets.db`), gitignored.

| Belongs | Does not belong |
|---------|-----------------|
| Runtime DB file | Source code, committed binaries |

---

## `backend/tests/`

**Why:** Pytest suite colocated with backend.

| Path | Purpose |
|------|---------|
| `conftest.py` | App client, DB fixtures, seed helpers |
| `unit/` | Service/state machine/utils without full HTTP stack (or with mocked repo) |
| `integration/` | API + real test DB — mandatory transition matrix |

Details: [testing-plan-backend.md](./testing-plan-backend.md), [test-strategy.md](./test-strategy.md).

---

## Related root paths (not under `app/`)

| Path | Why |
|------|-----|
| `scripts/seed_db.py` | Idempotent/documented seed — uses app settings/session |
| `scripts/bootstrap.sh` | Dev setup |
| `.github/workflows/ci.yml` | Runs backend lint/tests (Phase 6) |

---

## Placement Decision Cheat Sheet

| If you are writing… | Put it in… |
|---------------------|------------|
| Route + status code | `api/v1/endpoints/` |
| `Depends` factory | `api/deps.py` |
| `SELECT` / `INSERT` | `repositories/` |
| Transition allow-map | `services/ticket_service.py` |
| Request body fields | `schemas/` |
| Table column | `models/` + Alembic revision |
| Env var | `core/config.py` + `.env.example` |
| Domain error type | `core/exceptions.py` |
| Exception → HTTP map | `main.py` handlers |
| Demo users/tickets | `scripts/seed_db.py` |
