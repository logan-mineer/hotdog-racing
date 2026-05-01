# Hotdog Racing

Setup tools and content for RC drift — [hotdog-racing.com](https://hotdog-racing.com).

## Pages

| Route | Purpose |
|---|---|
| `/` | Home |
| `/tools` | Interactive setup tools landing page |
| `/tools/suspension` | Suspension Alignment Visualizer |
| `/tools/esc` | ESC Settings Visualizer |
| `/tools/gyro` | Servo & Gyro Visualizer (stub) |
| `/events` | Competition schedule |
| `/blog` | Guides and posts |
| `/podcast` | Episode list |
| `/about` | Background and build specs |

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npx tsc --noEmit    # type check
npm run lint         # ESLint
npx vitest run       # unit tests (lib/ only)
```

## Structure

```
app/             # Next.js App Router pages
components/      # Shared UI components
lib/             # Pure functions — tool logic, math, parsers
content/posts/   # Blog posts as Markdown with frontmatter
docs/            # PRD, tool specs, agent workflow docs
```

## Deployment

Vercel — every push to `main` triggers a production deploy. Every PR gets a preview URL. No workflow file needed.
