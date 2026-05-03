import type { Metadata } from 'next'
import Image from 'next/image'
import { resumeEntries, buildSpecs } from '@/lib/about/config'
import { partners } from '@/lib/partners/config'

export const metadata: Metadata = {
  title: 'About',
  description: 'Logan Mineer — RC drift driver, community organizer, and the person behind Hotdog Racing.',
  openGraph: {
    title: 'About | Hotdog Racing',
    description: 'Logan Mineer — RC drift driver, community organizer, and the person behind Hotdog Racing.',
    url: 'https://hotdog-racing.com/about',
  },
}

export default function AboutPage() {
  return (
    <>
      <IntroSection />
      <BackgroundSection />
      <DriftResumeSection />
      <CurrentBuildSection />
      <PartnersSection />
    </>
  )
}

function IntroSection() {
  return (
    <section className="py-20 px-6 bg-near-black">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent uppercase">About</p>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
          <Image
            src="/logan.png"
            alt="Logan Mineer"
            width={140}
            height={140}
            className="rounded-full shrink-0 self-start"
            priority
          />
          <div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-near-white sm:text-5xl">
              Logan Mineer
            </h1>
            <p className="text-base leading-relaxed text-near-white/70 mb-3">
              RC drift driver and community organizer based in Portland, Oregon. Member of Team D-Style
              and Team PDX, competing in the Super Drift Championship Oregon region with an eye on
              the World Finals.
            </p>
            <p className="text-base leading-relaxed text-near-white/70 mb-3">
              My favorite part of this sport has always been the people — the friendships, the late nights,
              the shared obsession over setups that probably don&apos;t matter as much as we think they do.
              That said, I&apos;m always chasing performance.
            </p>
            <p className="text-base leading-relaxed text-near-white/70">
              Outside of competing, I co-host the RC Drift Talk podcast — a weekly live stream on YouTube
              covering events, tuning, and everything happening in the RC drift world.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function BackgroundSection() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <SectionLabel>Background</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          How it started
        </h2>
        <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
          <p>
            It goes back to Gran Turismo 2. Rally was more fun than grip — something about loose surface
            driving and sliding felt right in a way that clean laps never did. NFS: Underground put a name
            to it, and from there I followed drifting through whatever games would let me do it: Forza, NFS,
            eventually Assetto Corsa and a proper sim rig. I came across RC drift in 2009, but without a dedicated
            track nearby there wasn&apos;t much point in building a car. I filed it away and moved on.
          </p>
          <p>
            That changed in late 2022 when some space opened up at my day job — CravenSpeed, a Portland
            automotive aftermarket company — and a few coworkers wanted to build cars. Around the same
            time, PDX RC Underground opened a dedicated drift space nearby. I was there three days a week
            from the start.
          </p>
          <p>
            In February 2024, a group of us formed Team PDX. We were involved in designing and installing
            the track layouts and organizing the events at PDX RC Underground. When we found out the venue
            would be closing in early 2025, the team helped our captain open Drift-PDX — a new dedicated facility we
            launched on March 1, 2025. It&apos;s been our home track ever since.
          </p>
          <p>
            One of the things I&apos;m most proud of is co-creating Drift to Death, our annual matsuri
            at Drift-PDX. The concept is simple: the track stays live from Friday morning straight through
            Sunday, no schedule, no windows. When the track never closes, you can actually set the remote
            down, share tuning notes, and hang out without missing your only session of the day. Whether
            it&apos;s 2:00 PM or 2:00 AM, the session doesn&apos;t stop.
          </p>
          <p>
            The tools on this site came out of how I learn. I&apos;m a visual person — I needed to
            actually see what suspension geometry or ESC timing changes were doing, not just read a number
            and hope it made sense. Building these tools is how I get better, and sharing them is
            how I try to help everyone else do the same.
          </p>
        </div>
      </div>
    </section>
  )
}

function DriftResumeSection() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-3xl">
        <SectionLabel>Competition</SectionLabel>
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          Drift resume
        </h2>
        <div className="space-y-3">
          {resumeEntries.map((entry, i) => (
            <div
              key={i}
              className="flex gap-5 rounded-lg border p-4 sm:p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <div className="shrink-0 w-10 font-mono text-xs font-semibold text-accent pt-0.5">
                {entry.year}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                  {entry.series}
                </div>
                <div className="text-sm font-semibold text-accent mt-0.5">{entry.result}</div>
                {entry.detail && (
                  <div className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {entry.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CurrentBuildSection() {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <SectionLabel>Chassis</SectionLabel>
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          Current build
        </h2>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {buildSpecs.map((row, i) => (
            <div
              key={row.label}
              className="flex justify-between gap-4 px-5 py-3"
              style={{
                background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                borderBottom: i < buildSpecs.length - 1 ? '1px solid var(--border)' : undefined,
              }}
            >
              <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: 'var(--muted)' }}>
                {row.label}
              </span>
              <span className="text-sm text-right" style={{ color: 'var(--foreground)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnersSection() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-3xl">
        <SectionLabel>Partners</SectionLabel>
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          Sponsors & affiliations
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {partners.map(p => (
            <div
              key={p.name}
              className="flex items-center gap-4 rounded-lg border px-4 py-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              {p.logoUrl ? (
                <div
                  className="flex h-12 w-20 shrink-0 items-center justify-center rounded"
                  style={{ background: '#2e2e2e' }}
                >
                  <img
                    src={p.logoUrl}
                    alt={p.name}
                    className="h-8 w-auto object-contain"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                  {p.name}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs">
                  <a
                    href={p.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {p.handle}
                  </a>
                  {p.websiteUrl && (
                    <a
                      href={p.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: 'var(--muted)' }}
                    >
                      Website ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs tracking-[0.25em] text-accent uppercase">
      {children}
    </p>
  )
}
