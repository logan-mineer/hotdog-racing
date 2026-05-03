import type { Geometry } from '@/lib/suspension/model'

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 200
const VIEW_X_MIN = -VIEW_WIDTH / 2
const VIEW_Y_MIN = -VIEW_HEIGHT / 2

type Props = {
  geometry: Geometry
}

export default function TopView({ geometry }: Props) {
  const { top, chassis } = geometry

  const right = top
  const left: typeof top = {
    lowerInboard: { x: -top.lowerInboard.x, y: top.lowerInboard.y },
    lowerOutboard: { x: -top.lowerOutboard.x, y: top.lowerOutboard.y },
    wheelCenter: { x: -top.wheelCenter.x, y: top.wheelCenter.y },
  }

  return (
    <svg
      viewBox={`${VIEW_X_MIN} ${VIEW_Y_MIN} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Top view of suspension geometry"
    >
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

      {/* Wheel footprints */}
      <Wheel center={right.wheelCenter} tireWidth={chassis.tireWidth} tireOD={chassis.tireOD} rimWidth={chassis.rimWidth} rimOD={chassis.rimDiameter} />
      <Wheel center={left.wheelCenter} tireWidth={chassis.tireWidth} tireOD={chassis.tireOD} rimWidth={chassis.rimWidth} rimOD={chassis.rimDiameter} />

      {/* Pivot dots */}
      <Pivot x={right.lowerInboard.x} y={right.lowerInboard.y} />
      <Pivot x={right.lowerOutboard.x} y={right.lowerOutboard.y} />
      <Pivot x={left.lowerInboard.x} y={left.lowerInboard.y} />
      <Pivot x={left.lowerOutboard.x} y={left.lowerOutboard.y} />
    </svg>
  )
}

function Wheel({
  center,
  tireWidth,
  tireOD,
  rimWidth,
  rimOD,
}: {
  center: { x: number; y: number }
  tireWidth: number
  tireOD: number
  rimWidth: number
  rimOD: number
}) {
  return (
    <g>
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
