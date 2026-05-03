import Link from 'next/link'
import Sponsors from '@/components/Sponsors'
import LatestEpisode from '@/components/LatestEpisode'
import { fetchEpisodes, type Episode } from '@/lib/youtube/fetch'
import { getAllPosts } from '@/lib/blog/posts'
import type { PostMeta } from '@/lib/blog/types'

export default async function Home() {
  const episodes = await fetchEpisodes()
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <>
      <HeroSection />
      <FeaturedToolsSection />
      <SocialSection episode={episodes[0]} />
      <SponsorsSection />
      <LatestPostsSection posts={latestPosts} />
    </>
  )
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-near-black text-center">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 overflow-hidden"
        style={{ perspective: '800px' }}
      >
        <div
          className="hero-grid-floor absolute left-1/2 top-0 h-[200%] w-[300%] origin-top"
          style={{
            transform: 'translateX(-50%) rotateX(60deg)',
            backgroundImage:
              'linear-gradient(to right, rgba(255, 0, 32, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 0, 32, 0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'hero-grid-scroll 1.6s linear infinite',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)',
          }}
        >
          <div
            className="hero-road absolute"
            style={{
              left: 'calc(50% - 150px)',
              top: '-600px',
              width: '300px',
              height: '1800px',
              animation: 'hero-road-scroll 16s linear infinite',
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 300 1800"
              aria-hidden="true"
              style={{ filter: 'drop-shadow(0 0 4px rgba(255, 0, 32, 0.6))' }}
            >
              <defs>
                <path
                  id="hero-touge"
                  d="M 150 600 C 150 510, 220 520, 220 480 C 220 440, 70 440, 70 400 C 70 360, 220 360, 220 320 C 220 280, 70 280, 70 240 C 70 200, 180 190, 180 150 C 180 110, 150 80, 150 0 M 150 1200 C 150 1110, 220 1120, 220 1080 C 220 1040, 70 1040, 70 1000 C 70 960, 220 960, 220 920 C 220 880, 70 880, 70 840 C 70 800, 180 790, 180 750 C 180 710, 150 680, 150 600 M 150 1800 C 150 1710, 220 1720, 220 1680 C 220 1640, 70 1640, 70 1600 C 70 1560, 220 1560, 220 1520 C 220 1480, 70 1480, 70 1440 C 70 1400, 180 1390, 180 1350 C 180 1310, 150 1280, 150 1200"
                  fill="none"
                />
              </defs>
              <use
                href="#hero-touge"
                x="-45"
                stroke="rgba(255, 0, 32, 0.8)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <use
                href="#hero-touge"
                x="45"
                stroke="rgba(255, 0, 32, 0.8)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 10%, rgba(255, 0, 32, 0.6) 50%, transparent 90%)',
          boxShadow: '0 0 40px 4px rgba(255, 0, 32, 0.25)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, #0D0D0D 100%)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[5%] z-10 grid grid-cols-1 px-6 md:grid-cols-3"
        style={{
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      >
        <div className="hidden items-center justify-center md:flex">
          <EscBlueprint />
        </div>
        <div className="flex items-center justify-center">
          <SuspensionBlueprint />
        </div>
        <div className="hidden items-center justify-center md:flex">
          <GyroBlueprint />
        </div>
      </div>
      <div className="relative z-10 px-6">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent-500 uppercase">RC Drift</p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-near-white sm:text-7xl">Hotdog Racing</h1>
        <p className="mb-8 text-lg text-near-white/60 sm:text-xl">Setup tools and content for RC drift.</p>
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

const BLUEPRINT_PRIMARY = 'rgba(255, 0, 32, 0.85)'
const BLUEPRINT_SECONDARY = 'rgba(255, 0, 32, 0.55)'
const BLUEPRINT_DASH = 'rgba(255, 0, 32, 0.25)'
const BLUEPRINT_LABEL = 'rgba(255, 0, 32, 0.45)'
const BLUEPRINT_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

function SuspensionBlueprint() {
  return (
    <svg viewBox="0 0 280 200" className="h-auto w-[85%]" aria-hidden="true">
      <g>
        <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
          TOP
        </text>
        <line x1="20" y1="50" x2="260" y2="50" stroke={BLUEPRINT_DASH} strokeDasharray="3 3" />
        <line x1="140" y1="18" x2="140" y2="82" stroke="rgba(255, 0, 32, 0.18)" strokeDasharray="2 2" />
        <rect x="80" y="30" width="120" height="40" rx="3" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <rect x="40" y="20" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        <rect x="40" y="68" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        <g transform="rotate(-4 224 26)">
          <rect x="208" y="20" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        </g>
        <g transform="rotate(4 224 74)">
          <rect x="208" y="68" width="32" height="12" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.5" fill="none" />
        </g>
        <line x1="224" y1="32" x2="224" y2="68" stroke={BLUEPRINT_DASH} />
      </g>
      <g transform="translate(0, 110)">
        <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
          FRONT
        </text>
        <line x1="20" y1="78" x2="260" y2="78" stroke={BLUEPRINT_SECONDARY} />
        <line x1="60" y1="28" x2="60" y2="78" stroke="rgba(255, 0, 32, 0.18)" strokeDasharray="2 2" />
        <line x1="220" y1="28" x2="220" y2="78" stroke="rgba(255, 0, 32, 0.18)" strokeDasharray="2 2" />
        <line x1="65" y1="28" x2="55" y2="76" stroke={BLUEPRINT_PRIMARY} strokeWidth="2" />
        <ellipse cx="55" cy="76" rx="7" ry="2" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <line x1="215" y1="28" x2="225" y2="76" stroke={BLUEPRINT_PRIMARY} strokeWidth="2" />
        <ellipse cx="225" cy="76" rx="7" ry="2" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <rect x="115" y="36" width="50" height="30" stroke={BLUEPRINT_SECONDARY} fill="none" />
        <line x1="115" y1="40" x2="65" y2="32" stroke={BLUEPRINT_SECONDARY} />
        <line x1="165" y1="40" x2="215" y2="32" stroke={BLUEPRINT_SECONDARY} />
        <line x1="115" y1="62" x2="55" y2="72" stroke={BLUEPRINT_SECONDARY} />
        <line x1="165" y1="62" x2="225" y2="72" stroke={BLUEPRINT_SECONDARY} />
        <circle cx="115" cy="40" r="1.5" fill={BLUEPRINT_PRIMARY} />
        <circle cx="165" cy="40" r="1.5" fill={BLUEPRINT_PRIMARY} />
        <circle cx="115" cy="62" r="1.5" fill={BLUEPRINT_PRIMARY} />
        <circle cx="165" cy="62" r="1.5" fill={BLUEPRINT_PRIMARY} />
      </g>
    </svg>
  )
}

function EscBlueprint() {
  return (
    <svg viewBox="0 0 160 110" className="h-auto w-[85%]" aria-hidden="true">
      <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
        ESC
      </text>
      <line x1="18" y1="86" x2="148" y2="86" stroke={BLUEPRINT_SECONDARY} />
      <line x1="18" y1="20" x2="18" y2="86" stroke={BLUEPRINT_SECONDARY} />
      <line x1="18" y1="86" x2="18" y2="89" stroke={BLUEPRINT_SECONDARY} />
      <line x1="83" y1="86" x2="83" y2="89" stroke={BLUEPRINT_DASH} />
      <line x1="148" y1="86" x2="148" y2="89" stroke={BLUEPRINT_SECONDARY} />
      <line x1="18" y1="86" x2="148" y2="22" stroke={BLUEPRINT_DASH} strokeDasharray="2 2" />
      <path
        d="M 18 86 C 35 82, 50 76, 65 65 C 75 55, 80 38, 95 30 C 110 26, 125 22, 148 18"
        stroke={BLUEPRINT_PRIMARY}
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="83" cy="42" r="1.8" fill={BLUEPRINT_PRIMARY} />
      <text x="88" y="40" fontSize="5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="0.5">
        BOOST
      </text>
      <text x="22" y="100" fontSize="5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="1">
        THROTTLE
      </text>
    </svg>
  )
}

function GyroBlueprint() {
  return (
    <svg viewBox="0 0 160 110" className="h-auto w-[85%]" aria-hidden="true">
      <text x="8" y="12" fontSize="6.5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="2">
        GYRO
      </text>
      <path d="M 30 86 A 50 50 0 0 1 130 86" stroke={BLUEPRINT_DASH} strokeDasharray="2 3" fill="none" />
      <line x1="30" y1="86" x2="30" y2="92" stroke={BLUEPRINT_SECONDARY} />
      <line x1="130" y1="86" x2="130" y2="92" stroke={BLUEPRINT_SECONDARY} />
      <line x1="80" y1="86" x2="80" y2="38" stroke={BLUEPRINT_DASH} strokeDasharray="2 2" />
      <line x1="80" y1="86" x2="115" y2="51" stroke={BLUEPRINT_PRIMARY} strokeWidth="2" />
      <g transform="rotate(-45 115 51)">
        <rect x="108" y="41" width="14" height="20" stroke={BLUEPRINT_PRIMARY} strokeWidth="1.4" fill="none" />
      </g>
      <path d="M 80 70 A 16 16 0 0 1 91 78" stroke={BLUEPRINT_SECONDARY} fill="none" />
      <circle cx="80" cy="86" r="2.5" fill={BLUEPRINT_PRIMARY} />
      <text x="22" y="100" fontSize="5" fontFamily={BLUEPRINT_FONT} fill={BLUEPRINT_LABEL} letterSpacing="1">
        STEER ANGLE
      </text>
    </svg>
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
          <Link href="/tools" className="text-sm text-accent transition-colors hover:text-accent-700">
            All Tools →
          </Link>
        </div>
      </div>
    </section>
  )
}

function SocialSection({ episode }: { episode: Episode }) {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Follow Along" title="Latest & Live" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <LatestEpisode episode={episode} />
          <InstagramCard />
        </div>
      </div>
    </section>
  )
}

function InstagramCard() {
  return (
    <a
      href="https://www.instagram.com/hotdogracingus"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center justify-center gap-5 rounded-lg border p-8 text-center transition-colors hover:border-accent"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/instagram-avatar.jpg"
        alt="@hotdogracingus"
        className="h-20 w-20 rounded-full object-cover"
      />
      <div>
        <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>@hotdogracingus</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Cool pics, rad clips, and comp runs.
        </p>
      </div>
      <span className="text-sm font-medium text-accent transition-colors group-hover:text-accent-700">
        Follow on Instagram →
      </span>
    </a>
  )
}

function SponsorsSection() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Partners" title="Sponsors" />
        <Sponsors />
      </div>
    </section>
  )
}

function LatestPostsSection({ posts }: { posts: PostMeta[] }) {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Blog" title="Latest Posts" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-lg border p-6 transition-colors hover:border-accent"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <p className="mb-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <h3 className="mb-2 font-semibold leading-snug group-hover:text-accent" style={{ color: 'var(--foreground)' }}>
                {post.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/blog" className="text-sm text-accent transition-colors hover:text-accent-700">
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
      <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>{title}</h2>
    </div>
  )
}
