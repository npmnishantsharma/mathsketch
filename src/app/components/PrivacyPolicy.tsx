import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
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

            <section>
              <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To monitor and analyze usage patterns</li>
                <li>To communicate with you about updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Data Security</h2>
              <p>We implement appropriate security measures to protect your information, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encryption of data in transit</li>
                <li>Secure session management</li>
                <li>Regular security audits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Service providers who assist in our operations</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of communications</li>
                <li>Update your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2">support@mathsketch.app</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy; 