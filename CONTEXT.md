# Hotdog Racing — Context

A Next.js (App Router) site for RC drift tools and content. Static-first: no backend, no database, no auth. All persistence via `localStorage`. Math and business logic live in `lib/` as pure functions, tested with Vitest.

---

## Glossary

| Term | Meaning |
|---|---|
| **Tool** | An interactive page under `/tools/[name]/` — a self-contained RC setup calculator with sliders, live diagrams, and save/load via localStorage |
| **Matsuri** | A relaxed, open-session drift event (not a formal competition) |
| **Drift to Death (D2D)** | Annual 3-day matsuri at Drift-PDX co-created by Logan; track stays live Friday–Sunday with no schedule |
| **SDC** | Super Drift Championship — the primary competition series Logan competes in |
| **Drift-PDX** | Logan's home track, opened March 1 2025. Previously PDX RC Underground (closed early 2025) |
| **Team PDX** | Logan's local team, formed February 2024 |
| **Team D-Style** | Logan's sponsored RC drift team |
| **RC Drift Talk** | Weekly live podcast on YouTube (@yadmah) co-hosted by Logan |
| **Agent brief** | A structured GitHub issue comment that specifies a task for an AFK agent |
| **SectionLabel** | The small mono uppercase label (e.g. "Background", "Competition") that sits above every section heading |

---

## Design System

### Colors

| Token | Value | Use |
|---|---|---|
| `text-accent` / `bg-accent` | `#FF0020` | Buttons, links, active states, slider handles, highlights |
| `text-near-black` / `bg-near-black` | `#0D0D0D` | Dark hero backgrounds |
| `text-near-white` | `#F5F5F5` | Text on dark backgrounds |
| `accent-700` | `#CC001A` | Hover state for accent elements |

### CSS Variables (theme-aware, switch on dark/light)

| Variable | Light | Dark |
|---|---|---|
| `--background` | `#F5F5F5` | `#0D0D0D` |
| `--foreground` | `#0D0D0D` | `#F5F5F5` |
| `--surface` | `#ffffff` | `#1a1a1a` |
| `--surface-2` | `#ebebeb` | `#262626` |
| `--border` | `#d4d4d4` | `#333333` |
| `--muted` | `#737373` | `#8a8a8a` |

Use `style={{ color: 'var(--foreground)' }}` (not Tailwind `dark:` variants) for theme-aware values. Tailwind classes like `text-accent` and `bg-near-black` are fine for static values.

### Typography

- **Content pages:** `font-sans` (Geist Sans) — default body font, no class needed
- **Tool UIs, readouts, mono labels:** `font-mono` (Geist Mono) — use `className="font-mono"` explicitly
- **SectionLabel pattern:** `font-mono text-xs tracking-[0.25em] text-accent uppercase`

### Dark mode

Controlled by a CSS class on `<html>`: `.dark` or `.light`. Falls back to `prefers-color-scheme`. Toggle is in the nav, state stored in `localStorage`. Never use Tailwind's `dark:` prefix — use CSS variables instead.

---

## Layout & Page Conventions

### Global layout

`app/layout.tsx` wraps every page: `<Nav /> → <main> → <Footer /> → <Analytics />`. Do not touch this unless Nav or Footer changes are the task.

### Section anatomy

Every page is composed of `<section>` blocks:

```tsx
<section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
  <div className="mx-auto max-w-7xl">   {/* or max-w-3xl for reading-width pages */}
    <SectionLabel>Label text</SectionLabel>
    <h2 className="mb-6 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
      Section title
    </h2>
    {/* content */}
  </div>
</section>
```

Alternate backgrounds between adjacent sections: one with `style={{ background: 'var(--surface)' }}`, the next without (defaults to `--background`).

**Content width:**
- `max-w-7xl` — full-width layouts (home page sections, tools, grid pages)
- `max-w-3xl` — reading-width layouts (about, blog posts, events)

### Metadata

Every page exports a `metadata` object. The root layout sets `template: '%s | Hotdog Racing'`, so page titles need only the page name:

```tsx
export const metadata: Metadata = {
  title: 'Page Name',
  description: 'One-sentence description.',
  openGraph: {
    title: 'Page Name | Hotdog Racing',
    description: 'One-sentence description.',
    url: 'https://hotdog-racing.com/route',
  },
}
```

### `'use client'` boundary

Pages are server components by default. Only add `'use client'` when the component uses hooks, event handlers, or browser APIs (e.g. interactive tool pages, the nav). Keep client components as leaf nodes.

---

## Recurring UI Patterns

### Cards

```tsx
<div
  className="rounded-lg border p-6 transition-colors hover:border-accent"
  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
>
```

### External links

Always `target="_blank" rel="noopener noreferrer"`.

### Spec/data tables (alternating rows)

```tsx
<div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
  {rows.map((row, i) => (
    <div
      key={row.label}
      className="flex justify-between gap-4 px-5 py-3"
      style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}
    >
      <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{row.label}</span>
      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{row.value}</span>
    </div>
  ))}
</div>
```

### Hero / dark intro sections

```tsx
<section className="py-20 px-6 bg-near-black">
  <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Eyebrow</p>
  <h1 className="text-4xl font-bold tracking-tight text-near-white sm:text-5xl">Heading</h1>
  <p className="text-base leading-relaxed text-near-white/70">Body copy</p>
</section>
```

---

## Navigation

`components/Nav.tsx` is fully wired — all routes exist in the dropdown and mobile menu:

| Route | Nav entry |
|---|---|
| `/` | Home |
| `/tools` | Tools → All Tools |
| `/tools/suspension` | Tools → Suspension Alignment |
| `/tools/esc` | Tools → ESC Settings |
| `/tools/gyro` | Tools → Servo & Gyro |
| `/podcast` | Podcast |
| `/blog` | Blog |
| `/about` | About |

Do not modify `Nav.tsx` unless a new route is being added or a regression is found.

---

## File Structure Conventions

```
app/
  [route]/page.tsx       ← new pages here
  tools/[name]/page.tsx  ← tool pages here
components/              ← shared UI components
lib/
  [tool-name]/           ← pure functions + types + Vitest tests
    geometry.ts
    geometry.test.ts
    types.ts
content/
  posts/                 ← Markdown blog posts with frontmatter
public/                  ← static assets (images, icons, manifest)
docs/
  site-prd.md            ← product requirements
  [tool-name]-spec.md    ← per-tool spec (required before implementation)
  agents/                ← agent workflow docs
  adr/                   ← architecture decision records
```

---

## Tool Architecture

Every tool under `/tools/[name]/` follows this pattern:

- **Page:** `app/tools/[name]/page.tsx` — `'use client'`, wires UI to lib functions
- **Logic:** `lib/[name]/` — pure functions only, no React, no side effects
- **Tests:** `lib/[name]/[module].test.ts` — Vitest, covers normal/boundary/bad-input cases
- **Persistence:** `localStorage` — validate on read, never trust raw stored values
- **Export:** JSON file via `URL.createObjectURL(new Blob([JSON.stringify(data)]))`
- **Visualization:** SVG (suspension geometry) or D3.js (ESC curves)
- **Controls:** Sliders + synced numeric inputs, large touch targets for mobile use at the track

A spec doc at `docs/[name]-spec.md` is required before implementation begins.
