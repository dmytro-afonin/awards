# Framework decision (LAB-50)

**Choice: Next.js (App Router)** — not TanStack Start.

**Rationale**

- Strongest alignment with **Vercel** (host) and **Convex** (official React client, examples, auth patterns).
- **Middleware** / route patterns for **invite links** and **private campaigns** are well documented.
- Fastest path for contributors and AI-assisted development versus TanStack Start’s smaller Convex + production sample pool.

TanStack Start remains a valid alternative if the team prioritizes TanStack Router/Start ergonomics; revisit only if a Milestone 0 deploy spike justifies the switch.
