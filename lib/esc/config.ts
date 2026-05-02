export type SliderDef = {
  min: number
  max: number
  step: number
  defaultValue: number
}

export type SelectDef<T extends string | number> = {
  options: readonly T[]
  defaultValue: T
}

// Timing tab
export const MOTOR_TURN: SliderDef = { min: 4.5, max: 21.5, step: 0.5, defaultValue: 10.5 }
export const MOTOR_CAN_TIMING: SliderDef = { min: 0, max: 30, step: 1, defaultValue: 0 }
export const BOOST_TIMING: SliderDef = { min: 0, max: 60, step: 1, defaultValue: 0 }
export const BOOST_START_RPM: SliderDef = { min: 1000, max: 40000, step: 500, defaultValue: 5000 }
export const BOOST_END_RPM: SliderDef = { min: 10000, max: 100000, step: 500, defaultValue: 20000 }
export const TURBO_TIMING: SliderDef = { min: 0, max: 60, step: 1, defaultValue: 0 }
export const REV_LIMIT_RPM: SliderDef = { min: 10000, max: 100000, step: 1000, defaultValue: 50000 }

// Throttle tab
export const INITIAL_SPEED: SliderDef = { min: 0, max: 50, step: 2, defaultValue: 10 }
export const FREE_ZONE_ADJUST: SliderDef = { min: 1, max: 10, step: 1, defaultValue: 3 }

export type ThrottleCurveMode = 'negative' | 'linear' | 'positive'
export const THROTTLE_CURVE: SelectDef<ThrottleCurveMode> = {
  options: ['negative', 'linear', 'positive'],
  defaultValue: 'linear',
}

export const DRIVE_FREQUENCY_KHZ: SelectDef<number> = {
  options: [1, 2, 4, 8, 16, 32, 64],
  defaultValue: 16,
}

// Braking tab
export const NEUTRAL_BRAKE_POWER: SliderDef = { min: 0, max: 100, step: 2, defaultValue: 10 }
export const INITIAL_BRAKE_POWER: SliderDef = { min: 0, max: 50, step: 2, defaultValue: 20 }
export const FULL_BRAKE_POWER: SliderDef = { min: 0, max: 100, step: 2, defaultValue: 80 }

export const NEUTRAL_BRAKE_FREQUENCY_KHZ: SelectDef<number> = {
  options: [0.5, 1, 2, 4, 8, 16, 32],
  defaultValue: 8,
}

export const BRAKE_FREQUENCY_KHZ: SelectDef<number> = {
  options: [0.5, 1, 2, 4, 8, 16, 32],
  defaultValue: 8,
}
