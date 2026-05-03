import type { Geometry, SideTopGeometry } from '@/lib/suspension/model'

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 200
const VIEW_X_MIN = -VIEW_WIDTH / 2
const VIEW_Y_MIN = -VIEW_HEIGHT / 2

type Props = {
  geometry: Geometry
  showGhost?: boolean
}

const STEERING_RED = '#FF0020'

export default function TopView({ geometry, showGhost = true }: Props) {
  const { live, isStateNeutral, chassis, setup } = geometry
  const right = live.right.top
  const left = live.left.top
  const ghost = showGhost && !isStateNeutral
  const restingRight: SideTopGeometry = {
    lowerInboard: geometry.top.lowerInboard,
    lowerOutboard: geometry.top.lowerOutboard,
    upperInboard: geometry.top.upperInboard,
    upperOutboard: geometry.top.upperOutboard,
    wheelCenter: geometry.top.wheelCenter,
    rackBall: geometry.top.rackBall,
    tieRodOutboard: geometry.top.tieRodOutboard,
    toeDeg: geometry.top.toeDegRight,
  }
  const restingLeft = mirrorTop(geometry.top)

  // SVG y is flipped relative to math y (+ y math = forward). Group flip lets
  // children use math coords directly so visual "forward" stays at the top.
  return (
    <svg
      viewBox={`${VIEW_X_MIN} ${VIEW_Y_MIN} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Top view of suspension geometry"
    >
      <g transform="scale(1, -1)">
        {/* Chassis centerline */}
        <line
          x1={0}
          y1={VIEW_Y_MIN}
          x2={0}
          y2={VIEW_Y_MIN + VIEW_HEIGHT}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Ghost (resting) — wheel outline + kingpin axis only, behind live geometry */}
        {ghost && (
          <>
            <Ghost
              top={restingRight}
              tireOD={setup.tireOD}
              tireWidth={chassis.tireWidth}
              toeSign={1}
            />
            <Ghost
              top={restingLeft}
              tireOD={setup.tireOD}
              tireWidth={chassis.tireWidth}
              toeSign={-1}
            />
          </>
        )}

        {/* Lower arms (top-down projection — purely lateral in v1) */}
        <line
          x1={right.lowerInboard.x}
          y1={right.lowerInboard.y}
          x2={right.lowerOutboard.x}
          y2={right.lowerOutboard.y}
          stroke="currentColor"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1={left.lowerInboard.x}
          y1={left.lowerInboard.y}
          x2={left.lowerOutboard.x}
          y2={left.lowerOutboard.y}
          stroke="currentColor"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Upper arms (top-down projection — picks up fore/aft sweep from caster) */}
        <line
          x1={right.upperInboard.x}
          y1={right.upperInboard.y}
          x2={right.upperOutboard.x}
          y2={right.upperOutboard.y}
          stroke="currentColor"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1={left.upperInboard.x}
          y1={left.upperInboard.y}
          x2={left.upperOutboard.x}
          y2={left.upperOutboard.y}
          stroke="currentColor"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Kingpin axis (top-view projection) — dashed brand red */}
        <line
          x1={right.lowerOutboard.x}
          y1={right.lowerOutboard.y}
          x2={right.upperOutboard.x}
          y2={right.upperOutboard.y}
          stroke={STEERING_RED}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <line
          x1={left.lowerOutboard.x}
          y1={left.lowerOutboard.y}
          x2={left.upperOutboard.x}
          y2={left.upperOutboard.y}
          stroke={STEERING_RED}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />

        {/* Wheel footprints — rotated by per-side toe so steering changes are visible.
            Sign flips per side so positive toe (toe in) tilts both wheel fronts
            toward the chassis centerline. */}
        <Wheel
          center={right.wheelCenter}
          tireWidth={chassis.tireWidth}
          tireOD={setup.tireOD}
          rimWidth={chassis.rimWidth}
          rimOD={chassis.rimDiameter}
          toeDeg={right.toeDeg}
        />
        <Wheel
          center={left.wheelCenter}
          tireWidth={chassis.tireWidth}
          tireOD={setup.tireOD}
          rimWidth={chassis.rimWidth}
          rimOD={chassis.rimDiameter}
          toeDeg={-left.toeDeg}
        />

        {/* Steering rack — connects the two rack balls laterally */}
        <line
          x1={left.rackBall.x}
          y1={left.rackBall.y}
          x2={right.rackBall.x}
          y2={right.rackBall.y}
          stroke={STEERING_RED}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Tie rods — rack ball to knuckle outboard pickup */}
        <line
          x1={right.rackBall.x}
          y1={right.rackBall.y}
          x2={right.tieRodOutboard.x}
          y2={right.tieRodOutboard.y}
          stroke={STEERING_RED}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1={left.rackBall.x}
          y1={left.rackBall.y}
          x2={left.tieRodOutboard.x}
          y2={left.tieRodOutboard.y}
          stroke={STEERING_RED}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Pivot dots */}
        <Pivot x={right.lowerInboard.x} y={right.lowerInboard.y} />
        <Pivot x={right.lowerOutboard.x} y={right.lowerOutboard.y} />
        <Pivot x={right.upperInboard.x} y={right.upperInboard.y} />
        <Pivot x={right.upperOutboard.x} y={right.upperOutboard.y} />
        <Pivot x={left.lowerInboard.x} y={left.lowerInboard.y} />
        <Pivot x={left.lowerOutboard.x} y={left.lowerOutboard.y} />
        <Pivot x={left.upperInboard.x} y={left.upperInboard.y} />
        <Pivot x={left.upperOutboard.x} y={left.upperOutboard.y} />
        <Pivot x={right.rackBall.x} y={right.rackBall.y} />
        <Pivot x={left.rackBall.x} y={left.rackBall.y} />
        <Pivot x={right.tieRodOutboard.x} y={right.tieRodOutboard.y} />
        <Pivot x={left.tieRodOutboard.x} y={left.tieRodOutboard.y} />
      </g>
    </svg>
  )
}

function Wheel({
  center,
  tireWidth,
  tireOD,
  rimWidth,
  rimOD,
  toeDeg,
}: {
  center: { x: number; y: number }
  tireWidth: number
  tireOD: number
  rimWidth: number
  rimOD: number
  toeDeg: number
}) {
  // Inside the y-flipped parent, a positive math rotation around (cx, cy)
  // is also a positive visual rotation. Toe convention: positive = toe in =
  // front of wheel toward chassis centerline. For the right wheel that's a
  // CCW rotation about the kingpin (top-down), which matches +toeDeg directly.
  const transform = `rotate(${toeDeg} ${center.x} ${center.y})`
  return (
    <g transform={transform}>
      <rect
        x={center.x - tireWidth / 2}
        y={center.y - tireOD / 2}
        width={tireWidth}
        height={tireOD}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        rx="2"
      />
      <rect
        x={center.x - rimWidth / 2}
        y={center.y - rimOD / 2}
        width={rimWidth}
        height={rimOD}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="1.5"
        rx="1"
      />
    </g>
  )
}

// Top-view ghost: wheel outline (tire only, rotated by static toe) + the
// kingpin segment from lowerOutboard to upperOutboard. PRD spec: foreground
// at 30%, 1.5px solid.
function Ghost({
  top,
  tireOD,
  tireWidth,
  toeSign,
}: {
  top: SideTopGeometry
  tireOD: number
  tireWidth: number
  toeSign: 1 | -1
}) {
  const transform = `rotate(${toeSign * top.toeDeg} ${top.wheelCenter.x} ${top.wheelCenter.y})`
  return (
    <g opacity="0.3">
      <line
        x1={top.lowerOutboard.x}
        y1={top.lowerOutboard.y}
        x2={top.upperOutboard.x}
        y2={top.upperOutboard.y}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g transform={transform}>
        <rect
          x={top.wheelCenter.x - tireWidth / 2}
          y={top.wheelCenter.y - tireOD / 2}
          width={tireWidth}
          height={tireOD}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          rx="2"
        />
      </g>
    </g>
  )
}

function Pivot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={2} fill="currentColor" />
}

function mirrorTop(top: Geometry['top']): SideTopGeometry {
  // Geometry.top is the right-side resting top; mirror it across the chassis
  // centerline so the ghost can render the left-side resting wheel position.
  return {
    lowerInboard: { x: -top.lowerInboard.x, y: top.lowerInboard.y },
    lowerOutboard: { x: -top.lowerOutboard.x, y: top.lowerOutboard.y },
    upperInboard: { x: -top.upperInboard.x, y: top.upperInboard.y },
    upperOutboard: { x: -top.upperOutboard.x, y: top.upperOutboard.y },
    wheelCenter: { x: -top.wheelCenter.x, y: top.wheelCenter.y },
    rackBall: { x: -top.rackBall.x, y: top.rackBall.y },
    tieRodOutboard: { x: -top.tieRodOutboard.x, y: top.tieRodOutboard.y },
    toeDeg: top.toeDegLeft,
  }
}
