# Support Ticket Management System

> **Status:** Engineering foundation complete — implementation not started.
> See [docs/project-foundation.md](./docs/project-foundation.md) to begin.

---

## README Outline

*Final README to be written in Phase 9. Sections below define required content.*

### 1. Project Title & Description
- Support Ticket Management System
- AI-assisted full-stack assessment project
- Brief feature list (create, assign, status workflow, comments, search, CSV export)

### 2. Tech Stack
- Backend: Python 3.13+, FastAPI, SQLAlchemy, SQLite, UV
- Frontend: React, TypeScript, Vite, MUI, TanStack Query
- Link to `docs/architecture.md` for details

### 3. Prerequisites
- Python 3.13+
- Node.js 20+ (LTS)
- UV package manager
- Git

### 4. Repository Structure
- Brief tree: `backend/`, `frontend/`, `docs/`, `artifacts/`, `scripts/`
- Link to `docs/directory-structure.md`

### 5. Quick Start
```bash
# Outline only — commands to be verified in Phase 9
git clone <repo-url>
cd new-project
./scripts/bootstrap.sh
# Backend setup
cd backend && uv sync
cp .env.example .env
uv run alembic upgrade head
uv run python ../scripts/seed_db.py
uv run uvicorn app.main:app --reload
# Frontend setup (separate terminal)
cd frontend && npm install
cp .env.example .env
npm run dev
```

### 6. Environment Variables

#### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite connection string | `sqlite:///./data/tickets.db` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

#### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base | `http://localhost:8000/api/v1` |
| `VITE_DEFAULT_USER_ID` | Demo user for X-User-Id | `1` |

### 7. Running Tests
```bash
# Backend
cd backend && uv run pytest

# Frontend
cd frontend && npm test
```

### 8. API Documentation
- Swagger UI: `http://localhost:8000/docs`
- Contract: `docs/api-contract.md`

### 9. Ticket Status Workflow
- Diagram or link to `ProjectNeed.md` / `docs/design-notes.md`
- Note: invalid transitions rejected by backend

### 10. CSV Export
- Export button on ticket list
- Downloads tickets created by current user

### 11. Development Workflow
- Branch naming: `cursor/<description>`
- Link to `docs/git-workflow.md`
- Pre-commit: `uv run pre-commit install`

### 12. Documentation
- Index: `docs/README.md`
- Planning, architecture, test strategy

### 13. Assessment Artifacts
- `/artifacts/tool-workflow.md`
- `/artifacts/prompt-history/`
- `/docs/reflection.md`

### 14. Known Limitations
- No authentication in core (demo user via header)
- SQLite for local dev only
- See `docs/security.md`

### 15. License
- TBD / assessment project

---

## Links

| Resource | Path |
|----------|------|
| Start here | [docs/project-foundation.md](./docs/project-foundation.md) |
| Implementation plan | [docs/implementation-plan.md](./docs/implementation-plan.md) |
| API contract | [docs/api-contract.md](./docs/api-contract.md) |
| Acceptance criteria | [docs/acceptance-criteria.md](./docs/acceptance-criteria.md) |
