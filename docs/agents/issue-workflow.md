# Issue Workflow

This is the standard workflow for working through GitHub issues on this project.

## "Let's get started"

When the user says they want to get started (or similar), run through these steps:

1. Run `/triage` on all open `needs-triage` issues — evaluate each against `docs/site-prd.md` and assign the appropriate label (`ready-for-agent`, `ready-for-human`, `needs-info`, `wontfix`) with a brief comment explaining the reasoning.
2. Present a summary of label changes.
3. Identify the next issue to work on: the lowest-numbered `ready-for-agent` issue whose "Blocked by" dependencies are all closed. Consider active feature areas in recent git history when breaking ties.
4. **Check in with the owner** — announce the chosen issue and wait for explicit confirmation before branching or writing any code.

## Working an issue

### 1. Read the issue

```
gh issue view <number> --comments
```

Check the "Blocked by" section. If any blocker is still open, skip this issue and pick the next unblocked one.

### 2. Check for a spec

Tool issues (anything under `app/tools/`) require a spec at `docs/[tool-name]-spec.md` before implementation. If it doesn't exist, stop and ask the user to run `/to-prd` to create one.

### 3. Check scope

If the issue feels too large for a single PR, stop before touching any code. Propose a breakdown and offer to run `/to-issues`. Wait for the user's go-ahead before proceeding.

### 4. Read relevant source files

Explore the codebase as needed to understand what exists before writing anything.

### 5. Create a branch

Follow the git strategy in `CLAUDE.md`. Branch from `main` using the appropriate prefix (`feat/`, `fix/`, `chore/`, `content/`).

### 6. Implement

Follow the coding principles and project structure conventions in `CLAUDE.md`.

### 7. Run checks

```
tsc --noEmit
npm run lint
```

If anything in `lib/` was added or modified:

```
npx vitest run
```

Fix all errors before continuing.

### 8. Post a verification checklist

Ask the user to review the changes before committing. The checklist should include:

- Each acceptance criterion from the issue, formatted as a checkbox
- Any edge cases worth verifying manually

For any issue involving interactive UI or mobile layout, include this command to spin up a local production server (avoids the WebSocket HMR interference from `next dev` that breaks touch events on mobile):

```
npm run build && npm start
```

Then access it from a mobile device at `http://<your-local-ip>:3000`. To find your local IP run `ipconfig` and look for the IPv4 address under your active network adapter.

Wait for the user's approval before proceeding.

### 9. Commit and open a PR

Once the user approves, commit the changes and open a PR referencing the issue (e.g. `Closes #10`). The PR description should include what was built and any notable decisions. The Vercel preview URL will be available on the PR for final visual verification.

## Amending a spec mid-project

When new problems or ideas surface during development — from the user, from testing, or from implementation discoveries — follow this sequence:

1. **Reframe as a problem**, not a solution. "Users can't tell X" rather than "add feature Y." The user's original phrasing often contains an implied solution — strip it out and state the underlying problem clearly.
2. **Discuss the approach.** For each problem, explore how it could be solved before committing to anything. What are the options? What are the tradeoffs? What fits the project's constraints and aesthetic? Do this without anchoring to how the user originally described the idea — their list is a starting point, not a spec. Reach explicit agreement on the approach before writing anything down.
3. **Identify the right spec.** Does this belong in `docs/site-prd.md`, an existing tool spec (`docs/[tool]-prd.md`), or does it need a new spec? If no spec exists for the area, create one before proceeding.
4. **Update the spec.** Add the agreed approach as a requirement in the relevant spec document. The spec is the source of truth — it must reflect considered decisions, not just a reformatted to-do list.
5. **Then create issues.** Issues derive from the spec. An issue that isn't anchored to a spec entry will drift and become hard to evaluate or prioritize.

**Never create issues for new work without first completing steps 1–4.** If you skip the discussion step, you risk building the wrong thing — just faster.

---

## Creating issues outside of `/to-issues`

When creating a GitHub issue manually (e.g. to track a bug, a model fix, or a UI slice that emerged during implementation), always apply labels immediately after creation — never leave an issue unlabeled.

Every issue needs two labels:
1. **Type** — `enhancement` for new features, `bug` for defects
2. **Triage state** — one of `needs-triage`, `ready-for-agent`, `ready-for-human`, `needs-info`, or `wontfix`

Apply `ready-for-agent` directly (skipping `needs-triage`) only when the issue is fully specified with clear acceptance criteria. Apply `needs-triage` when the scope or approach still needs evaluation.

```
gh issue edit <number> --add-label "enhancement,ready-for-agent"
```
