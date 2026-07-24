# Architecture

## 1. System Overview

Monorepo containing a React SPA and FastAPI REST API backed by SQLite.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
│  React + Vite + MUI + TanStack Query + React Router       │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/JSON (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Application                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌────────┐ │
│  │ API Layer│→ │ Service  │→ │ Repository   │→ │ SQLAlch│ │
│  │ (routes) │  │ (domain) │  │ (queries)    │  │ + SQLite│ │
│  └──────────┘  └──────────┘  └──────────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 2. Layer Responsibilities

### API Layer (`backend/app/api/`)

- HTTP routing, request/response models (Pydantic)
- Dependency injection wiring
- HTTP status mapping via exception handlers
- **No** business logic or SQL

### Service Layer (`backend/app/services/`)

- Business rules: status state machine, validation orchestration
- Transaction boundaries (commit/rollback via session)
- Domain exceptions (`InvalidStatusTransition`, `TicketNotFound`)

### Repository Layer (`backend/app/repositories/`)

- CRUD and query methods using SQLAlchemy 2.x
- Returns ORM models or scalars
- **No** knowledge of HTTP or Pydantic

### Persistence Layer (`backend/app/models/`, `backend/app/db/`)

- SQLAlchemy ORM models
- Session factory, engine configuration
- Alembic migrations (`backend/alembic/`)

## 3. Frontend Architecture

```
src/
├── api/          # Axios client + resource functions
├── pages/        # Route-level views
├── components/   # Reusable UI
├── hooks/        # TanStack Query hooks
├── types/        # TypeScript interfaces
├── theme/        # MUI theme
└── utils/        # CSV download, formatters
```

**Data flow:** Page → Hook (useQuery/useMutation) → API module → Backend → invalidate queries on success.

## 4. Cross-Cutting Concerns

| Concern | Backend | Frontend |
|---------|---------|----------|
| Config | `pydantic-settings`, `.env` | `import.meta.env` |
| Logging | stdlib `logging` | `console` in dev only |
| Errors | Exception handlers | Axios interceptor + toast |
| CORS | FastAPI middleware | N/A |
| Auth (stretch) | JWT middleware | Protected routes |

## 5. Dependency Injection (Backend)

```python
# Simplified wiring
def get_db() -> Generator[Session, None, None]: ...

def get_ticket_repository(db: Session = Depends(get_db)) -> TicketRepository: ...

def get_ticket_service(repo: TicketRepository = Depends(get_ticket_repository)) -> TicketService: ...

@router.patch("/{id}/status")
def update_status(svc: TicketService = Depends(get_ticket_service), ...): ...
```

## 6. State Machine (Domain Core)

Enforced exclusively in `TicketService.transition_status(ticket_id, new_status, actor_id)`:

1. Load ticket (404 if missing)
2. Validate `current_status → new_status` against allowed map (same-status = invalid)
3. Persist new status and `updated_at`
4. Return updated ticket or raise `InvalidStatusTransition` → HTTP **409**

## 7. API Versioning

**Decision (locked):** All resource endpoints under `/api/v1/`.

- Versioned: `/api/v1/tickets`, `/api/v1/users`, …
- Unversioned health: `GET /health` (ops/liveness only)

## 8. Deployment View (Assessment)

Local only:
- Backend: `uvicorn app.main:app --reload` on port 8000
- Frontend: `npm run dev` on port 5173
- Vite proxy to API optional

## 9. Technology Choices Summary

| Layer | Choice | Rationale |
|-------|--------|-----------|
| API | FastAPI | Async-capable, Pydantic native, OpenAPI |
| ORM | SQLAlchemy 2.x | Mature, Alembic integration |
| DB | SQLite | Zero setup, file persistence |
| FE build | Vite | Fast HMR, TS first-class |
| UI | MUI | Production components, accessible |
| Server state | TanStack Query | Caching, mutations, minimal code |

## 10. Quality Attributes

| Attribute | Approach |
|-----------|----------|
| Maintainability | Layered separation, typed schemas |
| Testability | Service unit tests; API integration tests |
| Security | Input validation, no secrets, CORS whitelist |
| Observability | Structured logs; health endpoint `GET /health` |

## 11. Implementation Notes (Non-Negotiable)

| Topic | Rule |
|-------|------|
| Invalid status HTTP code | Always **409** (not 400) |
| Route registration | Register `GET /tickets/export` **before** `GET /tickets/{id}` |
| Status updates | Dedicated endpoint only; general PATCH never mutates status |
| Export filter | Always `created_by = X-User-Id`; optional list filters narrow within that set |

## 12. Related Documents

- [data-model.md](./data-model.md) — entities and relationships
- [api-contract.md](./api-contract.md) — endpoints
- [directory-structure.md](./directory-structure.md) — folder layout
- [test-strategy.md](./test-strategy.md) — verification
- [design-review-gate.md](./design-review-gate.md) — design gate findings
