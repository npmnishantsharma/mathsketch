import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, RotateCcw, FastForward, Rewind } from "lucide-react";
import { DrawingAction } from '../types/interfaces';
import { Theme } from '../types';

interface SessionRecordingViewerProps {
  recordedActions: DrawingAction[];
  theme: Theme;
  onClose: () => void;
}

export default function SessionRecordingViewer({ 
  recordedActions, 
  theme,
  onClose 
}: SessionRecordingViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playRecording = async () => {
    setIsPlaying(true);
    while (currentActionIndex < recordedActions.length && isPlaying) {
      const action = recordedActions[currentActionIndex];
      await applyAction(action);
      setCurrentActionIndex(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 100 / playbackSpeed));
    }
    setIsPlaying(false);
  };

  const applyAction = async (action: DrawingAction) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;

    switch (action.type) {
      case 'draw':
        context.beginPath();
        context.moveTo(action.data.startX, action.data.startY);
        context.lineTo(action.data.endX, action.data.endY);
        context.strokeStyle = action.data.color;
        context.lineWidth = action.data.lineWidth;
        context.stroke();
        break;
      case 'erase':
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(action.data.x, action.data.y, action.data.radius, 0, Math.PI * 2);
        context.fill();
        context.globalCompositeOperation = 'source-over';
        break;
      // Add other action types as needed
    }
  };

  const resetRecording = () => {
    setCurrentActionIndex(0);
    setIsPlaying(false);
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Session Recording</h2>
          <Button 
            variant="ghost" 
            onClick={onClose}
            style={{ color: theme.text }}
          >
            Close
          </Button>
        </div>

        <div className="relative aspect-video bg-black/10 rounded-lg overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={resetRecording}
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentActionIndex(prev => Math.max(0, prev - 10))}
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            <Rewind className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => isPlaying ? setIsPlaying(false) : playRecording()}
            style={{ 
              backgroundColor: theme.primary,
              color: theme.text 
            }}
          >
            {isPlaying ? (
              <PauseCircle className="h-4 w-4 mr-2" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentActionIndex(prev => 
              Math.min(recordedActions.length - 1, prev + 10)
            )}
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            <FastForward className="h-4 w-4" />
          </Button>

          <select
            value={playbackSpeed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="px-3 py-2 rounded-md"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-full rounded-full transition-all duration-200"
              style={{ 
                width: `${(currentActionIndex / recordedActions.length) * 100}%`,
                backgroundColor: theme.primary 
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm" style={{ color: theme.secondary }}>
            <span>
              {currentActionIndex} / {recordedActions.length} actions
            </span>
            <span>
              {Math.round((currentActionIndex / recordedActions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 