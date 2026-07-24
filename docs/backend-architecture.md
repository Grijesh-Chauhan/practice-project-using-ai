# Backend Architecture Blueprint

**Audience:** Phase 3 implementers  
**Status:** Approved design — implement, do not redesign  
**Source of truth for layers:** [architecture.md](./architecture.md)  
**Contracts:** [api-contract.md](./api-contract.md), [data-model.md](./data-model.md)

This document adds implementation detail only. Do not re-decide stack, layers, or API shapes.

---

## 1. Layer Responsibilities (Implementation View)

| Layer | Package | Owns | Must not own |
|-------|---------|------|--------------|
| API | `app/api/` | Routing, Pydantic I/O, `Depends`, HTTP status mapping | SQL, state machine, commits |
| Service | `app/services/` | Domain rules, orchestration, **transactions**, domain exceptions | HTTP models, raw SQL strings |
| Repository | `app/repositories/` | SQLAlchemy queries, filters, pagination | Business rules, Pydantic, HTTP |
| Persistence | `app/models/`, `app/db/`, `alembic/` | ORM, engine/session, migrations | Request context, HTTP |

**Non-negotiable:** Status state machine lives **only** in `TicketService`. See [design-notes.md](./design-notes.md) §4 and [architecture.md](./architecture.md) §6.

---

## 2. Dependency Flow

```
main.py
  └── api/v1/router.py
        └── endpoints/*  ──Depends──► api/deps.py
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              get_db()            get_*_repository()    get_*_service()
                    │                    │                    │
                    ▼                    ▼                    ▼
              SessionLocal         Repository(db)      Service(repo[, …])
                                                           │
                                                           ▼
                                                    Repository methods
                                                           │
                                                           ▼
                                                    SQLAlchemy Session
                                                           │
                                                           ▼
                                                         SQLite
```

**Rules:**
- Dependencies point **inward**: API → Service → Repository → Session/Model.
- Services may depend on multiple repositories (e.g. Ticket + User).
- Repositories never import services or API modules.
- Schemas (`app/schemas/`) are used at the API boundary; services accept/return domain-friendly types (ORM models or plain values). Convert ORM → response schema in the endpoint (or a thin mapper in the service if reuse is needed).

---

## 3. Package Responsibilities

| Package | Responsibility |
|---------|----------------|
| `app/main.py` | Create FastAPI app; mount CORS; register routers; register exception handlers; configure logging on startup |
| `app/api/deps.py` | All `Depends` factories: DB, repos, services, `X-User-Id` resolution |
| `app/api/v1/endpoints/` | One module per resource; thin handlers |
| `app/api/v1/router.py` | Aggregate routers under `/api/v1` |
| `app/schemas/` | Request/response/filter Pydantic models only |
| `app/services/` | Use cases; state machine; assignee/creator existence checks |
| `app/repositories/` | CRUD + list/filter/search; no branching on status rules |
| `app/models/` | ORM entities and relationships |
| `app/db/` | Engine, session factory, declarative base |
| `app/core/` | Settings, domain exceptions, logging setup |
| `alembic/` | Schema evolution only (not seed business logic beyond optional data revisions) |

Folder file placement: [backend-folder-guide.md](./backend-folder-guide.md).  
Module boundaries: [backend-module-design.md](./backend-module-design.md).

---

## 4. Dependency Injection Strategy

**Pattern:** Constructor injection into services/repos; FastAPI `Depends` at the edge.

| Dependency | Factory location | Lifetime |
|------------|------------------|----------|
| `Session` | `get_db()` in `deps.py` | Per-request; yield; close in `finally` |
| `*Repository` | `get_*_repository(db)` | Per-request (new instance wrapping session) |
| `*Service` | `get_*_service(repo, …)` | Per-request |
| Active user ID | `require_user_id` / `optional_user_id` | Per-request header parse |

**Implementation notes:**
- Prefer explicit constructors: `TicketService(ticket_repo, user_repo, session)`.
- Pass the **same** `Session` into all repos used in one request so one transaction covers the use case.
- Do not create global service singletons with a long-lived session.
- Health endpoint does not need DB/service deps unless you choose a readiness check later (out of core scope).

Sketch only (not production code to copy as-is) — full wiring shape is in [architecture.md](./architecture.md) §5.

---

## 5. Request Lifecycle

```
1. HTTP request arrives (CORS middleware if cross-origin)
2. Route match (note: register /tickets/export before /tickets/{id})
3. Depends resolve: Session → Repositories → Service → optional X-User-Id
4. Pydantic validates path/query/body → 422 on failure (automatic)
5. Endpoint calls service method
6. Service runs business rules; repository reads/writes
7. Service commits (or rolls back on error) — see §8
8. Endpoint builds response_model / StreamingResponse (CSV)
9. Exception handlers map domain errors → JSON error body
10. Session closed
```

**Unversioned:** `GET /health` registered on the app root, not under `/api/v1`.

---

## 6. Validation Flow

| Stage | Where | What | Failure |
|-------|-------|------|---------|
| 1. Structural / type / length / enum | Pydantic schemas | title, description, priority, message, query enums | **422** (FastAPI default or customized) |
| 2. Header presence / parse | `deps` or service | `X-User-Id` required vs optional | **400** |
| 3. Referential | Service (+ FK as backstop) | user exists for creator/assignee | **400** (bad header user) or **422** (bad assignee) per [api-contract.md](./api-contract.md) |
| 4. Domain rules | Service only | status transitions; reject `status` on general PATCH | **409** / **422** |
| 5. Persistence constraints | DB | NOT NULL, UNIQUE email, FK | Map unexpected IntegrityError → 422/500 (prefer catch before commit when possible) |

**Order principle:** Cheap schema validation first; load entities; then state machine; then persist.

Field rules: [api-contract.md](./api-contract.md) Validation Rules; enforcement split: [data-model.md](./data-model.md) Validation Summary.

---

## 7. Error Propagation

```
Repository          → returns None / raises PersistenceError (rare)
        ↓
Service             → raises domain exceptions (NotFound, InvalidStatusTransition, …)
        ↓
Endpoint            → does not catch domain errors (let them bubble)
        ↓
Exception handlers  → map to HTTP + ErrorResponse JSON
        ↓
Unhandled Exception → 500, log ERROR, no stack in body
```

Details: [error-handling-strategy.md](./error-handling-strategy.md).  
Format locked in [design-notes.md](./design-notes.md) §10.

---

## 8. Transaction Boundaries

| Rule | Detail |
|------|--------|
| Owner | **Service layer** commits/rolls back |
| Unit of work | One service use-case method ≈ one transaction |
| Repository | May `flush()` for ID generation; **must not** `commit()` or `rollback()` |
| Success path | Mutating service methods call `session.commit()` (or commit via a unit-of-work helper on the session) before return |
| Failure path | On domain or unexpected error after flush, `session.rollback()` then re-raise |
| Read-only | List/get may omit explicit commit; still close session via `get_db` |
| Multi-repo | Same session → single commit at end of service method |

**Examples:**
- `create_ticket`: validate user → insert ticket → commit → return
- `transition_status`: load → validate transition → update status/`updated_at` → commit
- `add_comment`: load ticket (404) → insert comment → commit  
- `export_csv`: read-only query; no commit required

Do not open nested sessions per repository call within one request.

---

## 9. Cross-Cutting Wiring Checklist

| Concern | Doc |
|---------|-----|
| Settings / env | [configuration-strategy.md](./configuration-strategy.md) |
| Logging | [logging-monitoring.md](./logging-monitoring.md) |
| DB / Alembic / seed | [database-strategy.md](./database-strategy.md) |
| Errors | [error-handling-strategy.md](./error-handling-strategy.md) |
| Tests | [testing-plan-backend.md](./testing-plan-backend.md) |
| Build order | [implementation-order.md](./implementation-order.md) |

---

## 10. Anti-Patterns (Reject in Review)

- Status checks in repository or endpoint
- `session.commit()` in repository or endpoint
- Importing `HTTPException` inside services (use domain exceptions)
- Sharing one Session across requests
- Putting CSV column logic in the router without a pure helper (CSV builder may live under `services` or `core/utils` — keep router thin)
