# Invitations

**Glossary:** `docs.md` — invite link; inviter needs add/remove users rights; link may encode default role/permissions. Align with `CONTEXT.md` membership and [[features/Authorization model]].

## Scope

Invite users into a workspace; optional pre-assigned workspace role and granular template.

## Data model (stub)

_TBD: invite token, workspaceId, createdBy, expiresAt, intended roles/permissions snapshot, consumedBy, consumedAt._

## Authorization

- Only users with invite capability (Owner/Admin + granular as defined).
- Accept flow: see [[processes/Invite acceptance]].

## Related

- [[features/Workspaces]]
- [[features/Authorization model]]

## Pages

- [[pages/Invite accept]]

## Processes

- [[processes/Invite acceptance]]
