# Documentation Index

Engineering foundation for the Support Ticket Management System assessment project.

## Purpose

This folder contains planning, architecture, and lifecycle artifacts **before and during** implementation. These documents guide AI-assisted development and demonstrate SDLC ownership.

## Document Map

| Document | Purpose | When to Read/Update |
|----------|---------|---------------------|
| [requirements-analysis.md](./requirements-analysis.md) | Business needs, scope, assumptions | Phase 1; update if scope changes |
| [acceptance-criteria.md](./acceptance-criteria.md) | Testable success conditions | Phase 1; verify before submission |
| [implementation-plan.md](./implementation-plan.md) | Phase-wise roadmap and prompts | Phase 0–10; track progress |
| [design-notes.md](./design-notes.md) | Design decisions and trade-offs | Phase 2+ |
| [architecture.md](./architecture.md) | System structure and layers | Phase 2; update on structural changes |
| [api-contract.md](./api-contract.md) | REST endpoints and payloads | Phase 2–3; keep in sync with API |
| [data-model.md](./data-model.md) | Entities, fields, relationships | Phase 2–3; update with migrations |
| [ui-flow.md](./ui-flow.md) | Screens, navigation, UX flows | Phase 2, 4 |
| [test-strategy.md](./test-strategy.md) | Testing approach and coverage | Phase 2, 6 |
| [debugging-notes.md](./debugging-notes.md) | Issues encountered and fixes | Phase 7; append as you debug |
| [code-review-notes.md](./code-review-notes.md) | Review findings and resolutions | Phase 8 |
| [reflection.md](./reflection.md) | AI workflow lessons learned | Phase 9–10 |
| [pr-description.md](./pr-description.md) | PR template for submissions | Each PR |
| [documentation-plan.md](./documentation-plan.md) | How docs are maintained | Reference |
| [git-workflow.md](./git-workflow.md) | Branch, commit, PR strategy | Reference |
| [ai-agents.md](./ai-agents.md) | Specialized Cursor agent roles | Reference during development |
| [directory-structure.md](./directory-structure.md) | Monorepo folder layout | Phase 0 |
| [coding-standards.md](./coding-standards.md) | Language and API conventions | Reference |
| [security.md](./security.md) | Security practices for assessment | Reference |
| [project-foundation.md](./project-foundation.md) | Master engineering foundation summary | Start here |
| [design-review-gate.md](./design-review-gate.md) | Architecture/requirements review + DoR | Before Phase 3 |

### Backend implementation blueprints (Phase 3)

| Document | Purpose | When to Read/Update |
|----------|---------|---------------------|
| [backend-architecture.md](./backend-architecture.md) | Layers, DI, request lifecycle, transactions | Start of Phase 3; before coding |
| [backend-module-design.md](./backend-module-design.md) | Ticket / Comment / User module interfaces | Phase 3 module work |
| [backend-folder-guide.md](./backend-folder-guide.md) | Why each backend directory exists | Scaffolding |
| [error-handling-strategy.md](./error-handling-strategy.md) | Exception hierarchy, HTTP mapping, error JSON | Phase 3 cross-cutting |
| [configuration-strategy.md](./configuration-strategy.md) | Env vars, Settings, secrets | Scaffold + deploy config |
| [database-strategy.md](./database-strategy.md) | Alembic, seed, transactions, SQLite limits | Persistence milestones |
| [logging-monitoring.md](./logging-monitoring.md) | Lightweight logging / correlation IDs | Cross-cutting setup |
| [testing-plan-backend.md](./testing-plan-backend.md) | Backend test execution plan | Phase 3 baseline + Phase 6 |
| [implementation-order.md](./implementation-order.md) | Backend milestones, DoD, commit guidance | Day-to-day Phase 3 order |

## Related Locations

- **Cursor rules**: `.cursor/rules/` — lightweight AI context (stable project knowledge)
- **Artifacts**: `/artifacts` — prompt history, tool-workflow.md, exports
- **Scripts**: `/scripts` — bootstrap, seed, dev helpers
- **Root README**: setup and quick start (written after implementation)

## Maintenance Rules

1. Update contract docs (`api-contract`, `data-model`) when behavior changes.
2. Append to `debugging-notes` and `code-review-notes`; do not delete history.
3. Keep `acceptance-criteria` aligned with `ProjectNeed.md` and assessment rubric.
4. Export 10–15 Cursor sessions to `/artifacts/prompt-history/` before submission.
