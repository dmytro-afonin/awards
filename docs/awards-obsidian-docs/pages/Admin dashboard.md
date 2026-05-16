# Admin dashboard

**Shell:** Admin UI — `CONTEXT.md`: visible to **Owner** or **Admin** workspace role only.

## Route

_TBD: e.g. `/w/[workspaceSlug]/admin`_

## Mockups / wireframes

- Repo: `docs/admin-page-wireframe.excalidraw` — regenerate via `node scripts/generate-admin-wireframe.mjs`.
- Compare with vault [[Mockups]] as patterns emerge.

## Layout regions (stub)

| Region | Purpose |
|--------|---------|
| Top bar | Workspace switcher, user menu, notifications |
| Main | Cards / navigation into campaigns, members, settings |

## Control inventory

| Control | shadcn / pattern | Action | Consequence | Errors |
|---------|------------------|--------|---------------|--------|
| _TBD_ | Button, Card | Navigate to [[pages/Campaign list]] | Loads campaign directory | — |

## Authorization

- Gate entire route: no Member-only users (unless redirect to Member UI product-wide).

## Related features

- [[features/Workspaces]]
- [[features/Authorization model]]
- [[features/Campaigns]]

## Processes

- [[processes/Campaign lifecycle]]
