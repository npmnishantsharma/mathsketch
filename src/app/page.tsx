"use client"
import React from 'react';
import Link from 'next/link';
import DrawingCanvas from './pages/DrawingCanvas';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  return (
    <>
      <DrawingCanvas />
      <Analytics />
      <SpeedInsights />
    </>
  );
}