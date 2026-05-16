# Campaign list

**Shell:** Admin UI (primary); may mirror simplified list elsewhere.

## Route

_TBD: e.g. `/w/.../campaigns`_

## Mockup

![[campaigns.png]]

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| New campaign | `Button` | Open create flow / modal | Creates draft — [[features/Campaigns]] |
| Row / card click | `Table` or `Card` | Navigate | [[pages/Single campaign admin]] or editor |
| Filters | `Input`, `Select` | Narrow list | Query params or client filter |

## Authorization

- List visible campaigns user can **view** administratively (not same as voter entitlement).

## Related

- [[features/Campaigns]]
- [[pages/Campaign editor]]
