'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase/firebase';
import { collection, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import PreviewModal from '@/components/PreviewModal';

interface Theme {
  id: string;
  name: string;
  description: string;
  price: number;
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  preview: string;
  background: string;
  text: string;
  primary: string;
  secondary: string;
}

const themes: Theme[] = [
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'A luxurious gradient from deep purple to midnight blue',
    price: 100,
    gradientFrom: 'from-purple-600',
    gradientVia: 'via-indigo-700',
    gradientTo: 'to-blue-900',
    preview: 'bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-900',
    background: '#1a1a2e',
    text: '#ffffff',
    primary: '#9333ea',
    secondary: '#64748b'
  },
  {
    id: 'dark-ember',
    name: 'Dark Ember',
    description: 'Deep crimson fading into darkness',
    price: 120,
    gradientFrom: 'from-red-900',
    gradientVia: 'via-red-800',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-red-900 via-red-800 to-gray-900',
    background: '#18181b',
    text: '#ffffff',
    primary: '#dc2626',
    secondary: '#64748b'
  },
  {
    id: 'cosmic-night',
    name: 'Cosmic Night',
    description: 'Deep space inspired colors with hints of nebula',
    price: 150,
    gradientFrom: 'from-blue-900',
    gradientVia: 'via-purple-900',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900',
    background: '#0f172a',
    text: '#ffffff',
    primary: '#6366f1',
    secondary: '#64748b'
  },
  {
    id: 'emerald-night',
    name: 'Emerald Night',
    description: 'Dark emerald tones for a mysterious ambiance',
    price: 130,
    gradientFrom: 'from-green-900',
    gradientVia: 'via-green-800',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-green-900 via-green-800 to-gray-900',
    background: '#064e3b',
    text: '#ffffff',
    primary: '#10b981',
    secondary: '#64748b'
  },
  {
    id: 'cyber-punk',
    name: 'Cyber Punk',
    description: 'Neon pink and blue on dark background',
    price: 180,
    gradientFrom: 'from-pink-700',
    gradientVia: 'via-purple-900',
    gradientTo: 'to-blue-900',
    preview: 'bg-gradient-to-br from-pink-700 via-purple-900 to-blue-900',
    background: '#18181b',
    text: '#ffffff',
    primary: '#ec4899',
    secondary: '#64748b'
  },
  {
    id: 'golden-shadow',
    name: 'Golden Shadow',
    description: 'Rich gold tones melting into darkness',
    price: 200,
    gradientFrom: 'from-yellow-600',
    gradientVia: 'via-yellow-900',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-yellow-600 via-yellow-900 to-gray-900',
    background: '#1c1917',
    text: '#ffffff',
    primary: '#eab308',
    secondary: '#64748b'
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    description: 'Mysterious deep sea blues and teals',
    price: 140,
    gradientFrom: 'from-cyan-900',
    gradientVia: 'via-blue-900',
    gradientTo: 'to-slate-900',
    preview: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900',
    background: '#0c4a6e',
    text: '#ffffff',
    primary: '#0ea5e9',
    secondary: '#64748b'
  },
  {
    id: 'volcanic-night',
    name: 'Volcanic Night',
    description: 'Smoldering reds and blacks',
    price: 160,
    gradientFrom: 'from-red-950',
    gradientVia: 'via-red-900',
    gradientTo: 'to-slate-900',
    preview: 'bg-gradient-to-br from-red-950 via-red-900 to-slate-900',
    background: '#450a0a',
    text: '#ffffff',
    primary: '#ef4444',
    secondary: '#64748b'
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Northern lights in the dark sky',
    price: 175,
    gradientFrom: 'from-green-800',
    gradientVia: 'via-teal-900',
    gradientTo: 'to-blue-950',
    preview: 'bg-gradient-to-br from-green-800 via-teal-900 to-blue-950',
    background: '#134e4a',
    text: '#ffffff',
    primary: '#2dd4bf',
    secondary: '#64748b'
  },
  {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    description: 'Rich purple and deep blue tones',
    price: 185,
    gradientFrom: 'from-purple-800',
    gradientVia: 'via-indigo-900',
    gradientTo: 'to-violet-950',
    preview: 'bg-gradient-to-br from-purple-800 via-indigo-900 to-violet-950',
    background: '#4c1d95',
    text: '#ffffff',
    primary: '#a855f7',
    secondary: '#64748b'
  },
  {
    id: 'obsidian-fire',
    name: 'Obsidian Fire',
    description: 'Orange flames on black stone',
    price: 165,
    gradientFrom: 'from-orange-900',
    gradientVia: 'via-red-950',
    gradientTo: 'to-gray-950',
    preview: 'bg-gradient-to-br from-orange-900 via-red-950 to-gray-950',
    background: '#431407',
    text: '#ffffff',
    primary: '#f97316',
    secondary: '#64748b'
  },
  {
    id: 'midnight-forest',
    name: 'Midnight Forest',
    description: 'Dark forest greens in moonlight',
    price: 155,
    gradientFrom: 'from-green-950',
    gradientVia: 'via-emerald-900',
    gradientTo: 'to-slate-950',
    preview: 'bg-gradient-to-br from-green-950 via-emerald-900 to-slate-950',
    background: '#052e16',
    text: '#ffffff',
    primary: '#10b981',
    secondary: '#64748b'
  },
  {
    id: 'mystic-shadow',
    name: 'Mystic Shadow',
    description: 'Dusky lavender fading into dark slate',
    price: 120,
    gradientFrom: 'from-indigo-900',
    gradientVia: 'via-purple-700',
    gradientTo: 'to-gray-800',
    preview: 'bg-gradient-to-br from-indigo-900 via-purple-700 to-gray-800',
    background: '#1e1e2c',
    text: '#ffffff',
    primary: '#7c3aed',
    secondary: '#64748b',
  },
  {
    id: 'crimson-dusk',
    name: 'Crimson Dusk',
    description: 'Velvety crimson melting into twilight black',
    price: 130,
    gradientFrom: 'from-red-800',
    gradientVia: 'via-pink-900',
    gradientTo: 'to-black',
    preview: 'bg-gradient-to-br from-red-800 via-pink-900 to-black',
    background: '#2b0b0b',
    text: '#ffffff',
    primary: '#f43f5e',
    secondary: '#64748b',
  },
  {
    id: 'ethereal-mist',
    name: 'Ethereal Mist',
    description: 'Silvery blue and soft gray tones',
    price: 110,
    gradientFrom: 'from-blue-800',
    gradientVia: 'via-cyan-900',
    gradientTo: 'to-gray-700',
    preview: 'bg-gradient-to-br from-blue-800 via-cyan-900 to-gray-700',
    background: '#1a1e28',
    text: '#ffffff',
    primary: '#0ea5e9',
    secondary: '#64748b',
  },
  {
    id: 'galactic-flare',
    name: 'Galactic Flare',
    description: 'Fiery oranges amidst cosmic black',
    price: 180,
    gradientFrom: 'from-orange-700',
    gradientVia: 'via-red-800',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-orange-700 via-red-800 to-gray-900',
    background: '#2d1a0b',
    text: '#ffffff',
    primary: '#f97316',
    secondary: '#64748b',
  },
  {
    id: 'nebula-dreams',
    name: 'Nebula Dreams',
    description: 'Purple and teal swirling in the void',
    price: 190,
    gradientFrom: 'from-purple-700',
    gradientVia: 'via-teal-800',
    gradientTo: 'to-gray-950',
    preview: 'bg-gradient-to-br from-purple-700 via-teal-800 to-gray-950',
    background: '#18202c',
    text: '#ffffff',
    primary: '#8b5cf6',
    secondary: '#64748b',
  },
  {
    id: 'burnt-ember',
    name: 'Burnt Ember',
    description: 'Dark orange and muted crimson flames',
    price: 150,
    gradientFrom: 'from-orange-800',
    gradientVia: 'via-red-700',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-orange-800 via-red-700 to-gray-900',
    background: '#3a1d16',
    text: '#ffffff',
    primary: '#f97316',
    secondary: '#64748b',
  },
  {
    id: 'dark-eclipse',
    name: 'Dark Eclipse',
    description: 'Blackened yellows and ashen blues',
    price: 170,
    gradientFrom: 'from-yellow-900',
    gradientVia: 'via-blue-800',
    gradientTo: 'to-black',
    preview: 'bg-gradient-to-br from-yellow-900 via-blue-800 to-black',
    background: '#1a1d21',
    text: '#ffffff',
    primary: '#facc15',
    secondary: '#64748b',
  },
  {
    id: 'obsidian-night',
    name: 'Obsidian Night',
    description: 'Pure black with subtle purple glows',
    price: 185,
    gradientFrom: 'from-black',
    gradientVia: 'via-gray-900',
    gradientTo: 'to-purple-800',
    preview: 'bg-gradient-to-br from-black via-gray-900 to-purple-800',
    background: '#0d0d0d',
    text: '#ffffff',
    primary: '#9333ea',
    secondary: '#64748b',
  },
  {
    id: 'amber-veil',
    name: 'Amber Veil',
    description: 'Golden amber merging into deep copper',
    price: 160,
    gradientFrom: 'from-yellow-800',
    gradientVia: 'via-orange-700',
    gradientTo: 'to-red-900',
    preview: 'bg-gradient-to-br from-yellow-800 via-orange-700 to-red-900',
    background: '#422c17',
    text: '#ffffff',
    primary: '#eab308',
    secondary: '#64748b',
  },
  {
    id: 'frosted-horizon',
    name: 'Frosted Horizon',
    description: 'Icy blues transitioning to deep navy',
    price: 150,
    gradientFrom: 'from-blue-700',
    gradientVia: 'via-cyan-600',
    gradientTo: 'to-gray-800',
    preview: 'bg-gradient-to-br from-blue-700 via-cyan-600 to-gray-800',
    background: '#192434',
    text: '#ffffff',
    primary: '#3b82f6',
    secondary: '#64748b',
  },
  {
    id: 'stormy-dream',
    name: 'Stormy Dream',
    description: 'Muted grays and stormy blues',
    price: 145,
    gradientFrom: 'from-gray-800',
    gradientVia: 'via-blue-900',
    gradientTo: 'to-slate-800',
    preview: 'bg-gradient-to-br from-gray-800 via-blue-900 to-slate-800',
    background: '#111827',
    text: '#ffffff',
    primary: '#1e40af',
    secondary: '#64748b',
  },
  {
    id: 'plasma-wave',
    name: 'Plasma Wave',
    description: 'Vibrant pink and blue plasma tones',
    price: 200,
    gradientFrom: 'from-pink-700',
    gradientVia: 'via-purple-900',
    gradientTo: 'to-blue-900',
    preview: 'bg-gradient-to-br from-pink-700 via-purple-900 to-blue-900',
    background: '#1a1b24',
    text: '#ffffff',
    primary: '#ec4899',
    secondary: '#64748b',
  },
  {
    id: 'desert-night',
    name: 'Desert Night',
    description: 'Muted sands fading into cool twilight',
    price: 130,
    gradientFrom: 'from-yellow-800',
    gradientVia: 'via-orange-900',
    gradientTo: 'to-gray-900',
    preview: 'bg-gradient-to-br from-yellow-800 via-orange-900 to-gray-900',
    background: '#3a2315',
    text: '#ffffff',
    primary: '#f59e0b',
    secondary: '#64748b',
  },
  {
    id: 'aurora-glow',
    name: 'Aurora Glow',
    description: 'Northern lights hues over a black night sky',
    price: 170,
    gradientFrom: 'from-green-700',
    gradientVia: 'via-cyan-800',
    gradientTo: 'to-blue-900',
    preview: 'bg-gradient-to-br from-green-700 via-cyan-800 to-blue-900',
    background: '#11332b',
    text: '#ffffff',
    primary: '#34d399',
    secondary: '#64748b',
  }
];

export default function StorePage() {
  const { user } = useAuth();
  const [userCoins, setUserCoins] = useState(0);
  const [ownedThemes, setOwnedThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.uid) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(userData);
        setUserCoins(userData.points || 0);
        setOwnedThemes(userData.themes || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (theme: Theme) => {
    if (!user?.uid) {
      toast.error('Please login to purchase themes');
      return;
    }

    if (ownedThemes.includes(theme.id)) {
      toast.error('You already own this theme');
      return;
    }

    if (userCoins < theme.price) {
      toast.error('Not enough coins to purchase this theme');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Update user document with new theme
      await updateDoc(userRef, {
        points: userCoins - theme.price,
        themes: arrayUnion(theme.id),
        purchasedThemes: arrayUnion(theme),
        lastUpdated: serverTimestamp()
      });

      setUserCoins(prev => prev - theme.price);
      setOwnedThemes(prev => [...prev, theme.id]);
      
      // Show success message
      toast.success('Theme purchased successfully! You can now use it in the canvas.');
    } catch (error) {
      console.error('Error purchasing theme:', error);
      toast.error('Failed to purchase theme');
    }
  };

  const handlePreview = (theme: Theme) => {
    setPreviewTheme(theme);
    setIsPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            MathSketch Store
          </h1>
          <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-yellow-400">🪙</span>
            <span className="text-white font-medium">{userCoins} coins</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700"
            >
              <div className="relative group">
                <div className={`h-32 ${theme.preview}`} />
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => handlePreview(theme)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                    />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{theme.name}</h3>
                <p className="text-gray-400 mb-4">{theme.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">🪙</span>
                    <span className="text-white font-medium">{theme.price}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePurchase(theme)}
                    disabled={ownedThemes.includes(theme.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      ownedThemes.includes(theme.id)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                    }`}
                  >
                    {ownedThemes.includes(theme.id) ? 'Owned' : 'Purchase'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {previewTheme && (
        <PreviewModal
          theme={previewTheme}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
} 