# Backend Module Design

**Audience:** Phase 3 implementers  
**Layout:** [directory-structure.md](./directory-structure.md)  
**Contracts:** [api-contract.md](./api-contract.md), [data-model.md](./data-model.md)

Describes Ticket, Comment, and User modules: responsibilities, dependencies, interfaces, and extensibility. No application source code.

---

## Shared Conventions

| Concern | Convention |
|---------|------------|
| Interface style | Concrete classes; no ABC ports required for assessment |
| Return types | Repositories return ORM models or `None`; services return ORM (or DTO if needed) |
| Errors | Domain exceptions from `app/core/exceptions.py` — see [error-handling-strategy.md](./error-handling-strategy.md) |
| DI | Wired in `app/api/deps.py` — see [backend-architecture.md](./backend-architecture.md) |

---

## 1. Ticket Module

### Responsibilities

- Ticket CRUD (create, list with filters, get-by-id with comments, field update)
- Status transitions via state machine (single source of truth)
- CSV export of tickets created by the active user
- Enforce: default status `Open` on create; reject `status` on general PATCH; assignee existence

### Package Files

| File | Role |
|------|------|
| `models/ticket.py` | ORM `Ticket` |
| `schemas/ticket.py` | Create, Update, StatusUpdate, Response, ListResponse, filters |
| `repositories/ticket_repository.py` | Persist/query tickets |
| `services/ticket_service.py` | Use cases + `ALLOWED_TRANSITIONS` |
| `api/v1/endpoints/tickets.py` | HTTP routes |

### Dependencies

```
TicketService
  ├── TicketRepository
  ├── UserRepository          # creator / assignee existence
  └── Session                 # commit/rollback
```

Endpoints depend only on `TicketService` (+ header deps).  
Do **not** inject `CommentRepository` into ticket endpoints for adds — use Comment module for `POST .../comments`.  
`GET /tickets/{id}` may load comments via relationship / ticket repository join (read path owned by Ticket module).

### Interface Surface (logical)

**TicketRepository**
- `get_by_id(id) -> Ticket | None`
- `list(filters, skip, limit) -> tuple[list[Ticket], total]`
- `create(ticket_fields) -> Ticket`
- `update(ticket, fields) -> Ticket`
- `list_for_export(created_by, filters, skip, limit) -> list[Ticket]`

**TicketService**
- `create(data, created_by) -> Ticket`
- `list(filters, skip, limit) -> (items, total)`
- `get(id) -> Ticket` (with comments ordered ASC; raise if missing)
- `update_fields(id, data) -> Ticket` (no status; 422 if status present — prefer schema `model_config` / field forbid)
- `transition_status(id, new_status) -> Ticket`
- `export_csv(created_by, filters, …) -> str | bytes` (CSV body; columns locked in api-contract)

### State Machine

Owned exclusively by `TicketService`. Map and rules: [design-notes.md](./design-notes.md) §4, [api-contract.md](./api-contract.md) Status Transition Matrix. Same-status → invalid → **409**.

### Future Extensibility

| Extension | Hook point |
|-----------|------------|
| Audit / history table | Call after successful `transition_status` (same transaction) |
| Notifications | Event/callback after commit (stretch) |
| Soft delete | New service method; repository filter `deleted_at IS NULL` |
| AuthZ by role | Gate in service using `User.role` before mutate |

Keep transition map as a module-level constant or private method — easy to unit-test without HTTP.

---

## 2. Comment Module

### Responsibilities

- Add comment to an existing ticket
- Persist author from `X-User-Id`
- Allow comments on any ticket status including Closed/Cancelled
- Message validation (length/trim) — schema + service trim if needed

### Package Files

| File | Role |
|------|------|
| `models/comment.py` | ORM `Comment` |
| `schemas/comment.py` | Create request, response |
| `repositories/comment_repository.py` | Insert / list-by-ticket if needed |
| `services/comment_service.py` | `add_comment` orchestration |
| `api/v1/endpoints/comments.py` **or** nested under tickets router | `POST /tickets/{id}/comments` |

**Routing note:** Path lives under tickets URL space. Prefer `endpoints/comments.py` included by v1 router, or a sub-router mounted in `tickets.py` — one place only; do not duplicate handlers.

### Dependencies

```
CommentService
  ├── CommentRepository
  ├── TicketRepository        # ensure ticket exists
  ├── UserRepository          # ensure X-User-Id exists
  └── Session
```

### Interface Surface (logical)

**CommentRepository**
- `create(ticket_id, message, created_by) -> Comment`
- `list_by_ticket(ticket_id) -> list[Comment]` (optional if relationship load used on ticket get)

**CommentService**
- `add_comment(ticket_id, message, created_by) -> Comment`

### Out of Scope (do not build)

- Edit/delete comments
- Comment pagination
- Mentions / attachments

### Future Extensibility

| Extension | Hook point |
|-----------|------------|
| Edit/delete | New service methods + soft rules for author |
| Internal vs public | Column + schema field |
| Notifications | After commit hook |

---

## 3. User Module

### Responsibilities

- List seeded users for assignee dropdown (`GET /users`)
- Support lookup-by-id for creator/assignee validation (used by Ticket/Comment services)
- No create/update/delete user APIs in core assessment

### Package Files

| File | Role |
|------|------|
| `models/user.py` | ORM `User` |
| `schemas/user.py` | Response schema for list |
| `repositories/user_repository.py` | `list_all`, `get_by_id` |
| `services/user_service.py` | Optional thin wrapper (`list_users`); may call repo from other services directly |
| `api/v1/endpoints/users.py` | `GET /users` |

**Guidance:** A thin `UserService.list_users()` keeps API consistent. Ticket/Comment services may use `UserRepository` directly for existence checks to avoid circular service imports — acceptable for this monolith.

### Dependencies

```
UserService (optional)
  └── UserRepository
        └── Session

TicketService / CommentService
  └── UserRepository (read-only lookups)
```

### Interface Surface (logical)

**UserRepository**
- `get_by_id(id) -> User | None`
- `list_all() -> list[User]`

**UserService** (if present)
- `list_users() -> list[User]`
- `require_user(id) -> User` (raise domain error if missing) — shared helper for header validation

### Seed / Roles

- Seed via `scripts/seed_db.py` — [data-model.md](./data-model.md), [database-strategy.md](./database-strategy.md)
- `role` stored but **not** enforced in core

### Future Extensibility

| Extension | Hook point |
|-----------|------------|
| Auth (JWT) | New auth module; replace `X-User-Id` dep with token principal |
| Password | Column + hash utility; never in logs |
| RBAC | Checks in services using `role` |
| User admin CRUD | New endpoints behind auth |

---

## 4. Cross-Module Dependency Matrix

| Consumer → Provider | Ticket | Comment | User |
|---------------------|--------|---------|------|
| Ticket Service | — | read comments via relationship/repo | UserRepository |
| Comment Service | TicketRepository | — | UserRepository |
| User Service | none | none | — |
| API Tickets | TicketService | — | header → user check |
| API Comments | — | CommentService | header → user check |
| API Users | — | — | UserService/Repo |

**Cycle rule:** Comment → Ticket (existence) is allowed. Ticket must not call CommentService for create. No service ↔ service cycles.

---

## 5. Suggested Method Ownership (Quick Reference)

| Capability | Owner |
|------------|-------|
| ALLOWED_TRANSITIONS | TicketService |
| CSV columns / escaping | TicketService or `app/core/csv_export.py` helper |
| Trim title/description/message | Pydantic validators on schemas |
| `created_by` assignment | TicketService / CommentService from header |
| Pagination defaults | Schema/query deps (`skip`/`limit`) + repository |

---

## Related

- [backend-architecture.md](./backend-architecture.md)
- [backend-folder-guide.md](./backend-folder-guide.md)
- [implementation-order.md](./implementation-order.md)
