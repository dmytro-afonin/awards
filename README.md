# Awards

Multi-tenant awards campaigns (categories, nominees, visibility, invites) — **Next.js**, **Convex**, **Clerk**, **Vercel**. Replaces the previous Angular + Firebase app in this repo.

## Prerequisites

- [Bun](https://bun.sh)
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) application

## Setup

1. Copy [`.env.example`](.env.example) to `.env.local` and fill in Clerk keys.

2. Start Convex (links a deployment and sets `NEXT_PUBLIC_CONVEX_URL`):

   ```bash
   bunx convex dev
   ```

3. In the [Clerk dashboard](https://dashboard.clerk.com), create a JWT template named **`convex`** (Convex docs). Set **`CLERK_JWT_ISSUER_DOMAIN`** in Convex dashboard env to your Clerk Frontend API issuer host (see Convex + Clerk guide).

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
| `bun run test:e2e` | Playwright tests (start app separately or set `PLAYWRIGHT_BASE_URL`) |

## Deploy (Vercel)

- Import the repo; set the same env vars as `.env.example` in Vercel.
- Run `bunx convex deploy` for production Convex, then point `NEXT_PUBLIC_CONVEX_URL` at that deployment.

## Linear

Work is tracked in Linear project **“Awards platform v1”** (milestones M0–M6). Issue IDs **LAB-50+** map to scaffold, schema, UI, access, public page, and hardening.

## Regenerating Convex `api` types

[`convex/_generated`](convex/_generated) is checked in so builds work without a linked deployment. After changing Convex functions, run:

```bash
bunx convex codegen
```

(with `CONVEX_DEPLOYMENT` / `npx convex dev` configured) to refresh types.
