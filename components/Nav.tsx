'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const tools = [
  { label: 'Suspension Alignment', href: '/tools/suspension' },
  { label: 'ESC Settings', href: '/tools/esc' },
  { label: 'Servo & Gyro', href: '/tools/gyro' },
]

export default function Nav() {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(stored)
    }
  }, [])

  function toggleTheme() {
    const root = document.documentElement
    const isDark =
      root.classList.contains('dark') ||
      (!root.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const next = isDark ? 'light' : 'dark'
    root.classList.remove('dark', 'light')
    root.classList.add(next)
    localStorage.setItem('theme', next)
  }

  return (
    <>
      {/* Backdrop to close dropdown — rendered outside nav so it covers full viewport */}
      {toolsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setToolsOpen(false)}
        />
      )}

      <nav className="sticky top-0 z-50 w-full border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            HOTDOG<span className="text-accent">RACING</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/">Home</NavLink>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsOpen(o => !o)}
                className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium transition-colors hover:text-accent"
                style={{ color: 'var(--muted)', touchAction: 'manipulation' }}
              >
                Tools
                <ChevronIcon open={toolsOpen} />
              </button>
              {toolsOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1 w-52 rounded-md border py-1 shadow-lg"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  {tools.map(t => (
                    <Link
                      key={t.href}
                      href={t.href}
                      onClick={() => setToolsOpen(false)}
                      className="block px-4 py-2 text-sm transition-colors hover:text-accent"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {t.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                  <Link
                    href="/tools"
                    onClick={() => setToolsOpen(false)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-accent"
                  >
                    All Tools →
                  </Link>
                </div>
              )}
            </div>

            <NavLink href="/events">Events</NavLink>
            <NavLink href="/podcast">Podcast</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded p-2 transition-colors hover:text-accent"
              style={{ color: 'var(--muted)', touchAction: 'manipulation' }}
            >
              <span className="theme-icon-moon"><MoonIcon /></span>
              <span className="theme-icon-sun"><SunIcon /></span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              className="rounded p-2 transition-colors hover:text-accent md:hidden"
              style={{ color: 'var(--muted)', touchAction: 'manipulation' }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t md:hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="flex flex-col px-4 py-2">
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <div className="py-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tools</div>
              <div className="pl-3">
                {tools.map(t => (
                  <MobileNavLink key={t.href} href={t.href} onClick={() => setMobileOpen(false)}>
                    {t.label}
                  </MobileNavLink>
                ))}
                <MobileNavLink href="/tools" onClick={() => setMobileOpen(false)}>
                  <span className="text-accent">All Tools →</span>
                </MobileNavLink>
              </div>
              <MobileNavLink href="/events" onClick={() => setMobileOpen(false)}>Events</MobileNavLink>
              <MobileNavLink href="/podcast" onClick={() => setMobileOpen(false)}>Podcast</MobileNavLink>
              <MobileNavLink href="/blog" onClick={() => setMobileOpen(false)}>Blog</MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-2 text-sm font-medium transition-colors hover:text-accent"
      style={{ color: 'var(--muted)' }}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-sm font-medium transition-colors hover:text-accent"
      style={{ color: 'var(--foreground)' }}
    >
      {children}
    </Link>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      style={{ pointerEvents: 'none' }}
      className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ pointerEvents: 'none' }}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ pointerEvents: 'none' }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
