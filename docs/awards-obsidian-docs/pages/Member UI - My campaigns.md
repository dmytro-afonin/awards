# Member UI - My campaigns

**Shell:** Member UI — requires **Member** workspace role (`CONTEXT.md`).

## Route

_TBD: e.g. `/w/.../me/campaigns`_

## Purpose

Directory of campaigns the user may open for **view** and **vote** (participation, not admin config).

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Campaign row | `Table` / `Card` | Navigate | Opens [[pages/Public campaign page]] |
| Empty state | `Card` + CTA | — | Copy for no entitlements |

## Authorization

- Member UI gate; Owner never sees this shell in same workspace.

## Related

- [[features/Campaigns]]
- [[features/Authorization model]]
