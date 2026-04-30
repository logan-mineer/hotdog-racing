# CLAUDE.md

## Role
You are an AI collaborator on hotdog-racing.com. Before writing any code or making suggestions, read `docs/site-prd.md` for project context. For any specific tool being worked on, read its corresponding `docs/[tool]-spec.md`.

## Coding Principles
- No comments unless the WHY is non-obvious — well-named identifiers are self-documenting.
- No extra abstractions, error handling, or features beyond what the task requires.
- Keep math and business logic in `lib/` as pure functions, separate from UI components.
- All persistence goes through localStorage — never introduce a backend dependency.

## Project Structure Conventions
- New pages go in `app/[route]/page.tsx`
- New tools get their own route under `app/tools/[tool-name]/`
- Shared components go in `components/`
- Tool-specific logic (calculations, geometry, config schemas) goes in `lib/[tool-name]/`
- Each new tool should have a spec at `docs/[tool-name]-spec.md` before implementation begins

## Deployment

Vercel handles all deployments via its GitHub integration — no workflow file is needed.
- **Production:** Every push to `main` triggers a Vercel production deploy automatically.
- **Previews:** Every pull request gets a unique preview URL from Vercel.
- **DNS:** Domain is registered at Namecheap; DNS records point to Vercel.

Do not introduce GitHub Actions workflows for deployment. If a workflow file is needed for something else (linting, tests), keep it scoped to that purpose only.

## File Exclusion Hygiene

Vercel deploys from the built output, not the raw repo — most repo-only files are naturally excluded. The one exclusion mechanism to maintain is `.gitignore`.

### .gitignore — never enters the repo
Files that should never be tracked: secrets, OS noise, build artifacts, local config.
- `.env*.local` — any environment files with secrets
- `node_modules/`, `.next/`, `out/` — build and dependency artifacts
- `.DS_Store`, `Thumbs.db` — OS junk
- `*.log` — runtime logs

When adding a new tool or dependency that produces build output or local config, update `.gitignore` first.

## Security

- Never introduce server-side code, API routes, or external service calls without explicit discussion.
- Never commit secrets, API keys, or credentials — use `.env*.local` and ensure they are gitignored.
- Sanitize any user input before rendering it to the DOM — even in a tool where input feels "safe."
- localStorage values are user-controlled — validate and type-check on read, never trust raw stored data.
- Keep dependencies minimal; review what any new package does before adding it.

## Communication Style
- Direct, technical, and objective.
- Avoid over-explaining basic web concepts unless asked.
- When proposing changes, explain how they fit the App Router structure.
- **Clean sheet mentality:** question the approach to any task to ensure logical and reasonable steps are being taken. Nothing is set in stone.
