'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DesktopAuth() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Only allow desktop-win authentication
    if (params.device !== 'desktop-win') {
      setError('Invalid device type');
      setLoading(false);
      return;
    }

    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(user);
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            points: userData?.points || 0,
            // Add other relevant user data
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Error fetching user data');
        }
      } else {
        console.log('No user found');
        router.push('/login?redirect=/auth/' + params.device);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.device, router]);

  const handleAuthorize = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const uid = auth.currentUser?.uid;
      
      // First, verify the desktop auth by calling our API
      const response = await fetch(`/api/desktop-win?uid=${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Send auth data to desktop app via custom protocol
        window.location.href = `mathsketch://auth?token=${token}&userData=${encodeURIComponent(JSON.stringify(userData))}`;
        
        // Show success message
        setTimeout(() => {
          router.push('/auth/success');
        }, 1000);
      } else {
        throw new Error('Failed to verify desktop auth');
      }
    } catch (error) {
      console.error('Authorization error:', error);
      setError('Failed to authorize application');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Authorize MathSketch Desktop</h1>
          <p className="text-gray-600">
            Allow MathSketch Desktop to access your account information
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <img
              src={userData?.photoURL || '/favicon.ico'}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div className="ml-4">
              <div className="font-medium">{userData?.displayName}</div>
              <div className="text-sm text-gray-500">{userData?.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">The application will have access to:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your name and profile picture</li>
              <li>• Email address</li>
              <li>• MathSketch points and achievements</li>
              <li>• Saved drawings and solutions</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleAuthorize}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Authorize Application
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        <p className="mt-4 text-xs text-center text-gray-500">
          By authorizing, you're allowing MathSketch Desktop to access your account information.
          You can revoke access at any time from your account settings.
        </p>
      </div>
    </div>
  );
} 