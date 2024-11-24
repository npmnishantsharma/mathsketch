"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DrawingCanvas from '../../pages/DrawingCanvas';
import { rtdb as database, auth } from '@/lib/firebase';
import { ref, onValue, set, off } from 'firebase/database';
import { User } from 'firebase/auth';
import { Theme } from '@/app/types';
import { ShapeType } from '@/app/shapes/base';
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Share2, QrCode, Copy, Check } from "lucide-react";
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { sendEmailVerification } from "firebase/auth";

interface CollaborativeSession {
  createdAt: number;
  hostId: string;
  members: {
    [uid: string]: {
      displayName: string;
      photoURL: string;
      lastActive: number;
      isHost?: boolean;
    }
  };
  canvasData: {
    strokes: any[];
    textBoxes: any[];
    shapes: any[];
    settings: {
      color: string;
      lineWidth: number;
      tool: 'brush' | 'eraser' | 'text' | 'shape';
      selectedShape?: ShapeType;
      keyboardVisible: boolean;
      keyboardPosition: { x: number; y: number };
    };
  };
}

export default function CollaborativePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionid as string;
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { isVerified, isLoading } = useEmailVerification();

  // Add auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !isVerified) {
      toast.error('Email verification required', {
        duration: 5000,
      });
      router.push('/');
    }
  }, [isLoading, isVerified, router]);

  useEffect(() => {
    const sessionRef = ref(database, `collaborativeSessions/${sessionId}`);

    // Initialize session if it doesn't exist
    const initializeSession = async () => {
      const newSession: CollaborativeSession = {
        createdAt: Date.now(),
        hostId: user?.uid || '',
        members: {},
        canvasData: {
          strokes: [],
          textBoxes: [],
          shapes: [],
          settings: {
            color: "#FFFFFF",
            lineWidth: 5,
            tool: 'brush',
            keyboardVisible: false,
            keyboardPosition: { x: 20, y: window.innerHeight - 400 }
          }
        },
      };

      try {
        await set(sessionRef, newSession);
      } catch (error) {
        setError('Failed to initialize collaborative session');
        console.error('Error initializing session:', error);
      }
    };

    // Listen for session changes
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      if (!snapshot.exists()) {
        initializeSession();
      } else {
        setSession(snapshot.val());
      }
    }, (error) => {
      setError('Failed to load collaborative session');
      console.error('Error loading session:', error);
    });

    return () => {
      off(sessionRef);
    };
  }, [sessionId, user?.uid]);

  // Generate QR code when share dialog opens
  useEffect(() => {
    if (showShareDialog) {
      // Use absolute URL for QR code
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const collaborationUrl = `${baseUrl}/colab/${sessionId}`;
      
      QRCode.toDataURL(collaborationUrl)
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
        });
    }
  }, [showShareDialog, sessionId]);

  const handleCopyLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const collaborationUrl = `${baseUrl}/colab/${sessionId}`;
    navigator.clipboard.writeText(collaborationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSession = (sessionId: string) => {
    router.push(`/colab/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
          <p className="text-gray-600 mb-6">
            You need to verify your email address to join collaboration sessions.
          </p>
          <Button
            onClick={async () => {
              if (auth.currentUser) {
                try {
                  await sendEmailVerification(auth.currentUser);
                  toast.success('Verification email sent! Please check your inbox.');
                } catch (error) {
                  toast.error('Failed to send verification email. Please try again.');
                }
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Send Verification Email
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <DrawingCanvas isCollaboration sessionId={sessionId} />
      
      {/* Share Button */}
      <Button
        onClick={() => setShowShareDialog(true)}
        className="fixed top-4 right-20 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-lg transition-all duration-200"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Collaboration</DialogTitle>
            <DialogDescription>
              Share this link with others to collaborate in real-time
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-48 h-48"
                  />
                )}
              </div>
              <span className="text-sm text-gray-500">
                Scan with your phone camera
              </span>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/colab/${sessionId}`}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-100"
              />
              <Button 
                onClick={handleCopyLink}
                variant="outline" 
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Join Button */}
            <Button
              onClick={() => handleJoinSession(sessionId)}
              className="w-full"
              variant="default"
            >
              Join Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 