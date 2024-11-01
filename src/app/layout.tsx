import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MathSketch',
  description: 'A math sketching app for solving math problems',
  openGraph: {
    title: 'MathSketch',
    description: 'A math sketching app for solving math problems',
    url: 'https://mathsketch.nishantapps.in', // Update this with your actual URL
    siteName: 'MathSketch',
    images: [
      {
        url: '/og-image.jpg', // Add an OG image to your public folder
        width: 1200,
        height: 630,
        alt: 'MathSketch - Math Solvig App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MathSketch',
    description: 'A math sketching app for solving math problems',
    images: ['/og-image.jpg'], // Same image as OG
    creator: '@nishantapps4', // Update with your Twitter handle
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}