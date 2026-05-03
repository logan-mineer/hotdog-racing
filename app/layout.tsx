import type { Metadata } from 'next'
import { Calistoga, Geist, Geist_Mono, Yellowtail } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const calistoga = Calistoga({
  variable: '--font-calistoga',
  weight: '400',
  subsets: ['latin'],
})

const yellowtail = Yellowtail({
  variable: '--font-yellowtail',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Hotdog Racing',
    template: '%s | Hotdog Racing',
  },
  description: 'Setup tools and content for RC drift.',
  metadataBase: new URL('https://hotdog-racing.com'),
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Hotdog Racing',
    description: 'Setup tools and content for RC drift.',
    url: 'https://hotdog-racing.com',
    siteName: 'Hotdog Racing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotdog Racing',
    description: 'Setup tools and content for RC drift.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${calistoga.variable} ${yellowtail.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
