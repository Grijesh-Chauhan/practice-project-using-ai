# Backend Testing Plan

**Audience:** Phase 3 / Phase 6 implementers  
**Strategy parent:** [test-strategy.md](./test-strategy.md) — do not duplicate the matrix; implement it.

This plan turns the strategy into a backend-only execution guide for Cursor and developers.

---

## 1. Scope

| In scope | Out of scope |
|----------|--------------|
| Unit, repository, API/integration, state machine, validation tests | Frontend Vitest, E2E Playwright |
| Pytest + HTTPX/TestClient + SQLite test DB | Load/perf testing |

---

## 2. Layout

```
backend/tests/
├── conftest.py
├── unit/
│   ├── test_ticket_service_transitions.py
│   └── test_csv_export.py
├── integration/
│   ├── test_status_transitions.py    # mandatory matrix
│   ├── test_tickets_api.py
│   ├── test_comments_api.py
│   ├── test_search_api.py
│   ├── test_export_api.py
│   └── test_users_api.py
└── repositories/                     # optional folder or under unit/
    └── test_ticket_repository.py
```

Naming: `test_<unit>_<scenario>_<expected>` — [test-strategy.md](./test-strategy.md) §10.

---

## 3. Unit Tests

**Target:** Services and pure helpers. Fast; minimal I/O.

| Area | What to assert |
|------|----------------|
| State machine (service) | All valid pairs succeed; invalid raise `InvalidStatusTransitionError` |
| Create ticket | Forces status `Open`; sets `created_by` |
| Update fields | Does not change status |
| CSV builder | Header row exact; escaping quotes/newlines; column order locked |

**Repo mocking:** Optional for pure transition tests (in-memory ticket object). Prefer real DB for anything involving persistence side effects.

**Coverage goal:** State machine branches **100%**.

---

## 4. Integration / API Tests

**Target:** Full stack via FastAPI app + test database.

| Suite | Focus |
|-------|-------|
| `test_status_transitions.py` | 25-cell matrix → 200 vs **409** + `code` |
| `test_tickets_api.py` | CRUD, 404, PATCH rejects status, assignee 422 |
| `test_comments_api.py` | 201; 404 bad ticket; comment on Closed OK; 400 bad user |
| `test_search_api.py` | `q`, status, priority, assigned_to, created_by |
| `test_export_api.py` | CSV content-type; only own tickets; 400 without/unknown user |
| `test_users_api.py` | 200 list; shape includes id/name/email/role |

**Client:** `TestClient` or `httpx.AsyncClient` — match sync/async app style ([coding-standards.md](./coding-standards.md): sync OK).

**Always assert:** status code, key JSON fields, and for errors the `code` field when defined.

---

## 5. Repository Tests

**Optional but recommended** for filter/search correctness.

| Cases | Assert |
|-------|--------|
| Filter by status/priority | Only matching rows |
| `q` case-insensitive | Title/description LIKE behavior |
| Pagination | `skip`/`limit` + total count |
| Export query | `created_by` constraint |

Use same test DB fixtures as integration; call repository with session directly (no HTTP).

**Coverage goal:** ≥70% of repository module lines — [test-strategy.md](./test-strategy.md) §7.

---

## 6. State Machine Tests

Implement the matrix in [test-strategy.md](./test-strategy.md) §5.

| Layer | Role |
|-------|------|
| Unit | Raise vs success on service method (fast feedback) |
| Integration | HTTP **409** / **200** and body `code` (assessment mandatory) |

Parametrize invalid and valid pairs; do not hardcode 25 separate functions without parametrization.

Also cover: terminal states reject all; same-status invalid.

---

## 7. Validation Tests

| Input | Expected |
|-------|----------|
| Whitespace-only title | 422 |
| Missing description | 422 |
| Invalid priority | 422 |
| Message empty / >5000 | 422 |
| PATCH body includes `status` | 422 |
| `assigned_to` unknown user | 422 |
| Missing `X-User-Id` on create/comment/export | 400 |
| Unknown `X-User-Id` on those routes | 400 |

Edge list also in [test-strategy.md](./test-strategy.md) §11.

---

## 8. Coverage Goals

| Target | Goal |
|--------|------|
| `TicketService` transition paths | 100% branch |
| API ticket routes | ≥80% |
| Repositories | ≥70% |
| Overall `app/` | Strive ≥75%; do not block on vanity 100% |

Command: `uv run pytest --cov=app --cov-report=term-missing`

---

## 9. Test Data Strategy

| Mechanism | Usage |
|-----------|-------|
| `conftest.py` | `engine`, `db_session`, `client`, seed users fixture |
| Factories | `make_user()`, `make_ticket(status=…)`, `make_comment()` |
| Isolation | New DB per test session or per test; rollback/truncate between tests |
| Headers | Fixture `auth_headers(user_id)` → `{"X-User-Id": str(id)}` |
| Seed script | **Not** used inside pytest |

**DB URL:** `sqlite:///:memory:` or temp file. Prefer memory with `StaticPool` + `check_same_thread=False` if using shared in-memory across connections.

**Schema:** `Base.metadata.create_all` in tests **or** run Alembic against test engine — pick one; create_all is faster for assessment if models match migrations.

---

## 10. `conftest.py` Checklist

- [ ] Override Settings / `DATABASE_URL` for tests
- [ ] Create tables; yield client; drop/dispose
- [ ] At least two users for assignee/export isolation tests
- [ ] Helper to create ticket in a given status (via API or service)

---

## 11. Definition of Done (Backend Tests)

- [ ] Full transition matrix green (integration)
- [ ] CRUD, comments, search, export, users suites green
- [ ] Validation and X-User-Id edge cases green
- [ ] `uv run pytest` exits 0
- [ ] Coverage report generated at least once before submission

Phase placement: implement critical transition tests as soon as TicketService exists; finish full API suites in Phase 6 per [implementation-plan.md](./implementation-plan.md).

---

## Related

- [implementation-order.md](./implementation-order.md)
- [error-handling-strategy.md](./error-handling-strategy.md)
- [acceptance-criteria.md](./acceptance-criteria.md) AC-060+
