import { describe, it, expect } from 'vitest'
import { computeGeometry } from './model'
import { CHASSIS_BASELINE, LOWER_ARM_LENGTH } from './config'

describe('computeGeometry — camber', () => {
  it('returns zero camber at the baseline lower arm length (kingpin vertical)', () => {
    const geo = computeGeometry({ lowerArmLength: LOWER_ARM_LENGTH.defaultValue })
    expect(geo.rear.camberDeg).toBeCloseTo(0, 5)
  })

  it('returns negative camber when the lower arm is lengthened (top tilts inboard)', () => {
    // Hand-computed: lowerArmLength = 50, baseline chassis, gives camber ≈ -6.38°
    const geo = computeGeometry({ lowerArmLength: 50 })
    expect(geo.rear.camberDeg).toBeCloseTo(-6.38, 1)
    expect(geo.rear.camberDeg).toBeLessThan(0)
  })

  it('returns positive camber when the lower arm is shortened (top tilts outboard)', () => {
    // Hand-computed: lowerArmLength = 40, baseline chassis, gives camber ≈ +6.38°
    const geo = computeGeometry({ lowerArmLength: 40 })
    expect(geo.rear.camberDeg).toBeCloseTo(6.38, 1)
    expect(geo.rear.camberDeg).toBeGreaterThan(0)
  })

  it('is monotonically decreasing as lower arm length increases (across the valid range)', () => {
    const lengths = [LOWER_ARM_LENGTH.min, 40, 42.5, 45, 47.5, 50, 55, LOWER_ARM_LENGTH.max]
    const cambers = lengths.map(l => computeGeometry({ lowerArmLength: l }).rear.camberDeg)
    for (let i = 1; i < cambers.length; i++) {
      expect(cambers[i]).toBeLessThan(cambers[i - 1])
    }
  })
})

describe('computeGeometry — outboard kingpin ball position', () => {
  it('places the lower outboard ball at lowerArmLength from the inboard pivot (horizontal arm)', () => {
    const geo = computeGeometry({ lowerArmLength: 45 })
    expect(geo.rear.lowerOutboard.x).toBeCloseTo(CHASSIS_BASELINE.blockLowerInboardX + 45, 5)
    expect(geo.rear.lowerOutboard.y).toBeCloseTo(CHASSIS_BASELINE.blockLowerY, 5)
  })

  it('places the upper outboard ball such that knuckle length and upper arm length are both satisfied', () => {
    const geo = computeGeometry({ lowerArmLength: 50 })
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
  it('places top-view points at y = 0 (forward axis is zero in the v1 slice)', () => {
    const geo = computeGeometry({ lowerArmLength: 45 })
    expect(geo.top.lowerInboard.y).toBe(0)
    expect(geo.top.lowerOutboard.y).toBe(0)
    expect(geo.top.wheelCenter.y).toBe(0)
  })

  it('mirrors the rear-view x positions onto the top view', () => {
    const geo = computeGeometry({ lowerArmLength: 50 })
    expect(geo.top.lowerOutboard.x).toBeCloseTo(geo.rear.lowerOutboard.x, 5)
    expect(geo.top.wheelCenter.x).toBeCloseTo(geo.rear.wheelCenter.x, 5)
  })
})

describe('computeGeometry — robustness', () => {
  it('does not throw at the slider range extremes', () => {
    expect(() => computeGeometry({ lowerArmLength: LOWER_ARM_LENGTH.min })).not.toThrow()
    expect(() => computeGeometry({ lowerArmLength: LOWER_ARM_LENGTH.max })).not.toThrow()
  })

  it('returns finite numbers across the valid range', () => {
    for (let l = LOWER_ARM_LENGTH.min; l <= LOWER_ARM_LENGTH.max; l += 1) {
      const geo = computeGeometry({ lowerArmLength: l })
      expect(Number.isFinite(geo.rear.camberDeg)).toBe(true)
      expect(Number.isFinite(geo.rear.upperOutboard.x)).toBe(true)
      expect(Number.isFinite(geo.rear.upperOutboard.y)).toBe(true)
    }
  })
})
