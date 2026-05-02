# ESC Settings Visualizer — Tool Spec

## Overview

An interactive tool that helps RC drift drivers understand how ESC and motor settings affect power delivery. Users adjust sliders and see a live-updating chart respond — visualizing the relationship between timing, torque, and RPM in a way that makes abstract ESC parameters intuitive.

**Route:** `/tools/esc`

**Reference hardware:** Acuvance Xarvis XX ESC + Acuvance Agile 10.5T motor, 2S LiPo (8.4V fully charged). All parameter ranges and defaults are sourced from the Xarvis XX / TAO III documentation.

---

## Layout

Three tabs: **Timing**, **Throttle**, **Braking**.

Each tab contains a parameter panel (sliders and selectors) and a D3.js chart. On mobile: parameter panel stacks above the chart. On desktop: panel on the left, chart on the right.

All slider values auto-save to localStorage on change and restore on page load.

### Chart interactions (all tabs)

Every D3 chart must support a hover tooltip:
- On mouse hover (or touch drag on mobile), a tooltip appears anchored to the cursor's x-position
- Tooltip displays the x-axis value (RPM or throttle %) and all y-axis values at that position (e.g. torque %, power % on the Timing tab)
- Tooltip follows the cursor and must not clip outside chart bounds
- A vertical hairline at the cursor x-position helps read values off the curve

---

## Tab 1: Timing

### Goal
Show how motor can timing, boost timing, and turbo timing interact to shift the motor's torque and power output across the RPM range.

### Chart
**Dyno-style dual Y-axis chart.**

- X-axis: Motor RPM (0 to max possible RPM given current settings, with 10% headroom)
- Y-axis left: Torque (normalized, 0–100%)
- Y-axis right: Power (normalized, 0–100%)
- Two curves on the same chart: torque (solid) and power (dashed)
- A persistent 0° timing reference curve (all timing parameters at zero) is always visible as a muted/dashed background line, regardless of current settings — gives users a baseline to compare against
- Vertical line at `rev_limit_rpm` if enabled
- When turbo toggle is ON: primary curves show boost + turbo state; a faded ghost of the boost-only curves stays visible behind them
- Y-axis left (torque) scales dynamically — upper bound expands to fit the maximum torque value produced by current settings; the curve must never be clipped at the top

The curve is not static — it **bends** through the boost RPM zone because effective timing changes with RPM. Below `boost_start_rpm` the curve reflects base timing only. Through the boost ramp zone it transitions. Above `boost_end_rpm` it reflects full boost timing.

### Live Readout
A prominent numeric display with three metrics, all updating continuously as sliders move:

- **Total timing at peak power RPM** — `motor_can_timing + boost_timing (at that RPM) + turbo_timing (if toggled)`
- **Total cumulative timing** — the area under the `θ_total(rpm)` curve across the full RPM range; represents aggregate timing exposure across the power band
- **Peak RPM** — the RPM at which the power curve reaches its maximum for the current settings and rotor variant

### Parameters

| Parameter | Input Type | Range | Notes |
|---|---|---|---|
| Motor turn | Number input | 4.5–21.5T (0.5 step) | Derives KV; show computed KV as read-only label (KV ≈ 40,000 ÷ turns) |
| Motor can timing | Slider | 0–30° (1° step) | Physical timing ring on motor can |
| Boost timing | Slider | 0–60° (1° step) | Full boost timing at and above boost end RPM |
| Boost start RPM | Slider | 1,000–40,000 RPM (500 step) | RPM where boost begins to ramp in |
| Boost end RPM | Slider | 10,000–100,000 RPM (500 step) | RPM where full boost timing is reached |
| Turbo timing | Slider | 0–60° (1° step) | Added on top of boost when turbo toggle is ON |
| Rev limit | Slider + toggle | OFF or 10,000–100,000 RPM (1,000 step) | Shown as vertical line on chart |

**Turbo toggle:** A button labeled "WOT / Turbo" below the turbo timing slider. When active: curve morphs to include turbo timing, ghost of boost-only curve is displayed. Toggle communicates that turbo is throttle-triggered, not always-on.

Turbo on/off slope values are shown as read-only informational labels next to the turbo timing slider with a one-line descriptor: "higher = turbo hits faster / fades faster."

---

## Tab 2: Throttle

### Goal
Show how the ESC translates throttle stick position into motor power output, and how initial speed and throttle curve shape that response.

### Chart
**Throttle response curve.**

- X-axis: Throttle stick position (0–100%)
- Y-axis: Effective motor power output (0–100%)
- Single morphing curve, updates live

The curve has three shape-defining behaviors:
1. **Dead band** (`free_zone_adjust`): flat at 0% output for the first N% of stick travel
2. **Initial speed jump**: power immediately steps up to `initial_speed`% as soon as the stick exits the dead band
3. **Throttle curve shaping**: the ramp from `initial_speed`% to 100% is linear, convex (positive curve), or concave (negative curve) depending on `throttle_curve`

### Parameters

| Parameter | Input Type | Range | Notes |
|---|---|---|---|
| Initial speed | Slider | 0–50% (2% step) | Immediate power at throttle start |
| Free zone adjust | Slider | 1–10% (1% step) | Dead band before throttle engages |
| Throttle curve | Selector | Negative / Linear / Positive | Negative = soft start, aggressive top; Positive = aggressive start, soft top |
| Drive frequency | Selector | 1–64 kHz | Shown as labeled selector with descriptor: "lower = punchier / less smooth, higher = smoother / more RPM / more heat" |

Drive frequency does not affect the power curve shape and has no chart.

---

## Tab 3: Braking

### Goal
Show how the three brake power settings combine to define the braking force profile across the full brake input range.

### Chart
**Brake force curve.**

- X-axis: Brake stick input (0–100%, where 0% = throttle at neutral)
- Y-axis: Braking force (0–100%)
- Single morphing curve through three anchor points
- Curve interpolates smoothly between anchor points (monotonic)

The three anchor points:
- **(0%, neutral_brake_power)** — drag brake applied whenever throttle is at neutral
- **(~5%, initial_brake_power)** — force at first brake contact
- **(100%, full_brake_power)** — force at full brake input

### Parameters

| Parameter | Input Type | Range | Notes |
|---|---|---|---|
| Neutral brake power | Slider | 0–100% (2% step) | Drag brake at neutral throttle |
| Initial brake power | Slider | 0–50% (2% step) | Braking force at first brake touch |
| Full brake power | Slider | 0–100% (2% step) | Braking force at full brake input |
| Neutral brake frequency | Selector | 0.5–32 kHz | Labeled selector: "lower = quicker braking, higher = smoother" |
| Brake frequency | Selector | 0.5–32 kHz | Labeled selector: "lower = quicker braking, higher = smoother" |

---

## Math Model

All motor math lives in `lib/esc/model.ts` as pure functions. The model is physically motivated but intentionally simplified for illustration — values are qualitatively correct, not dyno-accurate.

### Motor Constants
```
KV = 40_000 / turn_count
RPM_noload_base = KV × 8.4
```

### Effective Timing at a Given RPM
```
θ_boost(rpm) =
  rpm < boost_start_rpm  → 0
  boost_start_rpm ≤ rpm ≤ boost_end_rpm → boost_timing × (rpm - boost_start_rpm) / (boost_end_rpm - boost_start_rpm)
  rpm > boost_end_rpm    → boost_timing

θ_total(rpm) = motor_can_timing + θ_boost(rpm) + (turbo_timing if turbo toggle ON else 0)
```

### Torque-Speed Curve
Sampled at N = 200 RPM points from 0 to `RPM_noload_base × 1.6` (to show the full range across all timing settings):

```
RPM_max(θ) = RPM_noload_base × (1 + θ × 0.007)
T_stall(θ)  = cos(θ × π / 180)          // normalized: 1.0 at 0°, ~0.5 at 60°
T(rpm, θ)   = max(0, T_stall(θ) × (1 - rpm / RPM_max(θ)))
```

Power is derived from torque:
```
P(rpm) = T(rpm) × rpm    // in arbitrary units, normalized to chart scale
```

Both torque and power curves are normalized independently to their own 0–100% scale for display.

### Throttle Curve
```
// Remap stick position past the dead band
x = (stick_pct - free_zone_adjust) / (1 - free_zone_adjust)   // 0–1 after dead band
x = clamp(x, 0, 1)

// Apply throttle curve shaping (k: negative curve = -1, linear = 0, positive = +1)
x_shaped = k < 0 ? x^(1 - 0.5×|k|) : x^(1 / (1 + 0.5×k))   // approximate

// Apply initial speed jump
power = initial_speed + x_shaped × (100 - initial_speed)
```

### Brake Curve
Catmull-Rom spline through the three anchor points:
- `(0, neutral_brake_power)`
- `(5, initial_brake_power)`
- `(100, full_brake_power)`

Clamped to [0, 100] and monotonically enforced.

---

## File Structure

```
app/tools/esc/
  page.tsx              — tab shell, localStorage save/restore, parameter state

lib/esc/
  model.ts              — torque/power/throttle/brake curve math (pure functions)
  model.test.ts         — unit tests for all math functions
  config.ts             — parameter ranges, defaults, step sizes

components/esc/
  TimingChart.tsx       — D3 dual-axis torque+power chart
  ThrottleChart.tsx     — D3 throttle response chart
  BrakeChart.tsx        — D3 brake force chart
```

Components own rendering only. All curve data is computed in `lib/esc/model.ts` and passed in as props.

---

## Real-World Validation

The math model is physically motivated but unvalidated against measured data. The goal is to close this gap by testing the actual reference hardware (Acuvance Xarvis XX + Agile 10.5T, 2S) and calibrating the model where it diverges from reality.

### Process

1. **Draft a test plan** — document what to measure (peak RPM at minimum), how to measure it (optical tachometer, ESC telemetry, or video analysis), which settings to vary, and what data to record. This phase can be completed by an agent.
2. **Run the tests** — owner runs the physical tests on the car and records measurements.
3. **Calibrate** — compare measurements against model output at matching parameter values; adjust constants in `lib/esc/model.ts` where the model diverges meaningfully from reality.

### What to measure (minimum)

- Peak no-load RPM at various can timing values (0°, 10°, 20°, 30°) with boost and turbo off
- Peak no-load RPM at several boost timing values with fixed can timing

These data points are sufficient to validate `RPM_max(θ)` — the most consequential output of the model.

### Calibration target

The model should predict peak RPM within ~10% of measured values across the tested parameter range. Constants to tune: the `0.007` timing multiplier in `RPM_max(θ)` and the `RPM_noload_base` calculation.

---

## Persistence

On every slider/selector change, serialize the full parameter state as JSON to `localStorage` under key `esc-tool-settings`. On page load, read and restore. No explicit save button.
