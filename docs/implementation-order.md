# Backend Implementation Order

**Audience:** Phase 3 developers / Cursor agents  
**Phase context:** [implementation-plan.md](./implementation-plan.md) Phase 3  
**Do not:** Redesign architecture or generate unrelated frontend code in these milestones.

Breaks backend work into small, reviewable milestones. Follow in order unless noted. Contracts: [api-contract.md](./api-contract.md), [data-model.md](./data-model.md).

Complexity: **S** &lt; 1h · **M** 1–2h · **L** 2–4h (single developer familiar with stack).

---

## Milestone 0 — Tooling Scaffold

### Objective
Create UV project and empty package layout with lint/test tooling wired — no business endpoints yet.

### Expected Deliverables
- `backend/pyproject.toml` (FastAPI, SQLAlchemy, Alembic, Pydantic settings, Pytest, HTTPX, Ruff, Black, MyPy)
- Package dirs per [directory-structure.md](./directory-structure.md) / [backend-folder-guide.md](./backend-folder-guide.md)
- `app/main.py` with empty FastAPI app + `GET /health`
- `.env.example` per [configuration-strategy.md](./configuration-strategy.md)
- `app/core/config.py` Settings stub

### Definition of Done
- `uv sync` succeeds
- `uv run uvicorn app.main:app` serves `/health` → 200
- Ruff/Black/MyPy configs present

### Validation Checklist
- [ ] Health returns `{"status":"ok"}`
- [ ] App imports without DB (or with deferred engine)
- [ ] `.env` gitignored; `.env.example` committed

### Git Commit Recommendation
`chore(backend): scaffold UV project, config, and health endpoint`

### Estimated Complexity
**S**

---

## Milestone 1 — Persistence Foundation

### Objective
ORM models, engine/session, Alembic initial migration, FK pragmas.

### Expected Deliverables
- `app/models/{user,ticket,comment}.py`
- `app/db/{base,session}.py`
- Alembic env + initial revision (tables + indexes)
- SQLite `check_same_thread` + `PRAGMA foreign_keys=ON`
- Ensure `data/` directory handling

### Definition of Done
- `alembic upgrade head` creates schema on file DB
- Models match [data-model.md](./data-model.md)

### Validation Checklist
- [ ] Tables `users`, `tickets`, `comments` exist
- [ ] FKs and recommended indexes present
- [ ] Downgrade path works for initial revision

### Git Commit Recommendation
`feat(backend): add SQLAlchemy models and initial Alembic migration`

### Estimated Complexity
**M**

---

## Milestone 2 — Core Cross-Cutting

### Objective
Exceptions, logging, DI session dependency, CORS, error handlers.

### Expected Deliverables
- `app/core/exceptions.py` hierarchy — [error-handling-strategy.md](./error-handling-strategy.md)
- Exception handlers on app
- `app/core/logging.py` + startup configure
- `api/deps.py` with `get_db`
- CORS from settings

### Definition of Done
- Raising a domain exception in a throwaway route (or early service) maps to correct HTTP envelope
- Logging emits INFO on startup

### Validation Checklist
- [ ] Error JSON has `detail` + `code`
- [ ] 500 path does not leak stack to client
- [ ] CORS allows `http://localhost:5173` and `X-User-Id`

### Git Commit Recommendation
`feat(backend): add domain exceptions, handlers, logging, and DB dependency`

### Estimated Complexity
**S–M**

---

## Milestone 3 — User Module (Read Path)

### Objective
User repository + list endpoint to unblock assignee UI later and header checks.

### Expected Deliverables
- `User` repository + schema
- Optional `UserService`
- `GET /api/v1/users`
- Seed script users section (or full seed deferred to M7 — minimum: insert users for manual test)

### Definition of Done
- `GET /users` returns seeded/fixture users after seed or manual insert

### Validation Checklist
- [ ] Response shape matches api-contract
- [ ] Mounted under `/api/v1`

### Git Commit Recommendation
`feat(backend): implement user list endpoint and repository`

### Estimated Complexity
**S**

---

## Milestone 4 — Ticket Repository + Schemas

### Objective
Data access and Pydantic models for tickets without full business rules yet.

### Expected Deliverables
- `TicketRepository` (CRUD, list filters, export query)
- Ticket schemas (create, update, status, read, list, detail)
- No status transition logic in repository

### Definition of Done
- Repository methods usable from a Python shell/session against migrated DB

### Validation Checklist
- [ ] Filters compose without errors
- [ ] `flush` yields ticket id
- [ ] No `commit` in repository

### Git Commit Recommendation
`feat(backend): add ticket schemas and repository`

### Estimated Complexity
**M**

---

## Milestone 5 — Ticket Service + State Machine

### Objective
Implement domain rules and transaction ownership for tickets.

### Expected Deliverables
- `TicketService` with `ALLOWED_TRANSITIONS`
- Methods: create, list, get, update_fields, transition_status
- Domain exceptions on not found / invalid transition
- Unit tests for transition matrix (can land here early)

### Definition of Done
- Invalid transitions raise `InvalidStatusTransitionError`
- Create always sets `Open`
- Service commits on success

### Validation Checklist
- [ ] Unit tests cover valid + invalid transitions
- [ ] Same-status rejected
- [ ] Terminal states reject all
- [ ] Assignee existence checked

### Git Commit Recommendation
`feat(backend): implement TicketService with status state machine`

### Estimated Complexity
**M–L**

---

## Milestone 6 — Ticket HTTP Endpoints

### Objective
Expose ticket API per contract; wire DI.

### Expected Deliverables
- `endpoints/tickets.py` + deps for `TicketService` / `X-User-Id`
- Routes: list, create, get, patch fields, patch status
- **Register `GET /tickets/export` stub or full in M8 — if stub, still register path order correctly before `{id}`**
- Router included in v1

### Definition of Done
- Manual curl/httpx matches contract for CRUD + status (export may be next milestone)

### Validation Checklist
- [ ] Create → 201, status Open, requires header
- [ ] Invalid transition → **409** + `INVALID_STATUS_TRANSITION`
- [ ] Missing ticket → 404
- [ ] PATCH with `status` → 422
- [ ] OpenAPI shows routes under `/api/v1`

### Git Commit Recommendation
`feat(backend): expose ticket CRUD and status endpoints`

### Estimated Complexity
**M**

---

## Milestone 7 — Comments Module

### Objective
Add comments API and persistence.

### Expected Deliverables
- Comment schema, repository, service
- `POST /tickets/{id}/comments`
- Ticket detail includes comments ASC
- Allow comment on Closed/Cancelled

### Definition of Done
- Comment create returns 201; unknown ticket 404; bad user 400

### Validation Checklist
- [ ] Message validation 422
- [ ] `created_by` from header
- [ ] GET ticket shows comments ordered by `created_at` ASC

### Git Commit Recommendation
`feat(backend): add comment service and create endpoint`

### Estimated Complexity
**S–M**

---

## Milestone 8 — Search, Export, Seed

### Objective
Complete remaining ticket capabilities and demo data.

### Expected Deliverables
- List query params fully wired (`q`, status, priority, assigned_to, created_by, skip, limit)
- `GET /tickets/export` CSV (columns locked; filter `created_by=X-User-Id`)
- `scripts/seed_db.py` idempotent or documented reset
- CSV helper if extracted

### Definition of Done
- Export returns `text/csv` with Content-Disposition; only own tickets
- Seed produces users + tickets across statuses + comments

### Validation Checklist
- [ ] Export without header → 400
- [ ] Export excludes others’ tickets
- [ ] Search `q` case-insensitive
- [ ] Seed runnable after migrate
- [ ] Data survives process restart

### Git Commit Recommendation
`feat(backend): add ticket search, CSV export, and seed script`

### Estimated Complexity
**M**

---

## Milestone 9 — Backend Hardening & Test Baseline

### Objective
Normalize validation errors, fill gaps, establish integration test baseline before Phase 6 expansion.

### Expected Deliverables
- Normalized 422 handler (recommended)
- Integration tests: status matrix + smoke CRUD/export
- Fix any contract drifts discovered; update docs only if behavior intentionally changed
- Confirm MyPy/Ruff clean on `app/`

### Definition of Done
- `uv run pytest` green for tests added
- Manual Phase 3 validation checklist in [implementation-plan.md](./implementation-plan.md) checked

### Validation Checklist
- [ ] 25-cell matrix (at least integration) green
- [ ] Export/X-User-Id edges covered
- [ ] `/docs` OpenAPI aligns with api-contract
- [ ] No secrets committed

### Git Commit Recommendation
`test(backend): add status transition integration matrix and API smoke tests`

### Estimated Complexity
**M–L**

---

## Suggested Sequence Diagram

```
M0 Tooling → M1 DB/Models → M2 Cross-cutting → M3 Users
    → M4 Ticket repo/schemas → M5 Ticket service/SM → M6 Ticket API
    → M7 Comments → M8 Search/Export/Seed → M9 Tests/harden
```

---

## Parallelization Notes

| Can overlap | Cannot overlap |
|-------------|----------------|
| M3 users after M1 | M5 before M4 |
| CSV helper pure functions anytime after schemas known | M6 before M5 |
| Unit transition tests with M5 | Seed before migration (M1) |

---

## Exit Criteria for Phase 3

- All endpoints in [api-contract.md](./api-contract.md) implemented
- State machine enforced only in service layer
- SQLite persistence + Alembic + seed verified
- Baseline automated tests for transitions exist
- Ready for Phase 4 frontend against local API

---

## Related Blueprints

| Doc | Use when |
|-----|----------|
| [backend-architecture.md](./backend-architecture.md) | Layering / DI / transactions |
| [backend-module-design.md](./backend-module-design.md) | Module interfaces |
| [backend-folder-guide.md](./backend-folder-guide.md) | File placement |
| [error-handling-strategy.md](./error-handling-strategy.md) | Exceptions / HTTP |
| [configuration-strategy.md](./configuration-strategy.md) | Env / settings |
| [database-strategy.md](./database-strategy.md) | Alembic / seed / SQLite |
| [logging-monitoring.md](./logging-monitoring.md) | Logs |
| [testing-plan-backend.md](./testing-plan-backend.md) | Test execution |
