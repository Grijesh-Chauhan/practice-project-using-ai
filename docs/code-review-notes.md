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

*(Add sessions below during Phase 8)*

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
