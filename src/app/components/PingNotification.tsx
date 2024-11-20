"use client"

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Theme } from '../types';

interface PingNotificationProps {
  message: string;
  sender: string;
  theme: Theme;
  onDismiss: () => void;
}

export default function PingNotification({ message, sender, theme, onDismiss }: PingNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000); // Auto dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-[100] rounded-lg shadow-lg p-4 max-w-md"
        style={{ 
          backgroundColor: theme.background,
          border: `1px solid ${theme.primary}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full" style={{ backgroundColor: theme.primary }}>
            <Bell className="h-4 w-4" style={{ color: theme.text }} />
          </div>
          <div>
            <div className="font-medium mb-1" style={{ color: theme.text }}>
              {sender} mentioned you
            </div>
            <div className="text-sm" style={{ color: theme.secondary }}>
              {message}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 