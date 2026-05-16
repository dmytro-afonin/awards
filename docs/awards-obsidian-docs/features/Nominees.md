# Nominees

**Glossary:** `docs.md` — name, description, image, optional location/date/person; category may require fields.

## Scope

Entities users vote for within a [[features/Categories|category]].

## Data model (stub)

_TBD: categoryId, name, description, imageId, location, date, personRef, order, archived flag._

## Authorization

- CRUD: Admin/Owner with per-campaign or per-category granular keys (see [[features/Authorization model]]; reconcile with `docs.md` tree).

## Related

- [[features/Categories]]
- [[features/Voting]]

## Pages

- [[pages/Single campaign admin]] (nominee management surface — align with product)
- [[pages/Public campaign page]] (display + ballot targets)
