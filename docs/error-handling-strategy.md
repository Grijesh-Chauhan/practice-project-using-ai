# Error Handling Strategy

**Audience:** Phase 3 implementers  
**Locked response shape:** [design-notes.md](./design-notes.md) §10, [api-contract.md](./api-contract.md)  
**Standards:** [coding-standards.md](./coding-standards.md)

Defines exception hierarchy, HTTP mapping, and logging expectations. No application source code.

---

## 1. Principles

1. Services raise **domain exceptions**; endpoints do not translate business rules into `HTTPException` ad hoc.
2. Central handlers in `main.py` map domain → HTTP + JSON body.
3. Never return stack traces or internal SQL in responses.
4. Prefer specific `code` strings the frontend can switch on.

---

## 2. Exception Hierarchy

Place in `app/core/exceptions.py`:

```
AppError (base)
├── NotFoundError
│     └── TicketNotFoundError
├── ConflictError
│     └── InvalidStatusTransitionError
├── BadRequestError
│     └── InvalidUserHeaderError      # missing/unknown X-User-Id
└── BusinessValidationError           # assignee missing, etc. → 422
```

| Exception | When raised | Attributes |
|-----------|-------------|------------|
| `TicketNotFoundError` | Ticket id missing | `ticket_id` optional |
| `InvalidStatusTransitionError` | Disallowed or same-status transition | `from_status`, `to_status` |
| `InvalidUserHeaderError` | Missing/non-int/unknown `X-User-Id` when required | — |
| `BusinessValidationError` | Rule failed after schema OK (e.g. assignee not found) | `field`, `code` |
| `AppError` | Catch-all base | `detail`, `code` |

**Do not** subclass for every Pydantic failure — FastAPI/Pydantic handles request body/query validation.

Repositories: return `None` for missing rows; services convert to `NotFoundError`. Avoid raising HTTP types from repositories.

---

## 3. HTTP Mapping

| Exception / case | HTTP | `code` (example) |
|------------------|------|------------------|
| `TicketNotFoundError` | **404** | `TICKET_NOT_FOUND` |
| `InvalidStatusTransitionError` | **409** | `INVALID_STATUS_TRANSITION` |
| `InvalidUserHeaderError` | **400** | `INVALID_USER_HEADER` |
| `BusinessValidationError` | **422** | e.g. `ASSIGNEE_NOT_FOUND` |
| Pydantic `RequestValidationError` | **422** | `VALIDATION_ERROR` (normalize if customizing) |
| Unhandled `Exception` | **500** | `INTERNAL_ERROR` |

**Locked:** Invalid status transition is always **409**, never 400. See [api-contract.md](./api-contract.md).

Optional: map unknown user on optional paths only when header is present but invalid — for core, required-header endpoints use 400 for missing **or** unknown id.

---

## 4. Validation Errors

### Schema (automatic)

- Empty/whitespace title, bad priority enum, message too long, etc.
- Default FastAPI 422 body may be verbose (`detail` as list). **Recommendation:** register a handler that normalizes to the project envelope:

```json
{
  "detail": "Title must be between 1 and 255 characters",
  "code": "VALIDATION_ERROR",
  "field": "title"
}
```

Use first error location for `field` when present. Keep messages human-readable.

### Business (service)

| Case | HTTP | Notes |
|------|------|-------|
| `assigned_to` set but user missing | 422 | `field`: `assigned_to` |
| `status` key on general PATCH | 422 | Prefer forbid via schema (`extra` / explicit rejection) |
| Create ignores client `status` | — | Do not error; force `Open` |

---

## 5. Business Rule Violations

| Rule | Exception | HTTP |
|------|-----------|------|
| Status transition invalid | `InvalidStatusTransitionError` | 409 |
| Ticket missing | `TicketNotFoundError` | 404 |
| Comment on missing ticket | `TicketNotFoundError` | 404 |
| Required `X-User-Id` bad | `InvalidUserHeaderError` | 400 |

State machine message example: `"Cannot transition from Open to Closed"`.

---

## 6. Error Response Format

**Canonical envelope:**

```json
{
  "detail": "Human-readable message",
  "code": "INVALID_STATUS_TRANSITION",
  "field": "status"
}
```

| Field | Required | Usage |
|-------|----------|-------|
| `detail` | Yes | UI toast / alert text |
| `code` | Yes | Programmatic handling |
| `field` | No | Highlight form field |

CSV export errors (400) still use JSON envelope (not CSV).

---

## 7. Logging Expectations

| Event | Level | Log what |
|-------|-------|----------|
| Domain 404/409/400/422 handled | WARNING or INFO | `code`, path, method; not full body PII |
| Invalid transition | INFO/WARNING | from→to, ticket_id |
| Unhandled exception | ERROR | exception + stack to logs only |
| Startup | INFO | app start, env name |

Full policy: [logging-monitoring.md](./logging-monitoring.md).  
No passwords, tokens, or email dumps in error logs.

---

## 8. Handler Registration Checklist

In `main.py` (or `core/exception_handlers.py` imported by main):

- [ ] `InvalidStatusTransitionError` → 409
- [ ] `TicketNotFoundError` → 404
- [ ] `InvalidUserHeaderError` → 400
- [ ] `BusinessValidationError` → 422
- [ ] `RequestValidationError` → normalized 422 (recommended)
- [ ] catch-all → 500 + ERROR log

Handlers return JSON matching the envelope above (`JSONResponse`).

---

## 9. Testing Expectations

Assert status **and** `code` for:

- Every invalid transition (409 + `INVALID_STATUS_TRANSITION`)
- Missing ticket (404)
- Export/create without user (400)
- Schema failures (422)

See [testing-plan-backend.md](./testing-plan-backend.md).

---

## Related

- [backend-architecture.md](./backend-architecture.md) §7
- [security.md](./security.md) — no stack traces to clients
