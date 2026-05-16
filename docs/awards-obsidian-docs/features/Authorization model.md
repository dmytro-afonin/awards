# Authorization model

**Source of truth (repo):** `CONTEXT.md` — workspace roles, granular permissions, additive model, Member hard ceiling, UI shell gates.

## Summary

- **Workspace roles:** Owner, Admin, Member — baseline capabilities.
- **Granular permissions:** Scoped (workspace / campaign / category); **additive only** for Owner and Admin — no explicit denies.
- **Member hard ceiling:** Member cannot receive structural/editorial rights beyond view + vote.
- **Owner–Admin normalization:** Workspace owner stored as Owner only; no redundant Admin row.
- **Owner–Member exclusivity:** Owner never gets Member UI in that workspace.
- **Surfaces:** Admin UI = Owner or Admin role; Member UI = Member role; voting only on [[pages/Public campaign page]].

## Reconciliation with `docs.md`

`docs.md` lists a fine-grained tree (`can_view`, `can_vote`, `can_modify`, …). **Spec task:** map each intended capability to:

1. **Role baseline** vs **stored granular key**, and  
2. **Scope** (workspace / campaign / category).

Document the matrix in this note or in [[data-model/Overview]].

## Data model (stub)

_TBD: tables for membership, role assignments, granular grants (resourceId + permissionKey)._

## API / invariants (stub)

- Private campaign / missing entitlement → **not found** (indistinguishable).
- All mutations validate authz before write.

## Related features

- [[features/Workspaces]]
- [[features/Campaigns]]
- [[features/Invitations]]

## Related pages

- [[pages/Admin dashboard]]
- [[pages/Settings]]

## Edge cases

- [[edge-cases/Index]]
