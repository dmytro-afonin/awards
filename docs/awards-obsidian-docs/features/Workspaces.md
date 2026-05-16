# Workspaces

**Glossary:** `CONTEXT.md` — **Workspace**, **Default workspace**, **Additional workspace**, **Workspace deletion**, **Retention**, **Owner-at-delete**, **Leaving a workspace**.

## Scope

Tenancy boundary: members, campaigns, roles. Default workspace auto-created per user; additional workspaces creatable by user; soft-delete + 1-year restore for additional only.

## Data model (stub)

_TBD: workspace table, membership (userId, workspaceId, roles[] normalized), isDefault flag per user, deletedAt, ownerUserId._

## Authorization

- Owner-only: delete additional workspace, initiate ownership transfer, restore during retention.
- See [[features/Authorization model]].

## Related

- [[features/Ownership transfer]]
- [[features/Invitations]]
- [[features/Campaigns]]

## Processes

- [[processes/Workspace soft delete and restore]]
- [[processes/Ownership transfer]]

## Pages

- [[pages/Workspace switcher and lifecycle]]
- [[pages/Admin dashboard]] (workspace context)
