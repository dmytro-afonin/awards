# Campaign lifecycle

## Actors

- Owner, Admin (with granular rights), scheduler/cron (same code path as manual — `CONTEXT.md`).

## Preconditions / postconditions

Document each transition in [[features/Campaigns]]:

- draft ↔ ready (revert allowed if not started)
- → started (manual or schedule; **cannot** start if end in past)
- → finished (from started only)
- **Validation:** single shared path for manual and scheduled triggers.

## Steps (outline)

1. User or job requests transition.
2. Load campaign with lock or version check.
3. Validate state graph + datetime rules.
4. Persist + emit [[features/Activity and audit log]].

## Diagram

_Add Mermaid `stateDiagram-v2` in this note or link exported PNG from [[diagrams/README]]._

## Related pages

- [[pages/Campaign editor]]
- [[pages/Single campaign admin]]

## Edge cases

- [[edge-cases/Index]]
