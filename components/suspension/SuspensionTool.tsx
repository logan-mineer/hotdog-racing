'use client'

import { useMemo, useState } from 'react'
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
  STEERING_INPUT,
  WHEEL_TRAVEL,
  type RackType,
} from '@/lib/suspension/config'
import { computeGeometry } from '@/lib/suspension/model'
import RearView from './RearView'
import TopView from './TopView'
import SetupPanel from './SetupPanel'
import ReadoutPanel from './ReadoutPanel'
import StatePanel from './StatePanel'

export default function SuspensionTool() {
  const [lowerArmLength, setLowerArmLength] = useState(LOWER_ARM_LENGTH.defaultValue)
  const [tieRodLength, setTieRodLength] = useState(TIE_ROD_LENGTH.defaultValue)
  const [casterSpacerDeg, setCasterSpacerDeg] = useState(CASTER_SPACER.defaultValue)
  const [upperArmLength, setUpperArmLength] = useState(UPPER_ARM_LENGTH.defaultValue)
  const [wheelHexThicknessMm, setWheelHexThicknessMm] = useState(WHEEL_HEX_THICKNESS.defaultValue)
  const [wheelOffsetMm, setWheelOffsetMm] = useState(WHEEL_OFFSET.defaultValue)
  const [tireOD, setTireOD] = useState(TIRE_OD.defaultValue)
  const [carrierTieRodInboardOffsetMm, setCarrierTieRodInboardOffsetMm] = useState(CARRIER_TIE_ROD_INBOARD_OFFSET.defaultValue)
  const [steeringRackForeAftMm, setSteeringRackForeAftMm] = useState(STEERING_RACK_FORE_AFT.defaultValue)
  const [carrierHeightMm, setCarrierHeightMm] = useState(CARRIER_HEIGHT.defaultValue)
  const [steeringRackType, setSteeringRackType] = useState<RackType>('direct-drive')

  // State sliders — never persist; useState defaults guarantee neutral on every page load.
  const [steeringInput, setSteeringInput] = useState(STEERING_INPUT.defaultValue)
  const [leftWheelTravelMm, setLeftWheelTravelMm] = useState(WHEEL_TRAVEL.defaultValue)
  const [rightWheelTravelMm, setRightWheelTravelMm] = useState(WHEEL_TRAVEL.defaultValue)
  const [showGhost, setShowGhost] = useState(true)

  const geometry = useMemo(
    () =>
      computeGeometry(
        {
          lowerArmLength,
          tieRodLength,
          casterSpacerDeg,
          upperArmLength,
          wheelHexThicknessMm,
          wheelOffsetMm,
          tireOD,
          carrierTieRodInboardOffsetMm,
          steeringRackForeAftMm,
          carrierHeightMm,
          steeringRackType,
        },
        undefined,
        {
          steeringInput,
          leftWheelTravelMm,
          rightWheelTravelMm,
        },
      ),
    [
      lowerArmLength,
      tieRodLength,
      casterSpacerDeg,
      upperArmLength,
      wheelHexThicknessMm,
      wheelOffsetMm,
      tireOD,
      carrierTieRodInboardOffsetMm,
      steeringRackForeAftMm,
      carrierHeightMm,
      steeringRackType,
      steeringInput,
      leftWheelTravelMm,
      rightWheelTravelMm,
    ],
  )

  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-accent">Suspension Tool</p>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          Suspension Alignment Visualizer
        </h1>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <SetupPanel
            lowerArmLength={lowerArmLength}
            onLowerArmLengthChange={setLowerArmLength}
            tieRodLength={tieRodLength}
            onTieRodLengthChange={setTieRodLength}
            casterSpacerDeg={casterSpacerDeg}
            onCasterSpacerChange={setCasterSpacerDeg}
            wheelHexThicknessMm={wheelHexThicknessMm}
            onWheelHexThicknessChange={setWheelHexThicknessMm}
            wheelOffsetMm={wheelOffsetMm}
            onWheelOffsetChange={setWheelOffsetMm}
            carrierTieRodInboardOffsetMm={carrierTieRodInboardOffsetMm}
            onCarrierTieRodInboardOffsetChange={setCarrierTieRodInboardOffsetMm}
            steeringRackForeAftMm={steeringRackForeAftMm}
            onSteeringRackForeAftChange={setSteeringRackForeAftMm}
            upperArmLength={upperArmLength}
            onUpperArmLengthChange={setUpperArmLength}
            tireOD={tireOD}
            onTireODChange={setTireOD}
            carrierHeightMm={carrierHeightMm}
            onCarrierHeightChange={setCarrierHeightMm}
            steeringRackType={steeringRackType}
            onSteeringRackTypeChange={setSteeringRackType}
          />

          <div className="flex flex-1 flex-col gap-4">
            <div
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                  Top View
                </p>
              </div>
              <div className="aspect-[16/10] w-full" style={{ color: 'var(--foreground)' }}>
                <TopView geometry={geometry} showGhost={showGhost} />
              </div>
            </div>

            <div
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                  Rear View
                </p>
              </div>
              <div className="aspect-[16/7] w-full" style={{ color: 'var(--foreground)' }}>
                <RearView geometry={geometry} showGhost={showGhost} />
              </div>
            </div>
          </div>

          <ReadoutPanel geometry={geometry} />
        </div>

        <div className="mt-4">
          <StatePanel
            steeringInput={steeringInput}
            onSteeringInputChange={setSteeringInput}
            leftWheelTravelMm={leftWheelTravelMm}
            onLeftWheelTravelChange={setLeftWheelTravelMm}
            rightWheelTravelMm={rightWheelTravelMm}
            onRightWheelTravelChange={setRightWheelTravelMm}
            showGhost={showGhost}
            onShowGhostChange={setShowGhost}
            isStateNeutral={geometry.isStateNeutral}
          />
        </div>
      </div>
    </section>
  )
}
