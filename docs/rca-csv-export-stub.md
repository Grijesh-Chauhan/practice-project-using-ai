# Root Cause Analysis — CSV Export Shipped as a 501 Stub

| Field | Value |
|-------|-------|
| RCA ID | RCA-001 |
| Date discovered | 2026-07-27 |
| Discovered during | Final pre-submission engineering review |
| Severity | High (core acceptance criterion not met) |
| Status | Resolved |
| Related | FR-07, AC-040–AC-043; `docs/api-contract.md`; `docs/business-rules.md` (BR-43…BR-45) |

---

## 1. Problem Statement

The "Export self-created tickets as CSV" feature — a **Core** requirement — did not
work end to end. `GET /api/v1/tickets/export` returned **HTTP 501** with body
`{"detail": "CSV export will be implemented in Milestone 8", "code": "NOT_IMPLEMENTED"}`.

Meanwhile the rest of the feature was fully built:
- The frontend had a working "Export My Tickets" button, `useExportTickets` hook,
  `exportTickets` API call, and `downloadBlob` helper.
- The data layer had `TicketRepository.list_for_export(created_by, …)` implemented.

So a user clicking "Export My Tickets" would trigger a failed request instead of a
CSV download. The gap was invisible in CI because the test suite **asserted the
stub** (`assert response.status_code == 501`).

## 2. Detection

Found by reviewing each acceptance criterion against **running behavior** rather than
against passing tests:
- `AC-040 Export self-created tickets as CSV`
- `AC-041 CSV columns per api-contract`
- `AC-043 Export without X-User-Id returns 400`

A grep for `501` / `NOT_IMPLEMENTED` in `backend/app` surfaced the stub in
`app/api/v1/endpoints/tickets.py`, and the endpoint's test in
`tests/integration/test_tickets_api.py` was found to encode the stubbed status code.

## 3. Root Cause

The feature was split across milestones and the **final milestone (export + sample
data seeding) was never completed**, but was marked "done":

1. A **route-ordering placeholder** was added early (register `/export` before
   `/{id}`) as a `501` stub, with a `# implemented in Milestone 8` note.
2. Milestone 8 (implement export, seed sample tickets, add `test_export_api.py`) was
   planned in `implementation-plan.md` but **not executed**.
3. A test was written to match the *current* behavior (501), which turned an
   incomplete feature into a **green, "passing" state** — masking the gap.
4. Contributing factor: reviews trusted green CI instead of verifying the feature
   against the API contract and a running server.

**Underlying cause:** "done" was defined as *tests pass* rather than *acceptance
criteria pass against running software*, and a placeholder stub was allowed to be
asserted by a test.

## 4. Impact

- **Functional:** a Core feature (CSV export) was broken for all users; the UI action
  failed.
- **Assessment:** `AC-040`, `AC-041`, `AC-042`, `AC-043` were not actually satisfied.
- **Data:** the seed script also stopped at users only (no sample tickets), so a
  fresh clone had an empty ticket list (`AC-051` partially unmet).
- **Trust:** green CI implied completeness that did not exist.

No data loss or security impact.

## 5. Resolution

Completed the documented design (not a new feature):

- Added `app/utils/csv_export.py` (`build_tickets_csv`) using the stdlib `csv`
  writer for correct quoting/escaping and the locked column order.
- Added `TicketService.list_for_export(...)` delegating to the existing repository
  method (enforcing `created_by = X-User-Id`).
- Replaced the `501` stub in `app/api/v1/endpoints/tickets.py` with a real handler
  returning `text/csv` and `Content-Disposition: attachment; filename="my-tickets.csv"`,
  requiring `X-User-Id` (→ 400 when missing/unknown) and honoring list filters.
- Updated the stub test and added `tests/integration/test_export_api.py` plus a
  `tests/unit/test_csv_export.py` unit test (headers, escaping, null assignee,
  empty export).
- Seeded 3 users **and 5 sample tickets** (idempotent) in `scripts/seed_db.py`.

Verified with `uv run pytest` (all green) and a manual `curl` against a running,
seeded server (correct CSV, own-tickets-only, 400 without header).

## 6. Preventive Actions

| # | Action | Owner | Status |
|---|--------|-------|--------|
| P1 | Define "done" as acceptance-criteria-verified against running software, not just green tests. | Team | Adopted in review process |
| P2 | Never write a test that asserts a `501`/`NOT_IMPLEMENTED` stub; stubs must be tracked as failing/skipped work. | Team | Adopted |
| P3 | Add a guard test asserting no shipped endpoint returns `NOT_IMPLEMENTED`. | Backend | Recommended follow-up |
| P4 | Reconcile narrative docs (README/status) with implementation at each milestone. | Team | Applied (README updated) |
| P5 | Keep an FR→AC→test traceability check in the review checklist. | Team | Applied |

## 7. Timeline

| When | Event |
|------|-------|
| Milestone planning | Export + seed scheduled for "Milestone 8" |
| Early build | `/export` added as a `501` route-order placeholder |
| Milestone 8 | Not executed; stub left in place; test asserts `501` |
| 2026-07-27 | Final review detects gap; feature completed, tests added, docs corrected |
