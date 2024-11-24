'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  
  const handleRelaunch = () => {
    const token = searchParams.get('token');
    const userData = searchParams.get('userData');
    const device = searchParams.get('device');
    const uid = searchParams.get('uid');

    if (token && userData && device && uid) {
      window.location.href = `mathsketch://auth?token=${token}&userData=${userData}&device=${device}&uid=${uid}`;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Authentication Successful!</h1>
        <p className="text-gray-600 mb-6">You can now close this window and return to the application.</p>
        <p className="text-sm text-gray-500 mb-4">If the application didn't launch automatically, click the button below:</p>
        <Button 
          onClick={handleRelaunch}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Launch MathSketch Desktop
        </Button>
      </div>
    </div>
  );
} 