# Git Workflow

## Branches
- `main` — stable, deployable. Protected.
- `cursor/<ticket>-<short-description>` — feature/fix branches (e.g., `cursor/TICKET-12-status-machine`).

## Commits
Conventional Commits: `type(scope): subject`
- Types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `ci`
- Example: `feat(backend): enforce ticket status state machine`

## Pull Requests
- One logical change per PR. Link to doc or issue if applicable.
- Template in `docs/pr-description.md`.
- Require: tests pass, self-review checklist, no secrets.
- Squash merge to `main` preferred.

## What Not to Commit
- `.env`, `*.db`, `node_modules/`, `.venv/`, coverage reports, prompt exports with sensitive data.

## Pre-Commit
Hooks run Ruff, Black, MyPy (backend) before commit. Fix failures before pushing.

## Tags (Optional)
`v0.1.0` at assessment submission milestone.
