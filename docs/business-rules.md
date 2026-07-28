# Business Rules

Single, consolidated reference for the domain rules enforced by the Support
Ticket Management System. These rules were previously distributed across
[requirements-analysis.md](./requirements-analysis.md) (§6 Assumptions, §7
Validation Rules) and [api-contract.md](./api-contract.md); this document brings
them together and maps each rule to where it is enforced in code.

> Source of truth for API shape: [api-contract.md](./api-contract.md).
> Source of truth for verifiable conditions: [acceptance-criteria.md](./acceptance-criteria.md).

---

## 1. Active user & ownership

| # | Rule | Enforced in |
|---|------|-------------|
| BR-01 | The active user is provided via the `X-User-Id` header (auth is out of core scope). | `app/api/deps.py::require_user_id` |
| BR-02 | `X-User-Id` is **required** for create ticket, add comment, and export; missing/non-integer/unknown → **400** `INVALID_USER_HEADER`. | `app/api/deps.py::require_user_id` |
| BR-03 | A ticket's `created_by` is always the active user; it is never taken from the request body. | `app/services/ticket_service.py::create` |
| BR-04 | "Self-created tickets" for export = tickets where `created_by == X-User-Id`; the server overrides any client-supplied `created_by`. | `TicketRepository.list_for_export` |

## 2. Ticket field validation

| # | Rule | HTTP | Enforced in |
|---|------|------|-------------|
| BR-10 | `title` required; 1–255 chars after trimming; whitespace-only rejected. | 422 | `schemas/ticket.py` |
| BR-11 | `description` required; ≥ 1 char after trimming. | 422 | `schemas/ticket.py` |
| BR-12 | `priority` required on create; one of `low` \| `medium` \| `high`. | 422 | `schemas/ticket.py` (`Priority`) |
| BR-13 | `assigned_to` optional/nullable; if provided must reference an existing user. | 422 `ASSIGNEE_NOT_FOUND` | `TicketService._validate_assignee` |
| BR-14 | New tickets always start in status `Open`; a client-supplied status on create is ignored. | — | `TicketService.create` |
| BR-15 | General `PATCH /tickets/{id}` does **not** accept `status`; sending it is rejected. | 422 | `TicketUpdate(extra="forbid")` |
| BR-16 | Title/description/priority/assignee are editable in **any** status, including terminal states. | 200 | `TicketService.update_fields` |

## 3. Status state machine (critical)

Allowed transitions:

```
Open        → In Progress | Cancelled
In Progress → Resolved    | Cancelled
Resolved    → Closed
Closed      → (none)
Cancelled   → (none)
```

| # | Rule | HTTP | Enforced in |
|---|------|------|-------------|
| BR-20 | Status changes only through `PATCH /tickets/{id}/status`. | — | `api/v1/endpoints/tickets.py` |
| BR-21 | Only the transitions above are permitted. | 200 | `TicketService.transition_status` |
| BR-22 | Disallowed transitions are rejected by the **backend**. | **409** `INVALID_STATUS_TRANSITION` | `TicketService.transition_status` |
| BR-23 | Same-status transitions (e.g. Open → Open) are invalid. | **409** | `ALLOWED_TRANSITIONS` (excludes self) |
| BR-24 | Terminal states (`Closed`, `Cancelled`) reject all further transitions. | **409** | `ALLOWED_TRANSITIONS` (empty sets) |
| BR-25 | The error body includes `code: "INVALID_STATUS_TRANSITION"` and a human-readable `detail`. | — | `core/exception_handlers.py` |

The frontend mirrors these transitions for UX (`utils/statusTransitions.ts`) but
the backend is the sole authority.

## 4. Comments

| # | Rule | HTTP | Enforced in |
|---|------|------|-------------|
| BR-30 | `message` required; 1–5000 chars after trimming. | 422 | `schemas/comment.py` |
| BR-31 | Comments may be added to a ticket in **any** status, including `Closed`/`Cancelled`. | 201 | `CommentService.add_comment` |
| BR-32 | Adding a comment to an unknown ticket → not found. | 404 | `CommentService.add_comment` |
| BR-33 | Comments are returned in chronological ascending order (`created_at`, then `id`). | — | `models/ticket.py`, `CommentRepository.list_by_ticket` |

## 5. Search, filter & export

| # | Rule | Enforced in |
|---|------|-------------|
| BR-40 | Text search (`q`) is a case-insensitive `LIKE` over title and description. | `TicketRepository._filtered_query` |
| BR-41 | Filters `status`, `priority`, `assigned_to`, `created_by` combine with AND semantics and with `q`. | `TicketRepository._filtered_query` |
| BR-42 | List pagination: `skip` ≥ 0; `limit` default 50, max 100. | `api/v1/endpoints/tickets.py::list_tickets` |
| BR-43 | Export is CSV (`text/csv`, `attachment; filename="my-tickets.csv"`) with columns: id, title, description, priority, status, assigned_to, created_by, created_at, updated_at. | `utils/csv_export.py` |
| BR-44 | Export contains **one row per ticket** and **no comments column**. | `utils/csv_export.py` |
| BR-45 | Export is scoped to the caller's own tickets; optional list filters apply within that scope. | `TicketService.list_for_export` |

## 6. Data & persistence

| # | Rule | Enforced in |
|---|------|-------------|
| BR-50 | All data persists across restarts (SQLite + Alembic migrations). | `alembic/`, `db/session.py` |
| BR-51 | Timestamps are UTC (ISO 8601 in API responses). | model `server_default=func.now()` |
| BR-52 | Foreign keys are enforced (SQLite `PRAGMA foreign_keys=ON`). | `db/session.py` |

---

## Traceability

- Requirements: [requirements-analysis.md](./requirements-analysis.md)
- Verifiable conditions: [acceptance-criteria.md](./acceptance-criteria.md)
- API behavior: [api-contract.md](./api-contract.md)
- Tests: `backend/tests/` (state machine, CRUD, comments, search, export)
