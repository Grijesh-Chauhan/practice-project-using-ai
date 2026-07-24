# Documentation Standards

## When to Update
- New endpoint → `docs/api-contract.md`
- Schema change → `docs/data-model.md` + Alembic migration
- UI flow change → `docs/ui-flow.md`
- Bug fix pattern → `docs/debugging-notes.md`
- Review finding → `docs/code-review-notes.md`

## Doc Style
- Markdown in `/docs`. Concise, scannable headings.
- Use tables for fields, endpoints, transitions.
- Document assumptions explicitly.

## Code Comments
Prefer self-documenting code. Comment only non-obvious business rules (e.g., why a transition is blocked).

## API Docs
FastAPI auto-generates OpenAPI at `/docs` — keep response models accurate.

## Artifacts
Export 10–15 Cursor chat sessions to `/artifacts/prompt-history/`.
Update `artifacts/tool-workflow.md` per assessment Part A requirements.

## README
Setup instructions must work from clean clone. Include env example, migrate, seed, run commands.

## Reflection
Update `docs/reflection.md` at project end with honest AI workflow assessment.
