import { describe, it, expect } from 'vitest'
import { computeGeometry, computeTrail, computeScrubRadius } from './model'
import {
  CHASSIS_BASELINE,
  LOWER_ARM_LENGTH,
  TIE_ROD_LENGTH,
  UPPER_ARM_LENGTH,
  CASTER_SPACER,
  WHEEL_HEX_THICKNESS,
  WHEEL_OFFSET,
  TIRE_OD,
} from './config'
import type { ChassisBaseline } from './config'

const DEFAULTS = {
  lowerArmLength: LOWER_ARM_LENGTH.defaultValue,
  tieRodLength: TIE_ROD_LENGTH.defaultValue,
  upperArmLength: UPPER_ARM_LENGTH.defaultValue,
  casterSpacerDeg: CASTER_SPACER.defaultValue,
  wheelHexThicknessMm: WHEEL_HEX_THICKNESS.defaultValue,
  wheelOffsetMm: WHEEL_OFFSET.defaultValue,
  tireOD: TIRE_OD.defaultValue,
}

describe('computeGeometry — camber', () => {
  it('returns zero camber at the baseline lower arm length (kingpin vertical)', () => {
    const geo = computeGeometry({ ...DEFAULTS })
    expect(geo.rear.camberDeg).toBeCloseTo(0, 5)
  })

  it('returns negative camber when the lower arm is lengthened (top tilts inboard)', () => {
    // Hand-computed: lowerArmLength = 50, baseline chassis, gives camber ≈ -6.38°
    const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: 50 })
    expect(geo.rear.camberDeg).toBeCloseTo(-6.38, 1)
    expect(geo.rear.camberDeg).toBeLessThan(0)
  })

  it('returns positive camber when the lower arm is shortened (top tilts outboard)', () => {
    // Hand-computed: lowerArmLength = 40, baseline chassis, gives camber ≈ +6.38°
    const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: 40 })
    expect(geo.rear.camberDeg).toBeCloseTo(6.38, 1)
    expect(geo.rear.camberDeg).toBeGreaterThan(0)
  })

  it('is monotonically decreasing as lower arm length increases (across the valid range)', () => {
    const lengths = [LOWER_ARM_LENGTH.min, 40, 42.5, 45, 47.5, 50, 55, LOWER_ARM_LENGTH.max]
    const cambers = lengths.map(l => computeGeometry({ ...DEFAULTS, lowerArmLength: l }).rear.camberDeg)
    for (let i = 1; i < cambers.length; i++) {
      expect(cambers[i]).toBeLessThan(cambers[i - 1])
    }
  })
})

describe('computeGeometry — outboard kingpin ball position', () => {
  it('places the lower outboard ball at lowerArmLength from the inboard pivot (horizontal arm)', () => {
    const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: 45 })
    expect(geo.rear.lowerOutboard.x).toBeCloseTo(CHASSIS_BASELINE.blockLowerInboardX + 45, 5)
    expect(geo.rear.lowerOutboard.y).toBeCloseTo(CHASSIS_BASELINE.blockLowerY, 5)
  })

  it('places the upper outboard ball such that knuckle length and upper arm length are both satisfied', () => {
    const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: 50 })
    const dKnuckle = Math.hypot(
      geo.rear.upperOutboard.x - geo.rear.lowerOutboard.x,
      geo.rear.upperOutboard.y - geo.rear.lowerOutboard.y,
    )
    const dUpperArm = Math.hypot(
      geo.rear.upperOutboard.x - geo.rear.upperInboard.x,
      geo.rear.upperOutboard.y - geo.rear.upperInboard.y,
    )
    expect(dKnuckle).toBeCloseTo(CHASSIS_BASELINE.knuckleLength, 5)
    expect(dUpperArm).toBeCloseTo(UPPER_ARM_LENGTH.defaultValue, 5)
  })
})

describe('computeGeometry — top view', () => {
  it('places lower-arm and wheel top-view points at y = 0 (forward axis is zero in the v1 slice)', () => {
    const geo = computeGeometry({ ...DEFAULTS })
    expect(geo.top.lowerInboard.y).toBe(0)
    expect(geo.top.lowerOutboard.y).toBe(0)
    expect(geo.top.wheelCenter.y).toBe(0)
  })

  it('mirrors the rear-view x positions onto the top view', () => {
    const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: 50 })
    expect(geo.top.lowerOutboard.x).toBeCloseTo(geo.rear.lowerOutboard.x, 5)
    expect(geo.top.wheelCenter.x).toBeCloseTo(geo.rear.wheelCenter.x, 5)
  })
})

describe('computeGeometry — toe', () => {
  it('returns zero toe at the default tie rod length and lower arm length', () => {
    const geo = computeGeometry({ ...DEFAULTS })
    expect(geo.top.toeDegRight).toBeCloseTo(0, 5)
    expect(geo.top.toeDegLeft).toBeCloseTo(0, 5)
  })

  it('places rack ball and tie rod outboard at the configured chassis positions when tie rod is at default', () => {
    const geo = computeGeometry({ ...DEFAULTS })
    const kingpinX = (geo.rear.lowerOutboard.x + geo.rear.upperOutboard.x) / 2
    expect(geo.top.rackBall.x).toBeCloseTo(CHASSIS_BASELINE.rackBallX, 5)
    expect(geo.top.rackBall.y).toBeCloseTo(CHASSIS_BASELINE.rackBallY, 5)
    // At zero toe the tie rod outboard sits at the kingpin midpoint + offset baseline.
    expect(geo.top.tieRodOutboard.x).toBeCloseTo(kingpinX + CHASSIS_BASELINE.knuckleTieRodOffsetX, 5)
    expect(geo.top.tieRodOutboard.y).toBeCloseTo(CHASSIS_BASELINE.knuckleTieRodOffsetY, 5)
  })

  it('keeps the tie rod outboard on a circle of constant radius around the kingpin as length changes', () => {
    const baselineRadius = Math.hypot(
      CHASSIS_BASELINE.knuckleTieRodOffsetX,
      CHASSIS_BASELINE.knuckleTieRodOffsetY,
    )
    for (const l of [TIE_ROD_LENGTH.min, 35, 38, 42, 45, TIE_ROD_LENGTH.max]) {
      const geo = computeGeometry({ ...DEFAULTS, tieRodLength: l })
      const kingpinX = (geo.rear.lowerOutboard.x + geo.rear.upperOutboard.x) / 2
      const r = Math.hypot(
        geo.top.tieRodOutboard.x - kingpinX,
        geo.top.tieRodOutboard.y - 0,
      )
      expect(r).toBeCloseTo(baselineRadius, 4)
    }
  })

  it('produces equal left and right toe under mirror-symmetric setup (no steering input yet)', () => {
    for (const l of [TIE_ROD_LENGTH.min, 35, 38, 42, 45, TIE_ROD_LENGTH.max]) {
      const geo = computeGeometry({ ...DEFAULTS, tieRodLength: l })
      expect(geo.top.toeDegLeft).toBeCloseTo(geo.top.toeDegRight, 10)
    }
  })

  it('reverses toe direction when the tie rod is lengthened vs. shortened around the baseline', () => {
    const longer = computeGeometry({ ...DEFAULTS, tieRodLength: TIE_ROD_LENGTH.defaultValue + 2 })
    const shorter = computeGeometry({ ...DEFAULTS, tieRodLength: TIE_ROD_LENGTH.defaultValue - 2 })
    expect(Math.sign(longer.top.toeDegRight)).not.toBe(Math.sign(shorter.top.toeDegRight))
    expect(Math.abs(longer.top.toeDegRight)).toBeGreaterThan(0.1)
    expect(Math.abs(shorter.top.toeDegRight)).toBeGreaterThan(0.1)
  })

  it('handles a vertical tie rod (parallel to chassis centerline) as a finite, zero-toe baseline', () => {
    // Synthetic chassis: rack ball directly behind the knuckle attach baseline,
    // so the tie rod runs purely along y at zero toe. This exercises the math
    // at the geometric configuration where tie rod is parallel to the chassis
    // forward axis — a known-singular direction for bump-steer (lands in #85)
    // but a perfectly well-defined static toe input.
    const verticalChassis: ChassisBaseline = {
      ...CHASSIS_BASELINE,
      rackBallX: 60,
      rackBallY: -25,
      knuckleTieRodOffsetX: -10,
      knuckleTieRodOffsetY: -5,
    }
    // With default lowerArm=45 the kingpin sits at top-view (70, 0), so the
    // baseline knuckle attach is (60, -5) and the rack ball is (60, -25).
    // Distance = 20 → tie rod length 20 yields zero toe along a vertical link.
    const geo = computeGeometry({ ...DEFAULTS, tieRodLength: 20 }, verticalChassis)
    expect(geo.top.toeDegRight).toBeCloseTo(0, 5)
    expect(Number.isFinite(geo.top.toeDegRight)).toBe(true)

    // A perturbation away from the vertical baseline still produces finite toe.
    const perturbed = computeGeometry({ ...DEFAULTS, tieRodLength: 19 }, verticalChassis)
    expect(Number.isFinite(perturbed.top.toeDegRight)).toBe(true)
    expect(Math.abs(perturbed.top.toeDegRight)).toBeGreaterThan(0)
  })
})

describe('computeGeometry — kingpin inclination (KPI)', () => {
  it('returns zero KPI at the baseline lower arm length (kingpin vertical)', () => {
    const geo = computeGeometry({ ...DEFAULTS })
    expect(geo.rear.kpiDeg).toBeCloseTo(0, 5)
  })

  it('reports KPI as the negation of camber under the v1 zero-scrub assumption', () => {
    for (const l of [40, 42.5, 45, 47.5, 50]) {
      const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: l })
      expect(geo.rear.kpiDeg).toBeCloseTo(-geo.rear.camberDeg, 6)
    }
  })

  it('returns positive KPI when the lower arm is lengthened (top of kingpin tilts inboard)', () => {
    const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: 50 })
    expect(geo.rear.kpiDeg).toBeGreaterThan(0)
    expect(geo.rear.kpiDeg).toBeCloseTo(6.38, 1)
  })
})

describe('computeGeometry — caster', () => {
  it('exposes caster equal to the caster spacer setting (1:1 in v1)', () => {
    for (const c of [0, 1, 5, 10, 15]) {
      const geo = computeGeometry({ ...DEFAULTS, casterSpacerDeg: c })
      expect(geo.casterDeg).toBe(c)
    }
  })

  it('shifts the entire upper hinge pin rearward by knuckleLength·tan(caster) — both ends move together', () => {
    const c = 10
    const geo = computeGeometry({ ...DEFAULTS, casterSpacerDeg: c })
    const expected = -CHASSIS_BASELINE.knuckleLength * Math.tan((c * Math.PI) / 180)
    expect(geo.top.upperInboard.y).toBeCloseTo(expected, 5)
    expect(geo.top.upperOutboard.y).toBeCloseTo(expected, 5)
    expect(geo.top.upperOutboard.y).toBeLessThan(0)
  })

  it('keeps the upper arm parallel to the lower arm (perpendicular to chassis centerline) at any caster', () => {
    for (const c of [0, 5, 10, 15]) {
      const geo = computeGeometry({ ...DEFAULTS, casterSpacerDeg: c })
      expect(geo.top.upperOutboard.y).toBeCloseTo(geo.top.upperInboard.y, 9)
      expect(geo.top.lowerOutboard.y).toBe(0)
      expect(geo.top.lowerInboard.y).toBe(0)
    }
  })
})

describe('computeTrail — caster trail bridge', () => {
  it('returns zero trail at zero caster regardless of tire size', () => {
    expect(computeTrail(0, 0, 0, 60)).toBeCloseTo(0, 9)
    expect(computeTrail(0, 5, 8, 60)).toBeCloseTo(0, 9)
  })

  it('returns R·tan(caster) for a positive caster angle', () => {
    expect(computeTrail(5, 0, 0, 60)).toBeCloseTo(30 * Math.tan((5 * Math.PI) / 180), 6)
    expect(computeTrail(10, 0, 0, 60)).toBeCloseTo(30 * Math.tan((10 * Math.PI) / 180), 6)
  })

  it('is symmetric about zero caster (negative caster → negative trail)', () => {
    expect(computeTrail(-5, 0, 0, 60)).toBeCloseTo(-computeTrail(5, 0, 0, 60), 9)
  })

  it('scales linearly with tire OD', () => {
    const small = computeTrail(8, 0, 0, 50)
    const large = computeTrail(8, 0, 0, 100)
    expect(large / small).toBeCloseTo(2, 6)
  })

  it('matches the trail readout exposed by computeGeometry at a known input', () => {
    const geo = computeGeometry({ ...DEFAULTS, casterSpacerDeg: 7 })
    expect(geo.trailMm).toBeCloseTo(computeTrail(7, geo.rear.kpiDeg, geo.setup.wheelOffsetMm, geo.setup.tireOD), 9)
  })

  it('responds linearly to tire OD when read off computeGeometry', () => {
    const small = computeGeometry({ ...DEFAULTS, casterSpacerDeg: 8, tireOD: 50 })
    const large = computeGeometry({ ...DEFAULTS, casterSpacerDeg: 8, tireOD: 70 })
    expect(large.trailMm / small.trailMm).toBeCloseTo(70 / 50, 6)
  })
})

describe('computeScrubRadius — bridge', () => {
  it('returns zero when wheel offset and hex thickness are both zero (regardless of KPI/tire OD)', () => {
    expect(computeScrubRadius(0, 0, 0, 60)).toBeCloseTo(0, 9)
    expect(computeScrubRadius(0, 0, 5, 60)).not.toBeCloseTo(0, 1)
    // The KPI term still applies — only (offset+hex)=0 *and* KPI=0 forces zero.
    expect(computeScrubRadius(0, 0, 0, 80)).toBeCloseTo(0, 9)
  })

  it('equals (hex + offset) when KPI is zero (kingpin vertical)', () => {
    expect(computeScrubRadius(0, 5, 0, 60)).toBeCloseTo(5, 9)
    expect(computeScrubRadius(3, 5, 0, 60)).toBeCloseTo(8, 9)
    expect(computeScrubRadius(-2, 5, 0, 60)).toBeCloseTo(3, 9)
  })

  it('returns negative scrub for zero offset and positive KPI (contact patch sits inboard of kingpin at ground)', () => {
    const result = computeScrubRadius(0, 0, 5, 60)
    expect(result).toBeCloseTo(-(60 / 2) * Math.tan((5 * Math.PI) / 180), 6)
    expect(result).toBeLessThan(0)
  })

  it('matches the closed-form (hex+offset)/cos(KPI) − R·tan(KPI) at a combined input', () => {
    const expected = 8 / Math.cos((5 * Math.PI) / 180) - 30 * Math.tan((5 * Math.PI) / 180)
    expect(computeScrubRadius(3, 5, 5, 60)).toBeCloseTo(expected, 9)
  })

  it('flips sign when KPI flips sign (positive vs. negative kingpin tilt)', () => {
    expect(computeScrubRadius(0, 0, 5, 60)).toBeCloseTo(-computeScrubRadius(0, 0, -5, 60), 9)
  })

  it('matches the scrub radius readout exposed by computeGeometry', () => {
    const geo = computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: 4, wheelOffsetMm: 2, lowerArmLength: 50 })
    expect(geo.scrubRadiusMm).toBeCloseTo(
      computeScrubRadius(2, 4, geo.rear.kpiDeg, geo.setup.tireOD),
      9,
    )
  })
})

describe('computeGeometry — wheel offset and hex thickness', () => {
  it('places the rear-view wheel center perpendicular-outboard of the kingpin midpoint by (hex + offset)', () => {
    const geo = computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: 5, wheelOffsetMm: 3 })
    // At zero camber the perpendicular direction is pure +x, so the wheel
    // center sits exactly (hex+offset) outboard of the kingpin midpoint.
    const kingpinMidX = (geo.rear.lowerOutboard.x + geo.rear.upperOutboard.x) / 2
    expect(geo.rear.wheelCenter.x - kingpinMidX).toBeCloseTo(8, 5)
  })

  it('shifts wheel center outboard by 1mm per mm of hex thickness or wheel offset (zero camber)', () => {
    const baseline = computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: 0, wheelOffsetMm: 0 })
    const plusHex = computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: 4, wheelOffsetMm: 0 })
    const plusOffset = computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: 0, wheelOffsetMm: 4 })
    expect(plusHex.rear.wheelCenter.x - baseline.rear.wheelCenter.x).toBeCloseTo(4, 5)
    expect(plusOffset.rear.wheelCenter.x - baseline.rear.wheelCenter.x).toBeCloseTo(4, 5)
  })

  it('does not change camber, KPI, or the kingpin ball positions', () => {
    const a = computeGeometry({ ...DEFAULTS, lowerArmLength: 50, wheelHexThicknessMm: 0, wheelOffsetMm: 0 })
    const b = computeGeometry({ ...DEFAULTS, lowerArmLength: 50, wheelHexThicknessMm: 8, wheelOffsetMm: 4 })
    expect(b.rear.camberDeg).toBeCloseTo(a.rear.camberDeg, 9)
    expect(b.rear.kpiDeg).toBeCloseTo(a.rear.kpiDeg, 9)
    expect(b.rear.lowerOutboard.x).toBeCloseTo(a.rear.lowerOutboard.x, 9)
    expect(b.rear.upperOutboard.x).toBeCloseTo(a.rear.upperOutboard.x, 9)
  })
})

describe('computeGeometry — upper arm', () => {
  it('places upper outboard on a circle of radius UPPER_ARM_LENGTH around the upper inboard pivot', () => {
    for (const u of [UPPER_ARM_LENGTH.min, 40, UPPER_ARM_LENGTH.defaultValue, 50, UPPER_ARM_LENGTH.max]) {
      const geo = computeGeometry({ ...DEFAULTS, upperArmLength: u })
      const r = Math.hypot(
        geo.rear.upperOutboard.x - geo.rear.upperInboard.x,
        geo.rear.upperOutboard.y - geo.rear.upperInboard.y,
      )
      expect(r).toBeCloseTo(u, 5)
    }
  })

  it('changing upper arm length moves the kingpin angle (camber/KPI not held constant)', () => {
    const shortArm = computeGeometry({ ...DEFAULTS, upperArmLength: 40 })
    const longArm = computeGeometry({ ...DEFAULTS, upperArmLength: 50 })
    expect(shortArm.rear.camberDeg).not.toBeCloseTo(longArm.rear.camberDeg, 1)
  })
})

describe('computeGeometry — robustness', () => {
  it('does not throw at the slider range extremes', () => {
    expect(() => computeGeometry({ ...DEFAULTS, lowerArmLength: LOWER_ARM_LENGTH.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, lowerArmLength: LOWER_ARM_LENGTH.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, tieRodLength: TIE_ROD_LENGTH.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, tieRodLength: TIE_ROD_LENGTH.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, upperArmLength: UPPER_ARM_LENGTH.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, upperArmLength: UPPER_ARM_LENGTH.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, casterSpacerDeg: CASTER_SPACER.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, casterSpacerDeg: CASTER_SPACER.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: WHEEL_HEX_THICKNESS.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: WHEEL_HEX_THICKNESS.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, wheelOffsetMm: WHEEL_OFFSET.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, wheelOffsetMm: WHEEL_OFFSET.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, tireOD: TIRE_OD.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, tireOD: TIRE_OD.max })).not.toThrow()
  })

  it('returns finite numbers across the valid range', () => {
    for (let l = LOWER_ARM_LENGTH.min; l <= LOWER_ARM_LENGTH.max; l += 1) {
      const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: l })
      expect(Number.isFinite(geo.rear.camberDeg)).toBe(true)
      expect(Number.isFinite(geo.rear.kpiDeg)).toBe(true)
      expect(Number.isFinite(geo.rear.upperOutboard.x)).toBe(true)
      expect(Number.isFinite(geo.rear.upperOutboard.y)).toBe(true)
      expect(Number.isFinite(geo.scrubRadiusMm)).toBe(true)
    }
    for (let l = TIE_ROD_LENGTH.min; l <= TIE_ROD_LENGTH.max; l += 0.5) {
      const geo = computeGeometry({ ...DEFAULTS, tieRodLength: l })
      expect(Number.isFinite(geo.top.toeDegRight)).toBe(true)
      expect(Number.isFinite(geo.top.toeDegLeft)).toBe(true)
      expect(Number.isFinite(geo.top.tieRodOutboard.x)).toBe(true)
      expect(Number.isFinite(geo.top.tieRodOutboard.y)).toBe(true)
    }
    for (let c = CASTER_SPACER.min; c <= CASTER_SPACER.max; c += 1) {
      const geo = computeGeometry({ ...DEFAULTS, casterSpacerDeg: c })
      expect(Number.isFinite(geo.casterDeg)).toBe(true)
      expect(Number.isFinite(geo.trailMm)).toBe(true)
      expect(Number.isFinite(geo.top.upperOutboard.y)).toBe(true)
    }
    for (let h = WHEEL_HEX_THICKNESS.min; h <= WHEEL_HEX_THICKNESS.max; h += 1) {
      for (let o = WHEEL_OFFSET.min; o <= WHEEL_OFFSET.max; o += 2) {
        const geo = computeGeometry({ ...DEFAULTS, wheelHexThicknessMm: h, wheelOffsetMm: o })
        expect(Number.isFinite(geo.scrubRadiusMm)).toBe(true)
        expect(Number.isFinite(geo.rear.wheelCenter.x)).toBe(true)
        expect(Number.isFinite(geo.rear.wheelCenter.y)).toBe(true)
      }
    }
  })
})
