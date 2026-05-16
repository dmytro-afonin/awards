# Single campaign admin

**Shell:** Admin UI.

## Route

_TBD: e.g. `/w/.../campaigns/[id]`_

## Mockup

![[single_campaign.png]]

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Edit campaign | `Button` | Navigate | [[pages/Campaign editor]] |
| Manage categories | `Button` | Navigate | [[pages/Categories admin]] |
| Nominees | `Button` / embedded table | CRUD | [[features/Nominees]] |
| Lifecycle | `Button`, `AlertDialog` confirm | start/finish/revert | [[processes/Campaign lifecycle]] |

## Related

- [[features/Campaigns]]
- [[pages/Campaign editor]]
- [[pages/Categories admin]]
