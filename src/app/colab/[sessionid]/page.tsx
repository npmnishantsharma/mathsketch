"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DrawingCanvas from '../../pages/DrawingCanvas';
import { rtdb as database, auth } from '@/lib/firebase';
import { ref, onValue, set, off } from 'firebase/database';
import { User } from 'firebase/auth';
import { Theme } from '@/app/types';
import { ShapeType } from '@/app/shapes/base';
import { onAuthStateChanged } from "firebase/auth";

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
  const sessionId = params.sessionid as string;
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Add auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

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
    </div>
  );
} 