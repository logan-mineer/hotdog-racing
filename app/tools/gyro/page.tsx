import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servo & Gyro Visualizer',
  description: 'Coming soon — gyro gain curve and servo response visualizer for RC drift.',
}

export default function GyroPage() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent uppercase">
          Coming Soon
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: 'var(--foreground)' }}>
          Servo &amp; Gyro Visualizer
        </h1>
        <p className="mx-auto max-w-sm text-base" style={{ color: 'var(--muted)' }}>
          This tool is still in development. Check back soon.
        </p>
      </div>
    </section>
  )
}
