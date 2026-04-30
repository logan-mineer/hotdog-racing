import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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

export const metadata: Metadata = {
  title: {
    default: 'Hotdog Racing',
    template: '%s | Hotdog Racing',
  },
  description: 'Setup tools and content for RC drift.',
  metadataBase: new URL('https://hotdog-racing.com'),
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
