# Reflection

Honest retrospective on the AI-assisted workflow used to build the Support Ticket
Management System. Time figures are good-faith estimates.

## 1. Project Summary

**What was built:** A Support Ticket Management System — FastAPI + SQLAlchemy +
Alembic backend on SQLite, and a React + TypeScript + Vite + MUI + TanStack Query
frontend. Features: ticket CRUD, an enforced status state machine, comments,
search/filter, and per-user CSV export, with backend and frontend test suites and
CI.

**Time allocation (estimate):**

| Activity | Hours |
|----------|-------|
| Foundation & planning (rules, docs, contracts) | ~3 |
| Backend implementation | ~3 |
| Frontend implementation | ~3 |
| Testing | ~2 |
| Debugging | ~1 |
| Documentation & artifacts | ~2 |
| **Total** | **~14** |

---

## 2. AI Workflow Effectiveness

### What worked well
- Writing the **API contract and acceptance criteria first** gave the agent a
  stable target and kept the backend and frontend in sync.
- **Layered generation** (models → schemas → repositories → services → API) kept
  each change small, reviewable, and independently testable.
- **Strict static gates** (Ruff/Black/MyPy strict, ESLint/tsc/Prettier) meant AI
  output was safe to accept quickly; the whole repo stayed green.

### What did not work well
- A milestone (CSV export + sample-ticket seeding) was left as a **501 stub**, and
  a test was written to assert the stub — so CI stayed green while a core feature
  was actually missing. AI happily "completed" a milestone that wasn't done.
- Some docs (root README) drifted and kept describing a "scaffold" long after the
  app was built — AI did not proactively reconcile narrative docs with reality.

### Most valuable Cursor features used
- [x] Project rules (`.cursor/rules/`)
- [x] @-mentions of docs/files
- [x] Agent mode for multi-file changes
- [x] Test-driven prompts
- [x] Code review / final review pass
- [x] Other: locked-decision docs to prevent re-litigation

---

## 3. Prompting Patterns

### Effective prompts (examples)
```
Act as a backend engineer following @.cursor/rules/02-python-backend.md.
Implement the ticket status state machine in the service layer per
@docs/business-rules.md and @docs/api-contract.md. Reject invalid and
same-status transitions with 409 INVALID_STATUS_TRANSITION. Add a
parametrized integration test covering the full 5x5 matrix.
```
```
Review the entire repository against @docs/acceptance-criteria.md. List any
core requirement that is documented but not actually implemented, then fix
only those gaps with tests.
```

### Ineffective prompts (and why)
```
"Finish milestone 8."
```
Too coarse: the agent stubbed the endpoint and marked it done. Naming the exact
deliverable ("return CSV for X-User-Id with columns …, and a test that fails if
it returns 501") would have prevented the stub.

---

## 4. Context Management

**How was project context provided to AI?**
- `.cursor/rules/` for stable conventions
- `/docs` as source of truth, `@`-mentioned per prompt
- `api-contract.md` as the FE/BE seam
- Locked decisions (409, `/api/v1`, CSV-fields-only)

**What context was intentionally withheld?**
- Secrets/credentials (none ever shared; `.env` gitignored)
- Real PII (seed data is fake)
- Detailed UI wireframes (delegated styling to the agent)

---

## 5. Validation of AI-Generated Code

**How did you verify AI output?**
- [x] Read diff carefully
- [x] Ran tests (`uv run pytest`, `npm test`)
- [x] Manual API testing (curl against a seeded DB)
- [x] Manual UI testing
- [x] Compared against api-contract

**Example of caught AI mistake:** the CSV export endpoint returned `501` while the
frontend and repository were fully wired for it — caught in the final review by
checking each acceptance criterion against running code rather than against CI.

---

## 6. Testing & Debugging with AI

**How did AI help with tests?** Generated the parametrized transition matrix and
API/integration tests from the test strategy, then extended coverage to search and
export during review.

**How did AI help with debugging?** Explained a MyPy `valid-type` error caused by a
method named `list` shadowing the `list[...]` builtin in a return annotation; fix
was `builtins.list[Ticket]`, matching the repository's existing pattern.

**Example debug session:** see `docs/debugging-notes.md` and the RCA in
`docs/rca-csv-export-stub.md`.

---

## 7. Code Review with AI

**Was AI review useful?** Yes. A structured full-repo review pass found the export
stub, stale README, a seed gap, and missing search/export tests, and fixed them.

**False positives / missed issues:** the earlier per-milestone reviews missed the
export stub because they trusted green CI; the lesson is to verify features against
*running behavior*, not just passing tests.

---

## 8. Responsible AI Judgment

**When did you override AI suggestions?** Kept the naive-UTC timestamp behavior as a
documented limitation instead of a large timezone refactor mid-review (smallest safe
change). Declined to fabricate prompt-history exports.

**Technical decisions made without AI:** the layered architecture boundaries, the
"backend is the sole authority for the state machine" rule, and the decision to
treat the export stub as an in-scope bug fix (documented, required, partially built)
rather than a new feature.

---

## 9. Growth Areas

| Area | Current level | Next step |
|------|---------------|-----------|
| Requirement analysis | Strong (IDs, traceability) | Keep AC ↔ running-app checks continuous |
| Architecture | Strong (clean layering) | Add lightweight ADRs for locked decisions |
| Prompting | Strong | Always name the exact, testable deliverable |
| Testing | Strong | Add a "no NOT_IMPLEMENTED in prod code" guard |
| Debugging | Good | Capture more sessions in debugging-notes as they happen |

---

## 10. Reuse on Real Projects

**What from this workflow would you reuse?**
1. Docs-as-context (contract + standards) `@`-mentioned in prompts.
2. `.cursor/rules/` for durable conventions + strict CI gates.
3. Tests-as-specification, especially for critical logic (state machine).

**What would you change?**
1. Never let a test assert a stub; add a check that fails on `501/NOT_IMPLEMENTED`
   in shipped endpoints.
2. Reconcile narrative docs (README/status) against reality at each milestone.

---

## 11. Assessment Part C Questions (Draft Answers)

**Repository URL:** _(fill in on submission)_

**Biggest learning:** Green CI is necessary but not sufficient — a feature can be
"tested" and still be a stub. Verify acceptance criteria against running software.

**Biggest challenge:** Keeping the AI honest about "done" across milestones and
keeping documentation in sync with the actual implementation.

**AI capability self-assessment:** Comfortable directing AI across the full SDLC
with docs-as-context, strict gates, and human ownership of architecture, security,
and final verification.

---

## 12. Related Artifacts

- Prompt history: `/artifacts/prompt-history/`
- Tool workflow: `/artifacts/tool-workflow.md`
- PR description: [pr-description.md](./pr-description.md)
- RCA sample: [rca-csv-export-stub.md](./rca-csv-export-stub.md)
