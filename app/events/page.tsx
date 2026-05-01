import type { Metadata } from 'next'
import { events, type Event } from '@/lib/events/config'
import { partitionEvents } from '@/lib/events/partition'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past RC drift events — competitions, matsuri, and series rounds.',
  openGraph: {
    title: 'Events | Hotdog Racing',
    description: 'Upcoming and past RC drift events — competitions, matsuri, and series rounds.',
    url: 'https://hotdog-racing.com/events',
  },
}

export default function EventsPage() {
  const { upcoming, past } = partitionEvents(events, new Date())

  return (
    <>
      <HeroSection />
      <UpcomingSection events={upcoming} />
      <PastSection events={past} />
    </>
  )
}

function HeroSection() {
  return (
    <section className="py-20 px-6 bg-near-black">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent uppercase">Schedule</p>
        <h1 className="text-4xl font-bold tracking-tight text-near-white sm:text-5xl">Events</h1>
        <p className="mt-4 text-base leading-relaxed text-near-white/70">
          Competitions, matsuri, and series rounds — where you&apos;ll find me on the track.
        </p>
      </div>
    </section>
  )
}

function UpcomingSection({ events }: { events: Event[] }) {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <SectionLabel>Upcoming</SectionLabel>
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          What&apos;s next
        </h2>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => <EventCard key={i} event={event} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function PastSection({ events }: { events: Event[] }) {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
      <div className="mx-auto max-w-3xl">
        <SectionLabel>Archive</SectionLabel>
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--foreground)' }}>
          Past events
        </h2>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No past events yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => <EventCard key={i} event={event} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function EventCard({ event }: { event: Event }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-lg border p-5 sm:flex-row sm:items-start sm:gap-6"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
    >
      <div className="shrink-0 font-mono text-xs font-semibold text-accent sm:w-28 sm:pt-0.5">
        {formatDate(event.date)}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
          {event.name}
        </div>
        <div className="font-mono text-xs text-accent mt-0.5">{event.series}</div>
        <div className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
          {event.location}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs tracking-[0.25em] text-accent uppercase">{children}</p>
  )
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
