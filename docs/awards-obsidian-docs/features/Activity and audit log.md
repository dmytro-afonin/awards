# Activity and audit log

> **Glossary:** `docs.md` — log all actions with entities, prev/new fields, userId; feed in user menu; notification prefs filter **display** only — DB always records.

## Scope

Immutable (or append-only) activity stream for compliance and “my feed”; optional rollback story — clarify product scope (“restore change” vs audit-only).

## Data model (stub)

_TBD: event type enum, actorUserId, resource refs, payload JSON (diff), createdAt; user feed subscription / mute matrix._

## Authorization

- Write: system on successful mutations.
- Read: per-user feed filtered by prefs; admin audit view TBD.

## Pages

- [[pages/Settings]] (notification preferences)
- User menu / activity surface — _TBD page note_

## Related

- All feature notes that mutate state should link here for **events emitted**.
