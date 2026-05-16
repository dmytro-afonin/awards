# Categories admin

**Shell:** Admin UI.

## Route

_TBD: under campaign admin route._

## Mockup

![[categories.png]]

## Control inventory (stub)

| Control | shadcn / pattern | Action | Consequence |
|---------|------------------|--------|-------------|
| Add category | `Button`, optional `Dialog` | Create row | New [[features/Categories]] |
| Reorder | drag handle + `Table` or dnd kit | Persist `order` | Affects voter display order |
| Edit | row action `DropdownMenu` | Navigate or `Sheet` | Updates category |
| Voting config | `Form`, `Switch`, `Select` | Save [[features/Category voting configuration]] | Ballot UX on public page |
| Schedule override | `Popover` + date/time | Set override window | Must stay inside campaign window |

## Related

- [[features/Categories]]
- [[features/Category voting configuration]]
- [[pages/Single campaign admin]]
