# Acceptance Criteria

Testable conditions for project completion. Each criterion maps to assessment rubric and `ProjectNeed.md` core requirements.

## Legend

- **AC-xxx** — Acceptance criterion ID
- **Verify** — How to confirm (manual or automated)

---

## Ticket CRUD

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-001 | User can create a ticket with required fields via UI | Manual: create ticket; appears in list |
| AC-002 | Created ticket persists after backend restart | Manual: restart API; ticket still exists |
| AC-003 | User can view list of all tickets | Manual: list page loads with data |
| AC-004 | User can open ticket detail page | Manual: click ticket; all fields visible |
| AC-005 | User can update title, description, priority | Manual: edit and save; changes reflected |
| AC-006 | User can reassign ticket to seeded user | Manual: change assignee; saved correctly |
| AC-007 | Backend rejects ticket without required fields | API test: POST missing title → 422 |
| AC-008 | New ticket status is always `Open` | API/UI: create → status Open |
| AC-009 | General field PATCH cannot change status | API test: PATCH with status field ignored or 422 |

## Status State Machine

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-010 | Open → In Progress succeeds | Integration test + manual |
| AC-011 | In Progress → Resolved succeeds | Integration test + manual |
| AC-012 | Resolved → Closed succeeds | Integration test + manual |
| AC-013 | Open → Cancelled succeeds | Integration test + manual |
| AC-014 | In Progress → Cancelled succeeds | Integration test + manual |
| AC-015 | Invalid transition rejected by backend (e.g., Open → Closed) | Integration test → **409** |
| AC-016 | Invalid transition rejected by backend (e.g., Closed → Open) | Integration test → **409** |
| AC-017 | Frontend shows clear error on invalid transition | Manual: attempt invalid change |
| AC-018 | Same-status transition rejected (e.g., Open → Open) | Integration test → 409 |
| AC-019 | Terminal states reject all further transitions | Integration test matrix |

## Comments

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-020 | User can add comment on ticket detail | Manual |
| AC-021 | Comments display with author and timestamp chronological ASC | Manual |
| AC-022 | Comments persist after restart | Manual |
| AC-023 | User can add comment on Closed or Cancelled ticket | Manual/API |

## Search

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-030 | User can text-search tickets by title/description (`q`) | Manual + API |
| AC-031 | User can filter tickets by status | Manual + API |
| AC-032 | User can filter tickets by priority | Manual + API |
| AC-033 | Search and filters can be combined | Manual + API |

## CSV Export

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-040 | User can export self-created tickets as CSV | Manual: download file |
| AC-041 | CSV contains ticket field columns per api-contract (no comments column) | Manual: inspect file |
| AC-042 | CSV excludes tickets created by other users | Manual/API test |
| AC-043 | Export without `X-User-Id` (or unknown user) returns 400 | API test |

## Data & Infrastructure

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-050 | Database migrations run cleanly on fresh clone | Script: `alembic upgrade head` |
| AC-051 | Seed data loads sample users and tickets | Script + manual |
| AC-052 | No secrets committed to Git | `git log` + `.env` in gitignore |
| AC-053 | `.env.example` provided (if env vars used) | File exists |

## Testing

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-060 | Integration tests for valid status transitions pass | `pytest` |
| AC-061 | Integration tests for invalid status transitions pass | `pytest` |
| AC-062 | At least one additional meaningful test tier exists | Review test suite |

## Documentation & Artifacts

| ID | Criterion | Verify |
|----|-----------|--------|
| AC-070 | README has setup and run instructions | Follow README from clean clone |
| AC-071 | Planning docs present in `/docs` | File review |
| AC-072 | 10–15 Cursor prompt exports in `/artifacts` | Folder review |
| AC-073 | Reflection document completed | `docs/reflection.md` |

## Definition of "Done" (Project)

All **Must** criteria (AC-001 through AC-062) pass. Documentation artifacts (AC-070–AC-073) complete before mentor assessment deadline.

Invalid status transitions **must** return HTTP **409** with `code: INVALID_STATUS_TRANSITION` (do not use 400 for this case).

## FR → AC Traceability

| FR | AC IDs |
|----|--------|
| FR-01 Create ticket | AC-001, AC-007, AC-008 |
| FR-02 List tickets | AC-003 |
| FR-03 View detail | AC-004 |
| FR-04 Update fields | AC-005, AC-009 |
| FR-05 Assign | AC-006 |
| FR-06 Search/filter | AC-030–AC-033 |
| FR-07 CSV export | AC-040–AC-043 |
| FR-08 State machine enforce | AC-010–AC-019, AC-060–AC-061 |
| FR-09 Reject invalid | AC-015, AC-016, AC-018, AC-019 |
| FR-10 FE error display | AC-017 |
| FR-11 Add comment | AC-020, AC-023 |
| FR-12 Display comments | AC-021, AC-022 |
| FR-13 Seed users | AC-051 |
| FR-14 createdBy/assignedTo | AC-001, AC-006, AC-042 |
| FR-15 Default Open | AC-008 |
| FR-16 Status endpoint only | AC-009 |
| NFR-01 Persistence | AC-002, AC-022, AC-050 |
| NFR-04 Tests | AC-060–AC-062 |
| NFR-05 No secrets | AC-052 |
| NFR-06 README | AC-070 |

## Stretch (Optional — Not Required for Core Done)

| ID | Criterion |
|----|-----------|
| AC-S01 | JWT or session authentication |
| AC-S02 | Role-based API authorization |
| AC-S03 | Docker Compose for local stack |
| AC-S04 | OpenAPI published and accurate |
