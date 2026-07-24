# Code Review Checklist

## Correctness
- [ ] Status transitions enforced in backend service (not only frontend).
- [ ] Invalid transitions return appropriate HTTP status and message.
- [ ] Required fields validated on backend (Pydantic + service).
- [ ] Data persists across restart (migrations + seed verified).

## Architecture
- [ ] API layer thin; business logic in services.
- [ ] No SQL in routes. No HTTP in repositories.
- [ ] Dependencies injected, not instantiated inline in handlers.

## Security
- [ ] No secrets, API keys, or `.env` committed.
- [ ] Input sanitized via Pydantic; no raw SQL string concatenation.
- [ ] CORS configured explicitly (not `*` in production config).

## Frontend
- [ ] API errors surfaced to user.
- [ ] Loading and error states on async operations.
- [ ] Types match API contract.

## Tests
- [ ] State machine integration tests present and passing.
- [ ] New behavior has corresponding test.

## Style
- [ ] Ruff/Black/MyPy clean (backend). ESLint/Prettier clean (frontend).
- [ ] No dead code or commented-out blocks.

## Docs
- [ ] API contract updated if endpoints changed.
- [ ] README setup steps still accurate.
