import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon | Hotdog Racing',
  description: 'RC drift setup tools and content. Launching soon.',
}

export default function ComingSoonPage() {
  return (
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center bg-near-black px-6 text-center">
      <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent uppercase">
        Coming Soon
      </p>
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-near-white sm:text-7xl">
        HOTDOG<span className="text-accent">RACING</span>
      </h1>
      <p className="mb-10 max-w-sm text-base text-near-white/60">
        Setup tools and content for RC drift. Something worth waiting for.
      </p>
      <a
        href="https://www.instagram.com/hotdogracingus"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-accent transition-colors hover:text-accent-700"
      >
        @hotdogracingus →
      </a>
    </div>
  )
}
