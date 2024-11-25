'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, createUserWithEmailAndPassword } from "firebase/auth";
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

const Signup = () => {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Show verification dialog
      setShowVerificationDialog(true);
      
      // ... rest of your signup code ...
    } catch (error) {
      // ... error handling ...
    }
  };

  return (
    <>
      {/* Your existing signup form JSX */}
      <VerificationDialog 
        isOpen={showVerificationDialog} 
        onClose={() => setShowVerificationDialog(false)} 
      />
    </>
  );
};

export default Signup; 