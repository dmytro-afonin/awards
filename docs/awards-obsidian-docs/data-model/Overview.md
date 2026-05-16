# Data model overview

Central place for **entity** list and **ERD** links. Refine into per-entity notes later (e.g. `data-model/Campaign.md`).

## Core entities

| Entity | Parent | Notes |
|--------|--------|-------|
| User | — | Auth identity; profile |
| Workspace | — | Tenancy; default vs additional |
| Membership | User, Workspace | Roles + normalized Owner |
| GranularGrant | Membership, resource? | Additive keys — see [[features/Authorization model]] |
| Campaign | Workspace | Lifecycle, visibility, slug |
| Category | Campaign | Order, overrides, voting config |
| Nominee | Category | Optional structured fields |
| Vote / Ballot | User, Category | Shape per [[features/Category voting configuration]] |
| ActivityEvent | Workspace? | [[features/Activity and audit log]] |
| Invite | Workspace | Token, snapshot — [[features/Invitations]] |
| OwnershipTransfer | Workspace | [[features/Ownership transfer]] |

## Diagram

_Add `erDiagram` Mermaid here or in [[diagrams/README]]._

## Related

- [[features/Workspaces]]
- [[features/Campaigns]]
- [[Home]]
