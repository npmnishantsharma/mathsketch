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
        url: 'https://res.cloudinary.com/dhvcqp8zp/image/upload/f_auto,q_auto/v1/mathsketch_assets/png36d4dtuipgh61eaqb', // Add an OG image to your public folder
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
    images: ['https://res.cloudinary.com/dhvcqp8zp/image/upload/f_auto,q_auto/v1/mathsketch_assets/png36d4dtuipgh61eaqb'], // Same image as OG
    creator: '@_Nishant_Apps', // Update with your Twitter handle
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
