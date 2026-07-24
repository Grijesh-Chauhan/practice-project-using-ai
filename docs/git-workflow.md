# Git Workflow

Professional Git strategy for the Support Ticket Management monorepo.

---

## Branch Strategy

### Main Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Stable, assessment-ready code | No direct pushes; PR only |

### Working Branches

| Pattern | Example | Use |
|---------|---------|-----|
| `cursor/<ticket>-<summary>` | `cursor/core-status-machine` | Features, fixes |
| `cursor/docs-<topic>` | `cursor/docs-api-contract` | Documentation-only |
| `cursor/fix-<issue>` | `cursor/fix-cors-export` | Bug fixes |

**Cloud Agents:** Must use `cursor/<ticket>-<summary>` — never push to `main` directly.

---

## Branch Naming Convention

```
cursor/<optional-ticket-id>-<kebab-case-description>
```

**Good:** `cursor/TICKET-1-backend-scaffold`, `cursor/status-integration-tests`  
**Avoid:** `fix`, `updates`, `wip`, personal names

---

## Commit Message Convention

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `test` | Add/update tests |
| `docs` | Documentation only |
| `chore` | Tooling, deps, config |
| `refactor` | Code change, no behavior change |
| `ci` | CI/CD changes |

### Scopes

`backend`, `frontend`, `docs`, `scripts`, `ci`

### Examples

```
feat(backend): add ticket status transition service
test(backend): parametrize invalid status transition cases
docs(api): document CSV export endpoint
chore(frontend): initialize vite react typescript project
fix(frontend): show API error on invalid status change
```

### Rules

- Subject: imperative mood, ≤72 chars, no period
- One logical change per commit when possible
- Reference acceptance criteria in body if helpful: `Closes AC-015`

---

## Pull Request Workflow

```
1. Create branch from main
2. Implement + test locally
3. Push branch to origin
4. Open PR using docs/pr-description.md template
5. CI passes (pytest, frontend tests, lint)
6. Self-review checklist complete
7. Squash merge to main
8. Delete branch
```

### PR Guidelines

- **Size:** Small, reviewable (< 400 lines ideal)
- **Title:** Same as conventional commit subject
- **Description:** Summary, test plan, checklist
- **Draft PRs:** OK for work-in-progress visibility

### Review Checklist

See `.cursor/rules/05-code-review.md` and `docs/code-review-notes.md`.

---

## Release / Submission Tags

Optional tag at submission: `v1.0.0-assessment`

---

## .gitignore

Root `.gitignore` covers:
- Python (`__pycache__`, `.venv`, `.uv`)
- Node (`node_modules`, `dist`)
- SQLite (`*.db`)
- Environment (`.env`)
- IDE (`.vscode` except examples, `.idea`)
- Cursor logs
- OS files (`.DS_Store`)
- Coverage and pytest cache
- Local DB data (`backend/data/*.db`)

---

## Pre-Commit Hooks

Configured in `.pre-commit-config.yaml` (to be added in Phase 0):

| Hook | Tool |
|------|------|
| Lint | Ruff |
| Format | Black |
| Types | MyPy |
| General | trailing whitespace, EOF, YAML check |

Install: `uv run pre-commit install`

---

## What Not to Commit

- `.env` files with secrets
- SQLite database files with real data
- `node_modules/`, `.venv/`
- Prompt exports containing sensitive client data
- API keys, tokens, certificates

---

## Merge Strategy

**Recommended:** Squash merge — clean linear history on `main`.

**Avoid:** Force push to `main` / `master`.

---

## Related

- [.cursor/rules/07-git-workflow.md](../.cursor/rules/07-git-workflow.md)
- [pr-description.md](./pr-description.md)
