# AI Tool Workflow

Part A assessment artifact. Describes how AI (Cursor) was used across the SDLC to
build the Support Ticket Management System. See `ProjectNeed.md` Part A for the
required section list.

## 1. Primary AI Tool Used

**Cursor** (agent + inline edits) was the single AI tool for the whole project:
planning, code generation, test authoring, debugging, and code review. All source
code and documentation were produced through Cursor per the assessment's
"no manual coding" rule. Models were used through Cursor's agent for multi-file
changes and through inline edits for local refactors.

## 2. How Project Context is Provided to the AI

Context was layered so the agent stayed grounded without re-explaining the project
each time:

- **`.cursor/rules/`** — seven concise, always-on rule files (project context,
  Python/backend, React/frontend, testing, code review, documentation, git). These
  encode stable conventions cheaply in tokens.
- **`/docs` as source of truth** — requirements, acceptance criteria, API
  contract, data model, coding standards, and backend blueprints were written
  first and then `@`-mentioned in prompts (e.g. "implement per `@api-contract.md`").
- **`api-contract.md` as the FE/BE seam** — the same contract drove backend
  schemas and the frontend TypeScript types, preventing drift.
- **Locked decisions** — invalid status → `409`, `/api/v1` prefix, and
  CSV-fields-only export were "locked" in docs so the agent did not relitigate them.

## 3. Requirement Analysis Workflow

Starting from `ProjectNeed.md`, Cursor helped turn the brief into:

- `requirements-analysis.md` — functional/non-functional requirements with IDs
  (FR-01…FR-16, NFR-01…NFR-07), explicit assumptions, and resolved questions.
- `acceptance-criteria.md` — testable AC-xxx conditions with an FR→AC traceability
  matrix, so "done" was defined before coding.

The key move was forcing ambiguities (e.g. "what is the active user without auth?")
into **locked assumptions** (`X-User-Id` header) rather than leaving them implicit.

## 4. Planning and Design Workflow

Design docs were generated and reviewed before implementation:

- `architecture.md`, `data-model.md`, `api-contract.md`, `ui-flow.md`.
- Backend blueprints (`backend-architecture`, `backend-module-design`,
  `error-handling-strategy`, `database-strategy`, `logging-monitoring`,
  `testing-plan-backend`, `implementation-order`).
- A `design-review-gate.md` acted as a Definition-of-Ready checkpoint before any
  application code was written.

`implementation-plan.md` broke the work into phases/milestones with the exact
Cursor prompts to use at each step.

## 5. Code Generation Workflow

- **Layer by layer, milestone by milestone**: models → schemas → repositories →
  services → API endpoints → cross-cutting (exceptions, logging, CORS) → frontend.
- Prompts referenced the relevant rule + doc, e.g. "Act as backend engineer
  (`@02-python-backend.md`), implement the ticket service state machine per
  `@business-rules.md`/`@api-contract.md`."
- The agent produced thin routes delegating to services, with the state machine
  centralized in `TicketService.transition_status` and a single `ALLOWED_TRANSITIONS`
  table — matching the planned architecture.

## 6. Validation of AI-Generated Code

Every change was validated before being accepted:

- **Static gates**: Ruff, Black, MyPy (strict) on the backend; ESLint, `tsc`,
  Prettier on the frontend — all wired into pre-commit and CI.
- **Read the diff**: generated code was reviewed against the coding standards and
  the API contract (field names, status codes, error envelope).
- **Run it**: `uv run pytest`, `npm test`, and manual `curl`/UI checks. The final
  review even booted uvicorn against a seeded DB and exercised `/tickets/export`
  end to end.

## 7. Testing Workflow

Tests were treated as executable specification:

- **State machine** (mandatory): a parametrized 5×5 matrix as a unit test plus
  integration tests asserting `409 INVALID_STATUS_TRANSITION` for every disallowed
  or same-status transition, and `200` for the five valid ones.
- **API integration**: CRUD, validation (422), `X-User-Id` (400), comments on
  terminal tickets, search/filter, and CSV export (content-type, own-tickets-only,
  filters, 400 without header).
- **Frontend**: Vitest + React Testing Library for `TicketForm`, `StatusSelector`,
  `CommentList`, `TicketTable`, and the API error mapper.
- **CI**: GitHub Actions runs both suites on every push/PR.

## 8. Debugging Workflow

- Reproduce with a focused failing test first, then ask Cursor to explain and fix.
- Common patterns captured in `docs/debugging-notes.md` (SQLite test isolation,
  CORS, route ordering `/export` before `/{id}`, Axios blob-vs-JSON error bodies).
- Notable real bug found in final review: CSV export shipped as a `501` stub with a
  test that locked the stub in place — see `docs/rca-csv-export-stub.md`.

## 9. Code Review Workflow

- Self-review against `.cursor/rules/05-code-review.md` and `code-review-notes.md`
  checklists (severity-tagged findings + resolutions).
- A final "Principal Engineer" review pass over the whole repo verified the
  implementation against every doc, ran all static analysis and tests, and applied
  only safe improvements (completing the documented-but-stubbed export, seeding
  sample tickets, adding missing search/export tests, correcting stale docs).

## 10. Information Intentionally Not Shared with AI

- No secrets, credentials, or tokens were ever placed in prompts, code, tests, or
  docs. `.env` files are gitignored; only `.env.example` is committed.
- No real user PII — seed data uses obviously fake names/emails (`alice@example.com`).
- No proprietary/internal company information beyond the public assessment brief.
- UI micro-styling was largely left to the agent's judgment rather than
  specifying pixel-level wireframes, to focus effort on lifecycle artifacts.

## 11. How This Workflow Would Be Reused on a Real Project

- **Docs-as-context first**: write requirements, an API contract, and coding
  standards, then keep them in-repo and `@`-mention them — this is the highest-leverage
  habit for keeping AI output consistent.
- **Rules for stable conventions**: `.cursor/rules/` scales well; put durable
  conventions there and link to detailed docs.
- **Locked decisions**: record irreversible choices explicitly to stop the agent
  from re-deciding them.
- **Gates before trust**: lint + types + tests + CI make AI output safe to accept
  quickly; tests-as-spec catch regressions like the export stub.
- **Human ownership at the seams**: architecture boundaries, security decisions,
  and the final "does this actually run?" check remain human-owned.
