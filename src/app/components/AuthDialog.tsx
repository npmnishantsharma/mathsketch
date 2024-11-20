import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from '@/lib/firebase';
import { initializeApp } from "firebase/app";
import { createUserDocument, updateUserProfileImage } from '@/lib/firebase-user';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Coins } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  theme: any;
}

export default function AuthDialog({ isOpen, onClose, theme }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create or update user document in Firestore
      await createUserDocument(result.user);
      
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && !isProfileSetup) {
      setIsProfileSetup(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name if provided
        if (displayName) {
          await updateProfile(user, { displayName });
        }
        
        // Create user document with profile image
        await createUserDocument(user);
        
        // Update profile image separately if provided
        if (profileImage) {
          await updateUserProfileImage(user.uid, profileImage);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSetup = () => (
    <form onSubmit={handleEmailAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.text,
            borderColor: theme.primary
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          {profileImage && (
            <img 
              src={profileImage} 
              alt="Profile preview" 
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text,
              borderColor: theme.primary
            }}
          >
            Choose Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setIsProfileSetup(false)}
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.text
          }}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading}
          style={{ 
            backgroundColor: theme.primary,
            color: theme.text
          }}
        >
          {loading ? 'Creating Account...' : 'Complete Sign Up'}
        </Button>
      </div>
    </form>
  );

  const renderAuthForm = () => (
    <form onSubmit={handleEmailAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.text,
            borderColor: theme.primary
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{ 
            backgroundColor: theme.secondary,
            color: theme.text,
            borderColor: theme.primary
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        style={{ 
          backgroundColor: theme.primary,
          color: theme.text
        }}
      >
        {loading ? 'Loading...' : (isSignUp ? 'Next' : 'Sign In')}
      </Button>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ backgroundColor: theme.background, color: theme.text }}>
        <DialogHeader>
          <DialogTitle>
            {isSignUp 
              ? (isProfileSetup ? 'Complete Your Profile' : 'Create Account')
              : 'Sign In'}
          </DialogTitle>
          <DialogDescription style={{ color: theme.secondary }}>
            {isSignUp 
              ? (isProfileSetup 
                  ? 'Add your display name and profile picture'
                  : 'Create a new account to save your progress')
              : 'Sign in to access your account'}
          </DialogDescription>
        </DialogHeader>

        {isSignUp && isProfileSetup ? renderProfileSetup() : renderAuthForm()}

        {!isProfileSetup && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" style={{ borderColor: theme.secondary }}/>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2" style={{ backgroundColor: theme.background }}>
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{ 
                backgroundColor: theme.secondary,
                color: theme.text,
                borderColor: theme.primary
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-sm text-center mt-4">
              <span style={{ color: theme.secondary }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              {' '}
              <Button
                variant="link"
                className="p-0"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsProfileSetup(false);
                }}
                style={{ color: theme.primary }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </>
        )}

        <div className="mt-4 text-xs text-center space-x-2" style={{ color: theme.secondary }}>
          <span>By continuing, you agree to our</span>
          <a 
            href="/terms" 
            target="_blank" 
            className="underline hover:text-primary"
            style={{ color: theme.primary }}
          >
            Terms of Service
          </a>
          <span>and</span>
          <a 
            href="/privacy" 
            target="_blank" 
            className="underline hover:text-primary"
            style={{ color: theme.primary }}
          >
            Privacy Policy
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
} 