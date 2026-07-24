# Pull Request Description Template

Copy into PR body when opening a pull request.

---

## Summary

<!-- 1–3 sentences: what this PR does and why -->

-

## Type of Change

- [ ] feat — New feature
- [ ] fix — Bug fix
- [ ] test — Tests only
- [ ] docs — Documentation
- [ ] refactor — Code change without behavior change
- [ ] chore — Tooling, deps, CI

## Related

- Docs: <!-- e.g., docs/api-contract.md -->
- Acceptance criteria: <!-- e.g., AC-010, AC-015 -->

## Changes

| Area | Files | Description |
|------|-------|-------------|
| Backend | | |
| Frontend | | |
| Tests | | |
| Docs | | |

## Screenshots / Demo

<!-- If UI changes, add screenshots or short Loom -->

## Test Plan

- [ ] `cd backend && uv run pytest` — all pass
- [ ] `cd frontend && npm test` — all pass
- [ ] Manual: <!-- specific flow tested -->
- [ ] State machine: valid transitions work
- [ ] State machine: invalid transitions rejected

## Checklist

- [ ] No secrets or `.env` files committed
- [ ] api-contract.md updated (if API changed)
- [ ] data-model.md updated (if schema changed)
- [ ] Self-reviewed against `.cursor/rules/05-code-review.md`
- [ ] Pre-commit hooks pass

## Notes for Reviewer

<!-- Optional: areas needing extra attention -->

---

## Example (Filled)

## Summary

Implements backend status state machine with integration tests for all valid and invalid transitions.

## Type of Change

- [x] feat — New feature
- [x] test — Tests only

## Related

- AC-010 through AC-016
- docs/api-contract.md — PATCH /tickets/{id}/status

## Test Plan

- [x] `uv run pytest tests/integration/test_status_transitions.py`
- [x] Manual: Open → In Progress → Resolved → Closed via API
