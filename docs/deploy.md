# Deploy

Production uses **Vercel** for the Next.js app and **Convex Cloud** for the backend. Vercel runs a single build command that deploys Convex (with schema push), then serves the frontend.

## Vercel build command

The repo sets this in `vercel.json`:

```bash
bun run deploy:production
```

Which runs:

```bash
convex deploy --cmd 'bun run build'
```

That builds Next.js, then pushes Convex functions/schema. Vercel authenticates to Convex with **`CONVEX_DEPLOY_KEY`** (a deploy/service token).

**Do not** append `convex run …` to the Vercel build command. Deploy keys can push code but cannot run arbitrary mutations (`403 ServiceTokenNotAllowed`). Data migrations must be run separately by a logged-in team member (see below).

## Environment variables

Set on Vercel (and locally in `.env.local`):

- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, etc.)
- `NEXT_PUBLIC_CONVEX_URL` — set automatically when using Convex + Vercel integration, or point at your prod deployment
- `CONVEX_DEPLOY_KEY` — required for `convex deploy` on Vercel

## Category slug migration (PR #10+)

Categories gained a `slug` field for public URLs. Existing production rows may lack `slug` until backfill runs.

| Phase | Schema | Action |
|-------|--------|--------|
| Deploy (current) | `slug` optional | Vercel deploy succeeds (no backfill in CI) |
| One-time backfill | still optional | Run manually from a member-authenticated CLI |
| After backfill | all rows have `slug` | Optional: narrow schema to `slug: v.string()` |

### One-time backfill (required after first deploy)

Run locally while logged in to Convex (`npx convex login`), **not** via Vercel:

```bash
# Production
bun run convex:backfill-category-slugs:prod

# Dev deployment
bun run convex:backfill-category-slugs
```

### Verify migration complete

```bash
npx convex run migrations:categorySlugMigrationStatus --prod
# { "missingSlugCount": 0 } → safe to make slug required in schema.ts
```

## Local production dry-run

```bash
bun run deploy:production
```

Uses `CONVEX_DEPLOY_KEY` if set, otherwise your logged-in Convex CLI session.
