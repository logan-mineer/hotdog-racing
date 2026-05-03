import {
  LOWER_ARM_LENGTH,
  TIE_ROD_LENGTH,
  CASTER_SPACER,
  UPPER_ARM_LENGTH,
  WHEEL_HEX_THICKNESS,
  WHEEL_OFFSET,
  TIRE_OD,
  CARRIER_HEIGHT,
  CARRIER_TIE_ROD_INBOARD_OFFSET,
  STEERING_RACK_FORE_AFT,
  RACK_TYPES,
  RACK_TYPE_LABELS,
  type RackType,
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
  carrierTieRodInboardOffsetMm: number
  onCarrierTieRodInboardOffsetChange: (value: number) => void
  steeringRackForeAftMm: number
  onSteeringRackForeAftChange: (value: number) => void
  upperArmLength: number
  onUpperArmLengthChange: (value: number) => void
  tireOD: number
  onTireODChange: (value: number) => void
  carrierHeightMm: number
  onCarrierHeightChange: (value: number) => void
  steeringRackType: RackType
  onSteeringRackTypeChange: (value: RackType) => void
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
  carrierTieRodInboardOffsetMm,
  onCarrierTieRodInboardOffsetChange,
  steeringRackForeAftMm,
  onSteeringRackForeAftChange,
  upperArmLength,
  onUpperArmLengthChange,
  tireOD,
  onTireODChange,
  carrierHeightMm,
  onCarrierHeightChange,
  steeringRackType,
  onSteeringRackTypeChange,
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

      <Slider
        label="Carrier Tie Rod Inboard Offset"
        value={carrierTieRodInboardOffsetMm}
        min={CARRIER_TIE_ROD_INBOARD_OFFSET.min}
        max={CARRIER_TIE_ROD_INBOARD_OFFSET.max}
        step={CARRIER_TIE_ROD_INBOARD_OFFSET.step}
        display={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)} mm`}
        onChange={onCarrierTieRodInboardOffsetChange}
      />

      <Slider
        label="Steering Rack Fore/Aft"
        value={steeringRackForeAftMm}
        min={STEERING_RACK_FORE_AFT.min}
        max={STEERING_RACK_FORE_AFT.max}
        step={STEERING_RACK_FORE_AFT.step}
        display={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)} mm`}
        onChange={onSteeringRackForeAftChange}
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

      <Slider
        label="Carrier Height"
        value={carrierHeightMm}
        min={CARRIER_HEIGHT.min}
        max={CARRIER_HEIGHT.max}
        step={CARRIER_HEIGHT.step}
        display={v => `${v.toFixed(1)} mm`}
        onChange={onCarrierHeightChange}
      />

      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Steering Rack Type
          </span>
        </div>
        <select
          value={steeringRackType}
          onChange={e => onSteeringRackTypeChange(e.target.value as RackType)}
          className="w-full rounded border bg-transparent p-1 font-mono text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          {RACK_TYPES.map(t => (
            <option key={t} value={t}>{RACK_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
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
