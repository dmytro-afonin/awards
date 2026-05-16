# Categories

**Glossary:** `CONTEXT.md` — **Category**, schedule inherit/override inside campaign window, link to [[features/Category voting configuration]].

## Scope

Subdivision of a campaign: nominee grouping, display order, optional description/images, nominee field requirements.

## Data model (stub)

_TBD: campaignId, name, description, order, smallImageId, largeImageId, votingStart/End overrides (nullable), nomineeRequirement flags, votingConfigId or inline config._

## Authorization

- Structural edits: Admin/Owner + scoped granular permissions.
- Ordering: same gate as edit.

## Related

- [[features/Campaigns]]
- [[features/Nominees]]
- [[features/Category voting configuration]]
- [[features/Voting]]

## Pages

- [[pages/Categories admin]]
- [[pages/Public campaign page]] (voter-facing category sections)

## Processes

- [[processes/Cast and change vote]]
