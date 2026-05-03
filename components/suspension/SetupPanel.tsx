import { LOWER_ARM_LENGTH } from '@/lib/suspension/config'

type Props = {
  lowerArmLength: number
  onLowerArmLengthChange: (value: number) => void
}

export default function SetupPanel({ lowerArmLength, onLowerArmLengthChange }: Props) {
  return (
    <div
      className="w-full shrink-0 rounded-lg border p-5 lg:w-72"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
        Setup
      </p>

      <Slider
        label="Lower Arm Length"
        value={lowerArmLength}
        min={LOWER_ARM_LENGTH.min}
        max={LOWER_ARM_LENGTH.max}
        step={LOWER_ARM_LENGTH.step}
        display={v => `${v.toFixed(1)} mm`}
        onChange={onLowerArmLengthChange}
      />
    </div>
  )
}

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: (v: number) => string
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
        <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>
          {display(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor: '#FF0020' }}
      />
    </div>
  )
}
