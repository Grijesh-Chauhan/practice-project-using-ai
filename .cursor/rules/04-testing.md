# Testing Standards

## Backend (Mandatory)
- **Integration tests** for status state machine: all valid transitions succeed; invalid transitions return 4xx.
- **API tests** for CRUD, comments, search, CSV export endpoint.
- Use test DB (in-memory SQLite or temp file). Reset between tests.

## Frontend
- Component tests for forms and status transition UI (Vitest + React Testing Library).
- Mock API with MSW or vi.mock on api modules.

## Naming
`test_<behavior>_<expected_outcome>` — e.g., `test_status_transition_open_to_cancelled_succeeds`.

## Structure
Mirror source: `backend/tests/integration/`, `backend/tests/unit/`, `frontend/src/**/*.test.tsx`.

## Coverage
Aim ≥80% on service layer and state machine. 100% on transition matrix. Coverage reports in CI optional.

## Test Data
Use factories or fixtures in `conftest.py`. Seed users referenced by ID. No hardcoded secrets.

## CI
Run `pytest` and `npm test` in GitHub Actions on PR.

## Before Merge
All tests pass locally. State machine integration tests green.
