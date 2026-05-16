# Category voting configuration

**Glossary:** `CONTEXT.md` — **Category voting configuration**.

## Behavior

Per **category**:

| Dimension | Options | Default |
|-----------|---------|---------|
| Cardinality | **singular** vs **multiple** concurrent active selections | singular |
| Mutability | **revocable** (replace/withdraw while open) vs **non-revocable** | revocable |

## Data model (stub)

_TBD: categoryId, selectionMode enum, revocable boolean (or enum), optional maxSelections when multiple._

## Validation rules (stub)

- Non-revocable: reject PATCH/delete on ballot after first commit while category open — exact rules in [[processes/Cast and change vote]].
- Multiple + cap: enforce server-side max if product defines one.

## Related

- [[features/Categories]]
- [[features/Voting]]

## Pages

- [[pages/Categories admin]] (configuration UI)
- [[pages/Public campaign page]] (ballot UX differs by config)
