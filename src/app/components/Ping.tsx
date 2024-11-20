"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PingProps {
  x: number;
  y: number;
  color: string;
  userName: string;
}

export default function Ping({ x, y, color, userName }: PingProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            zIndex: 50,
          }}
        >
          {/* Ping circle */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ 
              scale: [1, 2, 2],
              opacity: [0.8, 0.4, 0],
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              repeatType: "loop"
            }}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
            }}
          />
          
          {/* Center dot */}
          <motion.div
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Username label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              backgroundColor: color,
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, 15px)',
            }}
          >
            {userName}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 