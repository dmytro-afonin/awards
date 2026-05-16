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
| `bun run lint` | Biome check |
| `bun run format` | Biome format (write) |
| `bun run convex:codegen` | Regenerate `convex/_generated` types |

## Deploy (Vercel)

Set the same environment variables as local. Use `bunx convex deploy` for a production Convex deployment, then point `NEXT_PUBLIC_CONVEX_URL` at that deployment.
