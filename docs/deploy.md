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

## Data migrations

This repo uses the official [`@convex-dev/migrations`](https://www.convex.dev/components/migrations) component. Migrations are defined in `convex/migrations.ts` and run explicitly from a member-authenticated CLI session.

### Run migrations

```bash
# Dev deployment
bun run convex:migrate

# Production (clear CONVEX_DEPLOY_KEY if your .env.local points at dev)
CONVEX_DEPLOY_KEY= bun run convex:migrate:prod
```

### Check migration status

```bash
bun run convex:migrate:status
```

### Verify category slug backfill

```bash
CONVEX_DEPLOY_KEY= npx convex run migrations:categorySlugMigrationStatus --prod
# { "missingSlugCount": 0 } → all categories have slugs
```

## Local production dry-run

```bash
bun run deploy:production
```

Uses `CONVEX_DEPLOY_KEY` if set, otherwise your logged-in Convex CLI session.

When running prod mutations locally, prefix commands with `CONVEX_DEPLOY_KEY=` if `.env.local` contains a dev deploy key — otherwise `--prod` is ignored.
