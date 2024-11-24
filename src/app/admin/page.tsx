'use client';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

// Moving getStats outside the component since it's an async function
async function getStats() {
  const collections = ['users', 'changelogs', 'sessions'];
  const stats = await Promise.all([
    ...collections.map(async (collectionName) => {
      const coll = collection(db, collectionName);
      const snapshot = await getCountFromServer(coll);
      return {
        name: collectionName,
        count: snapshot.data().count,
      };
    }),
    (async () => {
      const sessionsRef = collection(db, 'sessions');
      const activeQuery = query(sessionsRef, where('status', '==', 'active'));
      const snapshot = await getCountFromServer(activeQuery);
      return {
        name: 'active sessions',
        count: snapshot.data().count,
      };
    })(),
  ]);
  return stats;
}

// Animated counter component
const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Array<{ name: string; count: number }>>([]);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      
      <div className="p-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8"
        >
          Database Overview
        </motion.h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 
                       shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)]
                       border border-gray-800/50 backdrop-blur-sm
                       before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br 
                       before:from-purple-500/10 before:to-pink-500/10 before:opacity-0 
                       hover:before:opacity-100 before:transition-opacity"
            >
              <div className="relative z-10">
                <h3 className="text-lg font-medium bg-gradient-to-r from-gray-200 to-gray-400 
                             bg-clip-text text-transparent mb-3 capitalize tracking-wide">
                  {stat.name}
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 
                             bg-clip-text text-transparent">
                  <Counter value={stat.count} />
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional loading state */}
        {stats.length === 0 && (
          <div className="flex justify-center items-center mt-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  );
} 