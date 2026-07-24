# Project Context

## What This Is
Support Ticket Management System — monorepo assessment project (FastAPI + React).

## Core Capabilities
Create, update, assign, view, list, search tickets; add comments; export self-created tickets as CSV.

## Status State Machine (Backend Enforced)
- Open → In Progress | Cancelled
- In Progress → Resolved | Cancelled
- Resolved → Closed
- All other transitions: **reject with 4xx**

## Stack
- Backend: Python 3.13+, FastAPI, SQLAlchemy 2.x, Alembic, SQLite, UV
- Frontend: React, TypeScript, Vite, MUI, TanStack Query, Axios, React Router, RHF + Zod

## Architecture
Layered: API → Service → Repository → Persistence. Use dependency injection.

## Constraints
- UV only (no pip). npm for frontend.
- No secrets in repo. SQLite for local dev.
- Auth is optional stretch — not required for core.

## Assumptions
- Single internal user context for core (seeded users; no user-management UI).
- "Self-created tickets" = tickets where `createdBy` matches the active user (default seeded user until auth added).
- Search = filter by title/description/status/priority (backend query params).

## Artifact Locations
- Planning: `/docs`
- Prompt exports: `/artifacts/prompt-history`
- Scripts: `/scripts`
