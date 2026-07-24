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

### 3.2 Status Lifecycle (Critical)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-08 | Enforce status state machine on backend | Must |
| FR-09 | Reject invalid transitions with clear error | Must |
| FR-10 | Frontend displays backend validation errors | Must |

**Allowed transitions:**

```
Open → In Progress
In Progress → Resolved
Resolved → Closed
Open → Cancelled
In Progress → Cancelled
```

### 3.3 Comments

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11 | Add comment to a ticket | Must |
| FR-12 | Display comments on ticket detail (chronological) | Must |

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

## 6. Assumptions

| # | Assumption | Rationale |
|---|------------|-----------|
| A1 | Active user defaults to first seeded user when auth is not implemented | Assessment allows optional auth; core needs createdBy for CSV export |
| A2 | "Self-created tickets" = tickets where `createdBy` equals active user ID | Matches export requirement |
| A3 | Search supports text match on title/description plus filters (status, priority) | Satisfies "search/filter" without Elasticsearch |
| A4 | Priority enum: `Low`, `Medium`, `High` (or similar fixed set) | Not specified; document in data-model |
| A5 | Single SQLite database for local dev | Simplest production-ready local setup |
| A6 | Timestamps stored in UTC (ISO 8601 in API) | Standard practice |

## 7. Constraints

- Python 3.13+, FastAPI, SQLAlchemy 2.x, Alembic, UV (no pip)
- React, TypeScript, Vite, MUI, TanStack Query
- All code AI-generated via Cursor (assessment rule)
- ~8–12 hours core app; remainder for artifacts and reflection

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State machine logic only in frontend | High — fails assessment | Enforce in service layer; integration tests |
| Scope creep into stretch features | Medium — artifacts suffer | Lock core first; stretch only if time permits |
| API/frontend contract drift | Medium | Maintain `api-contract.md`; shared types |
| SQLite concurrency limits | Low for assessment | Single-user dev; document limitation |

## 9. Open Questions

| # | Question | Decision (for now) |
|---|----------|-------------------|
| Q1 | How is "active user" determined without auth? | Header `X-User-Id` or hardcoded default user ID in frontend config |
| Q2 | Can assignee be null? | Yes — unassigned is valid |
| Q3 | Can title/description be updated in any status? | Yes, unless business rules added later |
| Q4 | CSV export scope — comments included? | Include ticket fields; one row per ticket; comments as separate column or omitted (document choice in api-contract) |

## 10. Traceability

Requirements map to:
- [acceptance-criteria.md](./acceptance-criteria.md) — verifiable conditions
- [api-contract.md](./api-contract.md) — API behavior
- [test-strategy.md](./test-strategy.md) — verification approach
