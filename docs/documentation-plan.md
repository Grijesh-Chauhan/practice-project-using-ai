# Documentation Plan

## Purpose

Define what documentation exists, when to create/update it, and how it supports the AI-assisted SDLC assessment.

---

## Document Lifecycle

| Phase | Documents to Create/Update |
|-------|---------------------------|
| 0 — Foundation | directory-structure, git-workflow, coding-standards, security, ai-agents, .cursor/rules |
| 1 — Requirements | requirements-analysis, acceptance-criteria |
| 2 — Design | architecture, design-notes, data-model, api-contract, ui-flow, design-review-gate |
| 2b — Backend blueprints | backend-architecture, backend-module-design, backend-folder-guide, error-handling-strategy, configuration-strategy, database-strategy, logging-monitoring, testing-plan-backend, implementation-order |
| 3–5 — Build | Follow implementation-order; update contract docs as needed; debugging-notes (append) |
| 6 — Testing | test-strategy (finalize), testing-plan-backend execution, coverage notes |
| 7 — Debug | debugging-notes (append) |
| 8 — Review | code-review-notes |
| 9 — Docs | README (final), reflection |
| 10 — Submit | pr-description, artifacts/tool-workflow.md, prompt exports |

---

## Document Purposes

### requirements-analysis.md
**Purpose:** Capture business needs, scope, assumptions, risks.  
**Audience:** You, AI agents, assessor.  
**Update when:** Scope changes or ambiguities resolved.

### acceptance-criteria.md
**Purpose:** Testable definition of done.  
**Audience:** QA mindset, assessor.  
**Update when:** New requirements added.

### implementation-plan.md
**Purpose:** Phase roadmap with prompts and checklists.  
**Audience:** Daily execution guide.  
**Update when:** Phase completed or replanned.

### design-notes.md
**Purpose:** Decision log with rationale.  
**Audience:** Future you, reviewers.  
**Update when:** Significant design choice made.

### architecture.md
**Purpose:** System structure, layers, data flow.  
**Audience:** Architects, AI context.  
**Update when:** Structural change.

### api-contract.md
**Purpose:** REST API specification (source of truth for FE/BE).  
**Audience:** Frontend, backend, tests.  
**Update when:** Any endpoint change.

### data-model.md
**Purpose:** Schema, relationships, enums, seed strategy.  
**Audience:** Backend, migrations.  
**Update when:** Schema change.

### ui-flow.md
**Purpose:** Screens, navigation, user journeys.  
**Audience:** Frontend implementation.  
**Update when:** UX change.

### test-strategy.md
**Purpose:** What to test, how, coverage targets.  
**Audience:** QA, CI setup.  
**Update when:** New test tier added.

### debugging-notes.md
**Purpose:** Issue journal for assessment artifact.  
**Audience:** Assessor, team.  
**Update when:** Non-trivial bug fixed.

### code-review-notes.md
**Purpose:** Review findings and resolutions.  
**Audience:** Assessor.  
**Update when:** Review session completed.

### reflection.md
**Purpose:** Honest AI workflow retrospective.  
**Audience:** Assessor, Part C form.  
**Update when:** Project end.

### pr-description.md
**Purpose:** PR template for consistent reviews.  
**Audience:** Git workflow.  
**Update when:** Template needs new sections.

### README.md (root)
**Purpose:** Quick start, setup, run, test commands.  
**Audience:** Anyone cloning repo.  
**Update when:** Setup steps change.

### docs/README.md
**Purpose:** Index of all docs.  
**Audience:** Navigation.  
**Update when:** New doc added.

### Backend Phase 3 blueprints
**Purpose:** Implementation-ready backend engineering guides (no application source).  
**Documents:** `backend-architecture`, `backend-module-design`, `backend-folder-guide`, `error-handling-strategy`, `configuration-strategy`, `database-strategy`, `logging-monitoring`, `testing-plan-backend`, `implementation-order`.  
**Audience:** Backend implementers / Cursor agents.  
**Update when:** Implementation discovers a missing convention (prefer linking to locked contracts over rewriting).

---

## Artifacts Folder (`/artifacts`)

| File/Folder | Purpose |
|-------------|---------|
| `tool-workflow.md` | Part A assessment — AI workflow description |
| `prompt-history/` | 10–15 exported Cursor chat sessions |
| `screenshots/` | Optional UI evidence |

---

## Cursor Rules vs Docs

| `.cursor/rules/` | `/docs/` |
|------------------|----------|
| Concise, stable, token-efficient | Detailed, evolving, human-readable |
| AI context during coding | Assessment artifacts and specs |
| 7 focused files | Full planning corpus |

**Rule:** Put stable conventions in rules; put detailed specs in docs. Reference docs from rules by path.

---

## Maintenance Principles

1. **Single source of truth:** api-contract for API; data-model for schema.
2. **Append-only logs:** debugging-notes, code-review-notes.
3. **Date changelogs:** api-contract, design-notes.
4. **No duplicate specs:** Link instead of copy.

---

## Pre-Submission Doc Checklist

- [ ] All docs in table above exist and are non-empty
- [ ] acceptance-criteria aligned with working app
- [ ] reflection.md completed
- [ ] artifacts/tool-workflow.md completed
- [ ] 10–15 prompt exports in artifacts/
- [ ] Root README has working setup steps
