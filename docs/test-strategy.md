# Test Strategy

## 1. Goals

1. **Prove state machine correctness** — mandatory assessment requirement
2. **Verify API contracts** — CRUD, comments, search, export
3. **Ensure regression safety** — run on every PR
4. **Support AI workflow** — tests as specification for generated code

## 2. Test Pyramid

```
        ┌─────────────┐
        │  E2E (opt)  │  Manual or Playwright (stretch)
        ├─────────────┤
        │ Integration │  API + DB (mandatory)
        ├─────────────┤
        │    Unit     │  Services, state machine, utils
        └─────────────┘
```

**Minimum for assessment:** Integration tests (state machine) + at least one other tier (unit or component).

---

## 3. Backend Testing

### 3.1 Unit Tests (`backend/tests/unit/`)

| Target | Examples |
|--------|----------|
| `TicketService.transition_status` | All valid/invalid pairs |
| Priority/status validators | Edge cases |
| CSV builder utility | Column headers, escaping |

**Tools:** Pytest, no HTTP, mock repository optional.

### 3.2 Integration Tests (`backend/tests/integration/`) — **MANDATORY**

| Test Suite | Coverage |
|------------|----------|
| `test_status_transitions.py` | Every allowed transition returns 200 |
| | Every disallowed transition returns 400/409 |
| | Terminal states reject all transitions |
| `test_tickets_api.py` | CRUD, validation 422 |
| `test_comments_api.py` | Add comment, 404 on bad ticket |
| `test_search_api.py` | Filter by q, status, priority |
| `test_export_api.py` | CSV content-type; only own tickets |

**Setup:**
- Test database: SQLite in-memory or temp file
- Fixtures: `client`, `db_session`, seeded users
- Run migrations or create tables in `conftest.py`

**Example cases (state machine):**
```python
# Parametrize all invalid pairs
("Open", "Closed"),
("Open", "Resolved"),
("Resolved", "Open"),
("Closed", "In Progress"),
("Cancelled", "Open"),
```

### 3.3 API Testing

Use `httpx.AsyncClient` with `app` or FastAPI `TestClient`.

Assert:
- Status codes
- Response JSON shape
- DB state after mutation

---

## 4. Frontend Testing

### 4.1 Component Tests (`*.test.tsx`)

| Component | Tests |
|-----------|-------|
| `TicketForm` | Validation errors, submit calls API |
| `StatusSelector` | Only valid options shown per status |
| `CommentList` | Renders comments |
| `TicketTable` | Empty state, loading state |

**Tools:** Vitest, React Testing Library, MSW for API mock.

### 4.2 Integration (Optional)

MSW handlers mirroring `api-contract.md` for page-level flows.

---

## 5. State Machine Testing (Detailed)

**Matrix approach:** 5 statuses × 5 targets = 25 combinations.

| From \ To | Open | In Progress | Resolved | Closed | Cancelled |
|-----------|------|-------------|----------|--------|-----------|
| Open | ✗ | ✓ | ✗ | ✗ | ✓ |
| In Progress | ✗ | ✗ | ✓ | ✗ | ✓ |
| Resolved | ✗ | ✗ | ✗ | ✓ | ✗ |
| Closed | ✗ | ✗ | ✗ | ✗ | ✗ |
| Cancelled | ✗ | ✗ | ✗ | ✗ | ✗ |

✓ = must succeed (200)  
✗ = must fail (400/409)

---

## 6. Test Data Strategy

| Approach | Usage |
|----------|-------|
| `conftest.py` fixtures | Users, sample tickets per test |
| Factory functions | `make_ticket(status="Open")` |
| Isolation | Transaction rollback or fresh DB per test |
| No production data | Never use real emails/PII |

**Seed script** separate from tests; tests create own data.

---

## 7. Coverage Strategy

| Layer | Target |
|-------|--------|
| State machine service | 100% branch coverage |
| API routes (tickets) | ≥80% |
| Repositories | ≥70% |
| Frontend components (critical paths) | Key forms and status UI |

Generate report: `pytest --cov=app --cov-report=html`

---

## 8. CI Pipeline

```yaml
# .github/workflows/ci.yml (planned)
- Backend: uv sync, ruff, mypy, pytest
- Frontend: npm ci, lint, npm test
```

Fail PR on test failure.

---

## 9. Manual Test Checklist

Before submission, run through [acceptance-criteria.md](./acceptance-criteria.md) manual verifications.

---

## 10. Test Naming Convention

```
test_<unit>_<scenario>_<expected>
test_transition_open_to_in_progress_succeeds
test_transition_open_to_closed_returns_409
```

---

## 11. Debugging Failed Tests

Document patterns in [debugging-notes.md](./debugging-notes.md).

---

## 12. Definition of Done (Testing)

- [ ] All state machine integration tests pass
- [ ] CRUD integration tests pass
- [ ] CI green on main
- [ ] Manual acceptance spot-check completed
