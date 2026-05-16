# Invite accept

**Shell:** Minimal chrome or marketing wrapper; may redirect to auth.

## Route

_TBD: e.g. `/invite/[token]`_

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Accept | `Button` | Consume invite | Membership created — [[processes/Invite acceptance]] |
| Decline | `Button` | Dismiss | No membership |
| Sign in required | `Card` + `Button` | OAuth / email | Resume token after session |

## Related

- [[features/Invitations]]
