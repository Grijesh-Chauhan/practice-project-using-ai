# Code Review Notes

> Record findings from self-review, AI review, and peer review. Track resolution status.

## Review Process

1. Run pre-commit hooks and CI locally
2. Self-review against `.cursor/rules/05-code-review.md`
3. Optional: Cursor Reviewer agent or Bugbot
4. Document findings here; link PR in `pr-description.md`

---

## Review Log Template

```markdown
### Review [DATE] — [PR/scope]
**Reviewer:** Self / AI / Peer
**Scope:** e.g., backend status machine

| # | Severity | Finding | Status | Resolution |
|---|----------|---------|--------|------------|
| 1 | High | ... | Open/Fixed | ... |
```

---

## Common Findings Checklist (Pre-Submit)

### Backend
- [ ] State machine not duplicated inconsistently between route and service
- [ ] All DB access through repositories
- [ ] Pydantic models separate from SQLAlchemy models
- [ ] Exceptions mapped to correct HTTP codes
- [ ] No raw SQL injection vectors

### Frontend
- [ ] No hardcoded API URLs (use env)
- [ ] Loading/error states on all mutations
- [ ] Types match api-contract
- [ ] Accessible form labels

### General
- [ ] No secrets in diff
- [ ] Tests added for new behavior
- [ ] Docs updated

---

## Severity Definitions

| Level | Meaning |
|-------|---------|
| Critical | Security issue, data loss, state machine bypass |
| High | Broken feature, missing validation |
| Medium | Poor error handling, missing tests |
| Low | Style, naming, minor UX |

---

## Review Sessions

### Review 2026-07-27 — Final pre-submission full-repo review
**Reviewer:** AI (Principal-Engineer review pass) + self
**Scope:** Entire repository (backend, frontend, tests, docs, CI, artifacts) vs.
`requirements-analysis`, `acceptance-criteria`, `api-contract`, `business-rules`,
`test-strategy`, `coding-standards`, `implementation-plan`.

| # | Severity | Finding | Status | Resolution |
|---|----------|---------|--------|------------|
| 1 | High | `GET /tickets/export` returned `501` stub; CSV export (FR-07, AC-040–043) broken end to end though FE + repository were wired. | Fixed | Implemented `csv_export` util + `TicketService.list_for_export` + real endpoint; see RCA-001. |
| 2 | High | A test asserted the `501` stub, masking the missing feature under green CI. | Fixed | Rewrote test to assert CSV; added `test_export_api.py`. |
| 3 | Medium | Seed script seeded users only ("deferred to M8"); fresh clone had no tickets (AC-051). | Fixed | Seed 5 sample tickets idempotently. |
| 4 | Medium | No search/filter API tests and no export API tests (test-strategy lists both). | Fixed | Added `test_search_api.py`, `test_export_api.py`, `test_csv_export.py`. |
| 5 | Medium | Root `README` described project as "scaffold — business features not implemented yet" (stale). | Fixed | Updated status, run/seed steps, tests, known limitations. |
| 6 | Low | `docs/business-rules.md` referenced by review scope but missing; rules scattered. | Fixed | Added consolidated `business-rules.md` with enforcement mapping. |
| 7 | Low | API timestamps serialized as naive ISO 8601 (no `Z`/offset) due to SQLite. | Documented | Recorded as known limitation (avoided large refactor). |
| 8 | Info | Backend layering, exception envelope, state machine, and DI are clean and consistent with docs. | Pass | No change. |

**Verification:** Ruff/Black/MyPy(strict)/Pytest green (101 tests); ESLint/tsc/Prettier/Vitest(16)/build green; manual E2E against seeded server incl. export.

---

### Planned Review Areas

| Area | Focus |
|------|-------|
| State machine | Backend enforcement + integration tests |
| API design | REST consistency, error format |
| Frontend UX | Error messages, status controls |
| Security | CORS, input validation, no secrets |
| Test coverage | Transition matrix complete |

---

## Refactoring Decisions

| Date | Change | Rationale |
|------|--------|-----------|
| | | |

---

## Related

- [.cursor/rules/05-code-review.md](../.cursor/rules/05-code-review.md)
- [pr-description.md](./pr-description.md)
