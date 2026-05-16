# Voting

**Glossary:** `CONTEXT.md` — votes only on [[pages/Public campaign page]]; entitlement for private campaigns; [[features/Category voting configuration]].

## Scope

Cast, replace, or withdraw selections subject to campaign + category voting windows and per-category ballot rules.

## Data model (stub)

_TBD: voteId or composite (userId, categoryId), selections[], version or updatedAt for optimistic concurrency, revokedAt nullable._

## Authorization

- Must be signed-in user.
- **can_vote** (or equivalent effective permission) on campaign/category.
- Anonymous: no vote (public campaign view only).

## Related

- [[features/Campaigns]]
- [[features/Categories]]
- [[features/Category voting configuration]]
- [[features/Nominees]]

## Processes

- [[processes/Cast and change vote]]

## Pages

- [[pages/Public campaign page]]
- [[pages/Member UI - My votes]]
