<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Agent skills

### Issue tracker

Work is tracked in **Linear**; GitHub is for code and PRs only. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical roles use the default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

**Single-context** — one `CONTEXT.md` and `docs/adr/` at the repo root when they exist. See `docs/agents/domain.md`.
