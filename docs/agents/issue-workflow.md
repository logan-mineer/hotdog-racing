# Issue Workflow

This is the standard workflow for working through GitHub issues on this project.

## "Let's get started"

When the user says they want to get started (or similar), run through these steps:

1. Run `/triage` on all open `needs-triage` issues — evaluate each against `docs/site-prd.md` and assign the appropriate label (`ready-for-agent`, `ready-for-human`, `needs-info`, `wontfix`) with a brief comment explaining the reasoning.
2. Present a summary of label changes.
3. Identify the next issue to work on: the lowest-numbered `ready-for-agent` issue whose "Blocked by" dependencies are all closed.
4. Announce the chosen issue and begin.

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

1. **Reframe as a problem**, not a solution. "Users can't tell X" rather than "add feature Y." Keep solution space open.
2. **Identify the right spec.** Does this belong in `docs/site-prd.md`, an existing tool spec (`docs/[tool]-prd.md`), or does it need a new spec? If no spec exists for the area, create one before proceeding.
3. **Update the spec first.** Add the problem as a requirement in the relevant spec document. This is the source of truth — the spec must reflect the full intended scope before any issue is created.
4. **Then create issues.** Issues derive from the spec. An issue that isn't anchored to a spec entry will drift and become hard to evaluate or prioritize.

**Never create issues for new work without first updating the relevant spec.** If you skip this step, the spec and the tracker will diverge and the spec loses its value as a source of truth.

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
