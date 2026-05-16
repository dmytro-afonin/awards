# Ownership transfer

**Glossary:** `CONTEXT.md` — **Workspace ownership transfer**; additional workspaces only; chooser for prior owner; accept/decline/cancel; 14-day expiry; in-app + email notifications.

## Scope

Reassign Owner of an **additional** workspace; not applicable to default workspace.

## Data model (stub)

_TBD: transferId, workspaceId, fromUserId, toUserId, status (pending|accepted|declined|cancelled|expired), priorOwnerOutcome enum, createdAt, expiresAt._

## Authorization

- Initiate: current workspace owner.
- Accept/decline: recipient.
- Cancel: initiator while pending.

## Related

- [[features/Workspaces]]

## Processes

- [[processes/Ownership transfer]]

## Pages

- [[pages/Workspace switcher and lifecycle]] (entry points for transfer UI)
