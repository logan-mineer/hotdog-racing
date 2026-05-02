import type { Metadata } from 'next'
import EscTool from '@/components/esc/EscTool'

export const metadata: Metadata = {
  title: 'ESC Settings Visualizer | Hotdog Racing',
  description: 'Visualize how motor timing, boost, and turbo settings affect your ESC power delivery curve. Built for RC drift.',
  openGraph: {
    title: 'ESC Settings Visualizer | Hotdog Racing',
    description: 'Visualize how motor timing, boost, and turbo settings affect your ESC power delivery curve.',
    url: 'https://hotdog-racing.com/tools/esc',
  },
}

export default function EscPage() {
  return <EscTool />
}
