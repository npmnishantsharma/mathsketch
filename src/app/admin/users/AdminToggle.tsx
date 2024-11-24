'use client';

import { useState } from 'react';
import { toggleUserAdmin } from '@/lib/services/users';

export default function AdminToggle({ 
  email, 
  initialIsAdmin,
  displayName
}: { 
  email: string; 
  initialIsAdmin: boolean;
  displayName?: string;
}) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const action = isAdmin ? 'remove admin rights from' : 'make admin';
    const userName = displayName || email;
    
    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await toggleUserAdmin(email, !isAdmin);
      setIsAdmin(!isAdmin);
    } catch (error) {
      console.error('Failed to toggle admin:', error);
      alert('Failed to update admin status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-2 py-1 rounded-full text-sm transition-colors ${
        isAdmin 
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
          : 'bg-zinc-700/30 text-zinc-400 hover:bg-zinc-700/40'
      }`}
    >
      {isLoading ? '...' : isAdmin ? 'Admin' : 'User'}
    </button>
  );
} 