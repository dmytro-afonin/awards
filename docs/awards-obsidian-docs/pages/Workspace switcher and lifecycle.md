# Workspace switcher and lifecycle

**Shell:** Admin UI (and possibly global app chrome).

## Purpose

- Switch active workspace context.
- Create **additional** workspace.
- Owner: soft-delete additional workspace, restore during retention.
- Owner: start / manage [[processes/Ownership transfer]].

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Workspace `Select` / `DropdownMenu` | `DropdownMenu`, `Command` | Change context | Reloads scoped data |
| Create workspace | `Dialog` + `Form` | Submit | New [[features/Workspaces]] |
| Delete workspace | `AlertDialog` | Confirm soft-delete | [[processes/Workspace soft delete and restore]] |
| Restore | `Button` (banner when in deleted state) | Restore | Owner-at-delete only |
| Transfer ownership | `Dialog` flow | Pending transfer | [[processes/Ownership transfer]] |

## Related

- [[features/Workspaces]]
- [[features/Ownership transfer]]
