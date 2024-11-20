import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-6 pr-4">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p>By accessing and using MathSketch, you agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must maintain accurate account information</li>
                <li>You are responsible for maintaining account security</li>
                <li>Multiple sessions are monitored for security</li>
                <li>We reserve the right to terminate accounts for violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the service for any illegal purpose</li>
                <li>Share account credentials</li>
                <li>Attempt to circumvent security measures</li>
                <li>Upload harmful content or malware</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>MathSketch retains all rights to the service</li>
                <li>You retain rights to your content</li>
                <li>You grant us license to use your content for service improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Service Availability</h2>
              <p>We strive to provide uninterrupted service but:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>We do not guarantee 100% uptime</li>
                <li>We may modify or discontinue features</li>
                <li>We may perform maintenance as needed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
              <p>MathSketch is provided "as is" without warranties of any kind.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
              <p>For questions about these terms, contact:</p>
              <p className="mt-2">support@mathsketch.app</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfService; 