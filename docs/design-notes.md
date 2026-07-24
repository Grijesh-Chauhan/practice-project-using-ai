# Design Notes

Decisions, trade-offs, and rationale recorded during planning. Update as implementation proceeds.

## 1. Architecture Style

**Decision:** Layered monolith (API → Service → Repository → Persistence) in a single FastAPI app.

**Why:** Simplest production-ready pattern for a small domain. Clear boundaries help AI generate consistent code and enable unit testing of services without HTTP.

**Alternatives considered:**
- Hexagonal / ports-adapters — more abstraction than needed for assessment scope
- CQRS — unnecessary for CRUD + state machine

## 2. Database: SQLite

**Decision:** SQLite for local development and assessment deployment.

**Why:** Zero external dependencies, file-based persistence satisfies "data survives restart," Alembic works well with SQLite.

**Trade-off:** Limited write concurrency. Acceptable for assessment; document if scaling discussed.

## 3. Active User Without Authentication

**Decision:** Use `X-User-Id` request header (integer) with fallback to default seeded user ID in frontend config.

**Why:** Assessment marks auth as optional stretch. Header approach keeps API auth-ready without implementing JWT.

**Assumption:** Trust boundary is internal demo only. Not suitable for production without real auth.

## 4. State Machine Location

**Decision:** Implement transition rules in `TicketService`; repository only persists valid state.

**Why:** Single source of truth. Mandatory integration tests target service/API layer.

**Implementation sketch:**
```python
ALLOWED_TRANSITIONS = {
    "Open": {"In Progress", "Cancelled"},
    "In Progress": {"Resolved", "Cancelled"},
    "Resolved": {"Closed"},
    "Closed": set(),
    "Cancelled": set(),
}
```

## 5. Status Update API Shape

**Decision:** Dedicated `PATCH /api/tickets/{id}/status` with body `{"status": "In Progress"}`.

**Why:** Separates lifecycle changes from field updates; easier to test and audit. General PATCH for title/description/priority/assignee remains separate.

**Alternative:** Single PATCH with optional status field — rejected to avoid accidental status changes during field edits.

## 6. Search Implementation

**Decision:** Query params on `GET /api/tickets`: `q` (text), `status`, `priority`, `assigned_to`, `created_by`.

**Why:** No full-text search engine needed. SQL `LIKE` on title/description sufficient for core.

## 7. CSV Export

**Decision:** `GET /api/tickets/export?format=csv` filtered server-side by `created_by = current user`.

**Why:** Server enforces "self-created" rule; frontend triggers download via blob response.

**CSV columns (proposed):** id, title, description, priority, status, assignedTo, createdBy, createdAt, updatedAt

## 8. Frontend State Management

**Decision:** TanStack Query for server state; no Redux.

**Why:** Minimal boilerplate, built-in cache invalidation after mutations, aligns with REST API.

## 9. Form Validation

**Decision:** Zod schemas mirror Pydantic models. Share field constraints in docs (`api-contract.md`), not generated code (separate repos in monorepo).

## 10. Error Response Format

**Decision:** Consistent JSON envelope:
```json
{
  "detail": "Human-readable message",
  "code": "INVALID_STATUS_TRANSITION",
  "field": "status"
}
```

**Why:** Frontend can map `code` to UI messages; FastAPI `HTTPException` and custom handlers support this.

## 11. ID Strategy

**Decision:** Integer auto-increment primary keys.

**Why:** Simplest for SQLite, foreign keys, and seed data. UUIDs optional stretch.

## 12. Timestamps

**Decision:** `created_at`, `updated_at` on Ticket; `created_at` on Comment. UTC in DB; ISO 8601 strings in API.

## 13. Priority Enum

**Decision:** `low`, `medium`, `high` (stored lowercase; displayed title-case in UI).

## 14. Role Field on User

**Decision:** Seed values `agent`, `admin` — not enforced in core. Reserved for stretch authorization.

## 15. Pre-Commit & CI

**Decision:** Pre-commit locally; GitHub Actions on PR for pytest + frontend test + lint.

**Why:** Catches issues before review without complex pipeline.

## Open Design Items

| Item | Status | Notes |
|------|--------|-------|
| Pagination on ticket list | Deferred | Optional; use limit/offset if list grows |
| Soft delete tickets | Out of scope | Hard delete not required |
| Comment edit/delete | Out of scope | Add-only for core |
