# AI-Assisted Full-Stack Development Exercise

## Base Rules

- No manual coding. All code/files must be generated using an AI tool.
- **Tool:** Cursor (everyone already has access).
- Develop the application as if it were a real production project with full ownership and gradual progression.

---

# Development Timeline

The exercise is **self-paced** and should be completed within **one week**.

There is **no mandatory day-wise plan**. Share your work by the agreed deadline.

### Expected Effort

The mandatory **Core** project is designed to take approximately **8–12 focused hours**.

The remaining time should be invested in:

- Requirement analysis
- Prompt history
- Testing
- Debugging notes
- Reflection

These lifecycle artifacts are a major part of the evaluation. **Do not expand the Core application at the expense of these artifacts.**

### Important Dates

| Activity | Deadline |
|----------|----------|
| GitHub Repository Submission | **21st July** |
| Mentor Assessment | **31st July** |

---

# Common Technical Requirements

Every submission must include:

- Frontend application (any JavaScript library/framework)
- Backend API (any Python framework)
- Database persistence
- Database setup or migration scripts
- Seed/sample data
- Input validation
- Error handling
- At least one working search/filter capability (Core)
- At least one meaningful test tier (Core)
- README with setup instructions
- Prompt history (export of **10–15 Cursor chat sessions**)
- Planning, design, testing, debugging, review, reflection, and PR artifacts inside an `/artifacts` folder

---

# Database Requirement

Use **any RDBMS**.

Provide:

- Database choice
- Setup instructions
- Schema/migration/initialization scripts
- Seed data
- Environment variable example (if applicable)
- Steps to run locally

---

# Authentication

Authentication is **optional**.

If implemented well, it counts as **Stretch** work.

Examples:

- Login/Logout
- JWT or Session authentication
- Role-based access
- Protected routes
- API authorization

---

# What You Get Out of It

You will receive a feedback report covering:

- Your strengths
- Growth areas
- Concrete next steps for improving your AI workflow
- Your current position in the AI capability framework
- Recommendations for moving forward

This is intended as a **development snapshot**, not an exam grade.

Your competency owner may also use this as one input into your normal growth discussions.

## Feedback Areas

Feedback focuses on:

- Requirement analysis
- Prompting and context-setting
- AI tool workflow
- Full-stack design
- Code quality
- Database design
- Testing depth
- Debugging
- Code review
- Documentation
- Ownership
- Responsible AI judgment

---

# Exercise Structure

| Part | Focus | Weight |
|------|-------|--------|
| Part A | AI Workflow Foundation | 20% |
| Part B | Full-Stack Mini Project (Core + Stretch) | 60% |
| Part C | Submission & Reflection | 20% |

> **Note:** Part C is completed through the participation form where you submit your repository and answer reflection questions. These percentages indicate effort allocation rather than exam marks.

---

# Part A – AI Workflow Foundation

## Objective

Demonstrate that you understand how AI should be used in a practical software engineering workflow—not merely as a code generator.

## Expected Submission

Create a document named:

```
tool-workflow.md
```

Include the following sections:

1. Primary AI tool used
2. How project context is provided to the AI
3. Requirement analysis workflow
4. Planning and design workflow
5. Code generation workflow
6. Validation of AI-generated code
7. Testing workflow
8. Debugging workflow
9. Code review workflow
10. Information intentionally not shared with AI
11. How this workflow would be reused on a real project

---

# Part B – Full-Stack Mini Project

## Project

**Support Ticket Management System**

---

## Business Context

A small application for managing support tickets.

Internal users should be able to:

- Create tickets
- Update tickets
- Comment on tickets
- Search tickets
- Move tickets through a defined lifecycle

---

# Core (Mandatory)

## Entities

### User

Seeded only (no user-management UI required)

| Field |
|-------|
| id |
| name |
| email |
| role |

---

### Ticket

| Field |
|-------|
| id |
| title |
| description |
| priority |
| status |
| assignedTo |
| createdBy |
| createdAt |
| updatedAt |

---

### Comment

| Field |
|-------|
| id |
| ticketId |
| message |
| createdBy |
| createdAt |

---

# Required Features

- Create a ticket
- List tickets
- View ticket details
- Update ticket fields
  - title
  - description
  - priority
  - assignee
- Change ticket status using the enforced state machine
- Add comments
- Persist all data (survive application restart)
- Backend validation of required fields
- Meaningful frontend error handling
- Export all self-generated tickets (with details) as CSV

---

# Status State Machine

This is the primary evaluation area.

## Allowed Transitions

```text
Open
 ├──> In Progress
 │      ├──> Resolved
 │      │      └──> Closed
 │      └──> Cancelled
 └──> Cancelled
```

### Valid Transitions

- Open → In Progress
- In Progress → Resolved
- Resolved → Closed
- Open → Cancelled
- In Progress → Cancelled

### Requirements

- Invalid transitions **must be rejected by the backend**
- The frontend should display clear error messages

---

# Mandatory Testing Requirement

Integration tests must verify:

- Valid transitions succeed
- Invalid transitions are rejected

---

# Stretch Goals (Optional – Evidence toward C1.1)

Possible enhancements:

- Richer data model
- Full User CRUD
- User roles
- Authentication
- Protected routes
- API authorization
- Swagger/OpenAPI documentation
- Docker setup
- Reusable prompt templates
- AI rules/specifications

---

# Core Acceptance Criteria

The following must work successfully:

- Create a ticket through the UI
- View all tickets
- Open ticket detail page
- Update ticket fields
- Reassign tickets
- Add comments
- Status changes only through valid transitions
- Invalid transitions are rejected
- Data survives restart
- Backend validation prevents invalid records
- No secrets committed to Git
- Export self-generated tickets as CSV
- State-machine integration tests pass

---

# Part C – Submission & Reflection

Your repository should include:

- Working frontend
- Working backend
- Database persistence
- Database setup/migration scripts
- Seed data
- README
- Basic tests
- Prompt history
- Requirement analysis
- Design notes
- Reflection
- Pull Request description

> Missing artifacts won't prevent feedback, but the assessment and recommendations will focus on those gaps.

---