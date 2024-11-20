'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GripHorizontal, Move } from "lucide-react"

interface Theme {
  name: string;
  background: string;
  text: string;
  primary: string;
  secondary: string;
}

interface MathKeyboardProps {
  onInsert: (text: string) => void;
  theme: Theme;
  isVisible: boolean;
  selectedTextBox: string | null;
  textBoxes: any[];
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({ onInsert, theme, isVisible, selectedTextBox, textBoxes }) => {
  const [position, setPosition] = useState({ x: 20, y: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: 20, y: window.innerHeight - 400 })
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add touch event handlers to the keyboard
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault(); // Prevent scrolling while dragging
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Basic Math Symbols
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const basicOperators = ['+', '-', '×', '÷', '=', '≠', '±', '∓']
  const comparisonOperators = ['<', '>', '≤', '≥', '≈', '≡', '≅', '∝']
  
  // Algebra and Number Theory
  const algebraicOperators = ['∑', '∏', '√', '∛', '∜', '∫', '∂', '∇']
  const numberSets = ['ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ', '∅', '∞', 'ℵ']
  const logicalOperators = ['∧', '∨', '¬', '⊕', '⊗', '⊙', '∀', '∃']
  
  // Set Theory
  const setTheory = ['∈', '∉', '⊂', '⊃', '⊆', '⊇', '∪', '∩']
  const setOperators = ['∖', '∆', '⊄', '⊅', '⊈', '⊉', '∁', '∅']
  
  // Greek Letters
  const greekLowercase = ['α', 'β', 'γ', 'θ', 'λ', 'μ', 'π', 'σ']
  const greekUppercase = ['Γ', 'Δ', 'Θ', 'Λ', 'Π', 'Σ', 'Φ', 'Ω']
  
  // Functions and Calculus
  const functions = ['sin', 'cos', 'tan', 'log', 'ln', 'lim', 'max', 'min']
  const calculus = ['∫', '∬', '∭', '∮', '∯', '∰', '∇', '∆']
  
  // Superscripts and Subscripts
  const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
  const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  
  // Geometry
  const geometry = ['∠', '⊥', '∥', '≅', '∼', '∝', '△', '□']
  const arrows = ['←', '→', '↑', '↓', '↔', '⇒', '⇔', '↦']

  const isTextBoxEditing = selectedTextBox && textBoxes.find(box => 
    box.id === selectedTextBox && box.isEditing
  );

  const renderButtonGroup = (symbols: string[], title: string) => (
    <div className="mb-2" onClick={(e) => e.stopPropagation()}>
      <h3 
        className="text-xs font-semibold mb-1" 
        style={{ color: theme.text }}
      >
        {title}
      </h3>
      <div className="flex flex-wrap gap-0.5">
        {symbols.map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            className="h-8 px-2 text-sm hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isTextBoxEditing) {
                console.log('Button clicked:', symbol);
                onInsert(symbol);
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{ 
              backgroundColor: isTextBoxEditing ? theme.primary : theme.secondary,
              color: theme.text,
              cursor: isTextBoxEditing ? 'pointer' : 'not-allowed',
              borderColor: theme.primary,
              opacity: isTextBoxEditing ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            {symbol}
          </Button>
        ))}
      </div>
    </div>
  )

  const handleMoveButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingButton(true);
    setButtonPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMoveButtonMouseMove = (e: React.MouseEvent) => {
    if (isDraggingButton) {
      e.preventDefault();
      const dx = e.clientX - buttonPosition.x;
      const dy = e.clientY - buttonPosition.y;
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setButtonPosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleMoveButtonMouseUp = () => {
    setIsDraggingButton(false);
  };

  // Add useEffect to handle global mouse events for the move button
  useEffect(() => {
    if (isDraggingButton) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const dx = e.clientX - buttonPosition.x;
        const dy = e.clientY - buttonPosition.y;
        
        setPosition(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        setButtonPosition({
          x: e.clientX,
          y: e.clientY
        });
      };

      const handleGlobalMouseUp = () => {
        setIsDraggingButton(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDraggingButton, buttonPosition]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed shadow-lg rounded-lg"
      style={{ 
        backgroundColor: theme.background,
        left: position.x,
        top: position.y,
        width: '300px',
        maxWidth: '90vw',
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'auto',
        border: `1px solid ${theme.primary}`
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="p-2 cursor-grab flex items-center justify-between border-b lg:cursor-default"
        onMouseDown={(e) => {
          if (window.innerWidth < 1024) {
            handleMouseDown(e);
          }
        }}
        onTouchStart={(e) => {
          if (window.innerWidth < 1024) {
            handleTouchStart(e);
          }
        }}
        style={{ borderColor: theme.primary }}
      >
        <span className="text-xs font-semibold" style={{ color: theme.text }}>Math Keyboard</span>
        <GripHorizontal className="h-4 w-4 lg:hidden" style={{ color: theme.text }} />
      </div>

      <div 
        className="hidden lg:flex absolute -right-10 top-1/2 transform -translate-y-1/2 cursor-grab"
        onMouseDown={handleMoveButtonMouseDown}
        onMouseMove={handleMoveButtonMouseMove}
        onMouseUp={handleMoveButtonMouseUp}
        style={{ 
          backgroundColor: theme.primary,
          padding: '8px',
          borderRadius: '0 8px 8px 0',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          cursor: isDraggingButton ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        <Move 
          className="h-4 w-4" 
          style={{ 
            color: theme.text,
            transform: isDraggingButton ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.1s ease'
          }} 
        />
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList 
          className="grid grid-cols-4 gap-1 p-1"
          style={{ backgroundColor: theme.secondary }}
        >
          {['basic', 'algebra', 'greek', 'advanced'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className={`text-xs hover:opacity-80 transition-all data-[state=active]:bg-primary data-[state=active]:text-white`}
              style={{ 
                color: theme.text,
                backgroundColor: 'transparent'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="outline-none">
          <ScrollArea 
            className="h-[200px] w-full p-2"
            style={{ backgroundColor: theme.background }}
          >
            {renderButtonGroup(numbers, "Numbers")}
            {renderButtonGroup(basicOperators, "Basic Operators")}
            {renderButtonGroup(comparisonOperators, "Comparison")}
            {renderButtonGroup(arrows, "Arrows")}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="algebra" className="outline-none">
          <ScrollArea className="h-[200px] w-full p-2">
            {renderButtonGroup(algebraicOperators, "Algebraic")}
            {renderButtonGroup(functions, "Functions")}
            {renderButtonGroup(superscripts, "Superscripts")}
            {renderButtonGroup(subscripts, "Subscripts")}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="greek" className="outline-none">
          <ScrollArea className="h-[200px] w-full p-2">
            {renderButtonGroup(greekLowercase, "Greek Lowercase")}
            {renderButtonGroup(greekUppercase, "Greek Uppercase")}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="advanced" className="outline-none">
          <ScrollArea className="h-[200px] w-full p-2">
            {renderButtonGroup(setTheory, "Set Theory")}
            {renderButtonGroup(setOperators, "Set Operators")}
            {renderButtonGroup(numberSets, "Number Sets")}
            {renderButtonGroup(geometry, "Geometry")}
            {renderButtonGroup(calculus, "Calculus")}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MathKeyboard