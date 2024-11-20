'use client'

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p>By accessing and using MathSketch, you agree to be bound by these Terms of Service.</p>
            </section>

            {/* Rest of the terms content */}
            <section>
              <h2 className="text-xl font-semibold mb-2">2. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must maintain accurate account information</li>
                <li>You are responsible for maintaining account security</li>
                <li>Multiple sessions are monitored for security</li>
                <li>We reserve the right to terminate accounts for violations</li>
              </ul>
            </section>

            {/* ... other sections ... */}

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
              <p>For questions about these terms, contact:</p>
              <p className="mt-2">support@mathsketch.app</p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 