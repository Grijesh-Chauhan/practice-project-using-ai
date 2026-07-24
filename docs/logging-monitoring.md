# Logging & Monitoring

**Audience:** Phase 3 implementers  
**Constraint:** Keep lightweight — local assessment, not a full observability stack.

Stdlib `logging` only. No ELK, Prometheus, or APM required for core.

---

## 1. Goals

1. Diagnose failures during development and demo.
2. Trace a failed request without logging PII or secrets.
3. Satisfy coding standards — [coding-standards.md](./coding-standards.md) Logging.

**Non-goals:** Metrics dashboards, distributed tracing vendors, log aggregation SaaS.

---

## 2. Logging Structure

| Item | Recommendation |
|------|----------------|
| Config module | `app/core/logging.py` — `configure_logging(level)` |
| Format | `%(asctime)s %(levelname)s [%(name)s] %(message)s` |
| Logger names | Hierarchical: `app`, `app.api`, `app.services`, … |
| Handlers | StreamHandler to stderr (uvicorn-compatible) |
| Libraries | Leave uvicorn access logs on in dev; no need to silence |

Call `configure_logging` once from `main.py` startup using Settings `log_level`.

---

## 3. Log Levels

| Level | Use |
|-------|-----|
| DEBUG | SQL echo only if explicitly enabled; verbose transition checks in local debug — off by default |
| INFO | Startup, shutdown, successful significant mutations (optional), request summary |
| WARNING | Handled client errors worth noticing (repeated 409s optional), deprecated usage |
| ERROR | Unhandled exceptions, commit failures, 500 path |

Never use DEBUG in “production” Settings default.

---

## 4. Request Logging

**Lightweight options (pick one):**

| Option | Pros | Cons |
|--------|------|------|
| A. Rely on uvicorn access log | Zero code | Less control over format |
| B. Simple HTTP middleware | Method, path, status, duration_ms | Small custom code |

**Recommendation:** Option A for core; Option B if you want duration and correlation id.

If middleware is added, log one line per request:

```text
INFO [app.api] method=PATCH path=/api/v1/tickets/3/status status=409 duration_ms=12 request_id=…
```

Do not log request bodies (may contain user text; noise + privacy).

---

## 5. Error Logging

| Case | Level | Include |
|------|-------|---------|
| Mapped domain error (404/409/400/422) | INFO or WARNING | `code`, path, ticket_id if any |
| Unhandled exception | ERROR | `exc_info=True` to logs only |
| DB operational error | ERROR | Exception type/message; no connection password |

Handlers: [error-handling-strategy.md](./error-handling-strategy.md).

---

## 6. Audit Logging

**Core assessment:** No `ticket_history` table required.

**Lightweight audit (optional INFO logs):**

| Event | Message fields |
|-------|----------------|
| Status transition success | `ticket_id`, `from_status`, `to_status`, `actor_id` |
| Ticket created | `ticket_id`, `created_by` |
| Comment added | `ticket_id`, `comment_id`, `created_by` |

Do not log full description/comment message bodies (PII/noise).

Stretch path: persist history table — [data-model.md](./data-model.md) Future Extensions.

---

## 7. Correlation IDs

**Appropriate?** Yes, as a **small** optional middleware — useful when debugging FE↔BE.

| Rule | Detail |
|------|--------|
| Header | Accept `X-Request-ID` if present; else generate UUID4 |
| Response | Echo `X-Request-ID` on response |
| Logging | Include `request_id` in log extra/format |
| Propagation | Not required beyond single process |

Skip entirely if time-boxed; uvicorn access logs remain enough for assessment.

---

## 8. Health & Monitoring

| Endpoint | Role |
|----------|------|
| `GET /health` | Liveness: `{"status":"ok"}` — no DB check required for core |

Optional later: readiness that pings SQLite — not mandatory.

---

## 9. Privacy Rules

- No passwords, tokens, API keys.
- Prefer user **ids** over emails in logs.
- Truncate free text if ever logged (prefer not logging message/description).

See [security.md](./security.md).

---

## 10. Minimal Implementation Checklist

- [ ] `configure_logging` on startup
- [ ] ERROR logs for 500s with stack
- [ ] No secrets in log lines
- [ ] (Optional) request_id middleware
- [ ] (Optional) INFO on status transitions

---

## Related

- [configuration-strategy.md](./configuration-strategy.md) — `LOG_LEVEL`
- [backend-architecture.md](./backend-architecture.md)
