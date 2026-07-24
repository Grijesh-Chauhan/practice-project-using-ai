# Project Foundation

Master summary of the engineering foundation for the Support Ticket Management System. **Start here** before implementation.

---

## Project Overview

| Item | Value |
|------|-------|
| **Application** | Support Ticket Management System |
| **Purpose** | AI-assisted full-stack engineering assessment |
| **Repository** | Monorepo: `backend/`, `frontend/`, `docs/`, `artifacts/`, `scripts/` |
| **Timeline** | ~8–12 hours core app + lifecycle artifacts |
| **Evaluation** | SDLC workflow, not just code generation |

---

## Tech Stack Summary

### Backend
Python 3.13+ · FastAPI · Pydantic v2 · SQLAlchemy 2.x · Alembic · SQLite · Uvicorn · Pytest · HTTPX · **UV** · Ruff · Black · MyPy · Pre-commit

### Frontend
React · TypeScript · Vite · Material UI · TanStack Query · Axios · React Router · React Hook Form · Zod · **npm**

---

## Architecture Decision

**Layered monolith** with dependency injection:

```
API → Service → Repository → SQLAlchemy → SQLite
```

**Critical rule:** Status state machine enforced in **Service layer** with mandatory integration tests.

---

## Cursor Configuration

### Why Lightweight Rules (not one large file)?

| Benefit | Explanation |
|---------|-------------|
| Token efficiency | AI loads only relevant context per task |
| Maintainability | Update backend rules without touching frontend |
| Reusability | Rules apply across many chat sessions |
| Clarity | Each file has single responsibility |

### Rule Files

| File | Why It Exists |
|------|---------------|
| `01-project-context.md` | Stable overview: scope, stack, state machine, assumptions |
| `02-python-backend.md` | Backend patterns: layers, DI, tooling |
| `03-react-frontend.md` | Frontend patterns: Query, forms, API layer |
| `04-testing.md` | Test requirements especially state machine |
| `05-code-review.md` | PR review checklist |
| `06-documentation.md` | When/how to update docs |
| `07-git-workflow.md` | Branches, commits, PR conventions |

---

## Git Strategy Summary

| Topic | Convention |
|-------|------------|
| Main branch | `main` (protected) |
| Feature branches | `cursor/<ticket>-<summary>` |
| Commits | Conventional Commits: `feat(backend): ...` |
| PRs | Template in `docs/pr-description.md`; squash merge |
| Ignore | Python, Node, SQLite, env, IDE, OS — see `.gitignore` |

Full detail: [git-workflow.md](./git-workflow.md)

---

## AI Agents Summary

Eight specialized roles: Requirements Analyst, Software Architect, Backend Engineer, Frontend Engineer, QA Engineer, Reviewer, Documentation Writer, Debugger.

Full detail: [ai-agents.md](./ai-agents.md)

---

## Documentation Corpus

| Category | Key Files |
|----------|-----------|
| Requirements | requirements-analysis, acceptance-criteria |
| Design | architecture, design-notes, data-model, api-contract, ui-flow |
| Execution | implementation-plan |
| Quality | test-strategy, debugging-notes, code-review-notes |
| Submission | reflection, pr-description, README |

Index: [docs/README.md](./README.md)  
Plan: [documentation-plan.md](./documentation-plan.md)

---

## Key Assumptions

1. **No auth in core** — `X-User-Id` header + default seeded user
2. **SQLite** — local file persistence, Alembic migrations
3. **Self-created CSV export** — filter by `created_by = current user`
4. **Search** — query params on list endpoint (no Elasticsearch)
5. **Priority** — `low`, `medium`, `high`

---

## State Machine (Non-Negotiable)

```
Open → In Progress → Resolved → Closed
  │         │
  │         └──→ Cancelled
  └──→ Cancelled
```

All other transitions: **backend rejects**.

---

## Security Posture

- Input validation (Pydantic)
- No secrets in repo
- SQLAlchemy parameterized queries
- CORS whitelist for localhost
- No auth in core (documented limitation)

Full detail: [security.md](./security.md)

---

## Next Steps

1. Review [implementation-plan.md](./implementation-plan.md) — Phase 0 checklist
2. Run bootstrap script (when created)
3. Begin Phase 3 backend with `@docs/api-contract.md` context
4. Export Cursor sessions to `/artifacts/prompt-history/` as you go

---

## Deliverables Checklist (Assessment)

- [ ] Working frontend + backend
- [ ] Migrations + seed data
- [ ] State machine integration tests passing
- [ ] CSV export working
- [ ] `/docs` complete
- [ ] `/artifacts/tool-workflow.md`
- [ ] 10–15 prompt exports
- [ ] `docs/reflection.md`
- [ ] README with setup instructions

---

## Related Source

- Assessment requirements: `/ProjectNeed.md`
- Cursor rules: `/.cursor/rules/`
