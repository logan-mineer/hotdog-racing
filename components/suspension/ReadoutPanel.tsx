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
        label="Toe (L)"
        value={`${geometry.top.toeDegLeft.toFixed(PRECISION.angleDeg)}°`}
      />
      <Readout
        label="Toe (R)"
        value={`${geometry.top.toeDegRight.toFixed(PRECISION.angleDeg)}°`}
      />
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
