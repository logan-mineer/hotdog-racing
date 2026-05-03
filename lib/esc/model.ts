import type { ThrottleCurveMode } from './config'

// Converts combined ESC timing degrees to an effective field-weakening angle.
// Calibrated from real hardware: Acuvance Xarvis XX + Agile 10.5T on 2S (8.4V),
// 95° combined timing → ~100k RPM peak. Derived: cos⁻¹(32k/100k) / 95° ≈ 0.75.
const TIMING_ADVANCE_SCALE = 0.75

const VOLTAGE_2S = 8.4

export function motorKV(turnCount: number): number {
  return 40_000 / turnCount
}

export function boostTimingAtRPM(
  rpm: number,
  boostTiming: number,
  boostStartRPM: number,
  boostEndRPM: number,
): number {
  if (rpm < boostStartRPM) return 0
  if (rpm > boostEndRPM) return boostTiming
  return boostTiming * (rpm - boostStartRPM) / (boostEndRPM - boostStartRPM)
}

export function effectiveTiming(
  rpm: number,
  motorCanTiming: number,
  boostTiming: number,
  boostStartRPM: number,
  boostEndRPM: number,
  turboTiming: number,
  turboActive: boolean,
): number {
  return (
    motorCanTiming +
    boostTimingAtRPM(rpm, boostTiming, boostStartRPM, boostEndRPM) +
    (turboActive ? turboTiming : 0)
  )
}

// Effective field-weakening angle in radians, clamped just below 90°
// to keep cos() positive and torque physically meaningful.
function fieldAngle(totalTimingDeg: number): number {
  const raw = totalTimingDeg * TIMING_ADVANCE_SCALE * (Math.PI / 180)
  return Math.min(raw, (89 * Math.PI) / 180)
}

export type TorquePowerParams = {
  motorTurn: number
  motorCanTiming: number
  boostTiming: number
  boostStartRPM: number
  boostEndRPM: number
  turboTiming: number
  turboActive: boolean
  // KV scale relative to LV30 standard rotor (1.0 = LV30, 30/38 = LV38, 30/42 = LV42).
  // Defaults to 1.0 (LV30) if omitted.
  rotorKvScale?: number
}

export type TorquePowerPoint = { rpm: number; torque: number; power: number }

export function cumulativeTiming(params: TorquePowerParams): number {
  return params.motorCanTiming + params.boostTiming + (params.turboActive ? params.turboTiming : 0)
}

export function peakRPM(params: TorquePowerParams): number {
  const rpmBase = motorKV(params.motorTurn) * (params.rotorKvScale ?? 1.0) * VOLTAGE_2S
  return rpmBase / Math.cos(fieldAngle(cumulativeTiming(params)))
}

export function torquePowerCurve(params: TorquePowerParams, N = 200): TorquePowerPoint[] {
  const kvBase = motorKV(params.motorTurn)
  const rotorKvScale = params.rotorKvScale ?? 1.0
  // No-load RPM for this rotor at 0° timing
  const rpmBase = kvBase * rotorKvScale * VOLTAGE_2S
  // LV30 reference values for normalization (kvScale = 1.0, 0° timing)
  const rpmBaseRef = kvBase * VOLTAGE_2S
  const T_ref = 1.0            // LV30 stall torque at 0° timing
  const P_ref = rpmBaseRef / 4 // LV30 peak power (occurs at RPM_max/2 for linear T-RPM)

  // Sample range covers all configured timing including turbo, so the axis is
  // stable when the turbo toggle is flipped and ghost curves are visible.
  const thetaForRange = params.motorCanTiming + params.boostTiming + params.turboTiming
  const rpmSampleMax = (rpmBase / Math.cos(fieldAngle(thetaForRange))) * 1.1

  const raw: TorquePowerPoint[] = []
  for (let i = 0; i <= N; i++) {
    const rpm = (i / N) * rpmSampleMax
    const theta = effectiveTiming(
      rpm,
      params.motorCanTiming,
      params.boostTiming,
      params.boostStartRPM,
      params.boostEndRPM,
      params.turboTiming,
      params.turboActive,
    )
    const beta = fieldAngle(theta)
    const cosBeta = Math.cos(beta)

    // Field weakening: stall torque ∝ cos(β)/kvScale, RPM ceiling ∝ 1/cos(β)
    // Their product = rpmBase/kvScale = KV_base × V = constant — timing conserves power.
    const tStall = (1 / rotorKvScale) * cosBeta
    const rpmCeil = rpmBase / cosBeta

    const torque = Math.max(0, tStall * (1 - rpm / rpmCeil))
    raw.push({ rpm, torque, power: torque * rpm })
  }

  // Normalize to LV30-at-0°-timing reference so the chart communicates
  // absolute losses: stall torque < 100% = timing cost, > 100% = stronger rotor.
  return raw.map(p => ({
    rpm: p.rpm,
    torque: (p.torque / T_ref) * 100,
    power: (p.power / P_ref) * 100,
  }))
}

export type ThrottleCurveParams = {
  initialSpeed: number
  freeZoneAdjust: number
  throttleCurve: ThrottleCurveMode
}

export type ThrottlePoint = { stick: number; power: number }

export function throttleCurve(params: ThrottleCurveParams, N = 200): ThrottlePoint[] {
  const { initialSpeed, freeZoneAdjust, throttleCurve: curveMode } = params
  const deadBandFraction = freeZoneAdjust / 100
  const k = curveMode === 'negative' ? -1 : curveMode === 'positive' ? 1 : 0

  const points: ThrottlePoint[] = []
  for (let i = 0; i <= N; i++) {
    const stick = (i / N) * 100
    const stickFraction = stick / 100

    if (stickFraction <= deadBandFraction) {
      points.push({ stick, power: 0 })
      continue
    }

    const x = (stickFraction - deadBandFraction) / (1 - deadBandFraction)

    let xShaped: number
    if (x === 0) {
      xShaped = 0
    } else if (k < 0) {
      xShaped = Math.pow(x, 1 - 0.5 * Math.abs(k))
    } else if (k > 0) {
      xShaped = Math.pow(x, 1 / (1 + 0.5 * k))
    } else {
      xShaped = x
    }

    points.push({ stick, power: initialSpeed + xShaped * (100 - initialSpeed) })
  }
  return points
}

export type BrakeCurveParams = {
  neutralBrakePower: number
  initialBrakePower: number
  fullBrakePower: number
}

export type BrakePoint = { input: number; force: number }

export function brakeCurve(params: BrakeCurveParams, N = 200): BrakePoint[] {
  const { neutralBrakePower, initialBrakePower, fullBrakePower } = params

  const p0 = { y: neutralBrakePower }
  const p1 = { y: neutralBrakePower }
  const p2 = { y: initialBrakePower }
  const p3 = { y: fullBrakePower }
  const p4 = { y: fullBrakePower }

  const points: BrakePoint[] = []
  for (let i = 0; i <= N; i++) {
    const input = (i / N) * 100
    let force: number
    if (input <= 5) {
      force = catmullRom(p0.y, p1.y, p2.y, p3.y, input / 5)
    } else {
      force = catmullRom(p1.y, p2.y, p3.y, p4.y, (input - 5) / 95)
    }
    points.push({ input, force: Math.min(100, Math.max(0, force)) })
  }

  for (let i = 1; i < points.length; i++) {
    if (points[i].force < points[i - 1].force) {
      points[i].force = points[i - 1].force
    }
  }

  return points
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  )
}
