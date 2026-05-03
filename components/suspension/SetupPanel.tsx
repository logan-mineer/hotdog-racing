import {
  LOWER_ARM_LENGTH,
  TIE_ROD_LENGTH,
  CASTER_SPACER,
  UPPER_ARM_LENGTH,
  WHEEL_HEX_THICKNESS,
  WHEEL_OFFSET,
  TIRE_OD,
} from '@/lib/suspension/config'

type Props = {
  lowerArmLength: number
  onLowerArmLengthChange: (value: number) => void
  tieRodLength: number
  onTieRodLengthChange: (value: number) => void
  casterSpacerDeg: number
  onCasterSpacerChange: (value: number) => void
  wheelHexThicknessMm: number
  onWheelHexThicknessChange: (value: number) => void
  wheelOffsetMm: number
  onWheelOffsetChange: (value: number) => void
  upperArmLength: number
  onUpperArmLengthChange: (value: number) => void
  tireOD: number
  onTireODChange: (value: number) => void
}

export default function SetupPanel({
  lowerArmLength,
  onLowerArmLengthChange,
  tieRodLength,
  onTieRodLengthChange,
  casterSpacerDeg,
  onCasterSpacerChange,
  wheelHexThicknessMm,
  onWheelHexThicknessChange,
  wheelOffsetMm,
  onWheelOffsetChange,
  upperArmLength,
  onUpperArmLengthChange,
  tireOD,
  onTireODChange,
}: Props) {
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

      <Slider
        label="Tie Rod Length"
        value={tieRodLength}
        min={TIE_ROD_LENGTH.min}
        max={TIE_ROD_LENGTH.max}
        step={TIE_ROD_LENGTH.step}
        display={v => `${v.toFixed(1)} mm`}
        onChange={onTieRodLengthChange}
      />

      <Slider
        label="Caster Spacer"
        value={casterSpacerDeg}
        min={CASTER_SPACER.min}
        max={CASTER_SPACER.max}
        step={CASTER_SPACER.step}
        display={v => `${v.toFixed(0)}°`}
        onChange={onCasterSpacerChange}
      />

      <Slider
        label="Wheel Hex Thickness"
        value={wheelHexThicknessMm}
        min={WHEEL_HEX_THICKNESS.min}
        max={WHEEL_HEX_THICKNESS.max}
        step={WHEEL_HEX_THICKNESS.step}
        display={v => `${v.toFixed(0)} mm`}
        onChange={onWheelHexThicknessChange}
      />

      <Slider
        label="Wheel Offset"
        value={wheelOffsetMm}
        min={WHEEL_OFFSET.min}
        max={WHEEL_OFFSET.max}
        step={WHEEL_OFFSET.step}
        display={v => `${v.toFixed(1)} mm`}
        onChange={onWheelOffsetChange}
      />

      {/* Chassis config — moves to a collapsible Advanced section in #89. */}
      <p className="mb-3 mt-6 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
        Chassis
      </p>

      <Slider
        label="Upper Arm Length"
        value={upperArmLength}
        min={UPPER_ARM_LENGTH.min}
        max={UPPER_ARM_LENGTH.max}
        step={UPPER_ARM_LENGTH.step}
        display={v => `${v.toFixed(1)} mm`}
        onChange={onUpperArmLengthChange}
      />

      <Slider
        label="Tire OD"
        value={tireOD}
        min={TIRE_OD.min}
        max={TIRE_OD.max}
        step={TIRE_OD.step}
        display={v => `${v.toFixed(1)} mm`}
        onChange={onTireODChange}
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
