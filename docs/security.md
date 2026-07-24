# Security

Basic security practices suitable for this assessment. **Not over-engineered** — proportional to a local demo app with optional auth.

---

## 1. Secrets Management

| Practice | Implementation |
|----------|----------------|
| No secrets in Git | `.env` gitignored; `.env.example` with placeholders |
| No hardcoded keys | Use environment variables |
| Rotate if leaked | Immediate removal + rotation if accidental commit |

---

## 2. Input Validation

| Layer | Control |
|-------|---------|
| API | Pydantic v2 — type, length, enum constraints |
| Business | Service layer state machine and rules |
| DB | NOT NULL, FK, length limits in schema |

**Reject:** Oversized strings, invalid enums, malformed IDs.

---

## 3. SQL Injection Prevention

- Use SQLAlchemy ORM / parameterized queries only
- **Never** concatenate user input into raw SQL strings
- Repository layer encapsulates all queries

---

## 4. Authentication & Authorization (Core)

**Core assessment:** No auth required.

**Interim approach:** `X-User-Id` header for demo user context.

**Risks accepted for assessment:**
- Any client can impersonate any user ID
- Document as known limitation

**Stretch (if implemented):**
- JWT or session cookies
- Hash passwords with bcrypt/argon2
- Protect routes by role
- Never store plaintext passwords

---

## 5. CORS

```python
# Development only — explicit origins
allow_origins=["http://localhost:5173"]
allow_credentials=True
allow_methods=["GET", "POST", "PATCH", "OPTIONS"]
allow_headers=["Content-Type", "X-User-Id"]
```

**Do not** use `allow_origins=["*"]` with credentials.

---

## 6. Error Handling

| Do | Don't |
|----|-------|
| Return generic message to client | Expose stack traces |
| Log full exception server-side | Log secrets or passwords |
| Use consistent error JSON | Leak internal paths |

---

## 7. HTTP Headers (Stretch)

If deploying beyond localhost:
- Consider security headers middleware (CSP, X-Content-Type-Options)
- Not required for local assessment

---

## 8. Dependency Security

| Practice | Tool |
|----------|------|
| Pin versions | `pyproject.toml`, `package-lock.json` |
| Audit (optional) | `uv pip audit`, `npm audit` |
| Minimal deps | Only add what is needed |

---

## 9. CSV Export

| Risk | Mitigation |
|------|------------|
| Data leak across users | Server filters by `created_by` from `X-User-Id` |
| CSV injection | Escape fields starting with `=`, `+`, `-`, `@` if exporting user content |

---

## 10. File System

- SQLite DB in `backend/data/` — gitignored
- No user file uploads in core (no upload attack surface)

---

## 11. Pre-Commit & CI Checks

- Secret scanning (manual review + gitignore)
- No `.env` in staged files
- Optional: `detect-secrets` pre-commit hook (stretch)

---

## 12. Security Review Checklist

Before submission:

- [ ] No API keys, tokens, or passwords in repo history
- [ ] `.env.example` has no real values
- [ ] CORS restricted to dev origin
- [ ] All inputs validated via Pydantic
- [ ] State machine cannot be bypassed via direct DB edit from API
- [ ] Error responses do not include stack traces

---

## 13. Known Limitations (Document in README)

1. No authentication in core — header-based user impersonation
2. SQLite — not hardened for multi-tenant production
3. No rate limiting
4. No HTTPS in local dev

---

## Related

- [requirements-analysis.md](./requirements-analysis.md) — auth optional
- `.cursor/rules/05-code-review.md`
