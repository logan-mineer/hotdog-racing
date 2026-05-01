'use client'

import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      localStorage.getItem(DISMISSED_KEY) === '1' ||
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg border p-4 shadow-lg sm:left-auto sm:right-4 sm:w-80"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Install Hotdog Racing
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Add to home screen for offline use
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={dismiss}
          className="text-xs px-3 py-1.5 rounded-md transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          Not now
        </button>
        <button
          onClick={install}
          className="text-xs px-3 py-1.5 rounded-md font-semibold text-white transition-colors"
          style={{ background: '#FF0020' }}
        >
          Install
        </button>
      </div>
    </div>
  )
}
