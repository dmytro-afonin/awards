# Ownership transfer

## State machine (summary)

`pending` → `accepted` | `declined` | `cancelled` | `expired` (14 days — `CONTEXT.md`).

## Steps (outline)

1. Current owner opens chooser (prior owner outcome: Admin / Member / leave — product enum).
2. Recipient receives in-app + email; accepts or declines.
3. Owner may cancel while pending.
4. On accept: apply role changes; **Owner–Admin normalization** for new owner.

## Related

- [[features/Ownership transfer]]
- [[pages/Workspace switcher and lifecycle]]

## Diagram

_Sequence diagram: initiator, system, recipient, email — add under [[diagrams/README]] pattern._
