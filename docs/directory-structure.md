# Directory Structure

Complete monorepo layout for the Support Ticket Management System.

```
new-project/
├── .cursor/
│   └── rules/                    # AI context rules (7 files)
├── .github/
│   └── workflows/
│       └── ci.yml                # PR checks: lint, test
├── artifacts/
│   ├── prompt-history/           # Exported Cursor chat sessions (10–15)
│   ├── screenshots/              # Optional UI evidence
│   └── tool-workflow.md          # Part A assessment artifact
├── backend/
│   ├── alembic/
│   │   ├── versions/             # Migration scripts
│   │   ├── env.py                # Alembic environment
│   │   └── script.py.mako        # Migration template
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/    # Route modules (tickets, users, comments)
│   │   │   │   └── router.py     # v1 router aggregation
│   │   │   └── deps.py           # FastAPI dependencies (DB, services)
│   │   ├── core/
│   │   │   ├── config.py         # pydantic-settings
│   │   │   ├── exceptions.py     # Domain exceptions
│   │   │   └── logging.py        # Logging config
│   │   ├── db/
│   │   │   ├── base.py           # Declarative base
│   │   │   └── session.py        # Engine, SessionLocal
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── ticket.py
│   │   │   └── comment.py
│   │   ├── repositories/         # Data access layer
│   │   │   ├── user_repository.py
│   │   │   ├── ticket_repository.py
│   │   │   └── comment_repository.py
│   │   ├── schemas/              # Pydantic request/response models
│   │   │   ├── user.py
│   │   │   ├── ticket.py
│   │   │   └── comment.py
│   │   ├── services/             # Business logic + state machine
│   │   │   ├── ticket_service.py
│   │   │   └── comment_service.py
│   │   └── main.py               # FastAPI app entry
│   ├── data/                     # SQLite file (gitignored)
│   ├── tests/
│   │   ├── unit/                 # Service/utility unit tests
│   │   ├── integration/          # API + DB tests (state machine)
│   │   └── conftest.py           # Fixtures, test client
│   ├── alembic.ini
│   ├── pyproject.toml            # UV project config
│   └── .env.example
├── docs/                         # Planning & lifecycle docs
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                  # Axios client + API functions
│   │   ├── components/           # Reusable UI components
│   │   │   ├── tickets/
│   │   │   ├── comments/
│   │   │   └── common/
│   │   ├── hooks/                # TanStack Query hooks
│   │   ├── pages/                # Route pages
│   │   ├── theme/                # MUI theme
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # CSV download, formatters
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── scripts/
│   ├── bootstrap.sh              # One-time dev setup
│   ├── seed_db.py                # Seed users/tickets/comments
│   └── run_dev.sh                # Start backend + frontend
├── .gitignore
├── .pre-commit-config.yaml
├── ProjectNeed.md                # Assessment requirements (provided)
└── README.md                     # Setup & quick start
```

---

## Folder Purposes

### Root

| Path | Purpose |
|------|---------|
| `.cursor/rules/` | Lightweight AI rules — stable project knowledge |
| `.github/workflows/` | CI automation on push/PR |
| `artifacts/` | Assessment deliverables (prompts, workflow doc) |
| `docs/` | Planning, architecture, lifecycle documentation |
| `scripts/` | Dev automation (bootstrap, seed, run) |

### Backend

| Path | Purpose |
|------|---------|
| `app/api/` | HTTP layer — routes, deps, no business logic |
| `app/services/` | Domain logic, state machine, orchestration |
| `app/repositories/` | SQLAlchemy queries, persistence access |
| `app/models/` | ORM entity definitions |
| `app/schemas/` | Pydantic validation and serialization |
| `app/core/` | Config, exceptions, logging |
| `app/db/` | Database engine and session management |
| `alembic/` | Schema migration history |
| `data/` | Local SQLite database file |
| `tests/unit/` | Fast isolated tests |
| `tests/integration/` | API + DB tests (mandatory state machine) |

### Frontend

| Path | Purpose |
|------|---------|
| `src/api/` | HTTP client and resource-specific API calls |
| `src/pages/` | Top-level route components |
| `src/components/` | Reusable presentational components |
| `src/hooks/` | Data fetching and mutation hooks |
| `src/types/` | Shared TypeScript interfaces |
| `src/theme/` | MUI theme customization |
| `src/utils/` | Pure helpers (CSV, dates) |

### Docs

See [documentation-plan.md](./documentation-plan.md) and [README.md](./README.md).

### Artifacts

| Path | Purpose |
|------|---------|
| `prompt-history/` | 10–15 Cursor session JSON/markdown exports |
| `tool-workflow.md` | Part A — how AI was used across SDLC |
| `screenshots/` | Optional demo captures |

### Scripts

| Script | Purpose |
|--------|---------|
| `bootstrap.sh` | Install UV deps, npm deps, pre-commit |
| `seed_db.py` | Populate users and sample tickets |
| `run_dev.sh` | Start uvicorn + vite concurrently |

---

## Files Created in Phase 0 (Foundation)

- `.gitignore`, `.pre-commit-config.yaml`
- `.cursor/rules/*`
- `docs/*` (this planning corpus)
- Empty scaffold folders with `.gitkeep` where needed

## Files Created in Phase 3+ (Implementation)

- All `backend/app/**` source
- All `frontend/src/**` source
- Alembic migrations
- CI workflow
- Final `README.md`

---

## Related

- [architecture.md](./architecture.md)
- [implementation-plan.md](./implementation-plan.md)
