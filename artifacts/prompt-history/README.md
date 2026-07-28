# Prompt History

This folder holds exported Cursor chat/agent sessions — the assessment expects
**10–15 sessions** covering the project lifecycle (planning → implementation →
testing → debugging → review).

## Status

The project was built across **13 Cursor agent sessions**, which satisfies the
10–15 requirement. The raw session exports are **not committed as source-controlled
JSONL** because `.gitignore` intentionally excludes
`artifacts/prompt-history/*.jsonl` and `*.zip` (to avoid bloating the repo / leaking
transient content). Add the exports before final submission using the steps below.

## How to export from Cursor

1. Open the Cursor chat/agent history panel.
2. For each of the ~13 sessions, use **Export chat** and save into this folder as
   `NN-topic.md` (or `.jsonl`), e.g. `01-requirements-analysis.md`.
3. If committing JSONL/zip is desired, either rename to `.md` or remove the ignore
   lines for this folder in `.gitignore`.

## Session index (fill titles/links as you export)

| # | Phase | Topic (suggested) | Export file |
|---|-------|-------------------|-------------|
| 01 | Foundation | Engineering foundation, rules & directory structure | |
| 02 | Requirements | Requirements analysis & acceptance criteria | |
| 03 | Design | Architecture, data model, API contract | |
| 04 | Design | Backend blueprints & design-review gate | |
| 05 | Build | Backend scaffold, config, DB session | |
| 06 | Build | Domain exceptions, handlers, logging | |
| 07 | Build | Models, schemas, repositories | |
| 08 | Build | Ticket service + status state machine | |
| 09 | Build | API endpoints (tickets, comments, users) | |
| 10 | Build | Frontend: pages, hooks, forms, export UI | |
| 11 | Testing | State-machine matrix + API/component tests | |
| 12 | Docs | README, docs finalization | |
| 13 | Review | Final engineering review & core completion | |

## Related

- Tool workflow: [../tool-workflow.md](../tool-workflow.md)
- Reflection: [../../docs/reflection.md](../../docs/reflection.md)
