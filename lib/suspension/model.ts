// Pure suspension geometry. Decoupled 2D per the PRD: rear plane and top plane
// are self-contained; cross-plane "bridge" functions land in later slices.
// No React imports, no side effects.

import { CHASSIS_BASELINE } from './config'
import type { ChassisBaseline } from './config'

export type Point = { x: number; y: number }

export type Setup = {
  lowerArmLength: number
  tieRodLength: number
  upperArmLength: number          // chassis config in PRD; same data layer as setup in v1
  casterSpacerDeg: number         // 0–15° spacer stack on upper hinge pin; sets caster directly in v1
  wheelHexThicknessMm: number     // hub spacer between carrier and rim; always positive
  wheelOffsetMm: number           // rim's lateral offset from its mounting face; signed
  tireOD: number                  // chassis config in PRD; surfaced inline until #89
}

export type RearGeometry = {
  lowerInboard: Point
  lowerOutboard: Point
  upperInboard: Point
  upperOutboard: Point
  wheelCenter: Point
  camberDeg: number  // signed: positive = wheel top tilts outboard, negative = top tilts inboard
  kpiDeg: number     // signed: positive = kingpin top tilts inboard (standard convention)
}

export type TopGeometry = {
  // Right-side positions in chassis-relative top-view coords (y = +forward).
  // Renderers mirror across x = 0 for the left side.
  lowerInboard: Point
  lowerOutboard: Point
  upperInboard: Point   // upper arm hinge pivot, top-view projection
  upperOutboard: Point  // upper kingpin ball, top-view projection (offset fore/aft by caster)
  wheelCenter: Point
  rackBall: Point        // right-side rack ball
  tieRodOutboard: Point  // right-side tie rod outboard attach (knuckle pickup)
  // Toe per side, signed: positive = toe in (front of wheel toward chassis centerline).
  // Equal under mirror-symmetric setup with no steering input; diverge once
  // the steering state slider lands in #84.
  toeDegRight: number
  toeDegLeft: number
}

export type Geometry = {
  rear: RearGeometry
  top: TopGeometry
  chassis: ChassisBaseline   // exposed so renderers can size wheels, rims, etc.
  setup: Setup               // exposed so renderers can read tireOD, hex/offset, etc.
  casterDeg: number          // side-plane kingpin tilt; v1 = casterSpacerDeg
  trailMm: number            // caster trail at the tire contact patch
  scrubRadiusMm: number      // signed: positive = wheel contact outboard of kingpin axis at ground
}

// Intersect two circles in 2D. Returns the intersection point on the side
// preferred (greater x for 'outboard', smaller x for 'inboard'). Falls back
// to the line connecting the centers when the circles don't intersect, so
// we degrade gracefully on out-of-reach inputs (proper GeometryError lands in #86).
function circleCircleIntersect(
  c1: Point,
  r1: number,
  c2: Point,
  r2: number,
  prefer: 'outboard' | 'inboard',
): Point {
  const dx = c2.x - c1.x
  const dy = c2.y - c1.y
  const d = Math.hypot(dx, dy)

  if (d === 0 || d > r1 + r2 || d < Math.abs(r1 - r2)) {
    // Out of reach — return the closest point on c2's circle from c1's direction.
    const ux = d === 0 ? 1 : dx / d
    const uy = d === 0 ? 0 : dy / d
    return { x: c1.x + r1 * ux, y: c1.y + r1 * uy }
  }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a))
  const mx = c1.x + (a * dx) / d
  const my = c1.y + (a * dy) / d
  const ox = (h * dy) / d
  const oy = (h * dx) / d

  const p1 = { x: mx + ox, y: my - oy }
  const p2 = { x: mx - ox, y: my + oy }
  if (prefer === 'outboard') return p1.x >= p2.x ? p1 : p2
  return p1.x <= p2.x ? p1 : p2
}

function computeRearGeometry(setup: Setup, chassis: ChassisBaseline): RearGeometry {
  const lowerInboard: Point = { x: chassis.blockLowerInboardX, y: chassis.blockLowerY }
  const upperInboard: Point = { x: chassis.blockUpperInboardX, y: chassis.blockUpperY }

  const armAngleRad = (chassis.staticLowerArmAngleDeg * Math.PI) / 180
  const lowerOutboard: Point = {
    x: lowerInboard.x + setup.lowerArmLength * Math.cos(armAngleRad),
    y: lowerInboard.y + setup.lowerArmLength * Math.sin(armAngleRad),
  }

  const upperOutboard = circleCircleIntersect(
    upperInboard,
    setup.upperArmLength,
    lowerOutboard,
    chassis.knuckleLength,
    'outboard',
  )

  const dx = upperOutboard.x - lowerOutboard.x
  const dy = upperOutboard.y - lowerOutboard.y
  // atan2(dx, dy): zero when kingpin is vertical (dx=0, dy>0).
  // Negative when upper ball is inboard of lower ball (top of wheel tilts in → negative camber by RC convention).
  const camberDeg = Math.atan2(dx, dy) * (180 / Math.PI)
  // KPI is the same physical kingpin angle but takes the opposite sign by
  // convention (positive = top inboard). The wheel plane is parallel to the
  // kingpin axis (the carrier is rigid), so KPI = -camber holds even after
  // wheel offset displaces the wheel center off the kingpin axis.
  const kpiDeg = -camberDeg

  // Wheel center sits at perpendicular offset (hex + wheelOffset) from the
  // kingpin axis, on the outboard side (right wheel). Perpendicular outboard
  // in the rear plane = the kingpin direction rotated -90°: (cos(camber), -sin(camber)).
  const camberRad = (camberDeg * Math.PI) / 180
  const lateralOffset = setup.wheelHexThicknessMm + setup.wheelOffsetMm
  const kingpinMidpoint: Point = {
    x: (lowerOutboard.x + upperOutboard.x) / 2,
    y: (lowerOutboard.y + upperOutboard.y) / 2,
  }
  const wheelCenter: Point = {
    x: kingpinMidpoint.x + lateralOffset * Math.cos(camberRad),
    y: kingpinMidpoint.y - lateralOffset * Math.sin(camberRad),
  }

  return { lowerInboard, lowerOutboard, upperInboard, upperOutboard, wheelCenter, camberDeg, kpiDeg }
}

// Pick the circle-circle intersection closest to a reference point. Used for
// tie rod geometry where, as length sweeps through baseline, we need the
// solution that varies continuously with the input rather than flipping to
// the mirror.
function intersectClosestToBaseline(
  c1: Point,
  r1: number,
  c2: Point,
  r2: number,
  baseline: Point,
): Point {
  const dx = c2.x - c1.x
  const dy = c2.y - c1.y
  const d = Math.hypot(dx, dy)
  if (d === 0 || d > r1 + r2 || d < Math.abs(r1 - r2)) {
    // Out of reach: project the baseline onto c1's circle. Proper
    // GeometryError for unreachable tie rod lengths lands in #86.
    const bx = baseline.x - c1.x
    const by = baseline.y - c1.y
    const bd = Math.hypot(bx, by)
    if (bd === 0) return { x: c1.x + r1, y: c1.y }
    return { x: c1.x + (r1 * bx) / bd, y: c1.y + (r1 * by) / bd }
  }
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a))
  const mx = c1.x + (a * dx) / d
  const my = c1.y + (a * dy) / d
  const ox = (h * dy) / d
  const oy = (h * dx) / d
  const p1 = { x: mx + ox, y: my - oy }
  const p2 = { x: mx - ox, y: my + oy }
  const d1 = Math.hypot(p1.x - baseline.x, p1.y - baseline.y)
  const d2 = Math.hypot(p2.x - baseline.x, p2.y - baseline.y)
  return d1 <= d2 ? p1 : p2
}

function computeTopGeometry(
  setup: Setup,
  rear: RearGeometry,
  chassis: ChassisBaseline,
): TopGeometry {
  // v1 top-view collapse: the kingpin axis projects to a single point at the
  // midpoint of the two kingpin balls — distinct from the wheel center once
  // wheel offset displaces the rim laterally (#82). The knuckle's tie rod
  // attach is rigid with the kingpin axis, so its top-view radius and
  // baseline angle are measured around this midpoint.
  const kingpinMidX = (rear.lowerOutboard.x + rear.upperOutboard.x) / 2
  const kingpin: Point = { x: kingpinMidX, y: 0 }
  const baselineAttach: Point = {
    x: kingpin.x + chassis.knuckleTieRodOffsetX,
    y: kingpin.y + chassis.knuckleTieRodOffsetY,
  }
  const rackBall: Point = { x: chassis.rackBallX, y: chassis.rackBallY }
  const knuckleRadius = Math.hypot(
    baselineAttach.x - kingpin.x,
    baselineAttach.y - kingpin.y,
  )

  const tieRodOutboard = intersectClosestToBaseline(
    kingpin,
    knuckleRadius,
    rackBall,
    setup.tieRodLength,
    baselineAttach,
  )

  // Toe = signed knuckle rotation from baseline. CCW (from above) on the
  // right side = front of wheel toward centerline = toe in = positive.
  const baselineAngle = Math.atan2(baselineAttach.y - kingpin.y, baselineAttach.x - kingpin.x)
  const currentAngle = Math.atan2(tieRodOutboard.y - kingpin.y, tieRodOutboard.x - kingpin.x)
  let rotationRad = currentAngle - baselineAngle
  if (rotationRad > Math.PI) rotationRad -= 2 * Math.PI
  if (rotationRad <= -Math.PI) rotationRad += 2 * Math.PI
  const toeDegRight = rotationRad * (180 / Math.PI)

  // Caster spacers shift the entire upper hinge pin fore/aft on the chassis,
  // so both ends of the upper arm translate together and the arm stays
  // parallel to the lower arm (perpendicular to the chassis centerline).
  // Positive caster (standard convention) tilts the top of the kingpin axis
  // rearward, so the upper arm sits at negative y (behind the lower arm) in
  // top-view. Result: lower arm at y = 0; upper arm at y = -knuckle·tan(caster).
  const casterRad = (setup.casterSpacerDeg * Math.PI) / 180
  const upperHingeForeAft = -chassis.knuckleLength * Math.tan(casterRad)
  const upperOutboard: Point = { x: rear.upperOutboard.x, y: upperHingeForeAft }
  const upperInboard: Point = { x: rear.upperInboard.x, y: upperHingeForeAft }

  return {
    lowerInboard: { x: rear.lowerInboard.x, y: 0 },
    lowerOutboard: { x: rear.lowerOutboard.x, y: 0 },
    upperInboard,
    upperOutboard,
    wheelCenter: { x: rear.wheelCenter.x, y: 0 },
    rackBall,
    tieRodOutboard,
    toeDegRight,
    toeDegLeft: toeDegRight,
  }
}

// Caster trail at the tire contact patch. v1 uses the standard mechanical
// trail formula R·tan(caster); the KPI and wheel-offset terms enter the full
// 3D coupling but are second-order for typical RC drift values and are left
// for a future refinement.
export function computeTrail(
  casterDeg: number,
  _kpiDeg: number,
  _wheelOffsetMm: number,
  tireOD: number,
): number {
  const casterRad = (casterDeg * Math.PI) / 180
  return (tireOD / 2) * Math.tan(casterRad)
}

// Scrub radius — signed lateral distance from the kingpin axis (where it
// meets the ground) to the tire contact center. Positive = contact patch
// outboard of kingpin. Derivation: wheel center sits perpendicular to the
// kingpin by (hex + offset); contact center sits directly below wheel center
// at height tireOD/2; the kingpin's lateral position at ground is the wheel
// center offset by (hex+offset)/cos(KPI) inboard plus (tireOD/2)·tan(KPI)
// outboard, leaving scrub = (hex+offset)/cos(KPI) − (tireOD/2)·tan(KPI).
export function computeScrubRadius(
  wheelOffsetMm: number,
  hexThicknessMm: number,
  kpiDeg: number,
  tireOD: number,
): number {
  const kpiRad = (kpiDeg * Math.PI) / 180
  const lateral = wheelOffsetMm + hexThicknessMm
  return lateral / Math.cos(kpiRad) - (tireOD / 2) * Math.tan(kpiRad)
}

export function computeGeometry(
  setup: Setup,
  chassis: ChassisBaseline = CHASSIS_BASELINE,
): Geometry {
  const rear = computeRearGeometry(setup, chassis)
  const top = computeTopGeometry(setup, rear, chassis)
  const casterDeg = setup.casterSpacerDeg
  const trailMm = computeTrail(casterDeg, rear.kpiDeg, setup.wheelOffsetMm, setup.tireOD)
  const scrubRadiusMm = computeScrubRadius(
    setup.wheelOffsetMm,
    setup.wheelHexThicknessMm,
    rear.kpiDeg,
    setup.tireOD,
  )
  return { rear, top, chassis, setup, casterDeg, trailMm, scrubRadiusMm }
}
