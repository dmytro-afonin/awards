# Issue tracker: Linear

Work items for this repo live in **Linear**. The Git remote (`dmytro-afonin/awards` on GitHub) is the **code** host; **issues, specs, and triage state** are managed in **Linear**.

## Conventions

- **Create / update / find issues** — Use the **Linear** integration (Cursor Linear plugin and/or **Linear MCP**). Do not use `gh issue` for project work; GitHub Issues are not the source of truth for this repo.
- **Default Linear project** — Every new issue for **this repo** must be attached to the Linear project **Awards** (name as shown in Linear). When using MCP `save_issue` or any API that accepts a project, pass `project: "Awards"` (or the project ID/slug Linear accepts) on **create** and add it on **update** if an issue was filed without a project. Only skip or override this when a human maintainer says the ticket belongs on a different project; if you override, say so in the issue description.
- **Linking** — When an issue should reference implementation work, link the Linear issue to the GitHub branch or pull request.
- **Branch names** — Create Git branches with a **`feat/`** prefix (e.g. `feat/lab-67-short-slug`). Linear’s suggested `gitBranchName` may omit it; adjust before pushing so every topic branch starts with `feat/`.
- **Labels** — Apply triage labels per `docs/agents/triage-labels.md` using the **exact** strings configured there (create matching labels in Linear if they do not exist yet).

Infer repository context from `git remote -v` when linking to GitHub; use the authenticated Linear workspace when creating or updating Linear issues. Issue creation still requires a Linear **team** (per product/API rules); use the team that owns the **Awards** project in your workspace.

## When a skill says "publish to the issue tracker"

Create or update the relevant artifact in **Linear** (issue, project item, or document — whichever the skill implies), not a GitHub issue.

## When a skill says "fetch the relevant ticket"

Load the Linear issue (or equivalent) via the Linear integration; use GitHub only for code, diffs, and CI status tied to linked PRs.
