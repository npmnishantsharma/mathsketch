'use client'

import { useEmailVerification } from '@/hooks/useEmailVerification';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function VerificationBar() {
  const { isVerified, isLoading } = useEmailVerification();
  
  if (isLoading || isVerified) return null;

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <p className="text-yellow-500 text-sm">
          Please verify your email to access all features
        </p>
        <Button
          onClick={async () => {
            const user = auth.currentUser;
            if (!user) return;
            
            try {
              await sendEmailVerification(user);
              toast.success('Verification email sent! Please check your inbox.');
            } catch (error) {
              toast.error('Failed to send verification email. Please try again.');
            }
          }}
          variant="outline"
          size="sm"
          className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10"
        >
          Verify Email
        </Button>
      </div>
    </div>
  );
} 