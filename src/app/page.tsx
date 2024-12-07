"use client"
import React from 'react';
import Link from 'next/link';
import IntroPage from './pages/Home';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  return (
    <>
      <IntroPage />
      <Analytics />
      <SpeedInsights />
    </>
  );
}