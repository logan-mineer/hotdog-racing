import type { ThrottleCurveMode } from './config'

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

export type TorquePowerParams = {
  motorTurn: number
  motorCanTiming: number
  boostTiming: number
  boostStartRPM: number
  boostEndRPM: number
  turboTiming: number
  turboActive: boolean
}

export type TorquePowerPoint = { rpm: number; torque: number; power: number }

export function torquePowerCurve(params: TorquePowerParams, N = 200): TorquePowerPoint[] {
  const kv = motorKV(params.motorTurn)
  const rpmNoloadBase = kv * 8.4
  const rpmSampleMax = rpmNoloadBase * 1.6

  const raw: { rpm: number; torque: number; power: number }[] = []
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
    const rpmMax = rpmNoloadBase * (1 + theta * 0.007)
    const tStall = Math.cos((theta * Math.PI) / 180)
    const torque = Math.max(0, tStall * (1 - rpm / rpmMax))
    const power = torque * rpm
    raw.push({ rpm, torque, power })
  }

  const maxTorque = Math.max(...raw.map(p => p.torque))
  const maxPower = Math.max(...raw.map(p => p.power))
  return raw.map(p => ({
    rpm: p.rpm,
    torque: maxTorque > 0 ? (p.torque / maxTorque) * 100 : 0,
    power: maxPower > 0 ? (p.power / maxPower) * 100 : 0,
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

  // Phantom points give horizontal tangents at the endpoints (natural boundary).
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

  // Enforce monotonic non-decreasing
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
