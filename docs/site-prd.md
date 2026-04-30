# hotdog-racing.com — Site PRD

## Overview

A personal hub for the RC drift community. The site combines static content (about, guides, blog) with specialized interactive engineering tools built for RC drift setup and tuning. Built as a Progressive Web App (PWA) — installable on mobile home screens and functional offline.

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
| `/` | Home — intro, featured tools, latest content |
| `/about` | Who Logan is, RC background |
| `/guides` | Written setup guides and how-tos |

### Tools
| Route | Tool | Status |
|---|---|---|
| `/tools/suspension` | Suspension Alignment Visualizer | Planned |
| `/tools/esc` | ESC Settings Visualizer | Planned |

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

## Design Direction

- **Aesthetic:** Clean, technical, dark-mode friendly. Think tuning software, not a lifestyle blog.
- **Typography:** Monospace or semi-technical feel for tool UIs; readable sans-serif for content pages.
- **Mobile-first:** Tools are designed for phone use at the track — touch-friendly controls, finger-sized tap targets, portrait-friendly layouts. Tablet and desktop are enhanced experiences, not the baseline.
- **PWA:** Installable via browser prompt. Service worker caches all tool assets for full offline use. No login required — localStorage handles all persistence.

---

## Non-Goals (v1)

- User accounts or server-side persistence
- Community features (comments, forums)
- e-commerce
- Native mobile app (React Native) — PWA covers the mobile use case; native is a future option if demand warrants it
