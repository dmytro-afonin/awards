# Deploy

Production uses **Vercel** for the Next.js app and **Convex Cloud** for the backend. Vercel runs a single build command that deploys Convex first (with schema push), then serves the frontend.

## Vercel build command

The repo sets this in `vercel.json`:

```bash
bun run deploy:production
```

Which runs:

1. `convex deploy --cmd 'bun run build'` — builds Next.js, then pushes Convex functions/schema
2. `convex run migrations:backfillCategorySlugs --prod` — idempotent data backfill after deploy

Do **not** use bare `bun run build` or `convex deploy` alone in Vercel unless you also run migrations manually.

## Environment variables

Set on Vercel (and locally in `.env.local`):

- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, etc.)
- `NEXT_PUBLIC_CONVEX_URL` — set automatically when using Convex + Vercel integration, or point at your prod deployment
- Convex deploy key for CI (`CONVEX_DEPLOY_KEY`) — required for `convex deploy` on Vercel

## Category slug migration (PR #10+)

Categories gained a `slug` field for public URLs. Existing production rows may lack `slug` until backfill runs.

| Phase | Schema | Action |
|-------|--------|--------|
| Deploy (current) | `slug` optional | Deploy succeeds; backfill runs automatically |
| After backfill | all rows have `slug` | Optional: narrow schema to `slug: v.string()` |

### Manual backfill (if needed)

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

Requires prod Convex credentials (`CONVEX_DEPLOY_KEY` or logged-in CLI with prod access).
