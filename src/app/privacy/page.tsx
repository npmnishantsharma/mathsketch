'use client'

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Account information (email, name)</li>
                <li>User-generated content (drawings, equations)</li>
                <li>Session information</li>
                <li>Device information</li>
              </ul>
            </section>

            {/* Rest of the privacy policy content */}
            <section>
              <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To monitor and analyze usage patterns</li>
                <li>To communicate with you about updates</li>
              </ul>
            </section>

            {/* ... other sections ... */}

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2">support@mathsketch.app</p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 