import type { Episode } from '@/lib/youtube/fetch'

export default function LatestEpisode({ episode }: { episode: Episode }) {
  return (
    <a
      href={episode.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-accent sm:flex-row"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={episode.thumbnailUrl}
        alt={episode.title}
        className="aspect-video w-full object-cover sm:w-72 sm:shrink-0"
      />
      <div className="flex flex-col justify-center p-5">
        <p className="mb-2 font-mono text-xs" style={{ color: 'var(--muted)' }}>
          {new Date(episode.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <h3
          className="text-base font-semibold leading-snug group-hover:text-accent"
          style={{ color: 'var(--foreground)' }}
        >
          {episode.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'var(--muted)' }}>
          {episode.description}
        </p>
      </div>
    </a>
  )
}
