// Stub for the state slider region (steering input, L/R wheel travel).
// State sliders land in #84; this placeholder keeps the responsive shell
// honest by reserving the bottom-docked region across all breakpoints.

export default function StatePanel() {
  return (
    <div
      className="w-full rounded-lg border p-3"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
        State
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
        Steering & travel sliders coming in a later slice.
      </p>
    </div>
  )
}
