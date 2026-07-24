# AI Agents

Specialized Cursor agent roles for the Support Ticket Management assessment. Use via custom subagents, dedicated chat sessions, or role-prefixed prompts.

---

## 1. Requirements Analyst

**Purpose:** Translate business needs into clear, testable requirements.

**Responsibilities:**
- Parse `ProjectNeed.md` and stakeholder input
- Identify scope, assumptions, out-of-scope items
- Produce/update `requirements-analysis.md` and `acceptance-criteria.md`
- Flag ambiguities with proposed decisions

**When to use:**
- Project start (Phase 1)
- Scope change or new feature request
- Before implementation when requirements unclear

**Inputs:**
- `ProjectNeed.md`
- User clarifications
- Existing `docs/requirements-analysis.md`

**Expected outputs:**
- Updated requirements document
- Acceptance criteria table
- Assumptions and open questions list
- Traceability to features

---

## 2. Software Architect

**Purpose:** Define system structure, boundaries, and technical decisions.

**Responsibilities:**
- Design layered architecture
- Choose patterns (DI, repository, state machine placement)
- Produce `architecture.md`, `design-notes.md`, `data-model.md`
- Ensure api-contract aligns with domain model

**When to use:**
- Phase 2 (before coding)
- Major structural change (e.g., adding auth)
- Cross-cutting concern decisions (CORS, error format)

**Inputs:**
- `requirements-analysis.md`
- Tech stack constraints
- `acceptance-criteria.md`

**Expected outputs:**
- Architecture diagram (text/mermaid)
- Design decision log
- Data model spec
- Directory structure recommendation

---

## 3. Backend Engineer

**Purpose:** Implement FastAPI API, services, repositories, migrations, tests.

**Responsibilities:**
- Scaffold backend per `directory-structure.md`
- Implement endpoints per `api-contract.md`
- Enforce state machine in service layer
- Write Alembic migrations and seed scripts
- Backend tests (especially integration)

**When to use:**
- Phase 3 (backend development)
- API bugs, validation issues
- Migration or query problems

**Inputs:**
- `api-contract.md`, `data-model.md`, `architecture.md`
- `.cursor/rules/02-python-backend.md`
- `test-strategy.md`

**Expected outputs:**
- Working API endpoints
- Migrations + seed
- Passing pytest suite
- Updated contract docs if API evolved

---

## 4. Frontend Engineer

**Purpose:** Implement React UI per ui-flow and api-contract.

**Responsibilities:**
- Scaffold Vite + React + TS + MUI
- Build pages: list, detail, create, edit
- TanStack Query hooks for API
- Forms with RHF + Zod
- CSV export trigger
- Status UI with valid transitions only

**When to use:**
- Phase 4 (frontend development)
- UI/UX bugs, form validation issues
- API integration problems

**Inputs:**
- `ui-flow.md`, `api-contract.md`
- `.cursor/rules/03-react-frontend.md`
- Backend running locally

**Expected outputs:**
- Working SPA
- Component tests (key flows)
- Error handling for API failures

---

## 5. QA Engineer

**Purpose:** Define and implement test strategy; verify acceptance criteria.

**Responsibilities:**
- Write test plan in `test-strategy.md`
- Implement state machine integration tests (mandatory)
- Add unit/component tests
- Maintain test data fixtures
- Run acceptance checklist

**When to use:**
- Phase 2 (planning tests)
- Phase 6 (test implementation)
- Before submission (verification)
- After bug fixes (regression)

**Inputs:**
- `acceptance-criteria.md`
- `api-contract.md`
- Working backend/frontend

**Expected outputs:**
- Test files and CI config
- Coverage report
- Pass/fail matrix against AC-xxx
- Gaps documented

---

## 6. Reviewer

**Purpose:** Critical review of code quality, architecture adherence, security.

**Responsibilities:**
- Review PRs against `05-code-review.md` checklist
- Verify state machine not bypassed
- Check for secrets, SQL injection, missing validation
- Document findings in `code-review-notes.md`

**When to use:**
- Before merging each PR (Phase 8)
- Pre-submission final review
- After large AI-generated diffs

**Inputs:**
- Git diff or PR
- `architecture.md`, `api-contract.md`
- `.cursor/rules/05-code-review.md`

**Expected outputs:**
- Review comments (severity-tagged)
- `code-review-notes.md` entries
- Refactor recommendations

---

## 7. Documentation Writer

**Purpose:** Maintain clear, assessment-ready documentation.

**Responsibilities:**
- Keep docs in sync with implementation
- Write README setup instructions
- Complete `reflection.md` and `artifacts/tool-workflow.md`
- Organize prompt history exports

**When to use:**
- Phase 0, 9, 10
- After API/schema changes
- Before submission

**Inputs:**
- Working application
- All `/docs` files
- Prompt session exports

**Expected outputs:**
- Updated docs
- Final README
- Completed reflection
- Documentation checklist signed off

---

## 8. Debugger

**Purpose:** Systematically diagnose and fix bugs.

**Responsibilities:**
- Reproduce issues
- Trace through layers (API → service → repo → DB)
- Propose minimal fixes
- Document in `debugging-notes.md`
- Add regression test

**When to use:**
- Phase 7
- Failing tests
- Unexpected API/UI behavior

**Inputs:**
- Error messages, logs, stack traces
- `debugging-notes.md` template
- Relevant source files

**Expected outputs:**
- Root cause analysis
- Fix (minimal diff)
- Regression test
- Debugging-notes entry

---

## Agent Handoff Flow

```
Requirements Analyst
        ↓
Software Architect
        ↓
   ┌────┴────┐
Backend    Frontend
Engineer   Engineer
   └────┬────┘
        ↓
   QA Engineer
        ↓
    Reviewer
        ↓
Documentation Writer
```

Debugger invoked at any stage when issues arise.

---

## Cursor Implementation Tips

1. **Start new chat per agent role** — cleaner context, better artifact export
2. **@-mention docs** — `@docs/api-contract.md` grounds AI in spec
3. **Rules auto-apply** — `.cursor/rules/` provide stable context
4. **Export sessions** — save 10–15 to `/artifacts/prompt-history/`

---

## Related

- [implementation-plan.md](./implementation-plan.md) — phase prompts per agent
- [documentation-plan.md](./documentation-plan.md)
