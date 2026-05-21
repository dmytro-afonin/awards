# Campaign run prototype

**Route:** `/prototype/campaign-run` (default `?variant=C`)

## Preferred direction (variant C)

- **Lead mode:** Run of show rail (from A) + focus card
- **Overview:** Full list with same per-category actions
- **Two steps per category:** `Close voting` → `Show winner` (winner locked but hidden until reveal)
- **Campaign-wide:** `Stop voting` / `Show winners` (separate; bulk confirms if runway already started)

### Category states

| Status | Meaning |
|--------|---------|
| `voting_open` | Ballots open |
| `voting_closed` | No more votes; winner computed, not on public page |
| `winner_revealed` | Winner visible on public page |

### Runway heads

- **Close-vote head:** first `voting_open` by `sortOrder`
- **Reveal head:** first `voting_closed` by `sortOrder`

Out-of-order close/reveal uses browser confirm vs the relevant head.

**Verdict:** _(fill in after review)_
