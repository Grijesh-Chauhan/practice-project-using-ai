# UI Flow

## 1. Navigation Map

```
┌──────────────────────────────────────────────────┐
│  App Shell (Header + Nav)                        │
│  [Tickets]  [Create Ticket]  [Export My Tickets] │
└──────────────────────────────────────────────────┘
         │
         ├── /tickets          → Ticket List Page
         ├── /tickets/new      → Create Ticket Page
         ├── /tickets/:id      → Ticket Detail Page
         └── /tickets/:id/edit → Edit Ticket Page (optional; can inline on detail)
```

**Default route:** Redirect `/` → `/tickets`

---

## 2. Screen Specifications

### 2.1 Ticket List (`/tickets`)

**Purpose:** Browse and search all tickets.

**Elements:**
- Search input (debounced, queries `q` param)
- Filter chips/dropdowns: Status, Priority
- Data table: ID, Title, Status, Priority, Assignee, Created, Updated
- Row click → navigate to detail
- FAB or button: "Create Ticket"
- Button: "Export My Tickets" (CSV download)

**States:**
- Loading: skeleton or spinner
- Empty: "No tickets found"
- Error: alert with retry

---

### 2.2 Create Ticket (`/tickets/new`)

**Purpose:** Create new ticket (status = Open).

**Form fields:**
| Field | Control | Validation |
|-------|---------|------------|
| Title | Text input | Required, max 255 |
| Description | Multiline | Required |
| Priority | Select | Required, enum |
| Assignee | Autocomplete/select | Optional, from users API |

**Actions:**
- Submit → POST ticket → redirect to detail
- Cancel → back to list

**Errors:** Inline field errors + API error banner

---

### 2.3 Ticket Detail (`/tickets/:id`)

**Purpose:** View full ticket, change status, add comments.

**Sections:**

**Header:** Title, status badge, priority badge

**Details card:**
- Description (read-only or edit toggle)
- Assignee, Created by, timestamps

**Status actions:**
- Dropdown or button group showing only **valid next statuses** from current state
- On invalid attempt (if UI allows): show API error message
- *Recommendation:* Only render allowed transitions to reduce errors

**Valid next statuses by current state:**
| Current | Show options |
|---------|--------------|
| Open | In Progress, Cancelled |
| In Progress | Resolved, Cancelled |
| Resolved | Closed |
| Closed | *(none — read-only)* |
| Cancelled | *(none — read-only)* |

**Edit fields:** Link/button to edit title, description, priority, assignee (PATCH)

**Comments section:**
- List: author name, timestamp, message — chronological ascending (`created_at` ASC — oldest first)
- Form: textarea + "Add Comment" (available even when status is Closed/Cancelled)

---

### 2.4 Edit Ticket (inline or `/tickets/:id/edit`)

**Purpose:** Update non-status fields.

**Fields:** Title, Description, Priority, Assignee  
**Note:** Status changed only via dedicated status control on detail page.

---

## 3. User Flows

### Flow A: Create and Assign Ticket
1. User opens Create Ticket
2. Fills form, selects assignee
3. Submits → lands on detail with status Open
4. Ticket appears in list

### Flow B: Progress Ticket to Closed
1. Open detail (status: Open)
2. Change status → In Progress
3. Add comment "Working on it"
4. Change status → Resolved
5. Change status → Closed
6. Status controls disabled

### Flow C: Cancel from Open
1. Open detail (status: Open)
2. Change status → Cancelled
3. Verify terminal state

### Flow D: Invalid Transition (Error Handling)
1. Attempt API-invalid transition (e.g., via dev tools or UI bug)
2. Backend returns error
3. UI shows: "Cannot transition from Open to Closed"
4. Status unchanged

### Flow E: Search Tickets
1. On list page, type in search
2. Table filters by title/description
3. Combine with status filter

### Flow F: Export CSV
1. Click "Export My Tickets"
2. Browser downloads CSV
3. File contains only current user's created tickets

---

## 4. Active User (No Auth)

**Assumption:** Header bar shows "Logged in as: Alice (demo)" using default seeded user.

Config: `VITE_DEFAULT_USER_ID=1` in frontend `.env.example`

---

## 5. Responsive Behavior

- MUI responsive grid
- Table scrolls horizontally on mobile
- Forms stack vertically on small screens

---

## 6. Accessibility

- All form inputs have `<label>` or `aria-label`
- Status badges include text (not color-only)
- Focus management after navigation

---

## 7. Wireframe (ASCII)

```
┌────────────────────────────────────────────┐
│ Support Tickets          [Export] [+ New]    │
├────────────────────────────────────────────┤
│ [Search...        ] [Status ▼] [Priority ▼] │
├────┬──────────────┬────────┬────────┬─────┤
│ ID │ Title        │ Status │ Priority│ ... │
├────┼──────────────┼────────┼────────┼─────┤
│ 1  │ Login issue  │ Open   │ high   │     │
└────┴──────────────┴────────┴────────┴─────┘
```

---

## 8. Related Documents

- [api-contract.md](./api-contract.md)
- [acceptance-criteria.md](./acceptance-criteria.md)
