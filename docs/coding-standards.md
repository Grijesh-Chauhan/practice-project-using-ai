# Coding Standards

Concise, production-ready standards for the Support Ticket Management monorepo.

---

## Python

| Topic | Standard |
|-------|----------|
| Version | 3.13+ |
| Formatter | Black (line length 88) |
| Linter | Ruff (select E, F, I, UP, B) |
| Types | MyPy strict on `app/`; type all public functions |
| Imports | stdlib → third-party → local; absolute imports |
| Naming | `snake_case` functions/vars; `PascalCase` classes |
| Docstrings | Public service methods only; Google style optional |
| Async | Sync routes OK for SQLite assessment; consistent style |

---

## FastAPI

| Topic | Standard |
|-------|----------|
| Routes | Thin; delegate to services |
| Prefix | `/api/v1` |
| Responses | Pydantic `response_model` on all endpoints |
| Status codes | 201 create, 200 read/update, 404 not found, 422 validation |
| Dependencies | `Depends()` in `api/deps.py` |
| Routers | One file per resource in `endpoints/` |
| Exception handlers | Map domain exceptions in `main.py` |

---

## SQLAlchemy

| Topic | Standard |
|-------|----------|
| Style | 2.x declarative with `Mapped`, `mapped_column` |
| Tables | Plural snake_case |
| Relationships | Explicit `back_populates` |
| Queries | Repository layer only |
| Migrations | Alembic; never edit DB manually |

---

## React & TypeScript

| Topic | Standard |
|-------|----------|
| Components | Functional only; named exports for pages |
| Files | `PascalCase.tsx` components; `camelCase.ts` utils |
| Props | Explicit interfaces; no `any` |
| Hooks | Prefix `use`; one concern per hook |
| State | TanStack Query for server; local for UI |
| CSS | MUI `sx` and theme; avoid inline styles spam |
| Imports | React → libs → local → types |

---

## REST APIs

| Topic | Standard |
|-------|----------|
| Nouns | `/tickets`, `/users` (plural) |
| Methods | GET list/detail, POST create, PATCH partial update |
| IDs | Integer path params `/tickets/{id}` |
| Filtering | Query params, not POST body |
| Errors | JSON `{"detail": "...", "code": "..."}` |
| Dates | ISO 8601 UTC strings in JSON |
| Versioning | `/api/v1` prefix |

---

## Validation

| Layer | Tool |
|-------|------|
| API input | Pydantic v2 models |
| API output | Pydantic response models |
| Frontend forms | Zod + React Hook Form |
| Business rules | Service layer (state machine) |
| DB | NOT NULL, FK constraints in migrations |

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| API fields (JSON) | snake_case | `created_by`, `assigned_to` |
| DB columns | snake_case | `created_at` |
| TS types | PascalCase | `Ticket`, `TicketStatus` |
| TS variables | camelCase | `ticketId` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |
| Branches | `cursor/<desc>` | `cursor/status-machine` |

---

## Logging

| Level | Usage |
|-------|-------|
| INFO | Request start/end, startup |
| WARNING | Recoverable issues, 4xx patterns |
| ERROR | 5xx, unhandled exceptions |
| DEBUG | Dev only; never in production config |

**Rules:** No passwords, tokens, or full PII in logs.

---

## Exception Handling

**Backend:**
```python
# Domain exception → HTTP mapping
InvalidStatusTransition → 409
TicketNotFound → 404
ValidationError → 422 (Pydantic automatic)
```

**Frontend:**
- Axios interceptor extracts `detail`
- User-friendly message in toast/alert
- Log technical details to console in dev only

---

## Configuration

| Component | Source |
|-----------|--------|
| Backend | `pydantic-settings` + `.env` |
| Frontend | `import.meta.env.VITE_*` |
| Example files | `.env.example` (committed) |
| Secrets | Never committed |

---

## Testing

| Rule | Detail |
|------|--------|
| Naming | `test_<what>_<expected>` |
| Isolation | Fresh DB state per test |
| Fixtures | `conftest.py` for client, users |
| Mandatory | State machine integration matrix |
| Mocking | Mock external services only; use real DB for integration |

---

## Security

See [security.md](./security.md). Minimum: validate input, no secrets, parameterized queries.

---

## Documentation

| What | Where |
|------|-------|
| API spec | `docs/api-contract.md` + FastAPI OpenAPI |
| Setup | `README.md` |
| Decisions | `docs/design-notes.md` |
| Code | Self-documenting; comments for non-obvious rules only |

---

## Pre-Commit (Enforced)

1. Ruff check + format
2. Black
3. MyPy
4. Trailing whitespace / EOF fixer

---

## Related

- `.cursor/rules/02-python-backend.md`
- `.cursor/rules/03-react-frontend.md`
- `.cursor/rules/04-testing.md`
