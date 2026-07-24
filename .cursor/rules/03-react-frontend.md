# React Frontend Standards

## Layout
`frontend/src/{components,pages,hooks,api,types,utils,theme}` — see `docs/directory-structure.md`.

## Patterns
- **Pages**: route-level composition only.
- **Components**: presentational; accept props, emit callbacks.
- **Hooks**: TanStack Query for server state; custom hooks for reusable logic.
- **API layer**: Axios instance in `api/client.ts`; one module per resource (`tickets.ts`, `comments.ts`).

## Forms
React Hook Form + Zod resolver. Mirror backend validation. Show field-level and API errors.

## State
- Server state: TanStack Query (cache keys per resource).
- UI state: local `useState` unless shared → React Context sparingly.
- Do not duplicate business rules (e.g., status transitions) — call backend; display errors.

## Routing
React Router v6+. List, detail, create/edit routes. 404 page for unknown routes.

## UI
Material UI components. Consistent spacing via theme. Accessible labels on all inputs.

## Types
Shared TypeScript interfaces in `types/`. Align with `docs/api-contract.md`.

## Error Handling
Axios interceptor maps API errors to user-friendly messages. Toast or inline alert for failures.

## CSV Export
Client-side export of tickets returned from API (filter self-created on backend or client per contract).
