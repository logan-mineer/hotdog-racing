import Wordmark from '@/components/Wordmark'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t py-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <span className="text-base" style={{ color: 'var(--muted)' }}>
          © {year} <Wordmark />
        </span>
        <a
          href="https://www.instagram.com/hotdogracingus"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm transition-colors hover:text-accent"
          style={{ color: 'var(--muted)' }}
        >
          <InstagramIcon />
          @hotdogracingus
        </a>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
