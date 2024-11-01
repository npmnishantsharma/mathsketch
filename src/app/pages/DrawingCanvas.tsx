'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Paintbrush, Eraser, Minus, Plus, Menu, RotateCcw, Sparkles } from "lucide-react"

interface ApiResponse {
  message: string;
  data: {
    expr: string;
    result: string;
    explanation: string;
    assign: boolean;
  }[];
  status: string;
}

const formatMathText = (text: string) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FFFFFF')
  const [lineWidth, setLineWidth] = useState(5)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [showToolbar, setShowToolbar] = useState(true)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showSparklePopup, setShowSparklePopup] = useState(false)
  const [dictOfVars, setDictOfVars] = useState({});
  const [drawingImage, setDrawingImage] = useState('')
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    const resizeCanvas = () => {
      if (canvas && context) {
        const tempCanvas = document.createElement('canvas')
        const tempContext = tempCanvas.getContext('2d')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        tempContext?.drawImage(canvas, 0, 0)

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        context.fillStyle = 'black'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(tempCanvas, 0, 0)

        context.lineCap = 'round'
        context.lineJoin = 'round'
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setShowToolbar(false)
    draw(event)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setShowToolbar(true)
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (context) {
      context.beginPath()
    }
  }

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!context || !canvas) return

    let clientX, clientY

    if ('touches' in event) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out'
    } else {
      context.globalCompositeOperation = 'source-over'
      context.strokeStyle = color
    }
    
    context.lineWidth = lineWidth

    context.lineTo(clientX, clientY)
    context.stroke()
    context.beginPath()
    context.moveTo(clientX, clientY)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (context && canvas) {
      context.fillStyle = 'black'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    setShowResetDialog(false)
    setDictOfVars({});
  }

  const handleSparkleClick = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      const imageDataUrl = canvas.toDataURL('image/png')
      setDrawingImage(imageDataUrl)

      try {
        const response = await fetch('http://localhost:8900/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageDataUrl, dict_of_vars: dictOfVars }),
        })
        const data: ApiResponse = await response.json()
        setApiResponse(data)
      } catch (error) {
        console.error('Error fetching sparkle response:', error)
        setApiResponse({
          message: 'Error',
          data: [{
            expr: '',
            result: 'Error',
            explanation: 'Oops! The sparkles got lost in the cloud.',
            assign: false
          }],
          status: 'error'
        })
      }

      setShowSparklePopup(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        className="touch-none"
      />
      <div
        className={`fixed bottom-0 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out ${
          showToolbar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="mb-4 flex items-center space-x-4 bg-white bg-opacity-10 p-2 rounded-lg shadow-md">
          <Button
            variant={tool === 'brush' ? "default" : "secondary"}
            size="icon"
            onClick={() => setTool('brush')}
            title="Brush"
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? "default" : "secondary"}
            size="icon"
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
            title="Color picker"
          />
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLineWidth(prev => Math.max(prev - 1, 1))}
              title="Decrease brush size"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              value={[lineWidth]}
              onValueChange={([value]) => setLineWidth(value)}
              min={1}
              max={50}
              step={1}
              className="w-24"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLineWidth(prev => Math.min(prev + 1, 50))}
              title="Increase brush size"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="destructive" size="icon" onClick={() => setShowResetDialog(true)} title="Reset canvas">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleSparkleClick}
            title="Sparkle magic"
            className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:from-purple-500 hover:via-pink-600 hover:to-red-600"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`fixed bottom-4 right-4 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 ease-in-out ${
          showToolbar ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        onClick={() => setShowToolbar(true)}
        title="Show toolbar"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reset the canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your current drawing will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearCanvas}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showSparklePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4">solution:</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <img 
                  src={drawingImage} 
                  alt="Your drawing" 
                  className="w-full h-auto rounded-lg max-h-[30vh] object-contain bg-black"
                />
              </div>
              {apiResponse && (
                <div className="space-y-4">
                  {apiResponse.data.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-lg font-medium mb-2">Result: {item.result}</div>
                      <div className="text-gray-600 whitespace-pre-wrap font-mono text-sm">
                        {formatMathText(item.explanation)}
                      </div>
                      {item.expr && (
                        <div className="text-sm text-gray-500 mt-2">
                          Expression: {item.expr}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button onClick={() => setShowSparklePopup(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}