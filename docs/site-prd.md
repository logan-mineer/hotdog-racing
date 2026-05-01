# Hotdog Racing — Site PRD

## Overview

A personal hub for the RC drift community. The site combines static content (about, guides, blog) with specialized interactive engineering tools built for RC drift setup and tuning. Built as a Progressive Web App (PWA) — installable on mobile home screens and functional offline.

**Tagline:** "Setup tools and content for RC drift."

**Primary audience:** RC drift enthusiasts who want to dial in their car setup with precision — suspension geometry, ESC timing, and similar technical parameters. Tools are designed to be used at the track, phone in hand, without reliable WiFi.

---

## Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | Handles static content and interactive tools in one project |
| Language | TypeScript | Type safety for math-heavy tool logic |
| Styling | Tailwind CSS | Utility-first, strong AI codegen support |
| PWA | next-pwa + service worker | Offline use at the track, installable on home screen |
| Visualization | SVG + React state | Suspension geometry diagrams |
| Visualization | D3.js | ESC timing curves and graph tools |
| Persistence | localStorage | Save/load tool configs as JSON — no backend needed |
| Hosting | Vercel (Hobby) | Zero-config Next.js deploys, free for non-commercial use |
| Analytics | Vercel Analytics | Privacy-friendly, no cookies, free on Hobby tier |
| Domain | Namecheap (DNS only) | Domain registration stays at Namecheap, DNS points to Vercel |

---

## Goals

1. Provide a clean, fast home for RC drift technical content.
2. Host interactive tools that make suspension and electronics tuning more visual and accessible.
3. Establish Logan's credibility and voice in the RC drift community.

---

## Information Architecture

### Static Content
| Route | Purpose |
|---|---|
| `/` | Home — Hero → Featured Tools → Latest Podcast Episode → Instagram feed → Sponsors → Latest Blog Posts |
| `/about` | Who Logan is, RC background and resume |
| `/podcast` | Full episode list pulled from YouTube channel |
| `/events` | Upcoming and past events — self-managed static config |
| `/blog` | All written content — guides, posts, and how-tos |
| `/blog/[slug]` | Individual content page |

### Tools
| Route | Tool | Status |
|---|---|---|
| `/tools` | Tools landing page — lists all available tools | Planned |
| `/tools/suspension` | Suspension Alignment Visualizer | Planned |
| `/tools/esc` | ESC Settings Visualizer | Planned |
| `/tools/gyro` | Servo & Gyro Visualizer | Stub |

Navigation: **Home / Tools ▾ / Podcast / Blog / About**. Tools has a dropdown listing individual tools; clicking the label goes to `/tools`. Dark/light mode toggle sits in the nav on the right.

---

## Tool Definitions

### Suspension Alignment Visualizer
Allow users to virtually adjust turnbuckle lengths and see real-time updates to alignment settings (toe, camber, caster, ackermann).

**Core interactions:**
- Drag sliders or enter values to adjust individual turnbuckles
- Live 2D diagram updates to reflect geometry changes
- Readouts for all affected alignment parameters
- Save/load named configurations via localStorage
- Export config as shareable JSON file

**Visualization approach:** SVG diagram of suspension geometry (top-down and rear views), updated reactively as parameters change.

**v1 scope:** Generic geometry model — universal parameters, relative values. Model-specific accuracy (per-chassis data) is a future phase once a chassis database is built.

### ESC Settings Visualizer
Visually represent how changing ESC timing parameters (can timing, boost timing, turbo timing, punch/brake settings) affect the power delivery curve.

**Core interactions:**
- Sliders for each timing/boost parameter
- Live curve visualization showing effect on power delivery across throttle range
- Side-by-side comparison mode (stock vs. custom)
- Save/load named profiles via localStorage
- Export profile as JSON

**Visualization approach:** D3.js line chart representing relative power/torque curve shape based on parameter values.

---

## Hero Section

Full-width dark hero with:
- Sharp headline (e.g. "RC Drift. Dialed In.")
- One-line subtext describing the site
- CTA button to `/tools` in `#FF0020`
- Subtle CSS/SVG animation as background — technical/geometric feel (e.g. animated track lines, grid, or abstract geometry). No video — keeps load fast.

### Servo & Gyro Visualizer (Stub)
Visualize how gyro gain, gyro direction, and servo speed/endpoint settings affect the servo output signal and steering response.

**v1 scope:** TBD — needs full spec before implementation.

---

## Design Direction

- **Aesthetic:** Clean, technical, dark-mode friendly. Think tuning software, not a lifestyle blog. Pages should adopt a congruent global template.
- **Color scheme:** Follows system preference (light/dark) by default. Manual toggle in the nav allows override.
- **Palette:** Primary accent `#FF0020` with tints and shades. No pure black (`#000`) or pure white (`#fff`) — use near-black (e.g. `#0D0D0D`) and near-white (e.g. `#F5F5F5`) instead. Accent used for interactive elements: buttons, links, active nav, slider handles, highlights.
- **Typography:** Geist Sans for content pages; Geist Mono for tool UIs, readouts, and numeric values. Both are bundled with Next.js via `create-next-app` — no extra dependency.
- **Mobile-first:** Tools are designed for phone use at the track — touch-friendly controls, finger-sized tap targets, portrait-friendly layouts. Tablet and desktop are enhanced experiences, not the baseline.
- **PWA:** Custom branded install prompt triggered after a user visits any tool page. Service worker caches all tool assets for full offline use. No login required — localStorage handles all persistence.

---

## Blog

Posts are written as Markdown files in `content/posts/` with frontmatter for metadata (title, date, slug, description, type). Next.js reads and renders them at build time — no CMS, no database, no admin UI. Publishing a post means committing a `.md` file and pushing to main.

Content types are distinguished via a `type` frontmatter field (e.g. `guide`, `post`). Guides can be pinned or featured on the home page. No separate `/guides` route — everything lives under `/blog`.

---

## Podcast

Live streamed weekly on YouTube. The site surfaces this in two places:
- **Home page:** Latest episode embedded or featured prominently
- **`/podcast` page:** Full episode list as a grid with thumbnails, pulled from the YouTube channel via YouTube Data API (free tier, no cost)

YouTube channel: `@yadmah` (https://www.youtube.com/@yadmah). Channel URL and API key stored in environment variables. Both YouTube and Instagram content fetched at build time — API failures surface as a failed Vercel build, not a broken page for visitors. No runtime error handling needed for these sections.

---

## Instagram Integration

Home page displays Instagram content via the official Instagram profile embed widget. The embed loads client-side via `embed.js` (using `next/script` with `strategy="lazyOnload"`) and always reflects the current profile without any API tokens or token refresh.

No environment variables required. No API dependency — Meta shut down the Instagram Basic Display API in December 2024.

---

## Event Calendar

Dedicated `/events` page listing upcoming (and past) events. Data managed as a static config file in the repo (name, date, location, series). Adding an event means updating the file and pushing to main. Past events automatically sorted below upcoming ones at build time.

---

## Sponsors

Dedicated section on the home page — sponsor logos with links to their websites. Also mentioned on the `/about` page. Sponsor data stored as a static JSON or TypeScript config file in the repo (name, logo, URL). Adding/removing a sponsor means updating that file and pushing to main.

---

## Footer

Minimal — Instagram link (@hotdogracingus) and copyright only. No nav links, no GitHub link.

---

## SEO

Every page includes title, meta description, and Open Graph tags via Next.js metadata API — no cost, built into the framework. Enables proper link previews on social and iMessage and basic search visibility. No paid SEO tools.

---

## Non-Goals (v1)

- User accounts or server-side persistence
- Community features (comments, forums)
- e-commerce
- Native mobile app (React Native) — PWA covers the mobile use case; native is a future option if demand warrants it
- Results tracker — contingent on rcdrift.io API availability, deferred indefinitely
