import { PRECISION } from '@/lib/suspension/config'
import type { Geometry } from '@/lib/suspension/model'

type Props = {
  geometry: Geometry
}

export default function ReadoutPanel({ geometry }: Props) {
  return (
    <div
      className="w-full shrink-0 rounded-lg border p-5 lg:w-64"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
        Alignment
      </p>

      <Readout
        label="Camber"
        value={`${geometry.rear.camberDeg.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="Caster"
        value={`${geometry.casterDeg.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="KPI"
        value={`${geometry.rear.kpiDeg.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="Trail"
        value={`${geometry.trailMm.toFixed(PRECISION.lengthMm)} mm`}
      />
      <Readout
        label="Scrub Radius"
        value={`${geometry.scrubRadiusMm.toFixed(PRECISION.lengthMm)} mm`}
      />
      <Readout
        label="Toe (L)"
        value={`${geometry.top.toeDegLeft.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="Toe (R)"
        value={`${geometry.top.toeDegRight.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="Ackerman"
        value={`${geometry.ackermanDeltaDeg.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="Max Steering Lock"
        value={`${geometry.maxSteeringLock.degrees.toFixed(PRECISION.angleDeg)}°`}
      />
      {geometry.maxSteeringLock.blocked && (
        <p
          className="mt-2 font-mono text-xs"
          style={{ color: '#FF0020' }}
        >
          {geometry.maxSteeringLock.reason}
        </p>
      )}

      {!geometry.isStateNeutral && (
        <>
          <p
            className="mb-3 mt-6 font-mono text-xs uppercase tracking-[0.2em]"
            style={{ color: 'var(--muted)' }}
          >
            Live
          </p>
          <PairedReadout
            label="Camber"
            unit="°"
            left={geometry.live.left.rear.camberDeg}
            right={geometry.live.right.rear.camberDeg}
            precision={PRECISION.angleDeg}
          />
          <PairedReadout
            label="Toe"
            unit="°"
            left={geometry.live.left.top.toeDeg}
            right={geometry.live.right.top.toeDeg}
            precision={PRECISION.angleDeg}
          />
          <PairedReadout
            label="Scrub"
            unit=" mm"
            left={geometry.live.left.scrubRadiusMm}
            right={geometry.live.right.scrubRadiusMm}
            precision={PRECISION.lengthMm}
          />
        </>
      )}
    </div>
  )
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--foreground)' }}>
        {value}
      </span>
    </div>
  )
}

function PairedReadout({
  label,
  unit,
  left,
  right,
  precision,
}: {
  label: string
  unit: string
  left: number
  right: number
  precision: number
}) {
  return (
    <div className="mb-3">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div className="mt-0.5 grid grid-cols-2 gap-2 font-mono text-sm tabular-nums" style={{ color: 'var(--foreground)' }}>
        <span>L {left.toFixed(precision)}{unit}</span>
        <span>R {right.toFixed(precision)}{unit}</span>
      </div>
    </div>
  )
}
