import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "sonner";

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationDialog({ isOpen, onClose }: VerificationDialogProps) {
  const [isSending, setIsSending] = React.useState(false);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    
    setIsSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            Please verify your email address to access all features. Check your inbox for the verification link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or click below to resend.
          </p>
          <Button 
            onClick={handleResendVerification}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 