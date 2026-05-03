import { describe, it, expect } from 'vitest'
import { computeGeometry } from './model'
import { CHASSIS_BASELINE, LOWER_ARM_LENGTH, TIE_ROD_LENGTH } from './config'
import type { ChassisBaseline } from './config'

const DEFAULTS = {
  lowerArmLength: LOWER_ARM_LENGTH.defaultValue,
  tieRodLength: TIE_ROD_LENGTH.defaultValue,
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
    expect(dUpperArm).toBeCloseTo(CHASSIS_BASELINE.upperArmLength, 5)
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
    expect(geo.top.rackBall.x).toBeCloseTo(CHASSIS_BASELINE.rackBallX, 5)
    expect(geo.top.rackBall.y).toBeCloseTo(CHASSIS_BASELINE.rackBallY, 5)
    // At zero toe the tie rod outboard sits at the kingpin + offset baseline.
    expect(geo.top.tieRodOutboard.x).toBeCloseTo(geo.top.wheelCenter.x + CHASSIS_BASELINE.knuckleTieRodOffsetX, 5)
    expect(geo.top.tieRodOutboard.y).toBeCloseTo(CHASSIS_BASELINE.knuckleTieRodOffsetY, 5)
  })

  it('keeps the tie rod outboard on a circle of constant radius around the kingpin as length changes', () => {
    const baselineRadius = Math.hypot(
      CHASSIS_BASELINE.knuckleTieRodOffsetX,
      CHASSIS_BASELINE.knuckleTieRodOffsetY,
    )
    for (const l of [TIE_ROD_LENGTH.min, 35, 38, 42, 45, TIE_ROD_LENGTH.max]) {
      const geo = computeGeometry({ ...DEFAULTS, tieRodLength: l })
      const r = Math.hypot(
        geo.top.tieRodOutboard.x - geo.top.wheelCenter.x,
        geo.top.tieRodOutboard.y - geo.top.wheelCenter.y,
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

describe('computeGeometry — robustness', () => {
  it('does not throw at the slider range extremes', () => {
    expect(() => computeGeometry({ ...DEFAULTS, lowerArmLength: LOWER_ARM_LENGTH.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, lowerArmLength: LOWER_ARM_LENGTH.max })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, tieRodLength: TIE_ROD_LENGTH.min })).not.toThrow()
    expect(() => computeGeometry({ ...DEFAULTS, tieRodLength: TIE_ROD_LENGTH.max })).not.toThrow()
  })

  it('returns finite numbers across the valid range', () => {
    for (let l = LOWER_ARM_LENGTH.min; l <= LOWER_ARM_LENGTH.max; l += 1) {
      const geo = computeGeometry({ ...DEFAULTS, lowerArmLength: l })
      expect(Number.isFinite(geo.rear.camberDeg)).toBe(true)
      expect(Number.isFinite(geo.rear.upperOutboard.x)).toBe(true)
      expect(Number.isFinite(geo.rear.upperOutboard.y)).toBe(true)
    }
    for (let l = TIE_ROD_LENGTH.min; l <= TIE_ROD_LENGTH.max; l += 0.5) {
      const geo = computeGeometry({ ...DEFAULTS, tieRodLength: l })
      expect(Number.isFinite(geo.top.toeDegRight)).toBe(true)
      expect(Number.isFinite(geo.top.toeDegLeft)).toBe(true)
      expect(Number.isFinite(geo.top.tieRodOutboard.x)).toBe(true)
      expect(Number.isFinite(geo.top.tieRodOutboard.y)).toBe(true)
    }
  })
})
