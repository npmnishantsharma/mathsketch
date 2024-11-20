'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Paintbrush, Eraser, Type, Sparkles, MessageCircle, Camera, Users, Shapes, Share2, Keyboard, Palette, HelpCircle } from "lucide-react"

interface CanvasIntroductionProps {
  isOpen: boolean;
  onClose: () => void;
}

const CanvasIntroduction: React.FC<CanvasIntroductionProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: <Paintbrush className="w-5 h-5" />,
      title: "Drawing Tools",
      description: "Use the brush tool with adjustable size and color. Click and drag to draw smoothly."
    },
    {
      icon: <Eraser className="w-5 h-5" />,
      title: "Eraser",
      description: "Easily correct mistakes with the eraser tool. Adjustable size for precise corrections."
    },
    {
      icon: <Type className="w-5 h-5" />,
      title: "Text & Math Symbols",
      description: "Add text annotations and mathematical symbols. Double-click text to edit."
    },
    {
      icon: <Keyboard className="w-5 h-5" />,
      title: "Math Keyboard",
      description: "Special keyboard for mathematical symbols and equations. Quick access to common math notations."
    },
    {
      icon: <Shapes className="w-5 h-5" />,
      title: "Shapes",
      description: "Add geometric shapes like circles, rectangles, triangles, and arrows. Resize and modify shapes easily."
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Real-time Collaboration",
      description: "Create collaboration sessions and work together in real-time. Share your workspace with others."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Analysis",
      description: "Get instant solutions and step-by-step explanations for mathematical problems using AI."
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Interactive Chat",
      description: "Ask follow-up questions and get detailed explanations through the AI chat interface."
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Camera Input",
      description: "Capture and solve problems directly from your device's camera or textbooks."
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Themes",
      description: "Customize your workspace with different color themes. Create and save your own themes."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Session Management",
      description: "Track active sessions and collaborators. Secure workspace with authentication."
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Help & Support",
      description: "Access quick help and tutorials. Learn about new features and updates."
    }
  ];

  const shortcuts = [
    { key: "ESC", description: "Cancel current action" },
    { key: "Ctrl + Z", description: "Undo last action" },
    { key: "Double Click", description: "Edit text box" },
    { key: "Shift + Drag", description: "Draw straight lines" },
    { key: "Space", description: "Toggle toolbar" },
    { key: "Delete", description: "Remove selected item" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to MathSketch!</DialogTitle>
          <DialogDescription className="text-lg">
            Your AI-powered mathematics learning assistant
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold mb-3">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded">
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
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-2">🆕 What's New</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Real-time collaboration with multiple users</li>
              <li>Enhanced shape tools with resizing and customization</li>
              <li>Improved math keyboard with more symbols</li>
              <li>New themes and customization options</li>
              <li>Better drawing precision and performance</li>
              <li>Session tracking and security improvements</li>
            </ul>
          </div>

          {/* Help Resources */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <h3 className="font-semibold mb-2">💡 Quick Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Use the crosshair cursor for precise drawing</li>
              <li>Try the AI analysis for step-by-step solutions</li>
              <li>Share your session URL to collaborate</li>
              <li>Save custom themes for quick access</li>
              <li>Double-click text boxes to edit content</li>
              <li>Press '?' anytime to show this help</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.open('https://docs.mathsketch.app', '_blank')}>
              Documentation
            </Button>
            <Button onClick={onClose}>Get Started</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CanvasIntroduction;
