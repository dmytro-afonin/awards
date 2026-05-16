# Campaign editor

**Shell:** Admin UI.

## Route

_TBD: e.g. `/w/.../campaigns/[id]/edit`_

## Mockup

![[edit_campaign.png]]

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Save | `Button` + `Form` | Persist draft fields | Validation errors inline (`FormMessage`) |
| Lifecycle actions | `Button` / `DropdownMenu` | Transition state | Server validates [[processes/Campaign lifecycle]] |
| Visibility toggle | `Switch` or `Select` | Public/private | Affects [[pages/Public campaign page]] access rules |
| Image pickers | `Input` file + preview card | Upload / attach asset | Storage pipeline TBD |

## Authorization

- Edit campaign: per [[features/Authorization model]]; **ready** state may lock fields — see [[features/Campaigns]].

## Related

- [[features/Campaigns]]
- [[pages/Single campaign admin]]
- [[pages/Campaign list]]
