// Slider ranges, defaults, step sizes, baseline chassis values, and decimal
// precision for the suspension tool. All baseline values are placeholders
// pinned with TODO until measured against a reference 1/10 MR chassis.

export type SliderDef = {
  min: number
  max: number
  step: number
  defaultValue: number
}

export type RackType = 'wiper' | 'direct-drive' | 'slide-rack'

export const RACK_TYPES: readonly RackType[] = ['wiper', 'direct-drive', 'slide-rack']

export const RACK_TYPE_LABELS: Record<RackType, string> = {
  wiper: 'Wiper',
  'direct-drive': 'Direct Drive',
  'slide-rack': 'Slide Rack',
}

export type ChassisBaseline = {
  // Rear-view plane (y = 0 is ground, +y up, +x is outboard from chassis centerline).
  // Right side of the car; left side mirrors.
  blockLowerInboardX: number
  blockLowerY: number
  blockUpperInboardX: number
  blockUpperY: number
  knuckleLength: number       // distance between lower and upper kingpin balls along the carrier
  // Temporary placeholder pinning the 4-bar linkage's free DOF until the
  // Ride height slider (PRD Setup table) is wired up — at that point ride
  // height will determine the lower-arm angle and this field can be removed.
  staticLowerArmAngleDeg: number
  // Visualization-only baseline. tireOD moved to Setup in #82; the remaining
  // tire/rim dimensions are static chassis defaults until further refinement.
  tireWidth: number
  rimDiameter: number
  rimWidth: number
  // Top-view plane (y = +forward, x = +outboard right; left mirrors).
  // Steering geometry. Engineered so that at default LOWER_ARM_LENGTH and default
  // TIE_ROD_LENGTH the right-side knuckle sits at zero rotation (zero toe).
  rackBallX: number              // rack ball x position (right side; left mirrors)
  rackBallY: number              // rack ball y position (negative = behind front axle)
  knuckleTieRodOffsetX: number   // tie rod attach offset from kingpin in baseline knuckle frame
  knuckleTieRodOffsetY: number
  maxRackTravelMm: number        // max lateral travel of the rack from neutral, at full lock
}

// Driver-tunable
export const LOWER_ARM_LENGTH: SliderDef = { min: 35, max: 60, step: 0.5, defaultValue: 45 }
export const TIE_ROD_LENGTH: SliderDef = { min: 30, max: 50, step: 0.5, defaultValue: 40 }
export const CASTER_SPACER: SliderDef = { min: 0, max: 15, step: 1, defaultValue: 0 }
export const WHEEL_HEX_THICKNESS: SliderDef = { min: 0, max: 10, step: 1, defaultValue: 5 }
export const WHEEL_OFFSET: SliderDef = { min: -5, max: 15, step: 0.5, defaultValue: 0 }
export const CARRIER_TIE_ROD_INBOARD_OFFSET: SliderDef = { min: -3, max: 3, step: 0.5, defaultValue: 0 }
export const STEERING_RACK_FORE_AFT: SliderDef = { min: -10, max: 10, step: 0.5, defaultValue: 0 }

// Chassis config — mirror-symmetric, persists per chassis. Inline in the
// Setup panel for now; the dedicated Advanced collapse lands in #89.
export const UPPER_ARM_LENGTH: SliderDef = { min: 35, max: 55, step: 0.5, defaultValue: 45 }
export const TIRE_OD: SliderDef = { min: 50, max: 70, step: 0.5, defaultValue: 60 }
// CARRIER_HEIGHT_MM is the wheel-hub height along the kingpin axis above the
// lower kingpin ball. Default = knuckleLength/2 (hub at midpoint).
export const CARRIER_HEIGHT: SliderDef = { min: 10, max: 35, step: 0.5, defaultValue: 22.5 }

// Ephemeral car articulation — never persists, resets on every page load.
// Steering input scales the rack lateral travel (100% = full lock); wheel
// travel is bump (positive) or droop (negative) from ride height per side.
export const STEERING_INPUT: SliderDef = { min: -100, max: 100, step: 1, defaultValue: 0 }
export const WHEEL_TRAVEL: SliderDef = { min: -10, max: 10, step: 0.5, defaultValue: 0 }

// Chassis baseline. Engineered so that at default LOWER_ARM_LENGTH the kingpin is
// vertical (camber = 0°) and the wheel sits with its bottom at ground.
export const CHASSIS_BASELINE: ChassisBaseline = {
  blockLowerInboardX: 25,        // TODO: measure off reference chassis
  blockLowerY: 8,                // TODO
  blockUpperInboardX: 25,        // TODO
  blockUpperY: 53,               // TODO
  knuckleLength: 45,             // TODO
  staticLowerArmAngleDeg: 0,     // TODO — currently horizontal
  tireWidth: 24,                 // TODO
  rimDiameter: 35,               // TODO
  rimWidth: 18,                  // TODO
  // Top-view steering geometry — at default lowerArm=45 the right kingpin sits
  // at top-view (70, 0); knuckle attach baseline is (60, -10); rack ball at
  // (20, -10) gives a 40mm tie rod for zero toe at TIE_ROD_LENGTH.defaultValue.
  rackBallX: 20,                 // TODO
  rackBallY: -10,                // TODO
  knuckleTieRodOffsetX: -10,     // TODO
  knuckleTieRodOffsetY: -10,     // TODO
  maxRackTravelMm: 5,            // TODO
}

// Decimal precision for readouts (per PRD: 0.1° / 0.1mm / integer %)
export const PRECISION = {
  angleDeg: 1,    // 0.1° — one decimal place
  lengthMm: 1,    // 0.1mm
  percent: 0,     // integer %
} as const
