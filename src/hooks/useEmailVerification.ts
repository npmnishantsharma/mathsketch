import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function useEmailVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsVerified(!!user?.emailVerified);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isVerified, isLoading };
} 