import type { Metadata } from 'next'
import SuspensionTool from '@/components/suspension/SuspensionTool'

export const metadata: Metadata = {
  title: 'Suspension Alignment Visualizer | Hotdog Racing',
  description: 'Tune the parts you actually adjust on the car — lower arm length, caster spacers, hex thickness — and see camber, toe, caster, and KPI update in real time. Built for RC drift.',
  openGraph: {
    title: 'Suspension Alignment Visualizer | Hotdog Racing',
    description: 'Tune the parts you actually adjust on the car and watch the alignment values update in real time.',
    url: 'https://hotdog-racing.com/tools/suspension',
  },
}

export default function SuspensionPage() {
  return <SuspensionTool />
}
