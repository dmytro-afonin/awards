# Awards

Next.js app with **Convex** and **Clerk**. Product direction and wireframes live in [`docs.md`](docs.md) and the [`docs/`](docs/) folder.

## Prerequisites

- [Bun](https://bun.sh)
- A [Convex](https://convex.dev) deployment (local dev is fine)
- A [Clerk](https://clerk.com) application

## Setup

1. Copy `.env.example` to `.env.local` and set Clerk + Convex URLs (see comments in `.env.example`).

2. Start Convex (links a deployment and can set `NEXT_PUBLIC_CONVEX_URL`):

   ```bash
   bunx convex dev
   ```

3. In the Clerk dashboard, add a JWT template named **`convex`** for Convex, and set **`CLERK_JWT_ISSUER_DOMAIN`** in the Convex dashboard to your Clerk Frontend API issuer host (see the [Convex + Clerk](https://docs.convex.dev/auth/clerk) docs).

4. Install and run the app:

   ```bash
   bun install
   bun dev
   ```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Scripts

| Command | Description |
|--------|-------------|
| `bun dev` | Next.js dev server (Turbopack) |
| `bun run convex:dev` | Convex dev / sync functions |
| `bun run build` | Production build |
| `bun run check` | Biome check (write) |
| `bun run typecheck` | TypeScript (`tsc --noEmit`) |
| `bun run convex:codegen` | Regenerate `convex/_generated` types |
| `bun run deploy:production` | Vercel/CI: Convex deploy + Next build (no data migrations) |
| `bun run convex:backfill-category-slugs:prod` | One-time slug backfill on prod (run locally after deploy; requires `convex login`) |

## Deploy (Vercel)

See **[docs/deploy.md](docs/deploy.md)** for the full checklist.

Summary:

1. Set Clerk + Convex env vars on Vercel (including `CONVEX_DEPLOY_KEY` for prod deploys).
2. Vercel uses `bun run deploy:production` from `vercel.json` — Convex deploy + Next.js build only.
3. After the first successful prod deploy, run the slug backfill **locally** (deploy keys cannot run mutations):

   ```bash
   bun run convex:backfill-category-slugs:prod
   npx convex run migrations:categorySlugMigrationStatus --prod
   ```

   When `missingSlugCount` is `0`, you can optionally narrow `campaignCategories.slug` to required in `convex/schema.ts`.
