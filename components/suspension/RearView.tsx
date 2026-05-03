import type { Geometry } from '@/lib/suspension/model'

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 130
const VIEW_X_MIN = -VIEW_WIDTH / 2
const VIEW_Y_MIN = -110  // y-up math; ground at math y=0 lands near the bottom of the SVG
const STEERING_RED = '#FF0020'

type Props = {
  geometry: Geometry
}

export default function RearView({ geometry }: Props) {
  const { rear, chassis } = geometry

  // Right side as computed; left side is mirrored across the chassis centerline.
  const right = rear
  const left = mirrorRear(rear)

  return (
    <svg
      viewBox={`${VIEW_X_MIN} ${VIEW_Y_MIN} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Rear view of suspension geometry"
    >
      <g transform="scale(1, -1)">
        {/* Reference lines */}
        <line
          x1={VIEW_X_MIN}
          y1={0}
          x2={VIEW_X_MIN + VIEW_WIDTH}
          y2={0}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <line
          x1={right.wheelCenter.x}
          y1={0}
          x2={right.wheelCenter.x}
          y2={Math.abs(VIEW_Y_MIN)}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <line
          x1={left.wheelCenter.x}
          y1={0}
          x2={left.wheelCenter.x}
          y2={Math.abs(VIEW_Y_MIN)}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Lower arms */}
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

        {/* Upper arms */}
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

        {/* Kingpin axis — dashed brand red through the rear-view kingpin balls */}
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

        {/* Wheels (tire + rim) — rectangle leaning at the camber angle */}
        <Wheel
          centerX={right.wheelCenter.x}
          centerY={right.wheelCenter.y}
          camberDeg={right.camberDeg}
          tireOD={chassis.tireOD}
          tireWidth={chassis.tireWidth}
          rimDiameter={chassis.rimDiameter}
          rimWidth={chassis.rimWidth}
        />
        <Wheel
          centerX={left.wheelCenter.x}
          centerY={left.wheelCenter.y}
          camberDeg={left.camberDeg}
          tireOD={chassis.tireOD}
          tireWidth={chassis.tireWidth}
          rimDiameter={chassis.rimDiameter}
          rimWidth={chassis.rimWidth}
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
      </g>
    </svg>
  )
}

function Wheel({
  centerX,
  centerY,
  camberDeg,
  tireOD,
  tireWidth,
  rimDiameter,
  rimWidth,
}: {
  centerX: number
  centerY: number
  camberDeg: number
  tireOD: number
  tireWidth: number
  rimDiameter: number
  rimWidth: number
}) {
  // Inside the y-flipped <g>, a positive math rotation is also a positive
  // visual rotation. Camber sign convention here: positive camber tilts the
  // top outboard; for the right wheel that's positive math angle, but the
  // visual rotation needs to invert depending on side. We rotate the wheel
  // around its center by the camber angle so positive camber visually tilts
  // the top of the wheel outboard from chassis center.
  // For the right wheel (centerX > 0), positive camber → top tilts in +x → rotate by -camberDeg around the wheel center
  //   (because the y-axis is flipped, "rotate so top goes to +x" is a clockwise rotation in math frame).
  // For the left wheel (centerX < 0), positive camber → top tilts in -x → rotate by +camberDeg around the center.
  const sign = centerX >= 0 ? -1 : 1
  const transform = `rotate(${sign * camberDeg} ${centerX} ${centerY})`

  return (
    <g transform={transform}>
      <rect
        x={centerX - tireWidth / 2}
        y={centerY - tireOD / 2}
        width={tireWidth}
        height={tireOD}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        rx="2"
      />
      <rect
        x={centerX - rimWidth / 2}
        y={centerY - rimDiameter / 2}
        width={rimWidth}
        height={rimDiameter}
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

function mirrorRear(rear: Geometry['rear']): Geometry['rear'] {
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
