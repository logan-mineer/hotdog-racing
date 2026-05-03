import { describe, it, expect } from 'vitest'
import {
  motorKV,
  boostTimingAtRPM,
  effectiveTiming,
  torquePowerCurve,
  cumulativeTiming,
  peakRPM,
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
    rotorKvScale: 1.0,
  }

  it('returns N+1 points', () => {
    expect(torquePowerCurve(baseParams, 200)).toHaveLength(201)
  })

  it('first point starts at RPM 0', () => {
    expect(torquePowerCurve(baseParams)[0].rpm).toBe(0)
  })

  it('all torque and power values are non-negative', () => {
    const pts = torquePowerCurve(baseParams)
    for (const p of pts) {
      expect(p.torque).toBeGreaterThanOrEqual(0)
      expect(p.power).toBeGreaterThanOrEqual(0)
    }
  })

  it('stall torque is 100% at zero timing on LV30 (fixed reference baseline)', () => {
    const pts = torquePowerCurve(baseParams)
    expect(pts[0].torque).toBeCloseTo(100, 3)
  })

  it('torque and power peaks occur at different RPM values', () => {
    const pts = torquePowerCurve(baseParams)
    const peakTorqueRPM = pts.reduce((best, p) => (p.torque > best.torque ? p : best)).rpm
    const peakPowerRPM = pts.reduce((best, p) => (p.power > best.power ? p : best)).rpm
    expect(peakPowerRPM).toBeGreaterThan(peakTorqueRPM)
  })

  it('peak power is ~100% at zero timing (fixed reference baseline)', () => {
    const pts = torquePowerCurve(baseParams)
    const maxP = Math.max(...pts.map(p => p.power))
    expect(maxP).toBeCloseTo(100, 1)
  })

  describe('timing increases RPM and reduces stall torque', () => {
    it('higher timing lowers stall torque below 100%', () => {
      const highTiming = torquePowerCurve({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true })
      expect(highTiming[0].torque).toBeLessThan(100)
    })

    it('with real hardware settings stall torque reflects only active timing at RPM=0', () => {
      // At RPM=0, boost hasn't ramped in (starts at 5000 RPM) — only can + turbo apply.
      // theta = 30° + 0° + 55° = 85°; cos(85° × 0.75) = cos(63.75°) ≈ 0.442 → 44.2%
      const pts = torquePowerCurve({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true })
      expect(pts[0].torque).toBeCloseTo(44.2, 0)
    })

    it('with real hardware settings (95°) peak RPM ceiling is ~100k', () => {
      const pts = torquePowerCurve({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true })
      const lastNonZero = [...pts].reverse().find(p => p.torque > 0)!
      expect(lastNonZero.rpm).toBeGreaterThan(90_000)
      expect(lastNonZero.rpm).toBeLessThan(115_000)
    })

    it('peak power is conserved — timing redistributes power, does not create it', () => {
      const noTiming = torquePowerCurve(baseParams)
      const highTiming = torquePowerCurve({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true })
      const peakNoTiming = Math.max(...noTiming.map(p => p.power))
      const peakHighTiming = Math.max(...highTiming.map(p => p.power))
      // Both should peak near 100% — field weakening conserves max power
      expect(peakNoTiming).toBeCloseTo(100, 1)
      expect(peakHighTiming).toBeCloseTo(100, 1)
    })

    it('higher timing shifts peak power to a higher RPM', () => {
      const noTiming = torquePowerCurve(baseParams)
      const highTiming = torquePowerCurve({ ...baseParams, motorCanTiming: 30 })
      const peakRPMNoTiming = noTiming.reduce((best, p) => (p.power > best.power ? p : best)).rpm
      const peakRPMHighTiming = highTiming.reduce((best, p) => (p.power > best.power ? p : best)).rpm
      expect(peakRPMHighTiming).toBeGreaterThan(peakRPMNoTiming)
    })
  })

  describe('rotor variants', () => {
    it('LV42 (kvScale=30/42) has higher stall torque than LV30 at same timing', () => {
      const lv30 = torquePowerCurve({ ...baseParams, rotorKvScale: 1.0 })
      const lv42 = torquePowerCurve({ ...baseParams, rotorKvScale: 30 / 42 })
      expect(lv42[0].torque).toBeGreaterThan(lv30[0].torque)
    })

    it('LV42 has lower RPM ceiling than LV30 at same timing', () => {
      const lv30 = torquePowerCurve({ ...baseParams, rotorKvScale: 1.0 })
      const lv42 = torquePowerCurve({ ...baseParams, rotorKvScale: 30 / 42 })
      const lastNonZeroLV30 = [...lv30].reverse().find(p => p.torque > 0)!
      const lastNonZeroLV42 = [...lv42].reverse().find(p => p.torque > 0)!
      expect(lastNonZeroLV42.rpm).toBeLessThan(lastNonZeroLV30.rpm)
    })

    it('all rotor variants conserve peak power near 100%', () => {
      for (const kvScale of [1.0, 30 / 38, 30 / 42]) {
        const pts = torquePowerCurve({ ...baseParams, rotorKvScale: kvScale })
        const maxP = Math.max(...pts.map(p => p.power))
        expect(maxP).toBeCloseTo(100, 1)
      }
    })

    it('LV38 stall torque is between LV30 and LV42', () => {
      const lv30 = torquePowerCurve({ ...baseParams, rotorKvScale: 1.0 })[0].torque
      const lv38 = torquePowerCurve({ ...baseParams, rotorKvScale: 30 / 38 })[0].torque
      const lv42 = torquePowerCurve({ ...baseParams, rotorKvScale: 30 / 42 })[0].torque
      expect(lv38).toBeGreaterThan(lv30)
      expect(lv42).toBeGreaterThan(lv38)
    })
  })

  it('turboActive=true shifts peak power to higher RPM than turboActive=false', () => {
    const withTurbo = torquePowerCurve({ ...baseParams, turboTiming: 40, turboActive: true })
    const noTurbo = torquePowerCurve({ ...baseParams, turboTiming: 40, turboActive: false })
    const peakTurboRPM = withTurbo.reduce((best, p) => (p.power > best.power ? p : best)).rpm
    const peakNoTurboRPM = noTurbo.reduce((best, p) => (p.power > best.power ? p : best)).rpm
    expect(peakTurboRPM).toBeGreaterThan(peakNoTurboRPM)
  })

  it('curve bends through boost zone when boost timing > 0', () => {
    const withBoost = torquePowerCurve({ ...baseParams, boostTiming: 30, boostStartRPM: 5000, boostEndRPM: 20000 })
    const noBoost = torquePowerCurve(baseParams)
    const aboveBoostIdx = withBoost.findIndex(p => p.rpm > 20000)
    expect(aboveBoostIdx).toBeGreaterThan(0)
    expect(withBoost[aboveBoostIdx].torque).not.toBeCloseTo(noBoost[aboveBoostIdx].torque, 0)
  })
})

describe('cumulativeTiming', () => {
  const baseParams = {
    motorTurn: 10.5,
    motorCanTiming: 0,
    boostTiming: 0,
    boostStartRPM: 5000,
    boostEndRPM: 20000,
    turboTiming: 0,
    turboActive: false,
    rotorKvScale: 1.0,
  }

  it('returns 0 when all timing sources are 0', () => {
    expect(cumulativeTiming(baseParams)).toBe(0)
  })

  it('sums can + boost when turbo is inactive', () => {
    expect(cumulativeTiming({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55 })).toBe(40)
  })

  it('includes turbo timing when turboActive is true', () => {
    expect(cumulativeTiming({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true })).toBe(95)
  })

  it('is independent of rotor variant and motor turn', () => {
    const a = cumulativeTiming({ ...baseParams, motorTurn: 4.5, rotorKvScale: 30 / 42, motorCanTiming: 12, boostTiming: 8 })
    const b = cumulativeTiming({ ...baseParams, motorTurn: 21.5, rotorKvScale: 1.0, motorCanTiming: 12, boostTiming: 8 })
    expect(a).toBe(b)
    expect(a).toBe(20)
  })
})

describe('peakRPM', () => {
  const baseParams = {
    motorTurn: 10.5,
    motorCanTiming: 0,
    boostTiming: 0,
    boostStartRPM: 5000,
    boostEndRPM: 20000,
    turboTiming: 0,
    turboActive: false,
    rotorKvScale: 1.0,
  }

  it('equals KV × voltage at zero timing on LV30', () => {
    // motorKV(10.5) ≈ 3809.52, × 8.4V ≈ 32_000 RPM
    expect(peakRPM(baseParams)).toBeCloseTo(3809.52 * 8.4, 0)
  })

  it('matches calibrated 95° real-hardware peak (~100k RPM)', () => {
    const rpm = peakRPM({ ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true })
    expect(rpm).toBeGreaterThan(95_000)
    expect(rpm).toBeLessThan(105_000)
  })

  it('rises monotonically with cumulative timing', () => {
    const t0 = peakRPM(baseParams)
    const t1 = peakRPM({ ...baseParams, motorCanTiming: 15 })
    const t2 = peakRPM({ ...baseParams, motorCanTiming: 30 })
    expect(t1).toBeGreaterThan(t0)
    expect(t2).toBeGreaterThan(t1)
  })

  it('LV42 has lower peak RPM than LV30 at same timing', () => {
    const lv30 = peakRPM({ ...baseParams, motorCanTiming: 20, rotorKvScale: 1.0 })
    const lv42 = peakRPM({ ...baseParams, motorCanTiming: 20, rotorKvScale: 30 / 42 })
    expect(lv42).toBeLessThan(lv30)
  })

  it('matches the highest non-zero RPM in the torque curve within sampling tolerance', () => {
    const params = { ...baseParams, motorCanTiming: 30, boostTiming: 10, turboTiming: 55, turboActive: true }
    const curve = torquePowerCurve(params, 1000)
    const lastNonZero = [...curve].reverse().find(p => p.torque > 0)!
    const sampleStep = curve[1].rpm - curve[0].rpm
    expect(Math.abs(peakRPM(params) - lastNonZero.rpm)).toBeLessThan(sampleStep * 2)
  })

  it('ignores turbo timing when turboActive is false', () => {
    const off = peakRPM({ ...baseParams, motorCanTiming: 10, turboTiming: 55, turboActive: false })
    const on = peakRPM({ ...baseParams, motorCanTiming: 10, turboTiming: 55, turboActive: true })
    expect(on).toBeGreaterThan(off)
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
