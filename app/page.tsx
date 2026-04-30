import Link from 'next/link'

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedToolsSection />
      <LatestEpisodeSection />
      <InstagramSection />
      <SponsorsSection />
      <LatestPostsSection />
    </>
  )
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-near-black text-center">
      {/* Animated grid background */}
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,0,32,0.1)" strokeWidth="0.5" />
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to="40 40"
                dur="8s"
                repeatCount="indefinite"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Radial fade overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, #0D0D0D 100%)' }}
      />

      <div className="relative z-10 px-6">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent-500 uppercase">
          RC Drift
        </p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-near-white sm:text-7xl">
          Hotdog Racing
        </h1>
        <p className="mb-8 text-lg text-near-white/60 sm:text-xl">
          Setup tools and content for RC drift.
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-near-white transition-colors hover:bg-accent-700"
        >
          Open Tools →
        </Link>
      </div>
    </section>
  )
}

function FeaturedToolsSection() {
  const tools = [
    {
      name: 'Suspension Alignment',
      description: 'Adjust turnbuckles and visualize toe, camber, caster, and Ackermann in real time.',
      href: '/tools/suspension',
    },
    {
      name: 'ESC Settings',
      description: 'See how boost, turbo, and timing parameters shape your power delivery curve.',
      href: '/tools/esc',
    },
    {
      name: 'Servo & Gyro',
      description: 'Visualize gyro gain and servo endpoint effects on steering response.',
      href: '/tools/gyro',
      soon: true,
    },
  ]

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Tools" title="Setup your car with precision" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => (
            <Link
              key={tool.href}
              href={tool.soon ? '/tools' : tool.href}
              className="group relative rounded-lg border p-6 transition-colors hover:border-accent"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              {tool.soon && (
                <span
                  className="absolute right-4 top-4 rounded-full px-2 py-0.5 font-mono text-xs"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                >
                  soon
                </span>
              )}
              <h3 className="mb-2 font-semibold group-hover:text-accent" style={{ color: 'var(--foreground)' }}>
                {tool.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/tools" className="text-sm text-accent hover:text-accent-700 transition-colors">
            All Tools →
          </Link>
        </div>
      </div>
    </section>
  )
}

function LatestEpisodeSection() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Podcast" title="Latest Episode" />
        <div
          className="mt-10 flex min-h-48 items-center justify-center rounded-lg border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            — YouTube episodes coming soon —
          </p>
        </div>
      </div>
    </section>
  )
}

function InstagramSection() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Instagram" title="@hotdogracingus" />
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md"
              style={{ background: 'var(--surface-2)' }}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <a
            href="https://www.instagram.com/hotdogracingus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:text-accent-700 transition-colors"
          >
            Follow on Instagram →
          </a>
        </div>
      </div>
    </section>
  )
}

function SponsorsSection() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Partners" title="Sponsors" />
        <div
          className="mt-10 flex min-h-24 items-center justify-center rounded-lg border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            — Sponsors coming soon —
          </p>
        </div>
      </div>
    </section>
  )
}

function LatestPostsSection() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Blog" title="Latest Posts" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border p-6"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="mb-3 h-3 w-20 rounded-full" style={{ background: 'var(--surface-2)' }} />
              <div className="mb-2 h-5 w-full rounded-full" style={{ background: 'var(--surface-2)' }} />
              <div className="h-4 w-4/5 rounded-full" style={{ background: 'var(--surface-2)' }} />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/blog" className="text-sm text-accent hover:text-accent-700 transition-colors">
            All Posts →
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="mb-1 font-mono text-xs tracking-[0.25em] text-accent uppercase">{label}</p>
      <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
        {title}
      </h2>
    </div>
  )
}
