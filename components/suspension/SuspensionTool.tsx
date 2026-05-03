'use client'

import { useMemo, useState } from 'react'
import { LOWER_ARM_LENGTH, TIE_ROD_LENGTH } from '@/lib/suspension/config'
import { computeGeometry } from '@/lib/suspension/model'
import RearView from './RearView'
import TopView from './TopView'
import SetupPanel from './SetupPanel'
import ReadoutPanel from './ReadoutPanel'
import StatePanel from './StatePanel'

export default function SuspensionTool() {
  const [lowerArmLength, setLowerArmLength] = useState(LOWER_ARM_LENGTH.defaultValue)
  const [tieRodLength, setTieRodLength] = useState(TIE_ROD_LENGTH.defaultValue)

  const geometry = useMemo(
    () => computeGeometry({ lowerArmLength, tieRodLength }),
    [lowerArmLength, tieRodLength],
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
                <TopView geometry={geometry} />
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
                <RearView geometry={geometry} />
              </div>
            </div>
          </div>

          <ReadoutPanel geometry={geometry} />
        </div>

        <div className="mt-4">
          <StatePanel />
        </div>
      </div>
    </section>
  )
}
