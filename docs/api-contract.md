# API Contract

**Base URL:** `http://localhost:8000/api/v1`  
**Content-Type:** `application/json`  
**Active user:** `X-User-Id: <integer>` header (required for create, comment, export; optional elsewhere)

> This is a planning contract. Update when implementation diverges.

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

---

## Health

### `GET /health`
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
Create ticket. `created_by` set from `X-User-Id`.

**Request**
```json
{
  "title": "Login issue",
  "description": "Cannot reset password",
  "priority": "high",
  "assigned_to": 2
}
```

**Response 201** — Ticket object (status defaults to `Open`)

**Response 422** — Validation error

### `GET /tickets/{id}`
**Response 200** — Ticket object with nested comments:
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
Update fields (not status).

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
**Response 422** — Validation error

### `PATCH /tickets/{id}/status`
Change status via state machine.

**Request**
```json
{ "status": "In Progress" }
```

**Response 200** — Updated ticket  
**Response 400/409** — Invalid transition (`INVALID_STATUS_TRANSITION`)  
**Response 404** — Not found

### `GET /tickets/export`
Export tickets created by current user (`X-User-Id`) as CSV.

**Query params:** Same filters as list (optional)

**Response 200**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="my-tickets.csv"`

**CSV columns:** id, title, description, priority, status, assigned_to, created_by, created_at, updated_at

---

## Comments

### `POST /tickets/{id}/comments`
**Request**
```json
{ "message": "Customer confirmed fix" }
```

**Response 201** — Comment object  
**Response 404** — Ticket not found  
**Response 422** — Empty message

---

## Status Transition Matrix (Reference)

| From | Allowed To |
|------|------------|
| Open | In Progress, Cancelled |
| In Progress | Resolved, Cancelled |
| Resolved | Closed |
| Closed | *(none)* |
| Cancelled | *(none)* |

---

## HTTP Status Code Summary

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 400/409 | Invalid status transition |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Unexpected server error (no stack trace in body) |

---

## CORS (Development)

Allow `http://localhost:5173` with credentials if needed.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-24 | Initial contract |
