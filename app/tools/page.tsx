import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tools',
  description: 'RC drift setup tools — suspension geometry, ESC settings, and gyro configuration.',
  openGraph: {
    title: 'Tools | Hotdog Racing',
    description: 'RC drift setup tools — suspension geometry, ESC settings, and gyro configuration.',
    url: 'https://hotdog-racing.com/tools',
  },
}

type Tool = {
  name: string
  description: string
  href: string
  status: 'available' | 'coming-soon'
}

const tools: Tool[] = [
  {
    name: 'Suspension Alignment Visualizer',
    description: 'Visualize suspension geometry changes in real time — camber, toe, caster, and ride height.',
    href: '/tools/suspension',
    status: 'available',
  },
  {
    name: 'ESC Settings Visualizer',
    description: 'Map and compare ESC timing, drag brake, and power curves across configurations.',
    href: '/tools/esc',
    status: 'available',
  },
  {
    name: 'Servo & Gyro Visualizer',
    description: 'Configure gyro gain curves and servo response for maximum angle and stability.',
    href: '/tools/gyro',
    status: 'coming-soon',
  },
]

export default function ToolsPage() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 font-mono text-xs tracking-[0.25em] text-accent uppercase">Setup Tools</p>
        <h1 className="mb-10 text-3xl font-bold sm:text-4xl" style={{ color: 'var(--foreground)' }}>
          Tools
        </h1>
        <div className="space-y-4">
          {tools.map(tool =>
            tool.status === 'available' ? (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block rounded-lg border p-6 transition-colors hover:border-accent"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <h2
                  className="mb-2 font-semibold text-sm leading-snug transition-colors group-hover:text-accent"
                  style={{ color: 'var(--foreground)' }}
                >
                  {tool.name}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {tool.description}
                </p>
              </Link>
            ) : (
              <div
                key={tool.href}
                className="rounded-lg border p-6 opacity-60"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="font-semibold text-sm leading-snug" style={{ color: 'var(--foreground)' }}>
                    {tool.name}
                  </h2>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                  >
                    coming soon
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {tool.description}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
