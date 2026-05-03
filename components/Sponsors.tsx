import { partners } from '@/lib/partners/config'

export default function Sponsors() {
  const sponsors = partners.filter(p => p.type === 'sponsor')
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {sponsors.map(sponsor => (
        <div
          key={sponsor.name}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border p-6"
          style={{ borderColor: '#3a3a3a', background: '#2e2e2e' }}
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
              style={{ background: '#1a1a1a', color: '#8a8a8a' }}
            >
              {sponsor.name.charAt(0)}
            </div>
          )}
          <span className="text-center text-sm font-medium" style={{ color: '#F5F5F5' }}>
            {sponsor.name}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 font-mono text-xs">
            <a
              href={sponsor.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {sponsor.handle}
            </a>
            {sponsor.websiteUrl && (
              <a
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#8a8a8a' }}
              >
                Website ↗
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
