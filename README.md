# Support Ticket Management System

AI-assisted full-stack assessment project for creating, assigning, transitioning, commenting on, searching, and exporting support tickets.

> **Status:** Project scaffold complete — business features not implemented yet.  
> Engineering foundation: [docs/project-foundation.md](./docs/project-foundation.md)

## Tech stack

| Layer | Stack |
|-------|--------|
| Backend | Python 3.13+, FastAPI, SQLAlchemy, Alembic, SQLite, UV |
| Frontend | React, TypeScript, Vite, Material UI, TanStack Query, Axios, React Router, React Hook Form, Zod |
| Tooling | Ruff, Black, MyPy, Pytest, ESLint, Prettier, Pre-commit, GitHub Actions |

Architecture details: [docs/architecture.md](./docs/architecture.md)

## Prerequisites

- Python 3.13+
- [UV](https://docs.astral.sh/uv/) package manager
- Node.js 20+ (LTS recommended)
- npm
- Git

## Repository structure

```text
new-project/
├── backend/          # FastAPI application (UV)
├── frontend/         # React + Vite SPA
├── docs/             # Planning & architecture (source of truth)
├── artifacts/        # Assessment artifacts
├── scripts/          # Bootstrap / seed / run helpers
├── .github/          # CI, PR & issue templates
└── .cursor/          # Cursor rules
```

Full tree: [docs/directory-structure.md](./docs/directory-structure.md)

## Quick start

```bash
git clone <repo-url>
cd new-project
./scripts/bootstrap.sh
```

### Backend

```bash
cd backend
uv sync --group dev
cp .env.example .env
uv run uvicorn app.main:app --reload
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

Useful UV commands:

```bash
uv sync --group dev          # install runtime + dev deps
uv run ruff check app tests  # lint
uv run black app tests       # format
uv run mypy app              # typecheck
uv run pytest                # tests
uv run alembic upgrade head  # migrations (after models exist)
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- App: http://localhost:5173

Useful npm commands:

```bash
npm run dev           # Vite dev server
npm run lint          # ESLint
npm run format        # Prettier write
npm run format:check  # Prettier check
npm run build         # production build
```

### Both servers

```bash
./scripts/run_dev.sh
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLAlchemy URL | `sqlite:///./data/tickets.db` |
| `CORS_ORIGINS` | Allowed origins (CSV) | `http://localhost:5173` |
| `APP_NAME` | OpenAPI title | `Support Ticket API` |
| `APP_ENV` | `development` \| `production` \| `test` | `development` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `API_V1_PREFIX` | API mount prefix | `/api/v1` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base | `http://localhost:8000/api/v1` |
| `VITE_DEFAULT_USER_ID` | Demo user for `X-User-Id` | `1` |

Root `.env.example` points at the package-specific examples.

## Development workflow

1. Create a branch: `cursor/<short-description>`
2. Install hooks once: `cd backend && uv run pre-commit install` (from repo root: `uv run --directory backend pre-commit install`)
3. Implement behind thin API / service layers — see Cursor rules under `.cursor/rules/`
4. Run lint, types, and tests before opening a PR
5. Open a PR using the template in `.github/PULL_REQUEST_TEMPLATE.md`

Git conventions: [docs/git-workflow.md](./docs/git-workflow.md)

## Tests

```bash
# Backend
cd backend && uv run pytest

# Frontend (scaffold has lint/build; unit tests added later)
cd frontend && npm run lint && npm run build
```

## Documentation

| Resource | Path |
|----------|------|
| Docs index | [docs/README.md](./docs/README.md) |
| Implementation plan | [docs/implementation-plan.md](./docs/implementation-plan.md) |
| API contract | [docs/api-contract.md](./docs/api-contract.md) |
| Acceptance criteria | [docs/acceptance-criteria.md](./docs/acceptance-criteria.md) |

## Known limitations (assessment scope)

- No authentication in core (demo user via `X-User-Id`)
- SQLite for local development
- Scaffold phase only — ticket/comment/user business logic not implemented yet

See [docs/security.md](./docs/security.md).
