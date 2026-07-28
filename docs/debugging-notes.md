# Debugging Notes

> Append entries as issues are discovered and resolved during development.

## Template

```markdown
### [DATE] — Short title
**Symptom:** What was observed
**Root cause:** Why it happened
**Fix:** What changed
**Prevention:** Test/doc/rule added
**Cursor prompt used:** (optional, for artifact traceability)
```

---

## Known Environment Setup Issues

### SQLite and FastAPI Test Client
**Symptom:** Tests pass individually but fail in suite
**Likely cause:** Shared DB state between tests
**Fix:** Use transaction rollback fixture or in-memory DB per test
**Prevention:** Document in `conftest.py` pattern

### CORS Errors in Browser
**Symptom:** Frontend cannot call API
**Likely cause:** Missing CORS middleware or wrong origin
**Fix:** Add `CORSMiddleware` with `http://localhost:5173`
**Prevention:** Health check from frontend on startup

### Alembic Migration Drift
**Symptom:** Model differs from DB schema
**Likely cause:** Model changed without migration
**Fix:** `alembic revision --autogenerate` and review
**Prevention:** Rule in `.cursor/rules/06-documentation.md`

---

## State Machine Debugging

### Invalid Transition Not Rejected
**Check:**
1. Is validation in service layer (not only route)?
2. Is status string exact match (`"In Progress"` vs `"in_progress"`)?
3. Is PATCH hitting correct endpoint?

### Status Updates But UI Stale
**Check:**
1. TanStack Query `invalidateQueries` after mutation?
2. Response body includes updated `updated_at`?

---

## Frontend Debugging

### Axios 422 Not Displayed
**Check:** Interceptor maps `error.response.data.detail` to UI

### Export Downloads Empty File
**Check:** `X-User-Id` header sent; backend filters `created_by`

---

## Log Locations

| Component | Log |
|-----------|-----|
| Backend | stdout via uvicorn |
| Frontend | Browser devtools console |
| Tests | `pytest -v --tb=short` |

---

## Debug Session Log

### 2026-07-27 — CSV export endpoint returned 501
**Symptom:** Clicking "Export My Tickets" failed; `GET /api/v1/tickets/export`
returned `501 NOT_IMPLEMENTED`.
**Root cause:** The endpoint was a route-order placeholder stub; the export
milestone was never completed, and an integration test asserted the `501`, so CI
stayed green. Full RCA: `docs/rca-csv-export-stub.md`.
**Fix:** Implemented `app/utils/csv_export.py`, `TicketService.list_for_export`, and
a real `text/csv` endpoint; updated/added tests; seeded sample tickets.
**Prevention:** Don't assert stubs in tests; verify acceptance criteria against a
running server. Added export/search/CSV tests.
**Cursor prompt used:** "Review the repo against acceptance-criteria; find core
requirements documented but not implemented, then fix only those with tests."

### 2026-07-27 — MyPy `valid-type` error after adding `list_for_export`
**Symptom:** `mypy app` failed: `Function "TicketService.list" is not valid as a
type` on the new method's `-> list[Ticket]` annotation.
**Root cause:** The service defines a method named `list`, which shadows the `list`
builtin when used as a type annotation in class scope.
**Fix:** Annotated the return type as `builtins.list[Ticket]`, matching the existing
pattern in `TicketRepository`.
**Prevention:** Prefer non-shadowing method names or `builtins.list` for annotations
when a method named `list` exists.

---

### Example Entry (remove when real entries exist)

**Symptom:** POST /tickets returns 500
**Root cause:** Missing `created_by` FK — user not seeded in test DB
**Fix:** Added user fixture in `conftest.py`
**Prevention:** Integration test for create without seed fails first
