"use client"
import React from 'react';
import Link from 'next/link';
import DrawingCanvas from './pages/DrawingCanvas';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
export default function Home() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Your code that uses window goes here
    }
  }, []);

  return (
    <main className="p-4">
      <nav className="mb-4">
        <Link href="/quiz" className="text-blue-500 hover:text-blue-700">
          Go to Quiz
        </Link>
      </nav>
      <DrawingCanvas/>
      <Analytics />
      <SpeedInsights />
    </main>
  );
}