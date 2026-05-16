# Workspace soft delete and restore

## Preconditions

- **Additional** workspace only (`CONTEXT.md`).
- Acting user is **owner**.

## Soft delete

1. Confirm in [[pages/Workspace switcher and lifecycle]] (`AlertDialog`).
2. Set `deletedAt`; hide from active lists; retain data for **retention** period (**one year**).

## Restore

- **Owner-at-delete** only, within retention window.
- Reverse `deletedAt`; audit event.

## Post-retention

- Workspace **no longer restorable**; final disposal = ops detail.

## Related

- [[features/Workspaces]]
