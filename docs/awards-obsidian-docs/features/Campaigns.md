# Campaigns

**Glossary:** `CONTEXT.md` — **Campaign**, **Campaign visibility**, **Public campaign**, **Private campaign**, lifecycle, shared validation for manual + scheduled transitions.

## Scope

Voting container: metadata, lifecycle, visibility, slug, images, voting window that bounds categories.

## Data model (stub)

_TBD: workspaceId, name, slug, description, smallImageId, largeImageId, visibility enum, lifecycle state, votingStart/End (or schedule refs), createdBy, timestamps._

## Lifecycle

States: **draft**, **ready**, **launched**, **finished** (plus **deleted** for soft-delete in admin). The **launched** state means voting is open per campaign and category windows. Manual **launch** and scheduled launch share one validation path (see `can_launch` in `docs.md`).

See [[processes/Campaign lifecycle]] and [[diagrams/README]] for state diagram placeholder.

## Authorization

- Create/edit/delete: Admin or Owner + granular keys (see [[features/Authorization model]]).
- **Member hard ceiling:** members never mutate campaign structure.

## Category relationship

- Campaign has many [[features/Categories]].
- Category voting window inherits or overrides **inside** campaign voting window only.

## Pages

- [[pages/Campaign list]]
- [[pages/Campaign editor]]
- [[pages/Single campaign admin]]
- [[pages/Public campaign page]]

## Events

Emit to [[features/Activity and audit log]] on lifecycle and metadata changes.
