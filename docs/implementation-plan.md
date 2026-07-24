# Implementation Plan

Phase-wise roadmap for the Support Ticket Management System. Each phase includes objective, deliverables, dependencies, acceptance criteria, definition of done, Cursor prompts, and validation checklist.

**Start with:** [project-foundation.md](./project-foundation.md)

---

## Phase 0 — Project Foundation

### Objective
Establish repository structure, tooling, Git strategy, Cursor rules, and planning docs before any application code.

### Deliverables
- [x] Monorepo folder scaffold (`backend/`, `frontend/`, `docs/`, `artifacts/`, `scripts/`, `.github/`)
- [x] `.gitignore` (Python, Node, SQLite, env, IDE, OS)
- [x] `.cursor/rules/` (7 rule files)
- [x] Complete `/docs` planning corpus
- [ ] `.pre-commit-config.yaml` *(create at start of Phase 3)*
- [x] `scripts/bootstrap.sh` (stub — finalize after scaffolds)
- [x] `artifacts/tool-workflow.md` (stub)
- [x] `artifacts/prompt-history/.gitkeep`
- [x] README outline (root)

### Dependencies
None — first phase.

### Acceptance Criteria
- All docs in `docs/README.md` index exist
- `.gitignore` covers required categories
- Cursor rules are concise and non-redundant
- Directory structure documented

### Definition of Done
Foundation docs committed; empty scaffold folders ready; bootstrap script runs without error (once backend/frontend init added in Phase 3–4).

### Expected Cursor Prompts

```
Read @ProjectNeed.md and @docs/project-foundation.md. Verify all foundation 
docs are complete and consistent. List any gaps.

Create .pre-commit-config.yaml for Ruff, Black, MyPy on backend. 
Do not add application code yet.

Create scripts/bootstrap.sh that documents setup steps for UV and npm 
(implementation can be completed after Phase 3–4 scaffolds exist).
```

### Validation Checklist
- [ ] `docs/` contains all required markdown files
- [ ] `.cursor/rules/` has 7 files
- [ ] `.gitignore` present and comprehensive
- [ ] No application source code yet (by design)
- [ ] `artifacts/prompt-history/` exists

---

## Phase 1 — Requirement Analysis

### Objective
Translate assessment requirements into structured, testable specifications.

### Deliverables
- [x] `docs/requirements-analysis.md`
- [x] `docs/acceptance-criteria.md`
- [x] Resolved open questions (Q1–Q4 locked in requirements-analysis)
- [x] Traceability matrix (FR → AC in acceptance-criteria)
- [x] Design review gate: `docs/design-review-gate.md`

### Dependencies
Phase 0 complete.

### Acceptance Criteria
- All core features from `ProjectNeed.md` mapped to FR-xxx
- State machine transitions documented
- Assumptions explicitly listed
- Out-of-scope items clear

### Definition of Done
Requirements and acceptance criteria reviewed; no blocking ambiguities; decisions recorded in design-notes.

### Expected Cursor Prompts

```
Act as Requirements Analyst (@docs/ai-agents.md). Review @ProjectNeed.md 
and @docs/requirements-analysis.md. Identify gaps, conflicts, and 
unresolved assumptions. Propose decisions for open questions Q1–Q4.

Create a traceability table mapping each FR-xxx to AC-xxx IDs. 
Add to acceptance-criteria.md.
```

### Validation Checklist
- [ ] Every mandatory feature has acceptance criterion
- [ ] State machine AC-010–AC-017 defined
- [ ] CSV export criteria defined
- [ ] Assumptions documented and reasonable
- [ ] Export this chat session to artifacts/prompt-history/

---

## Phase 2 — Architecture & Design

### Objective
Define system structure, API contract, data model, and UI flows before coding.

### Deliverables
- [x] `docs/architecture.md`
- [x] `docs/design-notes.md`
- [x] `docs/data-model.md`
- [x] `docs/api-contract.md`
- [x] `docs/ui-flow.md`
- [x] `docs/test-strategy.md`
- [x] `docs/directory-structure.md`
- [ ] Optional: mermaid diagrams in architecture.md

### Dependencies
Phase 1 complete.

### Acceptance Criteria
- Layered architecture documented
- All endpoints specified with request/response shapes
- State machine location decided (service layer)
- UI screens map to API calls
- Test strategy includes transition matrix

### Definition of Done
Architect and implementer can build without guessing API shape or schema.

### Expected Cursor Prompts

```
Act as Software Architect. Review @docs/requirements-analysis.md. 
Validate @docs/architecture.md and @docs/api-contract.md for consistency. 
Suggest improvements only if gaps exist.

Finalize decision for active user without auth: document X-User-Id header 
approach in design-notes.md and api-contract.md.

Review @docs/data-model.md against ProjectNeed entities. Confirm all fields 
and relationships match requirements.
```

### Validation Checklist
- [ ] api-contract covers all FR features
- [ ] data-model matches api-contract field names
- [ ] ui-flow references correct endpoints
- [ ] State machine in design-notes matches ProjectNeed
- [ ] test-strategy has 25-cell transition matrix plan
- [ ] Export session to prompt-history

---

## Phase 3 — Backend Development

### Objective
Implement FastAPI backend with layered architecture, persistence, migrations, seed data, and state machine.

### Implementation guide
Follow milestones in [implementation-order.md](./implementation-order.md).  
Blueprints: [backend-architecture.md](./backend-architecture.md), [backend-module-design.md](./backend-module-design.md), [backend-folder-guide.md](./backend-folder-guide.md), [error-handling-strategy.md](./error-handling-strategy.md), [configuration-strategy.md](./configuration-strategy.md), [database-strategy.md](./database-strategy.md), [logging-monitoring.md](./logging-monitoring.md), [testing-plan-backend.md](./testing-plan-backend.md).

### Deliverables
- `backend/pyproject.toml` (UV)
- `backend/app/` full structure per directory-structure.md
- Alembic initial migration (users, tickets, comments)
- `scripts/seed_db.py`
- `backend/.env.example`
- All endpoints per api-contract.md
- `GET /health`

### Dependencies
Phase 2 complete; backend blueprints under `docs/` reviewed.

### Acceptance Criteria
- All api-contract endpoints work via curl/httpx
- Invalid status transitions return **409**
- Data persists in SQLite after restart
- Seed script populates users and sample tickets

### Definition of Done
Backend runs locally; manual API testing passes; ready for integration tests in Phase 6.

### Expected Cursor Prompts

```
Act as Backend Engineer (@.cursor/rules/02-python-backend.md). 
Scaffold FastAPI project in /backend using UV. Create layered structure 
per @docs/directory-structure.md. No frontend code.

Implement SQLAlchemy models per @docs/data-model.md and Alembic initial 
migration.

Implement TicketService with status state machine per @docs/design-notes.md. 
Invalid transitions raise domain exception mapped to 409.

Implement all endpoints in @docs/api-contract.md with Pydantic schemas 
and dependency injection.

Create scripts/seed_db.py with 3 users and 5 sample tickets across 
all statuses.
```

### Validation Checklist
- [ ] `uv run uvicorn app.main:app --reload` starts
- [ ] `alembic upgrade head` succeeds
- [ ] `uv run python ../scripts/seed_db.py` populates data
- [ ] POST /tickets creates ticket (status Open)
- [ ] PATCH /tickets/{id}/status enforces transitions
- [ ] GET /tickets/export returns CSV for X-User-Id
- [ ] OpenAPI at /docs matches api-contract
- [ ] Export session to prompt-history

---

## Phase 4 — Frontend Development

### Objective
Build React SPA with list, detail, create, search, status changes, comments, and CSV export.

### Deliverables
- Vite + React + TS scaffold in `frontend/`
- MUI theme, React Router, TanStack Query, Axios
- Pages: TicketList, TicketDetail, CreateTicket
- Components: TicketForm, StatusSelector, CommentList, SearchFilters
- `frontend/.env.example` with `VITE_API_URL`, `VITE_DEFAULT_USER_ID`

### Dependencies
Phase 3 backend running locally.

### Acceptance Criteria
- All core UI flows in ui-flow.md work
- API errors displayed to user
- Status selector shows only valid transitions
- CSV export downloads file

### Definition of Done
Frontend communicates with backend; manual walkthrough of acceptance criteria UI items passes.

### Expected Cursor Prompts

```
Act as Frontend Engineer (@.cursor/rules/03-react-frontend.md). 
Scaffold React + Vite + TypeScript + MUI in /frontend using npm.

Create Axios client with base URL from env and X-User-Id header from 
VITE_DEFAULT_USER_ID.

Implement pages per @docs/ui-flow.md: ticket list with search/filters, 
create ticket form (RHF + Zod), ticket detail with status change and 
comments.

StatusSelector must only show valid next statuses per current status 
(see ui-flow.md table).

Implement Export My Tickets button calling GET /tickets/export.
```

### Validation Checklist
- [ ] `npm run dev` starts on 5173
- [ ] List, create, detail, edit flows work
- [ ] Invalid status shows error from API
- [ ] Comments add and display
- [ ] Search/filter works
- [ ] CSV export downloads
- [ ] Loading and error states present
- [ ] Export session to prompt-history

---

## Phase 5 — Integration

### Objective
Connect frontend and backend; fix CORS, env config, proxy; end-to-end manual verification.

### Deliverables
- Vite proxy or CORS configuration verified
- Consistent env setup documented
- `scripts/run_dev.sh` (optional)
- api-contract updates if gaps found during integration

### Dependencies
Phase 3 and 4 complete.

### Acceptance Criteria
- Full user flows work browser → API → DB
- No CORS errors in dev
- Field names consistent (snake_case API, mapped in frontend)

### Definition of Done
Clean clone + bootstrap + migrate + seed + run dev → app fully functional.

### Expected Cursor Prompts

```
Configure CORS on FastAPI for http://localhost:5173. Add Vite proxy 
to /api if preferred. Update README outline with env setup.

Run through all flows in @docs/ui-flow.md and fix any API/frontend 
mismatches. Update api-contract.md if changes were required.

Create scripts/run_dev.sh to start backend and frontend together.
```

### Validation Checklist
- [ ] Create ticket E2E works
- [ ] Status transition E2E works (full path to Closed)
- [ ] Cancelled path works
- [ ] Invalid transition shows UI error
- [ ] Data survives backend restart
- [ ] Export E2E works
- [ ] Export session to prompt-history

---

## Phase 6 — Testing

### Objective
Implement mandatory state machine integration tests and additional test coverage.

### Deliverables
- `backend/tests/integration/test_status_transitions.py` (full matrix)
- `backend/tests/integration/test_tickets_api.py`
- `backend/tests/integration/test_export_api.py`
- `backend/tests/conftest.py` with fixtures
- Frontend component tests (at least TicketForm, StatusSelector)
- `.github/workflows/ci.yml`

### Dependencies
Phase 5 complete.

### Acceptance Criteria
- AC-060, AC-061 pass
- AC-062: additional test tier exists
- CI runs on push/PR

### Definition of Done
`uv run pytest` and `npm test` pass; CI green.

### Expected Cursor Prompts

```
Act as QA Engineer (@.cursor/rules/04-testing.md). Implement parametrized 
integration tests for ALL valid and invalid status transitions per 
@test-strategy.md matrix. Use test SQLite DB.

Add integration tests for ticket CRUD, comments, search, and CSV export 
filtering by created_by.

Add Vitest tests for StatusSelector and TicketForm with mocked API.

Create .github/workflows/ci.yml running pytest and npm test on PR.
```

### Validation Checklist
- [ ] 5 valid transitions pass
- [ ] 20 invalid transitions fail with **409**
- [ ] Terminal states reject all transitions
- [ ] Export only returns own tickets
- [ ] CI workflow file valid
- [ ] Coverage report generated (optional)
- [ ] Export session to prompt-history

---

## Phase 7 — Bug Fixing & Debugging

### Objective
Fix defects found during testing and manual QA; document debugging process.

### Deliverables
- Bug fixes (minimal diffs)
- Regression tests for each bug
- Updated `docs/debugging-notes.md` entries

### Dependencies
Phase 6 complete.

### Acceptance Criteria
- All acceptance criteria pass
- Each significant bug has debugging-notes entry

### Definition of Done
No known P0/P1 bugs; test suite green.

### Expected Cursor Prompts

```
Act as Debugger. pytest test_transition_resolved_to_open fails with 
[paste error]. Trace through service layer and fix with minimal change. 
Add regression test. Document in debugging-notes.md.

Manual QA found: invalid transition shows 409 but UI does not display 
message. Fix Axios error handling. Document fix.
```

### Validation Checklist
- [ ] Full acceptance-criteria manual pass
- [ ] debugging-notes has ≥2 real entries
- [ ] No regressions in test suite
- [ ] Export session to prompt-history

---

## Phase 8 — Code Review & Refactoring

### Objective
Self-review and AI-assisted review; refactor for clarity without scope creep.

### Deliverables
- `docs/code-review-notes.md` populated
- Refactoring PRs (if needed)
- Pre-commit hooks verified

### Dependencies
Phase 7 complete.

### Acceptance Criteria
- Review checklist in 05-code-review.md satisfied
- No state machine duplication
- No secrets in history

### Definition of Done
Code is merge-ready; review notes document findings and resolutions.

### Expected Cursor Prompts

```
Act as Reviewer (@.cursor/rules/05-code-review.md). Review backend 
ticket_service.py and status endpoint. Verify state machine is single 
source of truth. List findings by severity.

Perform self-review of entire diff from main. Check architecture 
adherence per @docs/architecture.md. Update code-review-notes.md.

Run pre-commit on all files. Fix any Ruff/Black/MyPy issues.
```

### Validation Checklist
- [ ] code-review-notes.md has review session
- [ ] All high/critical findings resolved
- [ ] Pre-commit passes
- [ ] No `any` types in critical paths (frontend)
- [ ] Export session to prompt-history

---

## Phase 9 — Documentation

### Objective
Finalize README, sync docs with implementation, complete reflection draft.

### Deliverables
- Final `README.md` with setup, run, test commands
- Synced api-contract, data-model if changed
- `docs/reflection.md` draft
- `artifacts/tool-workflow.md` (Part A)

### Dependencies
Phase 8 complete.

### Acceptance Criteria
- README works from clean clone
- All docs accurate
- tool-workflow.md has all 11 sections per ProjectNeed Part A

### Definition of Done
New developer can set up project using README only.

### Expected Cursor Prompts

```
Act as Documentation Writer. Write final README.md with: prerequisites, 
bootstrap, migrate, seed, run backend, run frontend, run tests, env vars.

Verify @docs/api-contract.md matches implemented API. Update discrepancies.

Complete artifacts/tool-workflow.md per ProjectNeed Part A sections 1–11.

Draft reflection.md sections 1–6 based on our development experience.
```

### Validation Checklist
- [ ] Clean clone setup works
- [ ] api-contract matches reality
- [ ] tool-workflow.md complete
- [ ] reflection.md started
- [ ] Export session to prompt-history

---

## Phase 10 — Final Assessment Preparation

### Objective
Package submission artifacts; final QA; complete reflection.

### Deliverables
- 10–15 prompt exports in `artifacts/prompt-history/`
- Completed `docs/reflection.md`
- `docs/pr-description.md` example filled for final PR
- Optional: `v1.0.0-assessment` git tag
- Submission form answers drafted

### Dependencies
Phase 9 complete.

### Acceptance Criteria
- All AC-070 through AC-073 met
- Repository ready for mentor review

### Definition of Done
Repository submitted before deadline; all mandatory artifacts present.

### Expected Cursor Prompts

```
Review submission checklist in @docs/project-foundation.md and 
@docs/acceptance-criteria.md. List any missing artifacts.

Help me complete reflection.md sections 9–11 with honest assessment 
of AI workflow strengths and growth areas.

Generate summary for participation form: biggest learning, biggest 
challenge, AI capability self-assessment.
```

### Validation Checklist
- [ ] All acceptance criteria verified
- [ ] 10–15 prompt histories exported
- [ ] reflection.md complete
- [ ] No secrets in repo
- [ ] State machine tests pass
- [ ] CSV export works
- [ ] README accurate
- [ ] tool-workflow.md in artifacts/
- [ ] Final commit on main (or submission branch)

---

## Timeline Guidance (Self-Paced)

| Phase | Suggested Effort |
|-------|------------------|
| 0–2 | 2–3 hours (foundation — largely done) |
| 3 | 3–4 hours |
| 4 | 2–3 hours |
| 5 | 1 hour |
| 6 | 2 hours |
| 7–8 | 1–2 hours |
| 9–10 | 2–3 hours |

**Total:** ~12–18 hours including artifacts (aligns with 8–12h core + lifecycle).

---

## Risk Register

| Risk | Phase | Mitigation |
|------|-------|------------|
| State machine only in UI | 3, 6 | Service layer + integration tests first |
| API/FE drift | 5 | api-contract as spec; sync in integration |
| Artifact neglect | 9–10 | Export prompts after each phase |
| Scope creep (auth) | 3–4 | Core first; stretch only if time |

---

## Related Documents

- [acceptance-criteria.md](./acceptance-criteria.md)
- [ai-agents.md](./ai-agents.md)
- [project-foundation.md](./project-foundation.md)
