# Configuration Strategy

**Audience:** Phase 3 implementers  
**Standards:** [coding-standards.md](./coding-standards.md), [security.md](./security.md)

Defines environment variables, settings loading, and secret handling for the FastAPI backend. Lightweight — assessment scope only.

---

## 1. Approach

| Decision | Choice |
|----------|--------|
| Library | `pydantic-settings` v2 |
| Module | `app/core/config.py` |
| Single instance | `get_settings()` with `lru_cache` (or Settings singleton) |
| File | `.env` in `backend/` (gitignored); commit `.env.example` |

Frontend env (`VITE_*`) is out of scope here — see root/frontend `.env.example` in Phase 4.

---

## 2. Environment Variables

| Variable | Required | Default (dev) | Purpose |
|----------|----------|---------------|---------|
| `DATABASE_URL` | Yes* | `sqlite:///./data/tickets.db` | SQLAlchemy URL |
| `APP_NAME` | No | `Support Ticket API` | OpenAPI title |
| `APP_ENV` | No | `development` | `development` \| `production` \| `test` |
| `LOG_LEVEL` | No | `INFO` | Root/app log level |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated origins |
| `API_V1_PREFIX` | No | `/api/v1` | Mount prefix (locked value) |

\*Required in the sense “must resolve”; default may be baked into Settings for local DX.

**Do not add** for core: JWT secrets, third-party API keys, cloud credentials.

---

## 3. Settings Management

Logical settings fields (implement as typed Settings model):

| Field | Type | Notes |
|-------|------|-------|
| `database_url` | `str` | From `DATABASE_URL` |
| `app_name` | `str` | |
| `app_env` | `str` | Drive debug/logging behavior |
| `log_level` | `str` | |
| `cors_origins` | `list[str]` | Parse from CSV string |
| `api_v1_prefix` | `str` | Default `/api/v1` |

**Rules:**
- Use `SettingsConfigDict(env_file=".env", extra="ignore")`.
- Prefer field aliases matching env names.
- Validate `app_env` membership if helpful.
- SQLite relative paths: resolve relative to `backend/` working directory (document in README that uvicorn is run from `backend/`).

---

## 4. Configuration Loading

```
Process start
  → load .env (if present)
  → overlay real environment variables (env wins)
  → construct Settings
  → create engine from settings.database_url
  → configure logging from settings.log_level
  → create FastAPI(title=settings.app_name)
  → CORSMiddleware(allow_origins=settings.cors_origins)
```

**Tests:** Override `DATABASE_URL` to in-memory or temp file via env or fixture monkeypatch; do not use the developer’s `data/tickets.db`.

**Alembic:** Read the same URL (via `env.py` importing Settings or `sqlalchemy.url` in `alembic.ini` pointing at sqlite path). Prefer one source of truth — Settings — over duplicated hardcoding.

---

## 5. Development vs Production vs Test

| Concern | Development | Production (if ever) | Test |
|---------|-------------|----------------------|------|
| `APP_ENV` | `development` | `production` | `test` |
| Reload | uvicorn `--reload` | no reload | N/A |
| DB | File under `data/` | File or future Postgres URL | Memory/temp file |
| CORS | localhost:5173 | Explicit deploy origins only | Minimal / test client |
| Log level | DEBUG optional | INFO | WARNING often enough |
| Docs UI | `/docs` enabled | May disable later | Enabled |
| Stack in responses | Never | Never | Never |

Assessment is **local-only**; production column is forward guidance only — do not build deploy pipeline in core.

---

## 6. Secret Handling

| Practice | Rule |
|----------|------|
| Commit | `.env.example` only — placeholders, no real secrets |
| Gitignore | `.env`, `*.db`, `data/` |
| Code | No hardcoded passwords/tokens |
| Logs | Never log full `DATABASE_URL` if it ever contains credentials; SQLite file path OK |
| Future auth | Store JWT secret only in env; rotate if leaked |

This assessment has **no required secrets**. Treat any future secret per [security.md](./security.md).

---

## 7. `.env.example` Contents (Specification)

Document these keys (values are examples, not secrets):

```
APP_NAME=Support Ticket API
APP_ENV=development
LOG_LEVEL=INFO
DATABASE_URL=sqlite:///./data/tickets.db
CORS_ORIGINS=http://localhost:5173
API_V1_PREFIX=/api/v1
```

---

## 8. Consumer Map

| Consumer | Uses |
|----------|------|
| `db/session.py` | `database_url` |
| `main.py` | CORS, app title, prefix, logging init |
| `logging.py` | `log_level`, `app_env` |
| Alembic `env.py` | `database_url` |
| `scripts/seed_db.py` | Same Settings / engine |
| Tests | Overrides via env/fixtures |

---

## Related

- [database-strategy.md](./database-strategy.md)
- [logging-monitoring.md](./logging-monitoring.md)
- [backend-architecture.md](./backend-architecture.md)
