# Suspension Alignment Visualizer — Tool Spec

## Overview

An interactive tool that helps RC drift drivers understand front-end alignment by surfacing the relationship between the physical adjustments they make on the car and the alignment values that result. Drivers move sliders representing real parts (lower arm length, caster spacers, hex thickness, tie rod attach point), and a live wireframe plus numeric readouts show what those changes do to camber, toe, caster, KPI, trail, scrub radius, ackerman, bump steer, and dynamic camber.

The tool inverts the usual setup-software model. Instead of "set camber to -3°," users tune the parts they actually touch on the car. Alignment values are *outputs*. This matches how RC drift cars are actually adjusted at the bench and at the track, and exposes the relationships between settings — the stated educational goal.

**Route:** `/tools/suspension`

**v1 scope:** Generic geometry model — universal parameters, one baseline chassis profile loosely modeled on a typical 1/10 MR drift platform. Per-chassis presets (MD3, RMX, MS-01D, etc.) are a future phase.

---

## Layout

Three panel regions plus a wireframe region:

- **Wireframe** — top view above rear view, stacked vertically
- **Setup panel** — driver-tunable physical adjustments + collapsible chassis config
- **Readout panel** — static and live derived alignment values
- **State sliders** — steering, left wheel travel, right wheel travel (compact, scrubber-style)

### Mobile (portrait phone, primary target)

The wireframe is sticky-pinned to the top of the viewport (~50% of viewport height, with both views stacked inside it). The state sliders are sticky-pinned to the bottom (~12% of viewport height, compact horizontal rows). The middle ~38% scrolls and contains the setup panel, readout panel, and chassis config (collapsed by default).

This pattern keeps the wireframe and state-articulation controls always reachable while the user explores setup changes. The setup panel is the only thing that scrolls.

### Desktop

Three columns: setup panel (left), wireframe (center, top above rear), readout panel (right). State sliders span the bottom as a sticky horizontal scrubber.

### Tablet

Two columns with state sliders still bottom-docked.

### Save/load slot manager

Slide-up sheet on mobile, dropdown on desktop. Surfaced from a "Working from: <slot name>" indicator at the top of the setup panel.

---

## Inputs

### Setup (driver-tunable, mirror-symmetric, persists)

These are the parts a driver adjusts at the track or bench. Mirror-symmetric: one slider per parameter applied to both wheels.

| Parameter | Input Type | Notes |
|---|---|---|
| Lower arm length | Slider (mm) | Adjusted via lower arm turnbuckle/length; primary camber control |
| Tie rod length | Slider (mm) | Adjusted via tie rod turnbuckle; primary toe control |
| Caster spacer position | Slider (0–15°, 1° step) | Set by spacer order on upper arm hinge pin; discrete in reality, slider for continuity |
| Carrier tie rod inboard offset | Slider (mm, small window) | Adjustable within the knuckle's pickup window; affects ackerman + lock geometry |
| Carrier tie rod height | Slider (mm, small window) | Adjusted via spacers; affects bump steer + ackerman |
| Steering rack fore/aft | Slider (mm) | Adjusted on direct-drive and slide-rack chassis; affects ackerman |
| Wheel hex thickness | Slider (mm, 1mm step) | Selects hex part; affects scrub radius and lock clearance |
| Wheel offset | Slider (mm) | Selects wheel; affects scrub radius and lock clearance |
| Ride height | Slider (mm) | Baseline suspension position; setup, not state |

### Chassis config (mirror-symmetric, persists, collapsed under "Advanced")

Set once per session for a given chassis. Hidden by default to avoid overwhelming new users.

| Parameter | Input Type |
|---|---|
| Upper arm length | Slider (mm) — driven by body/shock clearance, not alignment |
| Suspension block width | Slider (mm) |
| Suspension block height | Slider (mm) |
| Carrier height | Slider (mm) |
| Tire OD | Slider (mm) |
| Steering rack type | Selector: Wiper / Direct Drive / Slide Rack |
| Steering rack dimensions | Sliders for height, width, radius, inclination |

### State (ephemeral, never persists)

These describe what the car is doing right now, not how it's configured. Reset to neutral on every page load. Not exported.

| Slider | Range | Purpose |
|---|---|---|
| Steering input | -100% to +100% (full lock left to full lock right) | Drives top-view steering animation |
| Left wheel travel | Bump/droop offset from ride height (mm) | Drives rear-view articulation |
| Right wheel travel | Bump/droop offset from ride height (mm) | Drives rear-view articulation |

Slider ranges and v1 baseline default values live in `lib/suspension/config.ts`. Initial values are placeholders pinned by TODO and refined during implementation by referencing measured values on a reference 1/10 MR drift chassis.

---

## Wireframe

Top view above rear view, both always visible. SVG rendered in mm units, scaled to container width. No side view in v1 (caster and trail surface as numerical readouts; side view is a future phase).

### Drawn elements (Tier 3)

The minimum element set such that every input slider produces a visible change in the diagram:

- Wheels (tire + rim/hub)
- Upper and lower A-arms
- Kingpin axis (rendered through both views as a line)
- Tie rods
- Steering rack
- Pivot points (suspension blocks, ball joints) as small dots

Excluded from v1: chassis silhouette, body, suspension block geometry beyond pivot points, force vectors, contact patch shading.

### Reference lines

Muted, dashed grid-style lines that anchor the geometry visually:

- Ground line (rear view, plus tire bottoms in top view)
- Vertical reference per wheel (rear view, dashed) — reads against the wheel plane to make camber visible
- Chassis centerline (top view, dashed) — anchor for toe and ackerman
- Wheel rotation axis (top view, per wheel) — reads against centerline for toe
- Kingpin axis (both views) — solid colored, primary geometric reference

### Ghost state

When any state slider is non-neutral, a faint "ghost" of the resting/static configuration renders behind the live geometry. The ghost is wheel outline + kingpin axis only — not the full arm structure — to keep the diagram quiet while still showing the delta. Ghost can be toggled off in the state slider area.

### Color scheme

| Element | Color | Weight | Style |
|---|---|---|---|
| Tire | Foreground | 2.5px | Solid |
| Wheel rim/hub | Foreground at 60% | 1.5px | Solid |
| Upper arms | Foreground at 75% | 2px | Solid |
| Lower arms | Foreground at 75% | 2px | Solid |
| Tie rods | `#FF0020` | 2px | Solid |
| Steering rack | `#FF0020` | 2px | Solid |
| Kingpin axis | `#FF0020` | 1.5px | Dashed |
| Pivot points | Foreground | 4px circle | — |
| Reference lines | Foreground at 25% | 1px | Dashed |
| Ghost state | Foreground at 30% | 1.5px | Solid |

Foreground is near-white in dark mode, near-black in light mode. Brand red is constant across modes and reserved for the steering system, which ties the wireframe visually to the brand color used elsewhere on the site (slider handles, CTAs).

### Animation

Snap updates on every slider change. No tweened transitions. With decoupled 2D math, every frame is cheap and continuous slider drag already produces smooth visual motion.

### Labels

No labels on the wireframe in v1. The setup panel labels every input; the diagram is self-explanatory once a user has worked through the controls.

---

## Readouts

Right-aligned monospace (Geist Mono per site PRD), 0.1° / 0.1mm / integer % precision. Tap-to-expand on mobile, hover on desktop reveals a tooltip describing each metric.

### Static (mirror-symmetric, one value)

| Readout | Unit | Description |
|---|---|---|
| Camber | ° | Wheel plane angle vs. vertical |
| Caster | ° | Kingpin axis angle vs. vertical (side plane) |
| Toe | ° per side | Wheel rotation axis angle vs. chassis centerline |
| Kingpin Inclination | ° | Kingpin axis angle vs. vertical (rear plane) |
| Trail | mm | Distance from kingpin axis to tire contact center, along ground |
| Scrub radius | mm | Distance from kingpin axis to tire centerline, at ground |
| Ackerman | ° | At full lock, |inner| − |outer| wheel angle. 0° = parallel; positive = inner turns more (Ackermann). A true % would require wheelbase + track, which v1 does not carry. |
| Max steering lock | ° | Maximum achievable lock; warning if knuckle pivot blocks 90° |
| Bump steer rate | ° toe per mm bump | Rate of toe change with suspension travel |
| Dynamic camber gain | ° camber per mm bump | Rate of camber change with suspension travel |

### Live (per side, when state sliders are non-neutral)

Shown as L/R pairs because outputs may diverge under steering or articulation:

- Live camber (L/R)
- Live toe (L/R)
- Live scrub radius (L/R)

### Validation badges

None in v1. Drift-tune target ranges vary by surface, tire compound, and driver style. Encoding one set would mislead. Tooltips explain *what* each metric is; opinion about acceptable ranges is left to the driver.

---

## Math Model

All geometry math lives in `lib/suspension/model.ts` as pure functions. The model is **decoupled 2D**: the top view and rear view each have self-contained 2D math, and a small set of named bridge functions analytically computes cross-plane quantities (bump steer, dynamic camber gain, max lock).

This is dramatically cheaper to implement and verify than a full 3D kinematic solver, while delivering 90%+ of the tool's educational value. Cross-plane subtleties surface as numerical readouts; the wireframe is honest about being a 2D projection of 2D math per view.

### Bridge functions

| Function | Inputs | Output |
|---|---|---|
| `computeBumpSteer` | tie rod geometry, lower arm geometry, rack position | ° toe per mm bump |
| `computeDynamicCamberGain` | upper/lower arm lengths, block geometry | ° camber per mm bump |
| `computeAckermanDelta` | steering snapshot (kingpins, baseline attaches, rack balls, tie rod length, rack travel, rack type) | ° at full lock: |inner| − |outer| |
| `computeMaxSteeringLock` | tie rod length, rack travel, knuckle pickup | ° max lock (or `lockBlocked: true`) |
| `computeScrubRadius` | wheel offset, hex thickness, KPI, tire OD | mm at ground |
| `computeTrail` | caster, KPI, wheel offset, tire OD | mm at ground |

Each bridge function is independently unit-testable.

### Top-level entry

```
computeGeometry(setup, state) → Result<Geometry, GeometryError>
```

`Geometry` contains the wireframe element positions for both views plus all alignment readouts. `GeometryError` is a discriminated union — see below.

### Invalid geometry handling

The tool fails loud, not silent. Setup combinations that violate rigid-link constraints (lower arm too short to reach kingpin ball, tie rod too short, caster spacer stack overflowing the hinge pin, rack travel exceeded, wheel inside the chassis) return a `GeometryError` rather than producing a fudged "best effort" geometry.

`GeometryError` variants:

- `LowerArmTooShort`
- `TieRodTooShort`
- `CasterStackOverflow`
- `RackTravelExceeded`
- `WheelInsideChassis`
- `MaxLockBlocked` (warning only — geometry still solves, but max lock readout is reduced and accompanied by an explanation)

Each variant carries a `message: string` and `culprit: SetupKey[]` listing the sliders involved. The wireframe greys out and renders the error message overlaid; readouts show "—" except for those still computable from the partial geometry. Sliders remain unconstrained — the user can drag freely and learn the constraint by hitting it.

This honors the educational goal: constraint violations *are* relationships, and surfacing them ("max lock blocked: pivot is outboard of the wheel — increase hex thickness") is exactly the pedagogy the tool is for.

---

## Persistence

Two localStorage keys:

- `suspension-tool-current` — the working setup, auto-saved on every setup-slider change (no explicit save button needed for the unsaved working state)
- `suspension-tool-slots` — array of `{ id, name, savedAt, setup }` for named saved configurations, capped at 5

State sliders (steering, L/R wheel travel) **never** persist. They reset to neutral on every page load and are not included in JSON export.

### Slot operations

- **Save** — overwrites the active slot if one is loaded; behaves like Save As if no active slot
- **Save As…** — prompts for a name, creates a new slot, sets it as active
- **Rename**, **Duplicate**, **Delete** — slot manager actions; delete confirms
- **Slot cap** — soft limit at 5 slots; "Save As" beyond the cap surfaces a friendly "you're at the slot limit, delete one to save another" message
- **Active slot indicator** — top of setup panel: "Working from: <name>" with a "●" dot if dirty (current diverges from loaded slot)

### Export / Import

- **Export** — downloads `{ name, savedAt, version, setup }` as `suspension-{name}-{date}.json`. Does not include state.
- **Import** — file picker accepts JSON, validates against schema, loads into current. User can then "Save As" to capture as a slot.
- **Schema version** — JSON includes `version: 1`. Importer rejects unknown versions with a friendly error.
- **No shareable URL** in v1.

### Reset

A reset button restores the current setup to factory defaults from `config.ts`. Confirms before resetting.

---

## File Structure

```
app/tools/suspension/
  page.tsx              — assembly: holds React state, wires storage, passes geometry to components

lib/suspension/
  model.ts              — pure geometry functions, bridge functions, GeometryError union, computeGeometry entry
  model.test.ts         — unit tests for all math
  storage.ts            — localStorage wrapper, slot CRUD, schema versioning, import/export
  storage.test.ts       — round-trip serialization, schema rejection, slot cap enforcement
  config.ts             — slider ranges, defaults, step sizes, baseline chassis values, decimal precision

components/suspension/
  TopView.tsx           — SVG top-view wireframe (rendering only)
  RearView.tsx          — SVG rear-view wireframe (rendering only)
  SetupPanel.tsx        — setup sliders + collapsible chassis config
  StatePanel.tsx        — state sliders, bottom-docked
  ReadoutPanel.tsx      — static + live readouts with tooltips
  SlotManager.tsx       — save/load/rename/duplicate/delete/export/import UI
```

Components own rendering only. All geometry computation lives in `lib/suspension/model.ts` and is passed in as props. Mirrors the ESC tool's separation.

---

## Testing

Test coverage targets the deep modules. Component rendering is verified visually, matching the ESC tool's convention.

### `lib/suspension/model.ts` (extensive)

- Each derived alignment value (camber, caster, toe, KPI, trail, scrub, ackerman delta, max lock) at known inputs against hand-computed expected values
- Each bridge function (`computeBumpSteer`, `computeDynamicCamberGain`, `computeAckermanDelta`, `computeMaxSteeringLock`, `computeScrubRadius`, `computeTrail`) at known inputs
- Each `GeometryError` variant — verify it triggers when expected, doesn't when geometry is valid
- Boundary cases: zero arm angles, vertical kingpin (KPI = 0), zero caster, zero steering input, neutral travel
- Property tests: monotonicity (e.g. lower arm length increasing → camber more negative across a valid range)

### `lib/suspension/storage.ts` (lighter)

- Round-trip serialize/deserialize through localStorage
- Slot cap enforcement (sixth save fails cleanly)
- Schema version rejection on import (unknown version → friendly error)
- Name-conflict handling on import / Save As

### `lib/suspension/config.ts` (none)

Pure data, no logic.

### Components (none)

Visual; verified by eye. Same convention as the ESC tool's `components/esc/`.

---

## Sanity Check

The math model is deterministic geometry — no empirical constants, no calibration phase. Unlike the ESC tool, there is nothing to "tune" against measured data. The math *is* the answer.

A one-time sanity check is still worthwhile: dial in actual measurements from a reference chassis, verify the readouts agree with what a camber gauge / toe gauge / KPI measurement reads on the real car. If they diverge, the bug is in the math, not in any constant. Target: agreement within ~5% on camber, toe, and KPI.

---

## Out of Scope (v1)

- Side view (caster and trail visualization beyond numerical readouts)
- Real chassis presets (MD3, RMX, MS-01D, etc. as named JSON profiles pre-filling chassis config)
- Per-side asymmetric setup (left/right independent setup sliders)
- Shareable URL (state encoded in query param)
- SVG drag-handle interactivity (dragging arm endpoints, rack ball, etc. directly on the diagram instead of via sliders)
- Validation badges on readouts ("typical drift range" green checks)
- Animated transitions between states (smooth tween on slider drag)
- Wireframe element labels
- Comparison mode (stock vs. custom side-by-side)

These are deferred but the math model and file structure are designed to accommodate them — adding side view, presets, or unmirrored setup is additive work that does not require a rewrite.

---

## Further Notes

The ESC tool PRD (`docs/esc-tool-prd.md`) is the structural template for this tool. Where conventions converge — file structure, separation of pure math from rendering components, monospace numeric readouts, JSON persistence — the suspension tool mirrors them. Where they diverge (named slots vs single auto-saved state, fail-loud geometry errors vs continuous tunable curves), the divergence is explicit and motivated by the difference between "tune this curve" and "configure this car."
