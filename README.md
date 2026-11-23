# Awards

Next.js app with **Convex** and **Clerk**. Product direction and wireframes live in [`docs.md`](docs.md) and the [`docs/`](docs/) folder.

## Prerequisites

- [pnpm](https://pnpm.io)
- A [Convex](https://convex.dev) deployment (local dev is fine)
- A [Clerk](https://clerk.com) application

## Setup

1. Copy `.env.example` to `.env.local` and set Clerk + Convex URLs (see comments in `.env.example`).

2. Start Convex (links a deployment and can set `NEXT_PUBLIC_CONVEX_URL`):

   ```bash
   pnpm exec convex dev
   ```

3. In the Clerk dashboard, add a JWT template named **`convex`** for Convex, and set **`CLERK_JWT_ISSUER_DOMAIN`** in the Convex dashboard to your Clerk Frontend API issuer host (see the [Convex + Clerk](https://docs.convex.dev/auth/clerk) docs).

4. Install and run the app:

   ```bash
   pnpm install
   pnpm dev
   ```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm run convex:dev` | Convex dev / sync functions |
| `pnpm run build` | Production build |
| `pnpm run check` | Biome check (write) |
| `pnpm run typecheck` | TypeScript (`tsc --noEmit`) |
| `pnpm run convex:codegen` | Regenerate `convex/_generated` types |
| `pnpm run deploy:production` | Vercel/CI: Convex deploy + Next build (no data migrations) |
| `pnpm run convex:migrate` | Run pending Convex data migrations (dev) |
| `pnpm run convex:migrate:prod` | Run pending migrations on prod (`CONVEX_DEPLOY_KEY=` if needed) |
| `pnpm run convex:migrate:status` | Show migration component status |

## Deploy (Vercel)

See **[docs/deploy.md](docs/deploy.md)** for the full checklist.

Summary:

1. Set Clerk + Convex env vars on Vercel (including `CONVEX_DEPLOY_KEY` for prod deploys).
2. Vercel uses `pnpm run deploy:production` from `vercel.json` — Convex deploy + Next.js build only.
3. After deploy, run data migrations **locally** when needed (deploy keys cannot run mutations):

   ```bash
   CONVEX_DEPLOY_KEY= pnpm run convex:migrate:prod
   pnpm run convex:migrate:status
   ```
