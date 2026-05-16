# Member UI - My votes

**Shell:** Member UI.

## Route

_TBD: e.g. `/w/.../me/votes`_

## Purpose

Cross-campaign voting status and history for the signed-in user.

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Row link | `Button` link variant | Open campaign | [[pages/Public campaign page]] |
| Revoke / change | `Button` | Mutate ballot | Only if [[features/Category voting configuration]] allows |

## Related

- [[features/Voting]]
- [[processes/Cast and change vote]]
