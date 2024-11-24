'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { Theme } from '@/app/types/interfaces';

interface PreviewModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to convert Tailwind classes to color values
const getTailwindColor = (className: string) => {
  const colorMap: { [key: string]: string } = {
    'purple-600': '#9333EA',
    'indigo-700': '#4338CA',
    'blue-900': '#1E3A8A',
    'orange-500': '#F97316',
    'pink-500': '#EC4899',
    'purple-500': '#A855F7',
    'cyan-400': '#22D3EE',
    'blue-500': '#3B82F6',
    'blue-600': '#2563EB',
    'red-900': '#7f1d1d',
    'red-800': '#991b1b',
    'gray-900': '#111827',
    'purple-900': '#581c87',
    'green-900': '#14532d',
    'green-800': '#166534',
    'pink-700': '#be185d',
    'yellow-600': '#ca8a04',
    'yellow-900': '#713f12',
    'cyan-900': '#164e63',
    'blue-950': '#172554',
    'slate-900': '#0f172a',
    'red-950': '#450a0a',
    'teal-900': '#134e4a',
    'purple-800': '#6b21a8',
    'indigo-900': '#312e81',
    'violet-950': '#2e1065',
    'orange-900': '#7c2d12',
    'gray-950': '#030712',
    'green-950': '#052e16',
    'emerald-900': '#064e3b',
    'slate-950': '#020617'
  };

  const colorKey = className.replace('from-', '')
    .replace('via-', '')
    .replace('to-', '');
    
  return colorMap[colorKey] || '#000000';
};

export default function PreviewModal({ theme, isOpen, onClose }: PreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Animation variables
    let progress = 0;
    const totalPoints = 200;
    const radius = Math.min(canvas.width, canvas.height) * 0.25;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      if (theme.gradientFrom && theme.gradientTo) {
        const fromColor = getTailwindColor(theme.gradientFrom.replace('from-', ''));
        const viaColor = theme.gradientVia ? getTailwindColor(theme.gradientVia.replace('via-', '')) : null;
        const toColor = getTailwindColor(theme.gradientTo.replace('to-', ''));

        gradient.addColorStop(0, fromColor);
        if (viaColor) {
          gradient.addColorStop(0.5, viaColor);
        }
        gradient.addColorStop(1, toColor);
      } else {
        // Fallback to solid background
        gradient.addColorStop(0, theme.background);
        gradient.addColorStop(1, theme.background);
      }

      // Fill background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw infinity symbol with glow effect
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add glow effect
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.beginPath();

      for (let i = 0; i <= progress; i++) {
        const t = (i / totalPoints) * Math.PI * 2;
        const x = canvas.width/2 + radius * Math.sin(t) / (1 + Math.cos(t) * Math.cos(t));
        const y = canvas.height/2 + radius * Math.sin(t) * Math.cos(t) / (1 + Math.cos(t) * Math.cos(t));
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      if (progress < totalPoints) {
        progress += 2;
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isOpen, theme]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">{theme.name} Preview</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 