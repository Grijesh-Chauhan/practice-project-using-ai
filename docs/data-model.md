# Data Model

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Ticket    │       │   Comment   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │◄──────│ id (PK)     │
│ name        │   │   │ title       │       │ ticket_id   │
│ email       │   ├───│ created_by  │       │ message     │
│ role        │   │   │ assigned_to │───┐   │ created_by  │──┐
└─────────────┘   │   │ priority    │   │   │ created_at  │  │
                  │   │ status      │   │   └─────────────┘  │
                  └───│ description │   │                      │
                      │ created_at  │   └──────────────────────┘
                      │ updated_at  │
                      └─────────────┘
```

## Tables

### `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INTEGER | PK, autoincrement | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| role | VARCHAR(50) | NOT NULL | e.g. `agent`, `admin` |

**Seed:** 3–5 users for assignee dropdown and comment authors.

---

### `tickets`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INTEGER | PK, autoincrement | |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | NOT NULL | |
| priority | VARCHAR(20) | NOT NULL | `low`, `medium`, `high` |
| status | VARCHAR(20) | NOT NULL, DEFAULT `Open` | See state machine |
| assigned_to | INTEGER | FK → users.id, NULLABLE | |
| created_by | INTEGER | FK → users.id, NOT NULL | |
| created_at | DATETIME | NOT NULL | UTC |
| updated_at | DATETIME | NOT NULL | UTC |

**Indexes (recommended):**
- `idx_tickets_status`
- `idx_tickets_created_by`
- `idx_tickets_assigned_to`

---

### `comments`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INTEGER | PK, autoincrement | |
| ticket_id | INTEGER | FK → tickets.id, NOT NULL, ON DELETE CASCADE | |
| message | TEXT | NOT NULL | |
| created_by | INTEGER | FK → users.id, NOT NULL | |
| created_at | DATETIME | NOT NULL | UTC |

**Index:** `idx_comments_ticket_id`

---

## Enumerations

### TicketStatus
| Value | Terminal? |
|-------|-----------|
| Open | No |
| In Progress | No |
| Resolved | No |
| Closed | Yes |
| Cancelled | Yes |

### Priority
`low` | `medium` | `high`

### UserRole (seed only)
`agent` | `admin` — not enforced in core schema

---

## State Machine (Domain Rule)

Not stored as separate table. Enforced in application layer.

```
Open ──► In Progress ──► Resolved ──► Closed
  │            │
  │            └──► Cancelled
  └──► Cancelled
```

---

## SQLAlchemy Model Conventions

- Table names: plural snake_case (`tickets`, `users`, `comments`)
- Model classes: singular PascalCase (`Ticket`, `User`, `Comment`)
- Use `Mapped[str]`, `mapped_column`, `relationship()` (SQLAlchemy 2.x style)
- `Ticket.comments`: one-to-many, ordered by `created_at` asc
- `Ticket.assignee` / `Ticket.creator`: many-to-one to `User`

---

## Alembic

- Initial migration: create all three tables
- Subsequent migrations: one concern per revision
- Location: `backend/alembic/versions/`

---

## Seed Data Strategy

Script: `scripts/seed_db.py` or Alembic data migration.

**Users:** 3 users (1 admin, 2 agents)  
**Tickets:** 5–10 tickets across all statuses for demo  
**Comments:** 2–3 per active ticket

Seed must be idempotent or documented as "reset DB first."

---

## Assumptions

- No soft delete; tickets are permanent for assessment
- `assigned_to` nullable = unassigned
- Description required on create (empty string rejected)

---

## Future Extensions (Stretch)

- `ticket_history` audit table for status changes
- `users.password_hash` for auth
- UUID primary keys
