import { useEmailVerification } from '@/hooks/useEmailVerification';
import { VerificationDialog } from './ui/verification-dialog';
import { useState } from 'react';

interface RequireVerificationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireVerification({ children, fallback }: RequireVerificationProps) {
  const { isVerified, isLoading } = useEmailVerification();
  const [showDialog, setShowDialog] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!isVerified) {
    return (
      <>
        <div onClick={() => setShowDialog(true)}>
          {fallback || (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                Please verify your email to access this feature.{' '}
                <button className="text-yellow-600 underline" onClick={() => setShowDialog(true)}>
                  Verify now
                </button>
              </p>
            </div>
          )}
        </div>
        <VerificationDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
      </>
    );
  }

  return <>{children}</>;
} 