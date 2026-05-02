import { describe, it, expect } from 'vitest'
import {
  motorKV,
  boostTimingAtRPM,
  effectiveTiming,
  torquePowerCurve,
  throttleCurve,
  brakeCurve,
} from './model'

describe('motorKV', () => {
  it('returns 40000 / turnCount', () => {
    expect(motorKV(10)).toBe(4000)
    expect(motorKV(10.5)).toBeCloseTo(3809.52, 1)
    expect(motorKV(4.5)).toBeCloseTo(8888.89, 1)
    expect(motorKV(21.5)).toBeCloseTo(1860.47, 1)
  })

  it('increases as turn count decreases', () => {
    expect(motorKV(5)).toBeGreaterThan(motorKV(10))
    expect(motorKV(10)).toBeGreaterThan(motorKV(15))
  })
})

describe('boostTimingAtRPM', () => {
  it('returns 0 below boost start RPM', () => {
    expect(boostTimingAtRPM(0, 30, 5000, 20000)).toBe(0)
    expect(boostTimingAtRPM(4999, 30, 5000, 20000)).toBe(0)
  })

  it('returns full boost timing above boost end RPM', () => {
    expect(boostTimingAtRPM(20001, 30, 5000, 20000)).toBe(30)
    expect(boostTimingAtRPM(100000, 30, 5000, 20000)).toBe(30)
  })

  it('linearly ramps between start and end RPM', () => {
    // Midpoint of [5000, 20000] is 12500 → should be 50% of 30° = 15°
    expect(boostTimingAtRPM(12500, 30, 5000, 20000)).toBeCloseTo(15, 5)
    // Quarter point: 8750 → 25% of 30° = 7.5°
    expect(boostTimingAtRPM(8750, 30, 5000, 20000)).toBeCloseTo(7.5, 5)
  })

  it('returns 0 when boostTiming is 0', () => {
    expect(boostTimingAtRPM(15000, 0, 5000, 20000)).toBe(0)
  })

  it('returns full boost at exactly boostEndRPM', () => {
    expect(boostTimingAtRPM(20000, 30, 5000, 20000)).toBe(30)
  })

  it('returns 0 at exactly boostStartRPM', () => {
    expect(boostTimingAtRPM(5000, 30, 5000, 20000)).toBe(0)
  })
})

describe('effectiveTiming', () => {
  it('sums can timing + boost at given RPM', () => {
    // Below boost start: effective = canTiming + 0
    expect(effectiveTiming(1000, 5, 30, 5000, 20000, 10, false)).toBe(5)
    // At peak boost: effective = canTiming + boostTiming
    expect(effectiveTiming(25000, 5, 30, 5000, 20000, 10, false)).toBe(35)
  })

  it('adds turbo timing when turboActive is true', () => {
    expect(effectiveTiming(25000, 5, 30, 5000, 20000, 10, true)).toBe(45)
  })

  it('excludes turbo timing when turboActive is false', () => {
    expect(effectiveTiming(25000, 5, 30, 5000, 20000, 10, false)).toBe(35)
  })

  it('returns only canTiming when boost and turbo are both zero', () => {
    expect(effectiveTiming(50000, 10, 0, 5000, 20000, 0, true)).toBe(10)
  })
})

describe('torquePowerCurve', () => {
  const baseParams = {
    motorTurn: 10.5,
    motorCanTiming: 0,
    boostTiming: 0,
    boostStartRPM: 5000,
    boostEndRPM: 20000,
    turboTiming: 0,
    turboActive: false,
  }

  it('returns N+1 points', () => {
    const pts = torquePowerCurve(baseParams, 200)
    expect(pts).toHaveLength(201)
  })

  it('first point starts at RPM 0', () => {
    const pts = torquePowerCurve(baseParams)
    expect(pts[0].rpm).toBe(0)
  })

  it('normalizes torque and power to 0–100 range', () => {
    const pts = torquePowerCurve(baseParams)
    const maxT = Math.max(...pts.map(p => p.torque))
    const maxP = Math.max(...pts.map(p => p.power))
    expect(maxT).toBeCloseTo(100, 5)
    expect(maxP).toBeCloseTo(100, 5)
  })

  it('all torque and power values are non-negative', () => {
    const pts = torquePowerCurve(baseParams)
    for (const p of pts) {
      expect(p.torque).toBeGreaterThanOrEqual(0)
      expect(p.power).toBeGreaterThanOrEqual(0)
    }
  })

  it('torque and power peaks occur at different RPM values', () => {
    const pts = torquePowerCurve(baseParams)
    const peakTorqueRPM = pts.reduce((best, p) => (p.torque > best.torque ? p : best)).rpm
    const peakPowerRPM = pts.reduce((best, p) => (p.power > best.power ? p : best)).rpm
    expect(peakPowerRPM).toBeGreaterThan(peakTorqueRPM)
  })

  it('curve bends through boost zone — torque differs below vs above boostStartRPM when boost > 0', () => {
    const withBoost = torquePowerCurve({
      ...baseParams,
      boostTiming: 30,
      boostStartRPM: 5000,
      boostEndRPM: 20000,
    })
    const noBoost = torquePowerCurve(baseParams)

    // Above boost end RPM, withBoost should have a different (shifted) torque curve shape
    const aboveBoostIdx = withBoost.findIndex(p => p.rpm > 20000)
    expect(aboveBoostIdx).toBeGreaterThan(0)

    // The curves should differ in the above-boost region
    const withBoostAbove = withBoost[aboveBoostIdx].torque
    const noBoostAbove = noBoost[aboveBoostIdx].torque
    expect(withBoostAbove).not.toBeCloseTo(noBoostAbove, 0)
  })

  it('turboActive=true produces a higher peak RPM ceiling than turboActive=false', () => {
    const withTurbo = torquePowerCurve({ ...baseParams, turboTiming: 40, turboActive: true })
    const noTurbo = torquePowerCurve({ ...baseParams, turboTiming: 40, turboActive: false })

    // With turbo: effective timing is higher everywhere → RPM_max is higher → torque reaches 0 at higher RPM
    const lastNonZeroTurbo = [...withTurbo].reverse().find(p => p.torque > 0)!
    const lastNonZeroNoTurbo = [...noTurbo].reverse().find(p => p.torque > 0)!
    expect(lastNonZeroTurbo.rpm).toBeGreaterThan(lastNonZeroNoTurbo.rpm)
  })

  it('turboActive=true produces a broader curve shape than turboActive=false', () => {
    const withTurbo = torquePowerCurve({ ...baseParams, turboTiming: 40, turboActive: true })
    const noTurbo = torquePowerCurve({ ...baseParams, turboTiming: 40, turboActive: false })
    // Turbo extends RPM ceiling; at the same absolute RPM index the turbo curve retains
    // more torque because it hasn't fallen as far toward its (higher) zero-crossing.
    const midIdx = Math.floor(withTurbo.length / 2)
    expect(withTurbo[midIdx].torque).toBeGreaterThan(noTurbo[midIdx].torque)
  })
})

describe('throttleCurve', () => {
  const baseParams = {
    initialSpeed: 10,
    freeZoneAdjust: 5,
    throttleCurve: 'linear' as const,
  }

  it('returns N+1 points', () => {
    expect(throttleCurve(baseParams, 200)).toHaveLength(201)
  })

  it('returns 0 power within the dead band', () => {
    const pts = throttleCurve(baseParams)
    const deadBandPts = pts.filter(p => p.stick <= 5)
    for (const p of deadBandPts) {
      expect(p.power).toBe(0)
    }
  })

  it('power is 0 at stick=0 regardless of initialSpeed', () => {
    const pts = throttleCurve({ ...baseParams, initialSpeed: 30 })
    expect(pts[0].power).toBe(0)
  })

  it('power reaches 100 at full stick (linear mode)', () => {
    const pts = throttleCurve(baseParams)
    expect(pts[pts.length - 1].power).toBeCloseTo(100, 5)
  })

  it('all power values are in [0, 100]', () => {
    for (const mode of ['negative', 'linear', 'positive'] as const) {
      const pts = throttleCurve({ ...baseParams, throttleCurve: mode })
      for (const p of pts) {
        expect(p.power).toBeGreaterThanOrEqual(0)
        expect(p.power).toBeLessThanOrEqual(100)
      }
    }
  })

  it('negative and positive modes produce different curve shapes from linear', () => {
    const linear = throttleCurve(baseParams)
    const negative = throttleCurve({ ...baseParams, throttleCurve: 'negative' })
    const positive = throttleCurve({ ...baseParams, throttleCurve: 'positive' })

    const midIdx = Math.floor(linear.length / 2)
    expect(negative[midIdx].power).not.toBeCloseTo(linear[midIdx].power, 0)
    expect(positive[midIdx].power).not.toBeCloseTo(linear[midIdx].power, 0)
  })

  it('power is monotonically non-decreasing', () => {
    for (const mode of ['negative', 'linear', 'positive'] as const) {
      const pts = throttleCurve({ ...baseParams, throttleCurve: mode })
      for (let i = 1; i < pts.length; i++) {
        expect(pts[i].power).toBeGreaterThanOrEqual(pts[i - 1].power - 1e-9)
      }
    }
  })
})

describe('brakeCurve', () => {
  const baseParams = {
    neutralBrakePower: 10,
    initialBrakePower: 20,
    fullBrakePower: 80,
  }

  it('returns N+1 points', () => {
    expect(brakeCurve(baseParams, 200)).toHaveLength(201)
  })

  it('passes through the neutral brake anchor at input=0', () => {
    const pts = brakeCurve(baseParams)
    expect(pts[0].input).toBe(0)
    expect(pts[0].force).toBeCloseTo(baseParams.neutralBrakePower, 5)
  })

  it('passes through the initial brake anchor at input=5', () => {
    const pts = brakeCurve(baseParams, 200)
    const pt5 = pts.find(p => Math.abs(p.input - 5) < 0.01)!
    expect(pt5.force).toBeCloseTo(baseParams.initialBrakePower, 5)
  })

  it('passes through the full brake anchor at input=100', () => {
    const pts = brakeCurve(baseParams, 200)
    expect(pts[pts.length - 1].input).toBeCloseTo(100, 5)
    expect(pts[pts.length - 1].force).toBeCloseTo(baseParams.fullBrakePower, 5)
  })

  it('is monotonically non-decreasing', () => {
    const pts = brakeCurve(baseParams)
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].force).toBeGreaterThanOrEqual(pts[i - 1].force - 1e-9)
    }
  })

  it('is monotonically non-decreasing when anchor points are equal', () => {
    const pts = brakeCurve({ neutralBrakePower: 50, initialBrakePower: 50, fullBrakePower: 50 })
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].force).toBeGreaterThanOrEqual(pts[i - 1].force - 1e-9)
    }
  })

  it('all force values are in [0, 100]', () => {
    const pts = brakeCurve(baseParams)
    for (const p of pts) {
      expect(p.force).toBeGreaterThanOrEqual(0)
      expect(p.force).toBeLessThanOrEqual(100)
    }
  })

  it('is monotonically non-decreasing for edge-case anchor ordering', () => {
    // initialBrakePower < neutralBrakePower (unusual but valid input)
    const pts = brakeCurve({ neutralBrakePower: 30, initialBrakePower: 10, fullBrakePower: 80 })
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].force).toBeGreaterThanOrEqual(pts[i - 1].force - 1e-9)
    }
  })
})
