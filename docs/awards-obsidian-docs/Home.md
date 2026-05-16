# Awards — documentation vault

Central index for structured product and technical specs. **Canonical domain language** (glossary, invariants, example dialogue) lives in the repository root: **`CONTEXT.md`** — open it from the IDE alongside this vault.

## How to use this vault

1. Start with [[features/Authorization model]] — it gates almost everything else.
2. Read [[features/Workspaces]] then [[features/Campaigns]] for tenancy and voting containers.
3. Use **pages/** for UI control inventories (buttons, dialogs, consequences) aligned with shadcn patterns.
4. Use **processes/** for cross-cutting flows; link back to features for storage and AuthZ detail.

## Folder map

| Folder | Purpose |
|--------|---------|
| `features/` | Abstract technical specs — start at [[features/Authorization model]] |
| `pages/` | One note per screen — e.g. [[pages/Admin dashboard]] |
| `processes/` | End-to-end workflows — e.g. [[processes/Campaign lifecycle]] |
| `diagrams/` | Mermaid / diagram conventions — [[diagrams/README]] |
| `edge-cases/` | Cross-cutting index — [[edge-cases/Index]] |
| `data-model/` | Entity overview — [[data-model/Overview]] |
| [[Mockups]] | Embedded UI mockups (PNG) |

## External references

- Repo: `docs.md` — early scratchpad; reconcile with `CONTEXT.md` where they differ.
- Repo: `docs/admin-page-wireframe.excalidraw` — admin wireframe source.
- Script: `node scripts/generate-admin-wireframe.mjs` — regenerate wireframe JSON.

## Feature index

- [[features/Workspaces]]
- [[features/Ownership transfer]]
- [[features/Invitations]]
- [[features/Authorization model]]
- [[features/Campaigns]]
- [[features/Categories]]
- [[features/Category voting configuration]]
- [[features/Nominees]]
- [[features/Voting]]
- [[features/Activity and audit log]]

## Page index

- [[pages/Marketing home]]
- [[pages/Admin dashboard]]
- [[pages/Campaign list]]
- [[pages/Campaign editor]]
- [[pages/Single campaign admin]]
- [[pages/Categories admin]]
- [[pages/Public campaign page]]
- [[pages/Member UI - My campaigns]]
- [[pages/Member UI - My votes]]
- [[pages/Settings]]
- [[pages/Workspace switcher and lifecycle]]
- [[pages/Invite accept]]

## Process index

- [[processes/Campaign lifecycle]]
- [[processes/Cast and change vote]]
- [[processes/Workspace soft delete and restore]]
- [[processes/Ownership transfer]]
- [[processes/Invite acceptance]]
