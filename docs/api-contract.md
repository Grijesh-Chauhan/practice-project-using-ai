# API Contract

**Base URL:** `http://localhost:8000/api/v1`  
**Content-Type:** `application/json`  
**Active user:** `X-User-Id: <integer>` header (required for create, comment, export; optional elsewhere)

> This is a planning contract. Update when implementation diverges.  
> **Locked decisions:** `/api/v1` prefix; invalid status → **409**; CSV ticket fields only.

---

## Common Types

### TicketStatus (enum)
`Open` | `In Progress` | `Resolved` | `Closed` | `Cancelled`

### Priority (enum)
`low` | `medium` | `high`

### Error Response
```json
{
  "detail": "Cannot transition from Open to Closed",
  "code": "INVALID_STATUS_TRANSITION"
}
```

Optional `field` for validation errors.

---

## Validation Rules

| Field / Context | Rule | HTTP |
|-----------------|------|------|
| `title` | Required; trimmed length 1–255 | 422 |
| `description` | Required; trimmed length ≥ 1 | 422 |
| `priority` | `low` \| `medium` \| `high` | 422 |
| `assigned_to` | Null OK; else must exist in `users` | 422 |
| `status` (create) | Ignored if sent; always set to `Open` | — |
| `status` (PATCH fields) | Not accepted on general PATCH | 422 |
| `status` (transition) | Must be allowed from current | **409** |
| `message` (comment) | Required; trimmed length 1–5000 | 422 |
| `X-User-Id` | Required on create/comment/export; must exist | **400** |

---

## Health

### `GET /health` (unversioned — `http://localhost:8000/health`)
**Response 200**
```json
{ "status": "ok" }
```

---

## Users

### `GET /users`
List seeded users (for assignee dropdown).

**Response 200**
```json
[
  { "id": 1, "name": "Alice Agent", "email": "alice@example.com", "role": "agent" }
]
```

---

## Tickets

> **Route order:** Register `GET /tickets/export` before `GET /tickets/{id}`.

### `GET /tickets`
List tickets with optional filters.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search title/description (case-insensitive) |
| `status` | TicketStatus | Filter by status |
| `priority` | Priority | Filter by priority |
| `assigned_to` | int | Filter by assignee user ID |
| `created_by` | int | Filter by creator user ID |
| `skip` | int | Pagination offset (default 0) |
| `limit` | int | Page size (default 50, max 100) |

**Response 200**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Login issue",
      "description": "Cannot reset password",
      "priority": "high",
      "status": "Open",
      "assigned_to": 2,
      "created_by": 1,
      "created_at": "2026-07-24T08:00:00Z",
      "updated_at": "2026-07-24T08:00:00Z"
    }
  ],
  "total": 1
}
```

### `POST /tickets`
Create ticket. `created_by` set from `X-User-Id`. Status always `Open`.

**Headers:** `X-User-Id` required

**Request**
```json
{
  "title": "Login issue",
  "description": "Cannot reset password",
  "priority": "high",
  "assigned_to": 2
}
```

**Response 201** — Ticket object (status = `Open`)  
**Response 400** — Missing/invalid `X-User-Id`  
**Response 422** — Validation error

### `GET /tickets/{id}`
**Response 200** — Ticket object with nested comments ordered by `created_at` ASC:
```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "priority": "high",
  "status": "Open",
  "assigned_to": 2,
  "created_by": 1,
  "created_at": "...",
  "updated_at": "...",
  "comments": [
    {
      "id": 1,
      "ticket_id": 1,
      "message": "Investigating",
      "created_by": 2,
      "created_at": "..."
    }
  ]
}
```

**Response 404** — Ticket not found

### `PATCH /tickets/{id}`
Update fields (**not** status). Status key in body → 422.

**Request** (all optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "assigned_to": 3
}
```

**Response 200** — Updated ticket  
**Response 404** — Not found  
**Response 422** — Validation error (including unknown assignee, status field present)

### `PATCH /tickets/{id}/status`
Change status via state machine.

**Request**
```json
{ "status": "In Progress" }
```

**Response 200** — Updated ticket  
**Response 409** — Invalid transition (`INVALID_STATUS_TRANSITION`)  
**Response 404** — Not found

### `GET /tickets/export`
Export tickets created by current user (`X-User-Id`) as CSV.

**Headers:** `X-User-Id` required

**Query params:** Optional list filters (`q`, `status`, `priority`, `assigned_to`, `skip`, `limit`) apply **within** `created_by = X-User-Id`. Do not pass `created_by` (server overrides).

**Response 200**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="my-tickets.csv"`

**CSV columns:** id, title, description, priority, status, assigned_to, created_by, created_at, updated_at

**Response 400** — Missing/invalid `X-User-Id`

---

## Comments

### `POST /tickets/{id}/comments`
Allowed for any ticket status including Closed/Cancelled.

**Headers:** `X-User-Id` required

**Request**
```json
{ "message": "Customer confirmed fix" }
```

**Response 201** — Comment object  
**Response 400** — Missing/invalid `X-User-Id`  
**Response 404** — Ticket not found  
**Response 422** — Empty/oversized message

---

## Status Transition Matrix (Reference)

| From | Allowed To |
|------|------------|
| Open | In Progress, Cancelled |
| In Progress | Resolved, Cancelled |
| Resolved | Closed |
| Closed | *(none)* |
| Cancelled | *(none)* |

Same-status transitions (e.g. Open → Open) are **invalid** → 409.

---

## HTTP Status Code Summary

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 400 | Missing/invalid `X-User-Id` |
| 409 | Invalid status transition |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Unexpected server error (no stack trace in body) |

---

## CORS (Development)

Allow `http://localhost:5173` with credentials if needed. Allow header `X-User-Id`.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-24 | Initial contract |
| 2026-07-24 | Design review: lock 409; validation table; export/route notes; X-User-Id errors |
