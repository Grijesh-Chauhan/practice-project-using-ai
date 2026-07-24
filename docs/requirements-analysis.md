# Requirements Analysis

## 1. Business Context

A small internal **Support Ticket Management System** allows users to create, track, assign, and resolve support tickets through a defined lifecycle. The system is the core deliverable for an AI-assisted full-stack engineering assessment.

**Primary users (assumed):** Internal support staff or team members who create and work tickets. No external customer portal required.

## 2. Stakeholders & Goals

| Stakeholder | Goal |
|-------------|------|
| End user | Manage tickets efficiently with clear status workflow |
| Assessor | Evaluate AI-assisted SDLC, not just code output |
| Developer (you) | Demonstrate production-minded engineering practices |

## 3. Functional Requirements

### 3.1 Ticket Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Create ticket with title, description, priority | Must |
| FR-02 | List all tickets | Must |
| FR-03 | View ticket details (fields + comments) | Must |
| FR-04 | Update title, description, priority, assignee | Must |
| FR-05 | Assign ticket to a seeded user | Must |
| FR-06 | Search/filter tickets | Must |
| FR-07 | Export self-created tickets as CSV | Must |
| FR-15 | New tickets default to status `Open` | Must |
| FR-16 | Status changes only via dedicated status endpoint (not general field PATCH) | Must |

### 3.2 Status Lifecycle (Critical)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-08 | Enforce status state machine on backend | Must |
| FR-09 | Reject invalid transitions with clear error (`409`, code `INVALID_STATUS_TRANSITION`) | Must |
| FR-10 | Frontend displays backend validation errors | Must |

**Allowed transitions:**

```
Open → In Progress
In Progress → Resolved
Resolved → Closed
Open → Cancelled
In Progress → Cancelled
```

**Terminal states:** `Closed`, `Cancelled` — no further status transitions. Field edits and comments remain allowed (see §6).

### 3.3 Comments

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Add comment to a ticket (including terminal statuses) | Must |
| FR-12 | Display comments on ticket detail chronological ascending (`created_at` ASC) | Must |

### 3.4 Users

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-13 | Seed users (id, name, email, role) — no user CRUD UI | Must |
| FR-14 | Track createdBy and assignedTo on tickets | Must |

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Data persists across application restart (SQLite + migrations) |
| NFR-02 | Backend validates all required fields |
| NFR-03 | Layered architecture (API → Service → Repository → DB) |
| NFR-04 | At least one meaningful test tier (state machine integration tests mandatory) |
| NFR-05 | No secrets in repository |
| NFR-06 | README with local setup instructions |
| NFR-07 | Monorepo: `/backend`, `/frontend`, `/docs`, `/artifacts` |

## 5. Out of Scope (Core)

- User registration / login UI (auth is optional stretch)
- Role-based authorization (unless stretch implemented)
- Email notifications
- File attachments on tickets
- Real-time updates (WebSockets)
- Multi-tenancy
- Production deployment (Docker is stretch)

## 6. Assumptions (Locked)

| # | Assumption | Rationale |
|---|------------|-----------|
| A1 | Active user = `X-User-Id` header; frontend defaults to `VITE_DEFAULT_USER_ID` (seeded user) | Auth optional stretch; keeps API auth-ready |
| A2 | "Self-created tickets" = `created_by` equals active user ID from `X-User-Id` | Matches export requirement; server-enforced |
| A3 | Search = case-insensitive `LIKE` on title/description (`q`) plus filters status, priority, assigned_to, created_by | Satisfies "search/filter" without Elasticsearch |
| A4 | Priority enum: `low`, `medium`, `high` (API/DB lowercase; UI may title-case) | Locked in data-model and api-contract |
| A5 | Single SQLite database for local dev | Simplest production-ready local setup |
| A6 | Timestamps stored in UTC (ISO 8601 in API) | Standard practice |
| A7 | `assigned_to` may be null (unassigned) | Common support workflow |
| A8 | Title/description/priority/assignee editable in any status including terminal | Keeps core simple; status is the only gated field |
| A9 | Comments allowed on any ticket including Closed/Cancelled | Assessment does not require comment locks |
| A10 | CSV = one row per ticket; ticket fields only; **no comments column** | Sufficient "details"; avoids multi-row complexity |

## 7. Validation Rules (Business)

| Rule | Behavior |
|------|----------|
| Title | Required; 1–255 chars after trim; empty/whitespace rejected |
| Description | Required; min 1 char after trim |
| Priority | Required on create; must be `low` \| `medium` \| `high` |
| Status on create | Always `Open` (client cannot set initial status) |
| Status change | Only via `PATCH /tickets/{id}/status`; must be allowed transition |
| Same-status transition | Rejected (`409`) — e.g. Open → Open |
| `assigned_to` | Optional; if provided must reference existing user else `422` |
| `X-User-Id` | Required for create, comment, export; must be existing user ID else `400` |
| Comment message | Required; 1–5000 chars after trim |
| Unknown ticket ID | `404` |

## 8. Constraints

- Python 3.13+, FastAPI, SQLAlchemy 2.x, Alembic, UV (no pip)
- React, TypeScript, Vite, MUI, TanStack Query
- All code AI-generated via Cursor (assessment rule)
- ~8–12 hours core app; remainder for artifacts and reflection

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State machine logic only in frontend | High — fails assessment | Enforce in service layer; integration tests |
| Scope creep into stretch features | Medium — artifacts suffer | Lock core first; stretch only if time permits |
| API/frontend contract drift | Medium | Maintain `api-contract.md`; shared types |
| SQLite concurrency limits | Low for assessment | Single-user dev; document limitation |
| `X-User-Id` impersonation | Accepted for core | Document in security.md / README |

## 10. Resolved Questions

| # | Question | Decision |
|---|----------|----------|
| Q1 | How is "active user" determined without auth? | `X-User-Id` header + `VITE_DEFAULT_USER_ID` frontend default |
| Q2 | Can assignee be null? | Yes — unassigned is valid |
| Q3 | Can title/description be updated in any status? | Yes — including terminal statuses |
| Q4 | CSV export scope — comments included? | No — ticket field columns only (see api-contract) |

## 11. Traceability

Requirements map to:
- [acceptance-criteria.md](./acceptance-criteria.md) — verifiable conditions + FR→AC matrix
- [api-contract.md](./api-contract.md) — API behavior
- [test-strategy.md](./test-strategy.md) — verification approach
- [design-review-gate.md](./design-review-gate.md) — final design review before coding
