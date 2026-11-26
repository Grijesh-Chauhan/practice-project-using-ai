# Roles and Access Control
Fictional assessment roles:
- Requester: creates tickets and views tickets they are permitted to access.
- Support Agent: works on assigned or authorized queues.
- Team Lead: assigns/reassigns tickets and escalates issues.
- Administrator: manages users, projects, configuration and access policies.
Apply authorization on the server for every operation. Hiding frontend buttons is not sufficient. Check project membership and ticket-level permissions before returning data. AI tool calls must use the authenticated user's identity and permissions. Never reveal another user's private ticket, internal notes, passwords, tokens or API keys.
