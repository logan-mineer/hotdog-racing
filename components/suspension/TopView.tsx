import type { Geometry } from '@/lib/suspension/model'

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 200
const VIEW_X_MIN = -VIEW_WIDTH / 2
const VIEW_Y_MIN = -VIEW_HEIGHT / 2

type Props = {
  geometry: Geometry
}

const STEERING_RED = '#FF0020'

export default function TopView({ geometry }: Props) {
  const { top, chassis } = geometry

  const right = {
    lowerInboard: top.lowerInboard,
    lowerOutboard: top.lowerOutboard,
    upperInboard: top.upperInboard,
    upperOutboard: top.upperOutboard,
    wheelCenter: top.wheelCenter,
    rackBall: top.rackBall,
    tieRodOutboard: top.tieRodOutboard,
  }
  const left = {
    lowerInboard: mirrorX(top.lowerInboard),
    lowerOutboard: mirrorX(top.lowerOutboard),
    upperInboard: mirrorX(top.upperInboard),
    upperOutboard: mirrorX(top.upperOutboard),
    wheelCenter: mirrorX(top.wheelCenter),
    rackBall: mirrorX(top.rackBall),
    tieRodOutboard: mirrorX(top.tieRodOutboard),
  }

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

        {/* Wheel footprints — rotated by toe so steering changes are visible.
            Sign flips per side so positive toe (toe in) tilts both wheel fronts
            toward the chassis centerline. */}
        <Wheel
          center={right.wheelCenter}
          tireWidth={chassis.tireWidth}
          tireOD={chassis.tireOD}
          rimWidth={chassis.rimWidth}
          rimOD={chassis.rimDiameter}
          toeDeg={top.toeDegRight}
        />
        <Wheel
          center={left.wheelCenter}
          tireWidth={chassis.tireWidth}
          tireOD={chassis.tireOD}
          rimWidth={chassis.rimWidth}
          rimOD={chassis.rimDiameter}
          toeDeg={-top.toeDegLeft}
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

function Pivot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={2} fill="currentColor" />
}

function mirrorX(p: { x: number; y: number }) {
  return { x: -p.x, y: p.y }
}
