# Cast and change vote

## Preconditions

- Campaign **started**; category voting window open (inherit or override inside campaign window).
- User signed in; effective **can_vote** for campaign/category.
- Ballot rules from [[features/Category voting configuration]].

## Happy path

1. User selects nominee(s) on [[pages/Public campaign page]].
2. Client validates local UX rules (min/max selections).
3. Mutation writes vote row(s); activity logged.

## Change / revoke

- **Revocable:** allow replace/withdraw until category close — specify idempotency (PUT vs DELETE).
- **Non-revocable:** reject further mutations after commit.
- **Singular vs multiple:** enforce server-side.

## Related

- [[features/Voting]]
- [[pages/Member UI - My votes]]
