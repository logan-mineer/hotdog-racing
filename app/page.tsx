import Link from 'next/link'
import Sponsors from '@/components/Sponsors'
import LatestEpisode from '@/components/LatestEpisode'
import { EscBlueprint, GyroBlueprint, SuspensionBlueprint } from '@/components/Blueprints'
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
          <EscBlueprint className="h-auto w-[85%]" />
        </div>
        <div className="flex items-center justify-center">
          <SuspensionBlueprint className="h-auto w-[85%]" />
        </div>
        <div className="hidden items-center justify-center md:flex">
          <GyroBlueprint className="h-auto w-[85%]" />
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

function FeaturedToolsSection() {
  const tools = [
    {
      name: 'Suspension Alignment',
      description: 'Adjust turnbuckles and visualize toe, camber, caster, and Ackermann in real time.',
      href: '/tools/suspension',
      Blueprint: SuspensionBlueprint,
    },
    {
      name: 'ESC Settings',
      description: 'See how boost, turbo, and timing parameters shape your power delivery curve.',
      href: '/tools/esc',
      Blueprint: EscBlueprint,
    },
    {
      name: 'Servo & Gyro',
      description: 'Visualize gyro gain and servo endpoint effects on steering response.',
      href: '/tools/gyro',
      Blueprint: GyroBlueprint,
      soon: true,
    },
  ]

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="Tools" title="Setup your car with precision" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ Blueprint, ...tool }) => (
            <Link
              key={tool.href}
              href={tool.soon ? '/tools' : tool.href}
              className="group relative rounded-lg border p-6 transition-colors hover:border-accent"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              {tool.soon && (
                <span
                  className="absolute right-4 top-4 z-10 rounded-full px-2 py-0.5 font-mono text-xs"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                >
                  soon
                </span>
              )}
              <div
                className="mb-5 flex h-28 w-full items-center justify-center overflow-hidden rounded-md"
                style={{ background: 'var(--surface-2)' }}
              >
                <Blueprint className="h-[85%] w-auto" />
              </div>
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
