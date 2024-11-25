'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Paintbrush, Eraser, Type, Sparkles, MessageCircle, Camera, Users, Shapes, Share2, Keyboard, Palette, HelpCircle, Brain, Coins, Crown, Rocket } from "lucide-react"

interface CanvasIntroductionProps {
  isOpen: boolean;
  onClose: () => void;
}

const CanvasIntroduction: React.FC<CanvasIntroductionProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: <Paintbrush className="w-5 h-5 text-blue-500" />,
      title: "Smart Drawing Tools",
      description: "Enhanced brush with pressure sensitivity, smooth line drawing, and gradient support.",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      title: "Advanced AI Analysis",
      description: "Improved mathematical recognition with step-by-step solutions and interactive quizzes.",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: <Palette className="w-5 h-5 text-emerald-500" />,
      title: "Enhanced Themes",
      description: "Create and customize themes with gradients, plus new preset themes to choose from.",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: <Share2 className="w-5 h-5 text-indigo-500" />,
      title: "Real-time Collaboration",
      description: "Work together in real-time with chat, presence indicators, and shared canvas.",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      icon: <Type className="w-5 h-5 text-green-500" />,
      title: "Rich Text & LaTeX",
      description: "Full LaTeX support for complex equations. Rich text formatting with multiple fonts.",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: <Keyboard className="w-5 h-5 text-pink-500" />,
      title: "Enhanced Math Keyboard",
      description: "Expanded symbol library with custom shortcuts. Quick access to frequently used expressions.",
      bgColor: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
      icon: <Coins className="w-5 h-5 text-yellow-500" />,
      title: "Points & Rewards",
      description: "Earn points for solving problems and helping others. Unlock special features and themes.",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      icon: <Crown className="w-5 h-5 text-orange-500" />,
      title: "Interactive Quizzes",
      description: "AI-generated quizzes based on your work. Track progress and earn bonus points.",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-cyan-500" />,
      title: "Smart Chat Assistant",
      description: "Context-aware AI chat that remembers your previous questions and work.",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
      icon: <Camera className="w-5 h-5 text-red-500" />,
      title: "Advanced Image Input",
      description: "Multi-camera support with image enhancement for better recognition.",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      icon: <Shapes className="w-5 h-5 text-violet-500" />,
      title: "Dynamic Shapes",
      description: "Resizable geometric shapes with snapping and alignment guides.",
      bgColor: "bg-violet-50 dark:bg-violet-900/20"
    },
    {
      icon: <Rocket className="w-5 h-5 text-rose-500" />,
      title: "Performance Boost",
      description: "Optimized drawing engine with smoother animations and faster responses.",
      bgColor: "bg-rose-50 dark:bg-rose-900/20"
    }
  ];

  const shortcuts = [
    { key: "ESC", description: "Cancel current action" },
    { key: "Ctrl + Z", description: "Undo last action" },
    { key: "Double Click", description: "Edit text box" },
    { key: "Shift + Drag", description: "Draw straight lines" },
    { key: "Space", description: "Toggle toolbar" },
    { key: "Delete", description: "Remove selected item" },
    { key: "Ctrl + S", description: "Save session" },
    { key: "Ctrl + C", description: "Copy selection" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to MathSketch!
          </DialogTitle>
          <DialogDescription className="text-lg">
            Your AI-powered mathematics learning assistant - Now with more features!
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all ${feature.bgColor}`}
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">⌨️</span> Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                  <kbd className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md font-mono">
                    {shortcut.key}
                  </kbd>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What's New Section */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🆕</span> Latest Updates
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <li className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                <Palette className="w-4 h-4 text-emerald-500" />
                <span>New gradient theme support</span>
              </li>
              <li className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Enhanced real-time collaboration</span>
              </li>
              <li className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Improved AI recognition</span>
              </li>
              <li className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>Interactive quizzes with rewards</span>
              </li>
            </ul>
          </div>

          {/* Quick Tips */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> Pro Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Try the new gradient themes for better visibility</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Use real-time collaboration for group study</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Earn points through quizzes and helping others</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Customize themes with your favorite gradients</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://docs.mathsketch.app', '_blank')}
              className="hover:scale-105 transition-transform"
            >
              Documentation
            </Button>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CanvasIntroduction;
