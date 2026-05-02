'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BOOST_END_RPM,
  BOOST_START_RPM,
  BOOST_TIMING,
  DRIVE_FREQUENCY_KHZ,
  FREE_ZONE_ADJUST,
  INITIAL_SPEED,
  MOTOR_CAN_TIMING,
  MOTOR_TURN,
  REV_LIMIT_RPM,
  THROTTLE_CURVE,
  TURBO_TIMING,
} from '@/lib/esc/config'
import type { ThrottleCurveMode } from '@/lib/esc/config'
import { effectiveTiming, motorKV, torquePowerCurve } from '@/lib/esc/model'
import ThrottleChart from './ThrottleChart'
import TimingChart from './TimingChart'

type Tab = 'timing' | 'throttle' | 'braking'

type TimingState = {
  motorTurn: number
  motorCanTiming: number
  boostTiming: number
  boostStartRPM: number
  boostEndRPM: number
  turboTiming: number
  turboActive: boolean
  revLimitEnabled: boolean
  revLimitRPM: number
}

const TIMING_DEFAULTS: TimingState = {
  motorTurn: MOTOR_TURN.defaultValue,
  motorCanTiming: MOTOR_CAN_TIMING.defaultValue,
  boostTiming: BOOST_TIMING.defaultValue,
  boostStartRPM: BOOST_START_RPM.defaultValue,
  boostEndRPM: BOOST_END_RPM.defaultValue,
  turboTiming: TURBO_TIMING.defaultValue,
  turboActive: false,
  revLimitEnabled: false,
  revLimitRPM: REV_LIMIT_RPM.defaultValue,
}

type ThrottleState = {
  initialSpeed: number
  freeZoneAdjust: number
  throttleCurve: ThrottleCurveMode
  driveFrequency: number
}

const THROTTLE_DEFAULTS: ThrottleState = {
  initialSpeed: INITIAL_SPEED.defaultValue,
  freeZoneAdjust: FREE_ZONE_ADJUST.defaultValue,
  throttleCurve: THROTTLE_CURVE.defaultValue,
  driveFrequency: DRIVE_FREQUENCY_KHZ.defaultValue,
}

const LS_KEY = 'esc-tool-settings'

export default function EscTool() {
  const [tab, setTab] = useState<Tab>('timing')
  const [timing, setTiming] = useState<TimingState>(TIMING_DEFAULTS)
  const [throttle, setThrottleState] = useState<ThrottleState>(THROTTLE_DEFAULTS)
  const skipFirstWrite = useRef(true)
  const skipFirstThrottleWrite = useRef(true)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (parsed.timing && typeof parsed.timing === 'object') {
          const t = parsed.timing as Record<string, unknown>
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTiming(prev => ({
            ...prev,
            ...(typeof t.motorTurn === 'number' ? { motorTurn: t.motorTurn } : {}),
            ...(typeof t.motorCanTiming === 'number' ? { motorCanTiming: t.motorCanTiming } : {}),
            ...(typeof t.boostTiming === 'number' ? { boostTiming: t.boostTiming } : {}),
            ...(typeof t.boostStartRPM === 'number' ? { boostStartRPM: t.boostStartRPM } : {}),
            ...(typeof t.boostEndRPM === 'number' ? { boostEndRPM: t.boostEndRPM } : {}),
            ...(typeof t.turboTiming === 'number' ? { turboTiming: t.turboTiming } : {}),
            ...(typeof t.turboActive === 'boolean' ? { turboActive: t.turboActive } : {}),
            ...(typeof t.revLimitEnabled === 'boolean' ? { revLimitEnabled: t.revLimitEnabled } : {}),
            ...(typeof t.revLimitRPM === 'number' ? { revLimitRPM: t.revLimitRPM } : {}),
          }))
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Persist to localStorage on change (skip initial mount to avoid overwriting stored values)
  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false
      return
    }
    try {
      const existing = localStorage.getItem(LS_KEY)
      const current = existing ? (JSON.parse(existing) as Record<string, unknown>) : {}
      localStorage.setItem(LS_KEY, JSON.stringify({ ...current, timing }))
    } catch {
      // ignore
    }
  }, [timing])

  // Restore throttle state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (parsed.throttle && typeof parsed.throttle === 'object') {
          const t = parsed.throttle as Record<string, unknown>
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setThrottleState(prev => ({
            ...prev,
            ...(typeof t.initialSpeed === 'number' ? { initialSpeed: t.initialSpeed } : {}),
            ...(typeof t.freeZoneAdjust === 'number' ? { freeZoneAdjust: t.freeZoneAdjust } : {}),
            ...(t.throttleCurve === 'negative' || t.throttleCurve === 'linear' || t.throttleCurve === 'positive'
              ? { throttleCurve: t.throttleCurve }
              : {}),
            ...(typeof t.driveFrequency === 'number' ? { driveFrequency: t.driveFrequency } : {}),
          }))
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Persist throttle state to localStorage on change
  useEffect(() => {
    if (skipFirstThrottleWrite.current) {
      skipFirstThrottleWrite.current = false
      return
    }
    try {
      const existing = localStorage.getItem(LS_KEY)
      const current = existing ? (JSON.parse(existing) as Record<string, unknown>) : {}
      localStorage.setItem(LS_KEY, JSON.stringify({ ...current, throttle }))
    } catch {
      // ignore
    }
  }, [throttle])

  function set<K extends keyof TimingState>(key: K, value: TimingState[K]) {
    setTiming(prev => ({ ...prev, [key]: value }))
  }

  function setThrottle<K extends keyof ThrottleState>(key: K, value: ThrottleState[K]) {
    setThrottleState(prev => ({ ...prev, [key]: value }))
  }

  const kv = Math.round(motorKV(timing.motorTurn))

  const chartParams = useMemo(() => ({
    motorTurn: timing.motorTurn,
    motorCanTiming: timing.motorCanTiming,
    boostTiming: timing.boostTiming,
    boostStartRPM: timing.boostStartRPM,
    boostEndRPM: timing.boostEndRPM,
    turboTiming: timing.turboTiming,
    turboActive: timing.turboActive,
  }), [
    timing.motorTurn,
    timing.motorCanTiming,
    timing.boostTiming,
    timing.boostStartRPM,
    timing.boostEndRPM,
    timing.turboTiming,
    timing.turboActive,
  ])

  const liveReadout = useMemo(() => {
    const curve = torquePowerCurve(chartParams)
    const peakPower = curve.reduce((best, p) => (p.power > best.power ? p : best))
    const deg = effectiveTiming(
      peakPower.rpm,
      timing.motorCanTiming,
      timing.boostTiming,
      timing.boostStartRPM,
      timing.boostEndRPM,
      timing.turboTiming,
      timing.turboActive,
    )
    return { rpm: Math.round(peakPower.rpm), deg: Math.round(deg * 10) / 10 }
  }, [chartParams, timing.motorCanTiming, timing.boostTiming, timing.boostStartRPM, timing.boostEndRPM, timing.turboTiming, timing.turboActive])

  const throttleChartParams = useMemo(() => ({
    initialSpeed: throttle.initialSpeed,
    freeZoneAdjust: throttle.freeZoneAdjust,
    throttleCurve: throttle.throttleCurve,
  }), [throttle.initialSpeed, throttle.freeZoneAdjust, throttle.throttleCurve])

  const tabs: Tab[] = ['timing', 'throttle', 'braking']

  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-accent">ESC Tool</p>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          ESC Settings Visualizer
        </h1>

        {/* Tab bar */}
        <div className="mb-6 flex border-b" style={{ borderColor: 'var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-5 py-3 text-sm font-medium capitalize transition-colors"
              style={{
                color: tab === t ? 'var(--foreground)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid #FF0020' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Timing tab */}
        {tab === 'timing' && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Parameter panel */}
            <div
              className="w-full shrink-0 rounded-lg border p-5 lg:w-80"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              {/* Motor turn */}
              <div className="mb-5">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    Motor Turn
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>
                    {timing.motorTurn}T
                    <span className="ml-2 text-xs" style={{ color: 'var(--muted)' }}>{kv} KV</span>
                  </span>
                </div>
                <input
                  type="number"
                  min={MOTOR_TURN.min}
                  max={MOTOR_TURN.max}
                  step={MOTOR_TURN.step}
                  value={timing.motorTurn}
                  onChange={e => {
                    const v = parseFloat(e.target.value)
                    if (!isNaN(v) && v >= MOTOR_TURN.min && v <= MOTOR_TURN.max) set('motorTurn', v)
                  }}
                  className="w-full rounded border px-3 py-2 font-mono text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--foreground)' }}
                />
              </div>

              <Slider label="Can Timing" value={timing.motorCanTiming} min={MOTOR_CAN_TIMING.min} max={MOTOR_CAN_TIMING.max} step={MOTOR_CAN_TIMING.step} display={v => `${v}°`} onChange={v => set('motorCanTiming', v)} />
              <Slider label="Boost Timing" value={timing.boostTiming} min={BOOST_TIMING.min} max={BOOST_TIMING.max} step={BOOST_TIMING.step} display={v => `${v}°`} onChange={v => set('boostTiming', v)} />
              <Slider label="Boost Start RPM" value={timing.boostStartRPM} min={BOOST_START_RPM.min} max={BOOST_START_RPM.max} step={BOOST_START_RPM.step} display={v => `${(v / 1000).toFixed(1)}k`} onChange={v => set('boostStartRPM', v)} />
              <Slider label="Boost End RPM" value={timing.boostEndRPM} min={BOOST_END_RPM.min} max={BOOST_END_RPM.max} step={BOOST_END_RPM.step} display={v => `${(v / 1000).toFixed(1)}k`} onChange={v => set('boostEndRPM', v)} />

              {/* Turbo section */}
              <div
                className="mb-5 rounded-md border p-3"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
              >
                <Slider label="Turbo Timing" value={timing.turboTiming} min={TURBO_TIMING.min} max={TURBO_TIMING.max} step={TURBO_TIMING.step} display={v => `${v}°`} onChange={v => set('turboTiming', v)} />
                <p className="mb-3 text-xs" style={{ color: 'var(--muted)' }}>
                  Higher = turbo hits faster / fades faster
                </p>
                <button
                  type="button"
                  onClick={() => set('turboActive', !timing.turboActive)}
                  className="w-full rounded py-2.5 text-sm font-semibold tracking-wide transition-colors"
                  style={{
                    background: timing.turboActive ? '#FF0020' : 'transparent',
                    color: timing.turboActive ? '#fff' : 'var(--foreground)',
                    border: '1px solid',
                    borderColor: timing.turboActive ? '#FF0020' : 'var(--border)',
                  }}
                >
                  {timing.turboActive ? 'WOT / TURBO ON' : 'WOT / Turbo'}
                </button>
              </div>

              {/* Rev limit */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    Rev Limit
                  </span>
                  <button
                    type="button"
                    onClick={() => set('revLimitEnabled', !timing.revLimitEnabled)}
                    className="font-mono text-xs font-semibold transition-colors"
                    style={{ color: timing.revLimitEnabled ? '#FF0020' : 'var(--muted)' }}
                  >
                    {timing.revLimitEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {timing.revLimitEnabled && (
                  <Slider label="" value={timing.revLimitRPM} min={REV_LIMIT_RPM.min} max={REV_LIMIT_RPM.max} step={REV_LIMIT_RPM.step} display={v => `${(v / 1000).toFixed(0)}k RPM`} onChange={v => set('revLimitRPM', v)} />
                )}
              </div>
            </div>

            {/* Chart column */}
            <div className="flex flex-1 flex-col gap-4">
              {/* Live readout */}
              <div
                className="rounded-lg border px-5 py-4"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <p className="mb-0.5 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Total timing at peak power
                </p>
                <p className="font-mono text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {liveReadout.deg}°
                  <span className="ml-3 font-mono text-sm font-normal" style={{ color: 'var(--muted)' }}>
                    @ {(liveReadout.rpm / 1000).toFixed(1)}k RPM
                  </span>
                </p>
              </div>

              {/* Chart */}
              <div
                className="relative h-72 overflow-hidden rounded-lg border sm:h-96"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                {/* Legend */}
                <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="2" viewBox="0 0 20 2" aria-hidden>
                      <line x1="0" y1="1" x2="20" y2="1" stroke="#FF0020" strokeWidth="2" />
                    </svg>
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Torque</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="2" viewBox="0 0 20 2" aria-hidden>
                      <line x1="0" y1="1" x2="20" y2="1" stroke="#FF0020" strokeWidth="2" strokeDasharray="6 3" />
                    </svg>
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Power</span>
                  </div>
                </div>
                <TimingChart
                  params={chartParams}
                  revLimitEnabled={timing.revLimitEnabled}
                  revLimitRPM={timing.revLimitRPM}
                />
              </div>
            </div>
          </div>
        )}

        {/* Throttle tab */}
        {tab === 'throttle' && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Parameter panel */}
            <div
              className="w-full shrink-0 rounded-lg border p-5 lg:w-80"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <Slider
                label="Initial Speed"
                value={throttle.initialSpeed}
                min={INITIAL_SPEED.min}
                max={INITIAL_SPEED.max}
                step={INITIAL_SPEED.step}
                display={v => `${v}%`}
                onChange={v => setThrottle('initialSpeed', v)}
              />
              <Slider
                label="Free Zone Adjust"
                value={throttle.freeZoneAdjust}
                min={FREE_ZONE_ADJUST.min}
                max={FREE_ZONE_ADJUST.max}
                step={FREE_ZONE_ADJUST.step}
                display={v => `${v}%`}
                onChange={v => setThrottle('freeZoneAdjust', v)}
              />

              {/* Throttle curve selector */}
              <div className="mb-5">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Throttle Curve
                </span>
                <div className="flex gap-2">
                  {THROTTLE_CURVE.options.map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setThrottle('throttleCurve', mode)}
                      className="flex-1 rounded py-2 text-xs font-semibold capitalize transition-colors"
                      style={{
                        background: throttle.throttleCurve === mode ? '#FF0020' : 'transparent',
                        color: throttle.throttleCurve === mode ? '#fff' : 'var(--foreground)',
                        border: '1px solid',
                        borderColor: throttle.throttleCurve === mode ? '#FF0020' : 'var(--border)',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  {throttle.throttleCurve === 'negative' && 'Soft start, aggressive top-end'}
                  {throttle.throttleCurve === 'linear' && 'Direct 1:1 stick-to-power response'}
                  {throttle.throttleCurve === 'positive' && 'Aggressive start, soft top-end'}
                </p>
              </div>

              {/* Drive frequency selector */}
              <div className="mb-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                    Drive Frequency
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>
                    {throttle.driveFrequency} kHz
                  </span>
                </div>
                <select
                  value={throttle.driveFrequency}
                  onChange={e => setThrottle('driveFrequency', Number(e.target.value))}
                  className="w-full rounded border px-3 py-2 font-mono text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--foreground)' }}
                >
                  {DRIVE_FREQUENCY_KHZ.options.map(f => (
                    <option key={f} value={f}>{f} kHz</option>
                  ))}
                </select>
                <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  Lower = punchier / less smooth · Higher = smoother / more RPM / more heat
                </p>
              </div>
            </div>

            {/* Chart */}
            <div
              className="relative h-72 flex-1 overflow-hidden rounded-lg border sm:h-96"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <ThrottleChart params={throttleChartParams} />
            </div>
          </div>
        )}

        {/* Braking tab placeholder */}
        {tab === 'braking' && (
          <div
            className="rounded-lg border p-12 text-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Coming next
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Brake curve — in progress.
            </p>
          </div>
        )}
      </div>
    </section>
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
      {label && (
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {label}
          </span>
          <span className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>
            {display(value)}
          </span>
        </div>
      )}
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
