# Edge cases index

Cross-product edge cases; deep detail may live in feature notes.

## Visibility & security

- [[features/Campaigns]] — Private campaign URL without entitlement → **not found** (not 403), per `CONTEXT.md`.
- Anonymous on public campaign: view allowed where product says; vote blocked until sign-in.

## Lifecycle & scheduling

- Manual and scheduled transition at same instant → single validation path, idempotent outcome.
- **Launch** campaign when computed end is in past → reject.

## Categories & voting

- Category override outside parent campaign voting window → reject.
- **Non-revocable** category: second submit or PATCH → 409 or domain error.
- **Member hard ceiling:** any API/UI attempt to grant editor permission to Member → reject; UI disabled with explanation ([[features/Authorization model]]).

## Workspace governance

- Transfer pending + owner deletes workspace → define precedence (document in [[features/Ownership transfer]]).
- Transfer expiry: both parties notified per `CONTEXT.md`.

## Roles

- API sets Owner + Member for same user/workspace → reject (**Owner–Member exclusivity**).
- API sets Owner + Admin rows → normalize to Owner only (**Owner–Admin normalization**).

## Related

- [[Home]]
