# Public campaign page

**Shell:** Voter-facing campaign URL — **not** Admin UI or Member shell (`CONTEXT.md`).

## Route

_TBD: e.g. `/c/[slug]` or `/w/.../c/[slug]`_

## Visibility

- **Public campaign:** anonymous **view** where product allows; **vote** requires signed-in user.
- **Private campaign:** **not found** if no entitlement.

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Nominee card / row | `Card`, `RadioGroup` or `ToggleGroup` | Select nominee | Depends on [[features/Category voting configuration]] |
| Submit / Save vote | `Button` | Persist ballot | [[processes/Cast and change vote]] |
| Sign in to vote | `Button` | Auth | Required for vote on public campaigns |

## Authorization

- Everyone with entitlement uses this page to vote, including Owner and Admin.

## Related

- [[features/Campaigns]]
- [[features/Voting]]
- [[features/Category voting configuration]]
