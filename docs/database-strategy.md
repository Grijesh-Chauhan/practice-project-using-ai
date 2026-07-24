# Database Strategy

**Audience:** Phase 3 implementers  
**Schema source of truth:** [data-model.md](./data-model.md)  
**Architecture:** [architecture.md](./architecture.md) §2 Persistence

Covers migrations, seed, transactions, connection lifecycle, SQLite limits, and a future Postgres path. No migration/application source code here.

---

## 1. Migration Strategy

| Rule | Detail |
|------|--------|
| Tool | Alembic |
| Location | `backend/alembic/versions/` |
| Initial revision | Create `users`, `tickets`, `comments` + indexes/FKs from data-model |
| Later revisions | One concern per revision (add column, add index, …) |
| Autogenerate | Allowed as draft; **always review** before committing |
| Manual DB edits | Forbidden for shared/demo DB — always migrate |
| Downgrade | Implement `downgrade()` for initial revision at minimum |

**Workflow:**
1. Change SQLAlchemy models.
2. `alembic revision --autogenerate -m "…"` (from `backend/`).
3. Review upgrade/downgrade; ensure SQLite-compatible ops.
4. `alembic upgrade head`.
5. Commit revision with the model change.

**Alembic `env.py`:** Import `Base.metadata` and all models; use Settings `database_url` — [configuration-strategy.md](./configuration-strategy.md).

**SQLite DDL limits:** Some ALTER operations are constrained; prefer additive changes. If a complex change is needed, use batch mode (`render_as_batch=True` for SQLite) — enable if autogenerate/alter fails.

---

## 2. Seed Strategy

| Item | Spec |
|------|------|
| Script | `scripts/seed_db.py` |
| Users | 3 (1 admin, 2 agents) — [data-model.md](./data-model.md) |
| Tickets | 5–10 across all statuses |
| Comments | 2–3 on active tickets |
| Idempotency | Prefer upsert-by-email for users; or document “delete DB / upgrade fresh then seed” |
| Not in Alembic | Prefer app script over data migration for demo content (easier to re-run) |

**Seed rules:**
- Use the same engine/session as the app.
- Run **after** `alembic upgrade head`.
- Do not import production PII.
- Tickets must satisfy FK and state values exactly (`Open`, `In Progress`, …).

**Tests:** Do not depend on seed script; factories/fixtures only — [testing-plan-backend.md](./testing-plan-backend.md).

---

## 3. Transaction Strategy

Aligned with [backend-architecture.md](./backend-architecture.md) §8:

| Layer | May | Must not |
|-------|-----|----------|
| Repository | `add`, `flush`, queries | `commit`, `rollback` |
| Service | `commit` on success; `rollback` on error | Leave dirty session after failed mutate |
| API | — | Manage transactions |

**Isolation:** Default SQLite / SQLAlchemy session isolation is sufficient. No explicit isolation level tuning for assessment.

**Long requests:** Export builds CSV in-process from query results; keep queries bounded by `limit` (contract max 100).

---

## 4. Connection Lifecycle

```
Settings.database_url
  → create_engine(...)          # once at import/startup
  → SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
  → get_db(): yield Session; close in finally
```

| Setting | Recommendation |
|---------|----------------|
| `autoflush` | `False` — flush explicitly when needing IDs mid-use-case, or rely on commit |
| `autocommit` | `False` |
| `expire_on_commit` | Default `True` OK; refresh/return after commit carefully in service |
| `check_same_thread` | For SQLite + FastAPI sync: `connect_args={"check_same_thread": False}` on engine |

**Engine lifecycle:** One engine per process. Do not create engines per request.

**File path:** Ensure `backend/data/` exists before first connect (create in startup or document mkdir in bootstrap).

---

## 5. SQLite Limitations (Accepted)

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Write concurrency | Single writer | Fine for local demo |
| ALTER TABLE | Limited | Batch migrations; additive schema |
| Full-text | No built-in FTS required | `LIKE` search on title/description |
| Types | Affinity / weaker enforcement | Still declare types; validate in Pydantic |
| Network | File only | Not multi-host |

Documented trade-off: [design-notes.md](./design-notes.md) §2.

**Foreign keys:** Enable on each connection:

```text
PRAGMA foreign_keys=ON
```

via SQLAlchemy `event.listen(engine, "connect", …)` — required so `assigned_to` / `ON DELETE CASCADE` behave.

---

## 6. Indexes & Integrity

Create in initial migration per [data-model.md](./data-model.md):

- `idx_tickets_status`, `idx_tickets_created_by`, `idx_tickets_assigned_to`
- `idx_comments_ticket_id`
- UNIQUE on `users.email`
- FK: tickets → users; comments → tickets (CASCADE), comments → users

---

## 7. Future Migration Path (Postgres)

When leaving assessment scope:

| Step | Action |
|------|--------|
| 1 | Set `DATABASE_URL=postgresql+psycopg://…` |
| 2 | Add driver dependency; keep SQLAlchemy 2.x models |
| 3 | Re-run migrations on empty Postgres (or generate diff if needed) |
| 4 | Remove SQLite-only `check_same_thread` / batch quirks |
| 5 | Connection pool defaults become useful; tune `pool_size` |
| 6 | Keep layered code unchanged — URL is the main switch |

**Do not** abstract a repository “port” solely for this; URL swap is enough for this codebase size.

---

## 8. Operational Checklist (Dev)

- [ ] `mkdir -p data` (or bootstrap)
- [ ] `alembic upgrade head`
- [ ] `python ../scripts/seed_db.py` (from backend or via documented path)
- [ ] Confirm `data/tickets.db` gitignored
- [ ] Restart uvicorn → data still present (NFR persistence)

---

## Related

- [configuration-strategy.md](./configuration-strategy.md)
- [backend-folder-guide.md](./backend-folder-guide.md)
- [implementation-order.md](./implementation-order.md)
