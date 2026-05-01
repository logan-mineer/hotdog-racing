import type { Metadata } from 'next'
import { fetchEpisodes } from '@/lib/youtube/fetch'

export const metadata: Metadata = {
  title: 'Podcast',
  description: 'RC Drift Talk — weekly live stream covering events, tuning, and everything in the RC drift world.',
  openGraph: {
    title: 'Podcast | Hotdog Racing',
    description: 'RC Drift Talk — weekly live stream covering events, tuning, and everything in the RC drift world.',
    url: 'https://hotdog-racing.com/podcast',
  },
}

export default async function PodcastPage() {
  const episodes = await fetchEpisodes()

  return (
    <div className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <p className="mb-1 font-mono text-xs tracking-[0.25em] text-accent uppercase">Podcast</p>
        <h1 className="mb-10 text-3xl font-bold sm:text-4xl" style={{ color: 'var(--foreground)' }}>
          RC Drift Talk
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map(episode => (
            <a
              key={episode.id}
              href={episode.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-lg border transition-colors hover:border-accent"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={episode.thumbnailUrl}
                alt={episode.title}
                className="aspect-video w-full object-cover"
              />
              <div className="p-4">
                <p className="mb-1 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(episode.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <h2
                  className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-accent"
                  style={{ color: 'var(--foreground)' }}
                >
                  {episode.title}
                </h2>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
