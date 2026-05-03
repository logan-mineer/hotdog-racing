'use client'

import { STEERING_INPUT, WHEEL_TRAVEL } from '@/lib/suspension/config'

type Props = {
  steeringInput: number
  onSteeringInputChange: (value: number) => void
  leftWheelTravelMm: number
  onLeftWheelTravelChange: (value: number) => void
  rightWheelTravelMm: number
  onRightWheelTravelChange: (value: number) => void
  showGhost: boolean
  onShowGhostChange: (value: boolean) => void
  isStateNeutral: boolean
}

export default function StatePanel({
  steeringInput,
  onSteeringInputChange,
  leftWheelTravelMm,
  onLeftWheelTravelChange,
  rightWheelTravelMm,
  onRightWheelTravelChange,
  showGhost,
  onShowGhostChange,
  isStateNeutral,
}: Props) {
  return (
    <div
      className="w-full rounded-lg border p-3"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          State
        </p>
        <label
          className="flex items-center gap-1.5 font-mono text-xs"
          style={{ color: isStateNeutral ? 'var(--muted)' : 'var(--foreground)' }}
        >
          <input
            type="checkbox"
            checked={showGhost}
            disabled={isStateNeutral}
            onChange={e => onShowGhostChange(e.target.checked)}
            style={{ accentColor: '#FF0020' }}
          />
          Ghost
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ScrubSlider
          label="Steering"
          value={steeringInput}
          min={STEERING_INPUT.min}
          max={STEERING_INPUT.max}
          step={STEERING_INPUT.step}
          display={v => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`}
          onChange={onSteeringInputChange}
        />
        <ScrubSlider
          label="Travel L"
          value={leftWheelTravelMm}
          min={WHEEL_TRAVEL.min}
          max={WHEEL_TRAVEL.max}
          step={WHEEL_TRAVEL.step}
          display={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)} mm`}
          onChange={onLeftWheelTravelChange}
        />
        <ScrubSlider
          label="Travel R"
          value={rightWheelTravelMm}
          min={WHEEL_TRAVEL.min}
          max={WHEEL_TRAVEL.max}
          step={WHEEL_TRAVEL.step}
          display={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)} mm`}
          onChange={onRightWheelTravelChange}
        />
      </div>
    </div>
  )
}

type ScrubSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: (v: number) => string
  onChange: (v: number) => void
}

function ScrubSlider({ label, value, min, max, step, display, onChange }: ScrubSliderProps) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
        <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--foreground)' }}>
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
