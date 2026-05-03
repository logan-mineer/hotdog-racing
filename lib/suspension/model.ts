// Pure suspension geometry. Decoupled 2D per the PRD: rear plane and top plane
// are self-contained; cross-plane "bridge" functions land in later slices.
// No React imports, no side effects.

import { CHASSIS_BASELINE } from './config'
import type { ChassisBaseline, RackType } from './config'

export type Point = { x: number; y: number }

export type Setup = {
  lowerArmLength: number
  tieRodLength: number
  upperArmLength: number              // chassis config in PRD; same data layer as setup in v1
  casterSpacerDeg: number             // 0–15° spacer stack on upper hinge pin; sets caster directly in v1
  wheelHexThicknessMm: number         // hub spacer between carrier and rim; always positive
  wheelOffsetMm: number               // rim's lateral offset from its mounting face; signed
  tireOD: number                      // chassis config in PRD; surfaced inline until #89
  carrierTieRodInboardOffsetMm: number // signed; positive = tie rod attach moves further inboard from kingpin
  steeringRackForeAftMm: number       // signed; positive = rack moves forward
  carrierHeightMm: number             // chassis config in PRD; height of wheel hub along kingpin from lower ball
  steeringRackType: RackType          // chassis config in PRD; affects effective rack travel
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
  // Static toe (resting state) — positive = toe in. Per side at the data layer
  // because the live `Geometry.live` per-side readouts diverge under steering;
  // the static pair is mirror-equal, exposed as L/R for renderer symmetry.
  toeDegRight: number
  toeDegLeft: number
}

// Ephemeral car articulation — never persists, resets on every page load.
// Steering input drives top-view rack offset; wheel travel drives per-side
// rear-view lower-arm rotation. Range bounds live in `config.ts`.
export type State = {
  steeringInput: number          // -100 to +100; percent of effective rack travel
  leftWheelTravelMm: number      // signed bump (positive) / droop (negative) from ride height
  rightWheelTravelMm: number
}

export const NEUTRAL_STATE: State = {
  steeringInput: 0,
  leftWheelTravelMm: 0,
  rightWheelTravelMm: 0,
}

export type SideTopGeometry = {
  lowerInboard: Point
  lowerOutboard: Point
  upperInboard: Point
  upperOutboard: Point
  wheelCenter: Point
  rackBall: Point
  tieRodOutboard: Point
  toeDeg: number   // signed; positive = toe in for this side
}

// Per-side live geometry in chassis frame (right at +x, left at -x). Renderer
// uses these directly — no further mirroring. Equal to the resting geometry
// (within mirror-symmetry) when the state is neutral.
export type SideGeometry = {
  rear: RearGeometry
  top: SideTopGeometry
  scrubRadiusMm: number
}

export type MaxSteeringLockResult = {
  degrees: number   // best achievable lock magnitude on the right wheel
  blocked: boolean  // true if rack reaches travel limit before tie rod can satisfy the geometry
  reason: string    // human-readable explanation when blocked, empty otherwise
}

export type Geometry = {
  // Resting (state-neutral, mirror-symmetric) geometry — drives static readouts
  // and the ghost overlay.
  rear: RearGeometry
  top: TopGeometry
  chassis: ChassisBaseline   // exposed so renderers can size wheels, rims, etc.
  setup: Setup               // exposed so renderers can read tireOD, hex/offset, etc.
  casterDeg: number          // side-plane kingpin tilt; v1 = casterSpacerDeg
  trailMm: number            // caster trail at the tire contact patch
  scrubRadiusMm: number      // signed: positive = wheel contact outboard of kingpin axis at ground
  ackermanDeltaDeg: number   // |inner| − |outer| at full lock; 0° = parallel, positive = inner turns more
  maxSteeringLock: MaxSteeringLockResult
  // State-aware live geometry — renderer reads these for the articulated wireframe.
  state: State
  isStateNeutral: boolean
  live: { left: SideGeometry; right: SideGeometry }
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

function computeRearGeometry(
  setup: Setup,
  chassis: ChassisBaseline,
  travelMm: number = 0,
): RearGeometry {
  const lowerInboard: Point = { x: chassis.blockLowerInboardX, y: chassis.blockLowerY }
  const upperInboard: Point = { x: chassis.blockUpperInboardX, y: chassis.blockUpperY }

  // Travel raises (bump, +) or drops (droop, −) the outboard end of the lower
  // arm by travelMm. The arm length is fixed, so the new arm angle satisfies
  //   L·sin(θ_new) = L·sin(θ_static) + travelMm
  // Clamp to avoid asin domain blowup at extreme over-bump (proper
  // GeometryError lands in #86).
  const baseAngleRad = (chassis.staticLowerArmAngleDeg * Math.PI) / 180
  const sinTarget = Math.sin(baseAngleRad) + travelMm / setup.lowerArmLength
  const armAngleRad = Math.asin(Math.max(-0.999, Math.min(0.999, sinTarget)))
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

  // Wheel center sits along the kingpin axis at carrierHeightMm above the
  // lower ball, then perpendicular-outboard from there by (hex + wheelOffset).
  // Perpendicular outboard in the rear plane = kingpin direction rotated -90°:
  // (cos(camber), -sin(camber)).
  const camberRad = (camberDeg * Math.PI) / 180
  const lateralOffset = setup.wheelHexThicknessMm + setup.wheelOffsetMm
  const t = setup.carrierHeightMm / chassis.knuckleLength
  const kingpinAtCarrierHeight: Point = {
    x: lowerOutboard.x + t * (upperOutboard.x - lowerOutboard.x),
    y: lowerOutboard.y + t * (upperOutboard.y - lowerOutboard.y),
  }
  const wheelCenter: Point = {
    x: kingpinAtCarrierHeight.x + lateralOffset * Math.cos(camberRad),
    y: kingpinAtCarrierHeight.y - lateralOffset * Math.sin(camberRad),
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

// Per-side top geometry in right-side-relative frame (positive x = outboard
// for that side). `rackOffsetMm` is the lateral shift of the rack ball in the
// same frame — for the right side this equals the chassis-frame steering
// shift; for the left side it flips sign because the left frame is mirrored.
function computeRightSideTopGeometry(
  setup: Setup,
  chassis: ChassisBaseline,
  rear: RearGeometry,
  rackOffsetMm: number = 0,
): SideTopGeometry {
  // v1 top-view collapse: the kingpin axis projects to a single point at the
  // midpoint of the two kingpin balls — distinct from the wheel center once
  // wheel offset displaces the rim laterally (#82). The knuckle's tie rod
  // attach is rigid with the kingpin axis, so its top-view radius and
  // baseline angle are measured around this midpoint.
  const kingpinMidX = (rear.lowerOutboard.x + rear.upperOutboard.x) / 2
  const kingpin: Point = { x: kingpinMidX, y: 0 }
  // Carrier tie rod inboard offset shifts the knuckle attach toward the
  // chassis centerline. For the right side, "inboard" is the −x direction,
  // so a positive offset subtracts from the baseline X coordinate.
  const baselineAttach: Point = {
    x: kingpin.x + chassis.knuckleTieRodOffsetX - setup.carrierTieRodInboardOffsetMm,
    y: kingpin.y + chassis.knuckleTieRodOffsetY,
  }
  // Steering rack fore/aft slides the rack along the chassis longitudinal
  // axis; steering input shifts it laterally by `rackOffsetMm`.
  const rackBall: Point = {
    x: chassis.rackBallX + rackOffsetMm,
    y: chassis.rackBallY + setup.steeringRackForeAftMm,
  }
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
  const toeDeg = rotationRad * (180 / Math.PI)

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
    toeDeg,
  }
}

function computeTopGeometry(
  setup: Setup,
  rear: RearGeometry,
  chassis: ChassisBaseline,
): TopGeometry {
  const right = computeRightSideTopGeometry(setup, chassis, rear, 0)
  return {
    lowerInboard: right.lowerInboard,
    lowerOutboard: right.lowerOutboard,
    upperInboard: right.upperInboard,
    upperOutboard: right.upperOutboard,
    wheelCenter: right.wheelCenter,
    rackBall: right.rackBall,
    tieRodOutboard: right.tieRodOutboard,
    toeDegRight: right.toeDeg,
    toeDegLeft: right.toeDeg,
  }
}

function mirrorRearAcrossX(rear: RearGeometry): RearGeometry {
  return {
    lowerInboard: { x: -rear.lowerInboard.x, y: rear.lowerInboard.y },
    lowerOutboard: { x: -rear.lowerOutboard.x, y: rear.lowerOutboard.y },
    upperInboard: { x: -rear.upperInboard.x, y: rear.upperInboard.y },
    upperOutboard: { x: -rear.upperOutboard.x, y: rear.upperOutboard.y },
    wheelCenter: { x: -rear.wheelCenter.x, y: rear.wheelCenter.y },
    camberDeg: rear.camberDeg,
    kpiDeg: rear.kpiDeg,
  }
}

function mirrorTopAcrossX(top: SideTopGeometry): SideTopGeometry {
  return {
    lowerInboard: { x: -top.lowerInboard.x, y: top.lowerInboard.y },
    lowerOutboard: { x: -top.lowerOutboard.x, y: top.lowerOutboard.y },
    upperInboard: { x: -top.upperInboard.x, y: top.upperInboard.y },
    upperOutboard: { x: -top.upperOutboard.x, y: top.upperOutboard.y },
    wheelCenter: { x: -top.wheelCenter.x, y: top.wheelCenter.y },
    rackBall: { x: -top.rackBall.x, y: top.rackBall.y },
    tieRodOutboard: { x: -top.tieRodOutboard.x, y: top.tieRodOutboard.y },
    toeDeg: top.toeDeg,   // toe sign is "+ = toe in" per side; mirror preserves it
  }
}

function computeSide(
  setup: Setup,
  chassis: ChassisBaseline,
  travelMm: number,
  rackOffsetMm: number,
  side: 'left' | 'right',
): SideGeometry {
  // For the left side the local rack offset flips sign — a +x chassis-frame
  // shift becomes −x in the mirrored left frame.
  const localRackOffset = side === 'right' ? rackOffsetMm : -rackOffsetMm
  const rear = computeRearGeometry(setup, chassis, travelMm)
  const top = computeRightSideTopGeometry(setup, chassis, rear, localRackOffset)
  const scrubRadiusMm = computeScrubRadius(
    setup.wheelOffsetMm,
    setup.wheelHexThicknessMm,
    rear.kpiDeg,
    setup.tireOD,
  )
  if (side === 'right') {
    return { rear, top, scrubRadiusMm }
  }
  return {
    rear: mirrorRearAcrossX(rear),
    top: mirrorTopAcrossX(top),
    scrubRadiusMm,
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

export type SteeringSnapshot = {
  rightKingpin: Point
  rightBaselineAttach: Point
  rightRackBall: Point
  leftKingpin: Point
  leftBaselineAttach: Point
  leftRackBall: Point
  tieRodLength: number
  rackTravelMm: number     // raw chassis travel limit
  rackType: RackType
}

// Wiper rack pivots, so the rack balls trace an arc rather than a line —
// effective lateral travel at the balls is reduced versus the linear
// rack-shaft displacement. Direct drive and slide rack are linear.
function effectiveRackTravel(rackTravelMm: number, rackType: RackType): number {
  return rackType === 'wiper' ? 0.9 * rackTravelMm : rackTravelMm
}

function knuckleRotationDeg(
  kingpin: Point,
  baselineAttach: Point,
  rackBallShifted: Point,
  tieRodLength: number,
): number {
  const knuckleRadius = Math.hypot(
    baselineAttach.x - kingpin.x,
    baselineAttach.y - kingpin.y,
  )
  const newAttach = intersectClosestToBaseline(
    kingpin,
    knuckleRadius,
    rackBallShifted,
    tieRodLength,
    baselineAttach,
  )
  const baselineAngle = Math.atan2(baselineAttach.y - kingpin.y, baselineAttach.x - kingpin.x)
  const newAngle = Math.atan2(newAttach.y - kingpin.y, newAttach.x - kingpin.x)
  let dRad = newAngle - baselineAngle
  if (dRad > Math.PI) dRad -= 2 * Math.PI
  if (dRad <= -Math.PI) dRad += 2 * Math.PI
  return dRad * (180 / Math.PI)
}

function rackOutOfReach(kingpin: Point, baselineAttach: Point, rackBall: Point, tieRodLength: number): boolean {
  const knuckleRadius = Math.hypot(
    baselineAttach.x - kingpin.x,
    baselineAttach.y - kingpin.y,
  )
  const d = Math.hypot(rackBall.x - kingpin.x, rackBall.y - kingpin.y)
  return d < Math.abs(tieRodLength - knuckleRadius) || d > tieRodLength + knuckleRadius
}

function bothSidesReachable(snapshot: SteeringSnapshot, offset: number): boolean {
  const rightOK = !rackOutOfReach(
    snapshot.rightKingpin,
    snapshot.rightBaselineAttach,
    { x: snapshot.rightRackBall.x + offset, y: snapshot.rightRackBall.y },
    snapshot.tieRodLength,
  )
  const leftOK = !rackOutOfReach(
    snapshot.leftKingpin,
    snapshot.leftBaselineAttach,
    { x: snapshot.leftRackBall.x + offset, y: snapshot.leftRackBall.y },
    snapshot.tieRodLength,
  )
  return rightOK && leftOK
}

// Largest |offset| within ±chassis-travel where both linkages can satisfy
// their constraints. When the chassis travel limit is itself reachable, that
// is returned directly; otherwise a bisection finds the binding limit. Both
// bridge readouts use this so the inner/outer comparison is always defined.
function maxAchievableRackOffset(snapshot: SteeringSnapshot, sign: 1 | -1): number {
  const limit = sign * effectiveRackTravel(snapshot.rackTravelMm, snapshot.rackType)
  if (bothSidesReachable(snapshot, limit)) return limit
  let lo = 0
  let hi = limit
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (bothSidesReachable(snapshot, mid)) lo = mid
    else hi = mid
  }
  return lo
}

// Ackerman delta — signed angular difference between the inner and outer wheel
// at full lock, in degrees. 0° = parallel steering; positive = inner wheel
// turns more than outer (Ackermann); negative would imply outer turns more
// (geometrically uncommon in front-steer drift cars and not produced by the
// linkages this tool models). Reported in degrees rather than as a percentage
// because a true % requires wheelbase + track, which the tool does not carry.
export function computeAckermanDelta(snapshot: SteeringSnapshot): number {
  const δ = maxAchievableRackOffset(snapshot, 1)
  const rotR = knuckleRotationDeg(
    snapshot.rightKingpin,
    snapshot.rightBaselineAttach,
    { x: snapshot.rightRackBall.x + δ, y: snapshot.rightRackBall.y },
    snapshot.tieRodLength,
  )
  const rotL = knuckleRotationDeg(
    snapshot.leftKingpin,
    snapshot.leftBaselineAttach,
    { x: snapshot.leftRackBall.x + δ, y: snapshot.leftRackBall.y },
    snapshot.tieRodLength,
  )
  const inner = Math.max(Math.abs(rotR), Math.abs(rotL))
  const outer = Math.min(Math.abs(rotR), Math.abs(rotL))
  return inner - outer
}

// Max steering lock — the inner-wheel rotation magnitude at the largest rack
// offset where both linkages can satisfy their constraints. `blocked` flags
// the case where the chassis-spec'd travel exceeds what the linkage can
// physically reach, with the PRD's pivot-outboard message as the educational
// explanation.
export function computeMaxSteeringLock(snapshot: SteeringSnapshot): MaxSteeringLockResult {
  const limit = effectiveRackTravel(snapshot.rackTravelMm, snapshot.rackType)
  const δ = maxAchievableRackOffset(snapshot, 1)
  const blocked = Math.abs(δ) < Math.abs(limit) - 1e-6
  const rotR = knuckleRotationDeg(
    snapshot.rightKingpin,
    snapshot.rightBaselineAttach,
    { x: snapshot.rightRackBall.x + δ, y: snapshot.rightRackBall.y },
    snapshot.tieRodLength,
  )
  const rotL = knuckleRotationDeg(
    snapshot.leftKingpin,
    snapshot.leftBaselineAttach,
    { x: snapshot.leftRackBall.x + δ, y: snapshot.leftRackBall.y },
    snapshot.tieRodLength,
  )
  return {
    degrees: Math.max(Math.abs(rotR), Math.abs(rotL)),
    blocked,
    reason: blocked
      ? 'max lock blocked: pivot is outboard of the wheel — increase hex thickness'
      : '',
  }
}

function buildSteeringSnapshot(
  setup: Setup,
  rear: RearGeometry,
  top: TopGeometry,
  chassis: ChassisBaseline,
): SteeringSnapshot {
  const rightKingpin: Point = {
    x: (rear.lowerOutboard.x + rear.upperOutboard.x) / 2,
    y: 0,
  }
  const leftKingpin: Point = { x: -rightKingpin.x, y: 0 }
  const rightBaselineAttach: Point = {
    x: rightKingpin.x + chassis.knuckleTieRodOffsetX - setup.carrierTieRodInboardOffsetMm,
    y: chassis.knuckleTieRodOffsetY,
  }
  const leftBaselineAttach: Point = {
    x: -rightBaselineAttach.x,
    y: rightBaselineAttach.y,
  }
  const rightRackBall = top.rackBall
  const leftRackBall: Point = { x: -rightRackBall.x, y: rightRackBall.y }
  return {
    rightKingpin,
    rightBaselineAttach,
    rightRackBall,
    leftKingpin,
    leftBaselineAttach,
    leftRackBall,
    tieRodLength: setup.tieRodLength,
    rackTravelMm: chassis.maxRackTravelMm,
    rackType: setup.steeringRackType,
  }
}

export function computeGeometry(
  setup: Setup,
  chassis: ChassisBaseline = CHASSIS_BASELINE,
  state: State = NEUTRAL_STATE,
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
  const snapshot = buildSteeringSnapshot(setup, rear, top, chassis)
  const ackermanDeltaDeg = computeAckermanDelta(snapshot)
  const maxSteeringLock = computeMaxSteeringLock(snapshot)

  const isStateNeutral =
    state.steeringInput === 0 &&
    state.leftWheelTravelMm === 0 &&
    state.rightWheelTravelMm === 0
  // Steering input scales the rack lateral travel by the rack-type-effective
  // limit, so 100% = the maximum the linkage actually delivers.
  const rackOffsetMm =
    (state.steeringInput / 100) *
    effectiveRackTravel(chassis.maxRackTravelMm, setup.steeringRackType)
  const live = {
    right: computeSide(setup, chassis, state.rightWheelTravelMm, rackOffsetMm, 'right'),
    left: computeSide(setup, chassis, state.leftWheelTravelMm, rackOffsetMm, 'left'),
  }

  return {
    rear,
    top,
    chassis,
    setup,
    casterDeg,
    trailMm,
    scrubRadiusMm,
    ackermanDeltaDeg,
    maxSteeringLock,
    state,
    isStateNeutral,
    live,
  }
}
