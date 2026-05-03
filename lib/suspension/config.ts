// Slider ranges, defaults, step sizes, baseline chassis values, and decimal
// precision for the suspension tool. All baseline values are placeholders
// pinned with TODO until measured against a reference 1/10 MR chassis.

export type SliderDef = {
  min: number
  max: number
  step: number
  defaultValue: number
}

export type ChassisBaseline = {
  // Rear-view plane (y = 0 is ground, +y up, +x is outboard from chassis centerline).
  // Right side of the car; left side mirrors.
  blockLowerInboardX: number
  blockLowerY: number
  blockUpperInboardX: number
  blockUpperY: number
  knuckleLength: number       // distance between lower and upper kingpin balls along the carrier
  upperArmLength: number      // chassis-fixed in v1 (the Advanced panel slider lands in #89)
  // Temporary placeholder pinning the 4-bar linkage's free DOF until the
  // Ride height slider (PRD Setup table) is wired up — at that point ride
  // height will determine the lower-arm angle and this field can be removed.
  staticLowerArmAngleDeg: number
  // Visualization-only baseline; these gain dedicated sliders in #82.
  tireOD: number
  tireWidth: number
  rimDiameter: number
  rimWidth: number
}

// Driver-tunable
export const LOWER_ARM_LENGTH: SliderDef = { min: 35, max: 60, step: 0.5, defaultValue: 45 }

// Chassis baseline. Engineered so that at default LOWER_ARM_LENGTH the kingpin is
// vertical (camber = 0°) and the wheel sits with its bottom at ground.
export const CHASSIS_BASELINE: ChassisBaseline = {
  blockLowerInboardX: 25,        // TODO: measure off reference chassis
  blockLowerY: 8,                // TODO
  blockUpperInboardX: 25,        // TODO
  blockUpperY: 53,               // TODO
  knuckleLength: 45,             // TODO
  upperArmLength: 45,            // TODO
  staticLowerArmAngleDeg: 0,     // TODO — currently horizontal
  tireOD: 60,                    // TODO
  tireWidth: 24,                 // TODO
  rimDiameter: 35,               // TODO
  rimWidth: 18,                  // TODO
}

// Decimal precision for readouts (per PRD: 0.1° / 0.1mm / integer %)
export const PRECISION = {
  angleDeg: 1,    // 0.1° — one decimal place
  lengthMm: 1,    // 0.1mm
  percent: 0,     // integer %
} as const
