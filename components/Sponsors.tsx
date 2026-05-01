import { sponsors } from '@/lib/sponsors/config'

export default function Sponsors() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {sponsors.map(sponsor => (
        <a
          key={sponsor.name}
          href={sponsor.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-3 rounded-lg border p-6 transition-colors hover:border-accent"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          {sponsor.logoUrl ? (
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded font-mono text-lg font-bold"
              style={{ background: 'var(--surface)', color: 'var(--muted)' }}
            >
              {sponsor.name.charAt(0)}
            </div>
          )}
          <span className="text-center text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {sponsor.name}
          </span>
        </a>
      ))}
    </div>
  )
}
