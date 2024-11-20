"use client"
import React, { useRef, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
//import 
import { v2 as cloudinary } from 'cloudinary' 
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";
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
import { Paintbrush, Eraser, Minus, Plus, Menu, RotateCcw, Sparkles, MessageCircle, Send, Palette, HelpCircle, Type, Keyboard, ChevronUp, ChevronDown, X, Camera, Coins, Users, Share2 } from "lucide-react"
import CanvasIntroduction from './canvas-introduction'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import MathKeyboard from '../components/MathKeyboard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "firebase/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { auth, initAnalytics } from '@/lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import AuthDialog from '../components/AuthDialog';
import { getUserData, saveQuizData, UserData } from '@/lib/firebase-user';
import { ShapesMenu } from '../components/ShapesMenu';
import { ShapeType } from '../shapes/base';
import { Theme } from "../types";
import { FontStyle, TextBox, QuizQuestion, QuizState, UserProfile, Participant } from '../types/interfaces';
import { Shape } from '../shapes/types';
import { createRectangle } from '../shapes/rectangle';
import { createCircle } from '../shapes/circle';
import { createTriangle } from '../shapes/triangle';
import { createLine } from '../shapes/line';
import { createArrow } from '../shapes/arrow';
import { roundedRect } from '../utils/canvas';
import { doc, updateDoc, increment, serverTimestamp, arrayUnion, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { getDatabase, ref, onValue, set, push, off, get, DataSnapshot } from "firebase/database";
import CollabChat from '../components/CollabChat';

interface ApiResponse {
  message: string;
  data: {
    expr: string;
    result: string;
    explanation: string;
    assign: boolean;
    basic_concepts?: string;
    practice_questions?: (string | { question: string; answer: string })[];
    quiz_questions?: QuizQuestion[]; // Add this line
  }[];
  status: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  image?: string;
  content: string;
}

const defaultThemes: Theme[] = [
  {
    name: "Dark",
    background: "#1a1a1a",
    text: "#FFFFFF",
    primary: "#3B82F6",
    secondary: "#6B7280",
  },
  {
    name: "Sepia",
    background: "#F1E7D0",
    text: "#433422",
    primary: "#A0522D",
    secondary: "#8B4513",
  },
  {
    name: "Slate",
    background: "#2C3E50",
    text: "#ECF0F1",
    primary: "#3498DB",
    secondary: "#7F8C8D",
  },
  {
    name: "Ocean",
    background: "#1B2B34",
    text: "#D8DEE9",
    primary: "#5FB3B3",
    secondary: "#4F5B66",
  }
];

const formatMathText = (text: string | undefined) => {
  if (!text) return null;  // Return null if text is undefined
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const saveTheme = (theme: Theme, customThemes: Theme[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentTheme', JSON.stringify(theme));
    localStorage.setItem('customThemes', JSON.stringify(customThemes));
  }
};

const loadSavedTheme = (): { currentTheme: Theme | null, customThemes: Theme[] } => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('currentTheme');
    const savedCustomThemes = localStorage.getItem('customThemes');
    return {
      currentTheme: savedTheme ? JSON.parse(savedTheme) : null,
      customThemes: savedCustomThemes ? JSON.parse(savedCustomThemes) : []
    };
  }
  return { currentTheme: null, customThemes: [] };
};

const fontStyles: FontStyle[] = [
  { name: "Arial", value: "Arial" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Courier New", value: "Courier New" },
  { name: "Georgia", value: "Georgia" },
  { name: "Verdana", value: "Verdana" },
  { name: "Helvetica", value: "Helvetica" },
];

// Update the interface to handle both types of questions
const QuestionBubbles: React.FC<{
  questions: (string | { question: string; answer: string })[];
  theme: Theme;
  onQuestionClick: (question: string) => void;
}> = ({ questions, theme, onQuestionClick }) => {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {questions.map((question, index) => {
        // Get the question text whether it's a string or object
        const questionText = typeof question === 'string' ? question : question.question;
        
        return (
          <button
            key={index}
            onClick={() => onQuestionClick(questionText)}
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all hover:scale-105 shadow-lg"
            style={{ 
              backgroundColor: theme.primary,
              color: theme.text,
              border: `1px solid ${theme.secondary}`,
            }}
          >
            {questionText}
          </button>
        );
      })}
    </div>
  );
};

const CURRENT_UPDATE_CODE = "1.0.1-rwfhs"; // Change this when you want to force show the introduction

const UpdateBadge: React.FC<{ type: 'new' | 'updated' }> = ({ type }) => (
  <span 
    className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
      type === 'new' ? 'bg-green-500' : 'bg-blue-500'
    } text-white`}
  >
    {type === 'new' ? 'NEW' : 'UPD'}
  </span>
);

// Add these props to the component
export interface DrawingCanvasProps {
  isCollaboration?: boolean;
  sessionId?: string;
}

// Add CollaboratorData interface at the top with other interfaces
interface CollaboratorData {
  id: string;
  name: string | null;
  lastActive: string;
  photoURL?: string;  // Make this match the Participant interface
}

interface DrawingData {
  x: number;
  y: number;
  newX: number;
  newY: number;
  color: string;
  lineWidth: number;
  tool: 'brush' | 'eraser' | 'text' | 'shape';  // Update this line
  timestamp: string;
  userId: string;
}

// Add this interface for drawing state
interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  color: string;
  lineWidth: number;
  tool: 'brush' | 'eraser' | 'text' | 'shape';
}

// Update the component definition - remove collaborators from props
export default function DrawingCanvas({ 
  isCollaboration = false, 
  sessionId
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(() => defaultThemes[0].text); // Initialize with default theme's text color
  const [lineWidth, setLineWidth] = useState(5)
  const [tool, setTool] = useState<'brush' | 'eraser' | 'text' | 'shape'>('brush')
  const [showToolbar, setShowToolbar] = useState(true)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showSparklePopup, setShowSparklePopup] = useState(false)
  const [dictOfVars, setDictOfVars] = useState({});
  const [drawingImage, setDrawingImage] = useState('')
  const [isImageUploaded, setIsImageUploaded] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showIntroduction, setShowIntroduction] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';
      const storedUpdateCode = localStorage.getItem('updateCode');
      
      // Show intro if user hasn't seen it or if the update code is different
      return !hasSeenIntro || storedUpdateCode !== CURRENT_UPDATE_CODE;
    }
    return true;
  });
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const { currentTheme: savedTheme } = loadSavedTheme();
    return savedTheme || defaultThemes[0];
  });
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    const { customThemes: savedCustomThemes } = loadSavedTheme();
    return savedCustomThemes || [];
  });
  const [newTheme, setNewTheme] = useState<Theme>({
    name: "",
    background: "#000000",
    text: "#FFFFFF",
    primary: "#3B82F6",
    secondary: "#6B7280",
  })
  const [showNewThemeDialog, setShowNewThemeDialog] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isAddingText, setIsAddingText] = useState(false)
  const [fontSize, setFontSize] = useState(20)
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null)
  const [isEditingText, setIsEditingText] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [fontStyle, setFontStyle] = useState("Arial");
  const [currentQuestions, setCurrentQuestions] = useState<(string | { question: string; answer: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    score: 0,
    showResults: false,
    selectedAnswer: null,
    isAnswered: false,
  });
  const [points, setPoints] = useState(0); // Remove localStorage initialization
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [userDbData, setUserDbData] = useState<UserData | null>(null);
  // Add this near the other state declarations
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [selectedShape, setSelectedShape] = useState<ShapeType | undefined>();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPos, setShapeStartPos] = useState<{ x: number, y: number } | null>(null);
  // Add these new states
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [sessionCollaborators, setSessionCollaborators] = useState<CollaboratorData[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  // Add Firebase Realtime Database refs
  const dbRef = useRef(getDatabase());
  const sessionRef = useRef<string | null>(null);
  // Add state for tracking last position
  const [lastX, setLastX] = useState<number | null>(null);
  const [lastY, setLastY] = useState<number | null>(null);
  // Add new state
  const [showCollabChat, setShowCollabChat] = useState(false);

  useEffect(() => {
    const initializeAnalytics = async () => {
      if (process.env.NEXT_PUBLIC_isFirebaseConnection === "true" || process.env.NEXT_PUBLIC_isFirebaseConnection) {
        const analytics = await initAnalytics();
        if (analytics) {
          setAnalytics(analytics);
        }
      }
    };

    initializeAnalytics();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Determine if the user signed in with Google
        const isGoogleUser = user.providerData[0]?.providerId === 'google.com';
        
        const profile: UserProfile = {  // Explicitly type the profile object
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: isGoogleUser ? 'google' : 'email' as const,  // Use type assertion to narrow the type
          uid: user.uid
        };
        
        setUserProfile(profile);

        // Initialize canvas after login
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        
        if (context && canvas) {
          // Set canvas dimensions
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          
          // Initialize canvas properties
          context.fillStyle = currentTheme.background;
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.strokeStyle = currentTheme.text; // Use theme's text color for stroke
          setColor(currentTheme.text); // Update color state when theme changes
          context.lineWidth = lineWidth;
          context.lineCap = 'round';
          context.lineJoin = 'round';
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, [currentTheme.background, color, lineWidth]); // Add dependencies

  useEffect(() => {
    const fetchUserData = async () => {
      if (userProfile?.uid) {
        const userData = await getUserData(userProfile.uid);
        if (userData) {
          setUserDbData(userData);
        }
      }
    };

    if (userProfile) {
      fetchUserData();
    } else {
      setUserDbData(null);
    }
  }, [userProfile]);

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

        // Use the parent container's dimensions
        const container = canvas.parentElement
        if (container) {
          canvas.width = container.clientWidth
          canvas.height = container.clientHeight
        } else {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        }
        
        context.fillStyle = currentTheme.background
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
  }, [currentTheme.background])

  // Add this new useEffect to reinitialize canvas context when auth state or theme changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    
    if (context && canvas) {
      // Set initial canvas properties
      context.fillStyle = currentTheme.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = currentTheme.text; // Use theme's text color for stroke
      setColor(currentTheme.text); // Update color state when theme changes
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  }, [userProfile, currentTheme]);

  const handleImageClick = (image: string) => {
    const imgElement = document.createElement('img');
    imgElement.src = image;
    imgElement.style.width = '80%';
    imgElement.style.height = '80%';
    imgElement.style.objectFit = 'contain';
    imgElement.style.maxWidth = '800px';
    imgElement.style.maxHeight = '80vh';
    imgElement.style.borderRadius = '12px';
    imgElement.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
    imgElement.style.transition = 'transform 0.3s ease';
    imgElement.style.transformOrigin = '0 0';

    const fullScreenDiv = document.createElement('div');
    fullScreenDiv.style.position = 'fixed';
    fullScreenDiv.style.top = '0';
    fullScreenDiv.style.left = '0';
    fullScreenDiv.style.width = '100vw';
    fullScreenDiv.style.height = '100vh';
    fullScreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    fullScreenDiv.style.backdropFilter = 'blur(8px)';
    fullScreenDiv.style.display = 'flex';
    fullScreenDiv.style.alignItems = 'center';
    fullScreenDiv.style.justifyContent = 'center';
    fullScreenDiv.style.zIndex = '1000';
    fullScreenDiv.style.cursor = 'zoom-in';
    fullScreenDiv.style.transition = 'all 0.2s ease';
    fullScreenDiv.style.animation = 'fadeIn 0.2s ease';

    // Add mousemove handler for zoom effect
    fullScreenDiv.addEventListener('mousemove', (e) => {
      const rect = imgElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate relative position within the image
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      // Apply zoom transform
      imgElement.style.transform = 'scale(1.5)';
      imgElement.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    });

    // Reset zoom on mouseout
    fullScreenDiv.addEventListener('mouseleave', () => {
      imgElement.style.transform = 'scale(1)';
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    fullScreenDiv.onclick = () => {
      fullScreenDiv.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(fullScreenDiv);
        document.head.removeChild(style);
      }, 200);
    };

    fullScreenDiv.appendChild(imgElement);
    document.body.appendChild(fullScreenDiv);
  };
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    console.log('🎨 Starting drawing...', { isCollaboration, sessionId });
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = ('touches' in event ? 
      (event.touches[0].clientX - rect.left) * scaleX : 
      (event.clientX - rect.left) * scaleX
    );
    const y = ('touches' in event ? 
      (event.touches[0].clientY - rect.top) * scaleY : 
      (event.clientY - rect.top) * scaleY
    );

    setLastX(x);
    setLastY(y);
    setIsDrawing(true);

    if (isCollaboration && sessionId && userProfile?.uid) {
      console.log('📡 Syncing drawing start...', { x, y, userId: userProfile.uid });
      const rtdb = getDatabase();
      const drawingRef = ref(rtdb, `sessions/${sessionId}/currentDrawing/${userProfile.uid}`);
      set(drawingRef, {
        isDrawing: true,
        lastX: x,
        lastY: y,
        currentX: x,
        currentY: y,
        color: tool === 'eraser' ? 'transparent' : color,
        lineWidth,
        tool,
        timestamp: new Date().toISOString(),
      }).then(() => {
        console.log('✅ Drawing start synced successfully');
      }).catch(error => {
        console.error('❌ Error syncing drawing start:', error);
      });
    }
  };

  const stopDrawing = () => {
    console.log('🛑 Stopping drawing...');
    setIsDrawing(false);
    setLastX(null);
    setLastY(null);

    if (isCollaboration && sessionId && userProfile?.uid) {
      console.log('📡 Syncing drawing stop...', { userId: userProfile.uid });
      const rtdb = getDatabase();
      const drawingRef = ref(rtdb, `sessions/${sessionId}/currentDrawing/${userProfile.uid}`);
      set(drawingRef, {
        isDrawing: false,
        timestamp: new Date().toISOString(),
      }).then(() => {
        console.log('✅ Drawing stop synced successfully');
      }).catch(error => {
        console.error('❌ Error syncing drawing stop:', error);
      });
    }
  };

  // Add this function to capture canvas state
  const captureCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  // Add this function to load canvas state
  const loadCanvasState = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const img = new Image();
    img.onload = () => {
      context.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  // Update the draw function
  const draw = async (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    console.log('✏️ Drawing...', { isDrawing, tool });
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const newX = ('touches' in event ? 
      (event.touches[0].clientX - rect.left) * scaleX : 
      (event.clientX - rect.left) * scaleX
    );
    const newY = ('touches' in event ? 
      (event.touches[0].clientY - rect.top) * scaleY : 
      (event.clientY - rect.top) * scaleY
    );

    if (isDrawingShape && shapeStartPos && selectedShape) {
      // Shape drawing logic remains the same...
    } else {
      const context = canvas.getContext('2d');
      if (!context) return;

      if (tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = color;
        context.fillStyle = color;
      }
      
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      // Draw a line between points for smoother drawing
      context.beginPath();
      context.moveTo(lastX || newX, lastY || newY);
      context.lineTo(newX, newY);
      context.stroke();

      // Also draw a circle at the current point for better coverage
      context.beginPath();
      context.arc(newX, newY, lineWidth / 2, 0, Math.PI * 2);
      context.fill();

      // Update last position
      setLastX(newX);
      setLastY(newY);

      // Sync drawing data in real-time
      if (isCollaboration && sessionId && userProfile?.uid) {
        try {
          console.log('📡 Syncing drawing data...', {
            lastX,
            lastY,
            newX,
            newY,
            tool,
            userId: userProfile.uid
          });
          const rtdb = getDatabase();
          const drawingRef = ref(rtdb, `sessions/${sessionId}/currentDrawing/${userProfile.uid}`);
          
          await set(drawingRef, {
            isDrawing: true,
            lastX: lastX || newX,
            lastY: lastY || newY,
            currentX: newX,
            currentY: newY,
            color: tool === 'eraser' ? 'transparent' : color,
            lineWidth,
            tool,
            timestamp: new Date().toISOString(),
          });
          console.log('✅ Drawing data synced successfully');
        } catch (error) {
          console.error('❌ Error syncing drawing data:', error);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.fillStyle = currentTheme.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    setShowResetDialog(false);
    setDictOfVars({});
    setTextBoxes([]);
    setSelectedTextBox(null);
    setIsEditingText(false);
    
    // Sync clear action in collaboration mode
    if (isCollaboration && sessionId && userProfile?.uid) {
      try {
        const stateRef = ref(dbRef.current, `sessions/${sessionId}/canvasState`);
        set(stateRef, {
          data: captureCanvasState(),
          timestamp: new Date().toISOString(),
          userId: userProfile.uid,
          action: 'clear'
        });
      } catch (error) {
        console.error('Error syncing canvas clear:', error);
      }
    }

    if (analytics) {
      logEvent(analytics, 'canvas_reset');
    }
  };

  const handleSparkleClick = async () => {
    setShowKeyboard(false);
    setIsLoading(true);
    setShowSparklePopup(true);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        tempContext?.drawImage(canvas, 0, 0);
        
        textBoxes.forEach(textBox => {
          if (tempContext) {
            const scaledFontSize = textBox.fontSize * 1.5;
            tempContext.font = `bold ${scaledFontSize}px Arial`;
            tempContext.fillStyle = textBox.color;
            tempContext.textAlign = 'center';
            tempContext.textBaseline = 'middle';
            
            const lines = textBox.text.split('\n');
            lines.forEach((line: string, index: number) => {
              const yOffset = index * (scaledFontSize * 1.2);
              tempContext.fillText(line, textBox.x, textBox.y + yOffset);
            });
          }
        });

        const imageDataUrl = tempCanvas.toDataURL('image/png');
        setDrawingImage(imageDataUrl);

        try {
          if (analytics) {
            logEvent(analytics, 'solve_attempt');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/calculate`, {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            },
            body: JSON.stringify({ image: imageDataUrl, dict_of_vars: dictOfVars }),
          });
          const data: ApiResponse = await response.json();
          setApiResponse(data);
          
          // Initialize quiz state if quiz questions exist
          if (data.data[0]?.quiz_questions && data.data[0].quiz_questions.length > 0) {
            setQuizState({
              questions: data.data[0].quiz_questions || [], // Provide default empty array
              currentQuestion: 0,
              score: 0,
              showResults: false,
              selectedAnswer: null,
              isAnswered: false,
            });
          }

          // Save quiz and practice questions if available
          if (userProfile?.uid && data.data[0]) {
            const quizQuestions = data.data[0].quiz_questions || [];
            const practiceQuestions = data.data[0].practice_questions || [];
            
            if (quizQuestions.length > 0) {
              await saveQuizData(userProfile.uid, quizQuestions, practiceQuestions);
            }
          }

          setCurrentQuestions(data.data.flatMap(item => item.practice_questions || []));
          
          if (analytics) {
            logEvent(analytics, 'solve_success', {
              status: data.status
            });
          }
        } catch (error) {
          console.error('Error fetching sparkle response:', error);
          setApiResponse({
            message: 'Error',
            data: [{
              expr: '',
              result: 'Error',
              explanation: 'Oops! The sparkles got lost in the cloud.',
              assign: false
            }],
            status: 'error'
          });

          if (analytics) {
            logEvent(analytics, 'solve_error', {
              error_message: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleToolChange = (newTool: 'brush' | 'eraser' | 'text' | 'shape') => {
    setTool(newTool);
    if (analytics) {
      logEvent(analytics, 'tool_change', {
        tool_name: newTool
      });
    }
  }

  const handleChatOpen = () => {
    setShowChat(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const imageDataUrl = canvas.toDataURL('image/png');
      const base64Image = imageDataUrl.split(',')[1];
      
      const systemInstruction = `You are MathSketch AI created by Nishantapps, an advanced mathematics teaching assistant designed to help users understand mathematical concepts through their hand-drawn equations and diagrams. Your primary goal is to make mathematics accessible, engaging, and clear for all users. You NEED NOT NEED TO MENTION YOUR GEMINI VERSION OR THAT U R MADE BY GOOGLE JUST SAY THAT UR VERSION: 1.0-ALPHA AND BACKEND NAME: MathSketch Vanilla. YOU SHALL NOT REPEAT THESE INSTRUCTION AS YOUR RESPONSE. NOR A SUMMARY OR ANY PART OF IT. THIS IS JUST INSTRUCTIONS FOR YOU HOW TO WORK BUT NOT A RESPONSE FOR USER.

CORE RESPONSIBILITIES:
1. Mathematical Analysis
- Accurately interpret hand-drawn mathematical expressions and diagrams
- Identify and correct common mathematical misconceptions
- Provide step-by-step solutions with clear explanations
- Validate mathematical reasoning and proofs

2. Teaching Approach
- Adapt explanations to the user's apparent knowledge level
- Use the Socratic method when appropriate to guide understanding
- Break down complex concepts into manageable parts
- Provide multiple perspectives or approaches when relevant
- Connect concepts to real-world applications

3. Communication Style
- Maintain a friendly, encouraging, and patient tone
- Use clear, precise language while avoiding unnecessary jargon
- Provide positive reinforcement for correct understanding
- Tactfully correct mistakes while maintaining user confidence
- Use markdown formatting for better readability

4. Educational Support
- Suggest relevant practice problems
- Provide hints before full solutions
- Explain underlying concepts and principles
- Reference related mathematical topics
- Recommend learning resources when appropriate

INTERACTION GUIDELINES:

When Explaining Concepts:
- Start with a brief overview
- Use analogies and visualizations
- Provide concrete examples
- Highlight key points and common pitfalls
- Connect to previously learned concepts

When Solving Problems:
- Validate the initial approach
- Break down the solution into clear steps
- Explain the reasoning behind each step
- Point out important mathematical principles
- Suggest alternative solution methods

When Handling Questions:
- Clarify ambiguous queries
- Address the specific question while providing context
- Anticipate follow-up questions
- Encourage deeper understanding
- Guide users to discover answers themselves

When Dealing with Mistakes:
- Acknowledge partial understanding
- Explain why an approach might not work
- Suggest corrections constructively
- Use mistakes as learning opportunities
- Reinforce correct concepts

SPECIAL CONSIDERATIONS:

1. Difficulty Levels:
- Basic: Focus on fundamental concepts and clear examples
- Intermediate: Introduce more complex relationships and proofs
- Advanced: Explore deeper mathematical connections and applications

2. Learning Styles:
- Visual: Use diagrams and graphical explanations
- Verbal: Provide clear written explanations
- Practical: Offer real-world applications
- Analytical: Focus on logical steps and proofs

3. Common Scenarios:
- Homework Help: Guide without giving direct answers
- Concept Review: Provide comprehensive explanations
- Exam Preparation: Focus on key concepts and practice
- General Interest: Explore fascinating mathematical connections

4. Support Features:
- Practice Problems: Offer relevant exercises
- Step-by-Step Solutions: Break down complex problems
- Conceptual Explanations: Focus on understanding
- Visual Aids: Use diagrams when helpful

BOUNDARIES AND LIMITATIONS:
- Do not solve homework problems directly
- Avoid non-mathematical topics
- Maintain academic integrity
- Acknowledge when a question is beyond scope

RESPONSE STRUCTURE:
1. Understanding Check
2. Concept Explanation
3. Step-by-Step Solution (if applicable)
4. Practice Suggestions
5. Related Topics
6. Encouragement/Next Steps

Remember to:
- Be patient with repeated questions
- Encourage mathematical curiosity
- Maintain consistency in explanations
- Focus on building long-term understanding
- Celebrate user progress and insights`;

      const initialHistory = [
        {
          "role": "user",
          "parts": [{
            "text": systemInstruction
          }]
        },
        {
          "role": "user",
          "parts": [
            {
              "inlineData": {
                "data": base64Image,
                "mimeType": "image/png"
              }
            },
            {
              "text": "Explain me this briefly with basic concepts"
            }
          ]
        },
        {
          "parts": [
            {
              "text": `Explanation: ${apiResponse?.data[0].explanation} \n\n Basic Concepts: ${apiResponse?.data[0].basic_concepts}`
            }
          ],
          "role": "model"
        }
      ];
      setChatHistory(initialHistory);

      const initialMessage: ChatMessage = { 
        role: 'assistant',
        image: imageDataUrl,
        content: `\nHello! I'm MathSketch AI, your dedicated mathematics learning assistant. I've analyzed your drawing and I'm here to help you understand the concepts thoroughly. Would you like me to:\n\n1. Explain the basic concepts involved\n2. Break down the solution step-by-step\n3. Provide similar practice problems\n4. Explore related mathematical topics\n\nFeel free to ask any questions! (Alpha Version)` 
      };
      setChatMessages([initialMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '' || isGenerating) return;

    const newUserMessage: ChatMessage = { role: 'user', content: currentMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    try {
      const response = await fetch(`https://${process.env.NEXT_PUBLIC_CHAT_URL}/web/chat/${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          history: chatHistory,
          image: drawingImage
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        const aiResponse: ChatMessage = { 
          role: 'assistant',
          content: data.message 
        };
        setChatMessages(prev => [...prev, aiResponse]);
        setChatHistory(data.history || chatHistory);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThemeChange = async (theme: Theme) => {
    setCurrentTheme(theme);
    setColor(theme.text);

    if (userProfile?.uid) {
      try {
        const userDocRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userDocRef, {
          currentTheme: theme,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving theme to database:', error);
      }
    } else {
      // Fallback to localStorage for non-logged in users
      saveTheme(theme, customThemes);
    }
  };

  const handleNewThemeSubmit = async () => {
    if (newTheme.name.trim() === '') return;
    
    const theme = { ...newTheme };
    const updatedCustomThemes = [...customThemes, theme];
    
    setCustomThemes(updatedCustomThemes);
    setCurrentTheme(theme);
    setColor(theme.text);

    if (userProfile?.uid) {
      try {
        const userDocRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userDocRef, {
          customThemes: updatedCustomThemes,
          currentTheme: theme,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving new theme to database:', error);
      }
    } else {
      // Fallback to localStorage for non-logged in users
      saveTheme(theme, updatedCustomThemes);
    }

    setShowNewThemeDialog(false);
    setNewTheme({
      name: "",
      background: "#000000",
      text: "#FFFFFF",
      primary: "#3B82F6",
      secondary: "#6B7280",
    });
  };

  useEffect(() => {
    if (!showIntroduction) {
      localStorage.setItem('hasSeenIntro', 'true');
      localStorage.setItem('updateCode', CURRENT_UPDATE_CODE);
    }
  }, [showIntroduction]);

  const handleHelpClick = () => {
    setShowIntroduction(true)
  }

  const handleCanvasClick = (e?: React.MouseEvent) => {
    // Handle text box deselection
    if (e && e.target === canvasRef.current) {
      setSelectedTextBox(null);
    }
    // Handle shape deselection
    setSelectedShapeId(null);
  };

  const handleAddTextBox = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
      const newTextBox: TextBox = {
        id: Date.now().toString(),
        text: "Double click to edit",
        x: event.clientX,
        y: event.clientY,
        fontSize,
        color,
        isDragging: false,
        isEditing: true
      }
      setTextBoxes(prev => [...prev, newTextBox])
      setTool('brush')
      setIsAddingText(false)
    }
  }

  const handleTextBoxMouseDown = (event: React.MouseEvent, textBoxId: string) => {
    event.stopPropagation()
    setSelectedTextBox(textBoxId)
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === textBoxId
          ? { ...box, isDragging: true }
          : box
      )
    )
  }

  const handleTextBoxMouseMove = (event: React.MouseEvent) => {
    if (selectedTextBox) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox && box.isDragging
            ? { ...box, x: event.clientX, y: event.clientY }
            : box
        )
      )
    }
  }; // Add this closing brace

  const handleTextBoxMouseUp = () => {
    // Only update the dragging state, don't clear the selection
    setTextBoxes(prev =>
      prev.map(box =>
        box.isDragging ? { ...box, isDragging: false } : box
      )
    );
  };

  const handleTextBoxDoubleClick = (textBox: TextBox) => {
    console.log('Double clicked textbox:', textBox.id);
    setSelectedTextBox(textBox.id);
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === textBox.id
          ? { 
              ...box, 
              isEditing: true,
              // Clear text if it's the default message
              text: box.text === "Double click to edit" ? "" : box.text 
            }
          : box
      )
    );
    setIsEditingText(true);
  };

  const updateTextBox = () => {
    if (selectedTextBox && textInput) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox
            ? { ...box, text: textInput, fontSize, color }
            : box
        )
      )
      setTextInput('')
      setIsEditingText(false)
      setSelectedTextBox(null)
    }
  }

  const handleTextBoxEdit = (event: React.ChangeEvent<HTMLTextAreaElement>, textBoxId: string) => {
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === textBoxId
          ? { ...box, text: event.target.value }
          : box
      )
    )
    console.log('textBoxId', selectedTextBox)
  }

  const handleKeyboardInsert = (text: string) => {
    if (selectedTextBox) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox && box.isEditing
            ? { ...box, text: box.text + text }
            : box
        )
      )
    }
  }

  useEffect(() => {
    if (customThemes.length > 0) {
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
    }
  }, [customThemes]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 72)); // Max font size 72
    if (selectedTextBox) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox
            ? { ...box, fontSize: Math.min(box.fontSize + 2, 72) }
            : box
        )
      );
    }
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 8)); // Min font size 8
    if (selectedTextBox) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox
            ? { ...box, fontSize: Math.max(box.fontSize - 2, 8) }
            : box
        )
      );
    }
  };

  const handleFontStyleChange = (value: string) => {
    setFontStyle(value);
    if (selectedTextBox) {
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox
            ? { ...box, fontStyle: value }
            : box
        )
      );
    }
  };

  const handleTextBoxTouchStart = (event: React.TouchEvent, textBoxId: string) => {
    event.stopPropagation();
    const touch = event.touches[0];
    setSelectedTextBox(textBoxId);
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === textBoxId
          ? { 
              ...box, 
              isDragging: true,
              // Store the initial touch position relative to the textbox position
              touchOffset: {
                x: touch.clientX - box.x,
                y: touch.clientY - box.y
              }
            }
          : box
      )
    );
  };

  const handleTextBoxTouchMove = (event: React.TouchEvent) => {
    if (selectedTextBox) {
      const touch = event.touches[0];
      setTextBoxes(prev =>
        prev.map(box =>
          box.id === selectedTextBox && box.isDragging
            ? { 
                ...box, 
                x: touch.clientX - (box.touchOffset?.x || 0),
                y: touch.clientY - (box.touchOffset?.y || 0)
              }
            : box
        )
      );
    }
  };

  const handleTextBoxTouchEnd = () => {
    setTextBoxes(prev =>
      prev.map(box =>
        box.isDragging ? { ...box, isDragging: false, touchOffset: undefined } : box
      )
    );
  };

  // Add handler for question clicks
  const handleQuestionClick = (question: string) => {
    setCurrentMessage(question);
    setShowChat(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleScroll = (event: any) => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleCameraClick = () => {
    setShowCameraDialog(true);
    startCamera();
  };

  const startCamera = async (deviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Get available camera devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const analyzeImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    try {
      if (analytics) {
        logEvent(analytics, 'image_analysis_attempt');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
        },
        body: JSON.stringify({ image: imageDataUrl, dict_of_vars: dictOfVars }),
      });
      
      const data: ApiResponse = await response.json();
      setApiResponse(data);
      setCurrentQuestions(data.data.flatMap(item => item.practice_questions || []));
      setShowSparklePopup(true);

      if (analytics) {
        logEvent(analytics, 'image_analysis_success', {
          status: data.status
        });
      }

      // Add to chat history
      const newMessage: ChatMessage = {
        role: 'user',
        image: imageDataUrl,
        content: 'I captured this image. Can you analyze it?'
      };
      setChatMessages(prev => [...prev, newMessage]);

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: data.data[0].explanation
      };
      setChatMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Error analyzing image:', error);
      if (analytics) {
        logEvent(analytics, 'image_analysis_error', {
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Save current canvas content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempContext = tempCanvas.getContext('2d');
        tempContext?.drawImage(canvas, 0, 0);

        // Clear canvas and draw video frame
        context.fillStyle = currentTheme.background;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to maintain aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvas.width / canvas.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (videoAspect > canvasAspect) {
          drawHeight = canvas.width / videoAspect;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * videoAspect;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Get the image data and analyze it
        const imageDataUrl = canvas.toDataURL('image/png');
        analyzeImage(imageDataUrl);

        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setShowCameraDialog(false);

        if (analytics) {
          logEvent(analytics, 'camera_capture');
        }
      }
    }
  };

  useEffect(() => {
    if (!showCameraDialog && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [showCameraDialog, stream]);

  // Add this effect to migrate points from localStorage to DB on login
  useEffect(() => {
    const migratePointsFromLocalStorage = async () => {
      if (userProfile?.uid) {
        const localPoints = localStorage.getItem('mathPoints');
        if (localPoints) {
          const points = parseInt(localPoints);
          try {
            const userDocRef = doc(db, 'users', userProfile.uid);
            await updateDoc(userDocRef, {
              points: increment(points),
              lastUpdated: serverTimestamp()
            });
            // Remove points from localStorage after successful migration
            localStorage.removeItem('mathPoints');
          } catch (error) {
            console.error('Error migrating points to database:', error);
          }
        }
      }
    };

    migratePointsFromLocalStorage();
  }, [userProfile?.uid]);

  // Update the updatePoints function to only use DB
  const updatePoints = async (newPoints: number) => {
    // Update state immediately for UI responsiveness
    setPoints(prev => prev + newPoints);

    // Update points in Firebase if user is logged in
    if (userProfile?.uid) {
      try {
        const userDocRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userDocRef, {
          points: increment(newPoints),
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating points in database:', error);
        // Revert the state update if DB update fails
        setPoints(prev => prev - newPoints);
      }
    }
  };

  // Update the handleAnswerSelect function
  const handleAnswerSelect = async (answer: string) => {
    if (quizState.isAnswered) return;

    const currentQuestion = quizState.questions[quizState.currentQuestion];
    const isCorrect = answer === currentQuestion.correctAnswer;

    setQuizState((prev: QuizState) => ({
      ...prev,
      selectedAnswer: answer,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));

    // Add points for correct answers
    if (isCorrect) {
      await updatePoints(10); // Award 10 points for each correct answer
    }

    // Add answer feedback to chat
    const feedbackMessage: ChatMessage = {
      role: 'assistant',
      content: `Question ${quizState.currentQuestion + 1}: ${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}\n\nExplanation: ${currentQuestion.explanation}`
    };
    setChatMessages(prev => [...prev, feedbackMessage]);

    // Log answer to analytics
    if (analytics) {
      logEvent(analytics, 'quiz_answer', {
        is_correct: isCorrect,
        question_number: quizState.currentQuestion + 1
      });
    }
  };

  // Update the handleNextQuestion function
  const handleNextQuestion = async () => {
    if (quizState.currentQuestion === quizState.questions.length - 1) {
      // Quiz completed
      setQuizState((prev: QuizState) => ({ ...prev, showResults: true }));
      
      // Calculate and award bonus points based on performance
      const percentageScore = (quizState.score / quizState.questions.length) * 100;
      let bonusPoints = 0;
      if (percentageScore === 100) {
        bonusPoints = 50; // Perfect score bonus
      } else if (percentageScore >= 80) {
        bonusPoints = 30; // Great performance bonus
      } else if (percentageScore >= 60) {
        bonusPoints = 20; // Good performance bonus
      }
      
      if (bonusPoints > 0) {
        await updatePoints(bonusPoints);
      }

      // Save score to localStorage
      const previousScores = JSON.parse(localStorage.getItem('quizScores') || '[]');
      const newScore = {
        date: new Date().toISOString(),
        score: quizState.score,
        total: quizState.questions.length,
        pointsEarned: (quizState.score * 10) + bonusPoints
      };
      localStorage.setItem('quizScores', JSON.stringify([...previousScores, newScore]));

      // Add completion message to chat with points info
      const completionMessage: ChatMessage = {
        role: 'assistant',
        content: `Quiz completed! 🎉\n\nYou got ${quizState.score} out of ${quizState.questions.length} questions correct (${Math.round((quizState.score / quizState.questions.length) * 100)}%).\n\nPoints earned:\n- Questions: ${quizState.score * 10}\n- Bonus: ${bonusPoints}\n\nWould you like to try another quiz?`
      };
      setChatMessages(prev => [...prev, completionMessage]);

      // Log quiz completion to analytics
      if (analytics) {
        logEvent(analytics, 'quiz_completed', {
          final_score: quizState.score,
          total_questions: quizState.questions.length,
          points_earned: (quizState.score * 10) + bonusPoints
        });
      }

      // Update user's quiz stats in Firebase
      if (userProfile?.uid) {
        try {
          const userDocRef = doc(db, 'users', userProfile.uid);
          await updateDoc(userDocRef, {
            totalQuizzesTaken: increment(1),
            totalQuizPoints: increment((quizState.score * 10) + bonusPoints),
            lastQuizDate: serverTimestamp(),
            quizHistory: arrayUnion({
              date: new Date().toISOString(),
              score: quizState.score,
              total: quizState.questions.length,
              pointsEarned: (quizState.score * 10) + bonusPoints
            })
          });
        } catch (error) {
          console.error('Error updating quiz stats in database:', error);
        }
      }
    } else {
      // Next question
      setQuizState((prev: QuizState) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        isAnswered: false
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add this function to handle unauthorized canvas clicks
  const handleUnauthorizedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAuthDialog(true);
  };

  const handleShapeSelect = (shape: ShapeType) => {
    setTool('shape');
    setSelectedShape(shape);
  };

  // Add helper function to create shapes
  const createShapeByType = (type: ShapeType, x: number, y: number, props: any): Shape => {
    switch (type) {
      case 'rectangle':
        return createRectangle(x, y, props);
      case 'circle':
        return createCircle(x, y, props);
      case 'triangle':
        return createTriangle(x, y, props);
      case 'line':
        return createLine(x, y, props);
      case 'arrow':
        return createArrow(x, y, props);
      // Add other shape cases
      default:
        return createRectangle(x, y, props);
    }
  };

  // Replace all renderShape functions with this combined version
  const renderShape = (context: CanvasRenderingContext2D, shape: Shape) => {
    context.save();
    context.beginPath();
    context.strokeStyle = shape.stroke;
    context.fillStyle = shape.fill;
    context.lineWidth = shape.strokeWidth || 2;

    // Draw the shape
    switch (shape.type) {
      case 'rectangle':
        if (shape.cornerRadius) {
          roundedRect(context, shape.x, shape.y, shape.width, shape.height, shape.cornerRadius);
        } else {
          context.rect(shape.x, shape.y, shape.width, shape.height);
        }
        break;
      case 'circle':
        context.arc(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          shape.radius,
          0,
          2 * Math.PI
        );
        break;
      case 'triangle':
        context.moveTo(shape.x + shape.points[0][0], shape.y + shape.points[0][1]);
        shape.points.slice(1).forEach(point => {
          context.lineTo(shape.x + point[0], shape.y + point[1]);
        });
        context.closePath();
        break;
      case 'line':
        context.moveTo(shape.startX, shape.startY);
        context.lineTo(shape.endX, shape.endY);
        break;
      case 'arrow':
        // Draw line
        context.moveTo(shape.startX, shape.startY);
        context.lineTo(shape.endX, shape.endY);
        context.stroke();

        // Draw arrow head
        const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
        context.beginPath();
        context.moveTo(shape.endX, shape.endY);
        context.lineTo(
          shape.endX - shape.headSize * Math.cos(angle - Math.PI / 6),
          shape.endY - shape.headSize * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
          shape.endX - shape.headSize * Math.cos(angle + Math.PI / 6),
          shape.endY - shape.headSize * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.fillStyle = shape.stroke;
        context.fill();
        break;
    }

    if (shape.fill !== 'transparent') {
      context.fill();
    }
    context.stroke();
    context.restore();
  };

  // Add this function to handle shape selection
  const handleShapeClick = (event: React.MouseEvent, shapeId: string) => {
    event.stopPropagation();
    setSelectedShapeId(shapeId);
  };

  // Add this function to handle canvas click for deselection
  // const handleCanvasClick = () => {
  //   setSelectedShapeId(null);
  // };

  // Add resize handle functions
  const startResizing = (event: React.MouseEvent, handle: string, shapeId: string) => {
    event.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedShapeId(shapeId);
  };

  const handleResize = (event: React.MouseEvent) => {
    if (!isResizing || !selectedShapeId || !resizeHandle) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setShapes(prev => prev.map(shape => {
      if (shape.id !== selectedShapeId) return shape;

      let newWidth = shape.width;
      let newHeight = shape.height;
      let newX = shape.x;
      let newY = shape.y;

      switch (resizeHandle) {
        case 'top-left':
          newWidth = shape.x + shape.width - x;
          newHeight = shape.y + shape.height - y;
          newX = x;
          newY = y;
          break;
        case 'top-right':
          newWidth = x - shape.x;
          newHeight = shape.y + shape.height - y;
          newY = y;
          break;
        case 'bottom-left':
          newWidth = shape.x + shape.width - x;
          newHeight = y - shape.y;
          newX = x;
          break;
        case 'bottom-right':
          newWidth = x - shape.x;
          newHeight = y - shape.y;
          break;
      }

      // Ensure minimum size
      if (newWidth < 10) newWidth = 10;
      if (newHeight < 10) newHeight = 10;

      return {
        ...shape,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        // Update radius for circles
        ...(shape.type === 'circle' && { radius: Math.min(newWidth, newHeight) / 2 }),
      };
    }));

    // Redraw canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = currentTheme.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      shapes.forEach(shape => renderShape(context, shape));
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Add this effect to fetch themes from DB when user logs in
  useEffect(() => {
    const fetchUserThemes = async () => {
      if (userProfile?.uid) {
        try {
          const userDocRef = doc(db, 'users', userProfile.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Get custom themes from DB
            if (userData.customThemes) {
              setCustomThemes(userData.customThemes);
            }
            
            // Get current theme from DB
            if (userData.currentTheme) {
              setCurrentTheme(userData.currentTheme);
              setColor(userData.currentTheme.text);
            }
          } else {
            // If user doc doesn't exist, save default theme
            await updateDoc(userDocRef, {
              currentTheme: defaultThemes[0],
              customThemes: [],
              lastUpdated: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error fetching themes from database:', error);
        }
      }
    };

    fetchUserThemes();
  }, [userProfile?.uid]);

  // Update the collaboration effect
  useEffect(() => {
    if (!isCollaboration || !sessionId || !userProfile?.uid) return;

    const rtdb = getDatabase();
    const drawingsRef = ref(rtdb, `sessions/${sessionId}/currentDrawing`);
    
    const unsubscribe = onValue(drawingsRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const drawingData = snapshot.val();
      console.log('📥 Received drawing data:', drawingData);
      
      Object.entries(drawingData).forEach(([uid, data]: [string, any]) => {
        if (uid === userProfile.uid) return;

        console.log('🎨 Rendering remote drawing:', { uid, data });
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context || !canvas || !data.isDrawing) return;

        // Match the local drawing style
        if (data.tool === 'eraser') {
          context.globalCompositeOperation = 'destination-out';
        } else {
          context.globalCompositeOperation = 'source-over';
          context.strokeStyle = data.color;
          context.fillStyle = data.color;
        }
        
        context.lineWidth = data.lineWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        // Draw line between points
        context.beginPath();
        context.moveTo(data.lastX, data.lastY);
        context.lineTo(data.currentX, data.currentY);
        context.stroke();

        // Draw point at current position
        context.beginPath();
        context.arc(data.currentX, data.currentY, data.lineWidth / 2, 0, Math.PI * 2);
        context.fill();

        console.log('✅ Remote drawing rendered successfully');
      });
    });

    return () => {
      console.log('🧹 Cleaning up collaboration listeners...');
      unsubscribe();
      if (userProfile?.uid) {
        const drawingRef = ref(rtdb, `sessions/${sessionId}/currentDrawing/${userProfile.uid}`);
        set(drawingRef, null).then(() => {
          console.log('✅ Drawing data cleaned up successfully');
        }).catch(error => {
          console.error('❌ Error cleaning up drawing data:', error);
        });
      }
    };
  }, [isCollaboration, sessionId, userProfile?.uid]);

  // Add this function near your other handlers
  const handleCreateCollaboration = async () => {
    if (!userProfile?.uid) {
      setShowAuthDialog(true);
      return;
    }

    try {
      // Generate a random session ID
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Get current canvas state
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      const canvasState = canvas.toDataURL('image/png');
      if (!canvasState) {
        throw new Error('Failed to capture canvas state');
      }

      const rtdb = getDatabase();
      
      // Create session data object - remove the id field
      const sessionData = {
        createdAt: new Date().toISOString(),
        createdBy: userProfile.uid,
        participants: {
          [userProfile.uid]: {
            id: userProfile.uid,
            name: userProfile.displayName,
            lastActive: new Date().toISOString(),
            photoURL: userProfile.photoURL
          }
        },
        lastActive: new Date().toISOString(),
        canvasState: {
          data: canvasState,
          timestamp: new Date().toISOString(),
          userId: userProfile.uid
        }
      };

      // Initialize session in RTDB
      const sessionRef = ref(rtdb, `sessions/${sessionId}`);
      await set(sessionRef, sessionData);

      // Log analytics event
      if (analytics) {
        logEvent(analytics, 'create_collaboration', {
          sessionId: sessionId
        });
      }

      // Redirect to collaboration URL
      window.location.href = `/colab/${sessionId}`;  // Make sure this matches the route

    } catch (error) {
      console.error('Error creating collaboration session:', error);
    }
  };

  // Update the useEffect for collaboration to use RTDB
  useEffect(() => {
    if (!isCollaboration || !sessionId || !userProfile?.uid) return;

    try {
      const rtdb = getDatabase();
      const sessionRef = ref(rtdb, `sessions/${sessionId}`);
      
      // Subscribe to session updates
      const unsubscribe = onValue(sessionRef, (snapshot) => {
        if (snapshot.exists()) {
          const sessionData = snapshot.val();
          if (sessionData.canvasState?.data) {
            loadCanvasState(sessionData.canvasState.data);
          }
        }
      });

      return () => {
        // Cleanup subscription
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up collaboration:', error);
    }
  }, [isCollaboration, sessionId, userProfile?.uid]);

  // Add this effect to track collaborators
  useEffect(() => {
    if (!isCollaboration || !sessionId || !userProfile?.uid) return;

    console.log('🔄 Setting up collaborator tracking...', { sessionId });
    const rtdb = getDatabase();
    const participantsRef = ref(rtdb, `sessions/${sessionId}/participants`);

    const unsubscribe = onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const participantsData = snapshot.val();
        console.log('👥 Received participants data:', participantsData);

        // Convert participants object to array
        const collaborators = Object.entries(participantsData).map(([id, data]: [string, any]) => ({
          id,
          name: data.name,
          lastActive: data.lastActive,
          photoURL: data.photoURL
        }));

        console.log('👥 Updated collaborators:', collaborators);
        setSessionCollaborators(collaborators);
        setActiveSessions(collaborators.length);
        setWsConnected(true);
      } else {
        console.log('ℹ️ No participants data available');
        setSessionCollaborators([]);
        setActiveSessions(0);
        setWsConnected(false);
      }
    });

    // Heartbeat to update last active status
    const heartbeatInterval = setInterval(() => {
      const userRef = ref(rtdb, `sessions/${sessionId}/participants/${userProfile.uid}`);
      set(userRef, {
        id: userProfile.uid,
        name: userProfile.displayName,
        lastActive: new Date().toISOString(),
        photoURL: userProfile.photoURL
      }).catch(error => {
        console.error('❌ Error updating heartbeat:', error);
      });
    }, 30000); // Every 30 seconds

    return () => {
      console.log('🧹 Cleaning up collaborator tracking...');
      unsubscribe();
      clearInterval(heartbeatInterval);
    };
  }, [isCollaboration, sessionId, userProfile?.uid]);

  // Add this effect to clean up inactive participants
  useEffect(() => {
    if (!isCollaboration || !sessionId || !userProfile?.uid) return;

    const cleanupInterval = setInterval(() => {
      const rtdb = getDatabase();
      const participantsRef = ref(rtdb, `sessions/${sessionId}/participants`);
      
      get(participantsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const participantsData = snapshot.val();
          const now = new Date().getTime();
          
          // Remove participants who haven't been active for more than 1 minute
          Object.entries(participantsData).forEach(([id, data]: [string, any]) => {
            const lastActive = new Date(data.lastActive).getTime();
            if (now - lastActive > 60000) { // 1 minute
              console.log('🗑️ Removing inactive participant:', id);
              const inactiveRef = ref(rtdb, `sessions/${sessionId}/participants/${id}`);
              set(inactiveRef, null);
            }
          });
        }
      });
    }, 60000); // Check every minute

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isCollaboration, sessionId, userProfile?.uid]);

  // Update the canvas event handlers
  return (
    <TooltipProvider>
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden" 
        style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
        onMouseMove={userProfile ? handleTextBoxMouseMove : undefined}
        onMouseUp={userProfile ? handleTextBoxMouseUp : undefined}
        onTouchMove={userProfile ? handleTextBoxTouchMove : undefined}
        onTouchEnd={userProfile ? handleTextBoxTouchEnd : undefined}
      >
        {isAuthChecking ? (
          <div 
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: currentTheme.background }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${currentTheme.primary} transparent transparent transparent` }}
                />
              </div>
              <p className="text-lg font-medium animate-pulse" style={{ color: currentTheme.text }}>
                Loading MathSketch...
              </p>
            </div>
          </div>
        ) : !userProfile ? (
          // Unauthorized user view
          <div className="h-full w-full flex flex-col items-center justify-center">
            <div 
              className="max-w-md w-full mx-auto p-8 rounded-lg text-center space-y-6"
              style={{ backgroundColor: currentTheme.secondary + '20' }}
            >
              <h1 className="text-3xl font-bold mb-4">Welcome to MathSketch</h1>
              <p className="text-lg mb-8" style={{ color: currentTheme.secondary }}>
                Sign in to start solving math problems with AI assistance
              </p>
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="w-full py-6 text-lg flex items-center justify-center gap-3 animate-pulse"
                style={{ 
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.text,
                }}
              >
                Sign In to Get Started
              </Button>
              <p className="text-sm" style={{ color: currentTheme.secondary }}>
                Create an account to save your progress and earn points
              </p>
            </div>
          </div>
        ) : (
          // Authorized user view - existing canvas and tools
          <>
            <canvas
              ref={canvasRef}
              onMouseDown={tool === 'text' ? handleAddTextBox : startDrawing}
              onMouseUp={(e) => {
                if (isResizing) {
                  stopResizing();
                } else {
                  stopDrawing();
                }
              }}
              onMouseOut={stopDrawing}
              onMouseMove={(e) => {
                if (isResizing) {
                  handleResize(e);
                } else {
                  draw(e);
                }
              }}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              onClick={handleCanvasClick}
              className="touch-none w-full h-full absolute top-0 left-0"
              style={{ 
                display: 'block',
                cursor: tool === 'text' ? 'text' : 'crosshair',  // Change cursor to crosshair
                touchAction: 'none'  // Prevent default touch behaviors
              }}
            />
            
            {textBoxes.map(textBox => (
              <div
                key={textBox.id}
                className={`absolute cursor-move select-none ${
                  selectedTextBox === textBox.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: textBox.x,
                  top: textBox.y,
                  transform: 'translate(-50%, -50%)',
                  minWidth: '50px',
                  touchAction: 'none', // Prevent default touch behaviors
                }}
                onMouseDown={(e) => handleTextBoxMouseDown(e, textBox.id)}
                onTouchStart={(e) => handleTextBoxTouchStart(e, textBox.id)}
                onTouchMove={handleTextBoxTouchMove}
                onTouchEnd={handleTextBoxTouchEnd}
                onDoubleClick={(e) => handleTextBoxDoubleClick(textBox)}
              >
                {textBox.isEditing ? (
                  <textarea
                    value={textBox.text}
                    onChange={(e) => handleTextBoxEdit(e, textBox.id)}
                    onBlur={() => {
                      setTextBoxes(prev =>
                        prev.map(box =>
                          box.id === textBox.id
                            ? { ...box, isEditing: false }
                            : box
                        )
                      )
                    }}
                    style={{
                      fontSize: `${textBox.fontSize}px`,
                      fontFamily: textBox.fontStyle || fontStyle,
                      color: textBox.color,
                      backgroundColor: 'transparent',
                      border: `2px dashed ${currentTheme.primary}`,
                      borderRadius: '4px',
                      padding: '8px',
                      outline: 'none',
                      resize: 'both',
                      overflow: 'hidden',
                      minWidth: '100px',
                      minHeight: '2em',
                      boxSizing: 'border-box',
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: `${textBox.fontSize}px`,
                      fontFamily: textBox.fontStyle || fontStyle,
                      color: textBox.color,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {textBox.text}
                  </div>
                )}
              </div>
            ))}

            {currentQuestions.length > 0 && (
              <QuestionBubbles
                questions={currentQuestions}
                theme={currentTheme}
                onQuestionClick={handleQuestionClick}
              />
            )}

            <div
              className={`fixed bottom-0 left-0 right-0 flex justify-center transition-all duration-300 ease-in-out ${
                showToolbar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2 bg-opacity-10 p-2 rounded-lg shadow-md max-w-full overflow-x-auto" style={{ backgroundColor: currentTheme.secondary }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={tool === 'brush' ? "default" : "secondary"}
                      size="icon"
                      onClick={() => handleToolChange('brush')}
                      style={{ backgroundColor: tool === 'brush' ? currentTheme.primary : currentTheme.secondary, color: currentTheme.text }}
                    >
                      <Paintbrush className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Brush tool</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={tool === 'eraser' ? "default" : "secondary"}
                      size="icon"
                      onClick={() => handleToolChange('eraser')}
                      style={{ backgroundColor: tool === 'eraser' ? currentTheme.primary : currentTheme.secondary, color: currentTheme.text }}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eraser tool</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Color picker</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLineWidth(prev => Math.max(prev - 1, 1))}
                        style={{ color: currentTheme.text }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Decrease brush size</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Slider
                        value={[lineWidth]}
                        onValueChange={([value]) => setLineWidth(value)}
                        min={1}
                        max={50}
                        step={1}
                        className="w-24 sm:w-32 md:w-40"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adjust brush size</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLineWidth(prev => Math.min(prev + 1, 50))}
                        style={{ color: currentTheme.text }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Increase brush size</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={() => setShowResetDialog(true)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset canvas</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}>
                      <Palette className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Theme</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {defaultThemes.map((theme) => (
                      <DropdownMenuItem 
                        key={theme.name} 
                        onSelect={() => handleThemeChange(theme)}
                        className="flex items-center gap-2"
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-400"
                          style={{ backgroundColor: theme.background }}
                        />
                        {theme.name}
                      </DropdownMenuItem>
                    ))}
                    {customThemes.map((theme) => (
                      <DropdownMenuItem 
                        key={theme.name} 
                        onSelect={() => handleThemeChange(theme)}
                        className="flex items-center gap-2"
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-400"
                          style={{ backgroundColor: theme.background }}
                        />
                        {theme.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setShowNewThemeDialog(true)}>
                      Create New Theme
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={tool === 'text' ? "default" : "secondary"}
                      size="icon"
                      onClick={() => {
                        handleToolChange('text')
                        setIsAddingText(true)
                      }}
                      style={{ backgroundColor: tool === 'text' ? currentTheme.primary : currentTheme.secondary, color: currentTheme.text }}
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Text tool</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setShowKeyboard(!showKeyboard)}
                        style={{ backgroundColor: showKeyboard ? currentTheme.primary : currentTheme.secondary, color: currentTheme.text }}
                      >
                        <Keyboard className="h-4 w-4" />
                      </Button>
                      <UpdateBadge type="new" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Math Keyboard</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleCameraClick}
                      style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save as image</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleSparkleClick}
                      className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:from-purple-500 hover:via-pink-600 hover:to-red-600"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Solve with AI</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <ShapesMenu
                        onShapeSelect={handleShapeSelect}
                        theme={currentTheme}
                        currentShape={selectedShape}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Shapes</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleCreateCollaboration}
                      style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Convert to collaboration session</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => setShowCollabChat(true)}
                      style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open collaboration chat</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`fixed bottom-4 right-4 bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 ease-in-out ${
                    showToolbar ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                  }`}
                  onClick={() => setShowToolbar(true)}
                  style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show toolbar</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogContent style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to reset the canvas?</AlertDialogTitle>
                  <AlertDialogDescription style={{ color: currentTheme.secondary }}>
                    This action cannot be undone. All your current drawing will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCanvas} style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {showSparklePopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" 
                  style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
                  <h2 className="text-2xl font-bold mb-4">Solution:</h2>
                  <div className="flex-1 overflow-y-auto">
                    <div className="mb-4">
                      <img 
                        src={drawingImage} 
                        alt="Your drawing" 
                        className="w-full h-auto rounded-lg max-h-[30vh] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(drawingImage)} 
                        style={{ backgroundColor: currentTheme.background }}
                      />
                    </div>
                    {isLoading ? (
                      <div className="space-y-6">
                        <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary }}>
                          <Skeleton className="h-6 w-1/3 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ) : (
                      apiResponse && (
                        <div className="space-y-6">
                          {apiResponse.data.map((item, index) => (
                            <div key={index} className="space-y-4">
                              {/* Main Result */}
                              <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary }}>
                                <div className="text-lg font-medium mb-2">Result: {item.result}</div>
                                <div className="whitespace-pre-wrap font-mono text-sm" style={{ color: currentTheme.text }}>
                                  {formatMathText(item.explanation)}
                                </div>
                                {item.expr && (
                                  <div className="text-sm mt-2" style={{ color: currentTheme.text }}>
                                    Expression: {item.expr}
                                  </div>
                                )}
                              </div>

                              {/* Basic Concepts Section */}
                              {item.basic_concepts && (
                                <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary }}>
                                  <h3 className="text-lg font-medium mb-2">Basic Concepts:</h3>
                                  <div className="prose prose-invert max-w-none" style={{ color: currentTheme.text }}>
                                    <ReactMarkdown>{item.basic_concepts}</ReactMarkdown>
                                  </div>
                                </div>
                              )}

                              {/* Practice Questions Section */}
                              {item.practice_questions && item.practice_questions.length > 0 && (
                                <div className="p-4 rounded-lg">
                                  <h3 className="text-lg font-medium mb-2">Practice Questions:</h3>
                                  <QuestionBubbles
                                    questions={item.practice_questions}
                                    theme={currentTheme}
                                    onQuestionClick={handleQuestionClick}
                                  />
                                </div>
                              )}

                              {/* Quiz Button - Only show if quiz questions exist */}
                              {item.quiz_questions && item.quiz_questions.length > 0 && (
                                <div className="mt-4 p-4 rounded-lg border-2 border-dashed" 
                                  style={{ borderColor: currentTheme.primary }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium">Ready to Test Your Knowledge?</h3>
                                    <div className="flex items-center gap-2">
                                      <Coins className="h-5 w-5 text-yellow-400" />
                                      <span className="text-sm">Earn up to {(item.quiz_questions.length * 10) + 50} points!</span>
                                    </div>
                                  </div>
                                  <p className="text-sm mb-4" style={{ color: currentTheme.secondary }}>
                                    Take a quiz to test your understanding and earn points. Get 10 points for each correct answer, plus bonus points for high scores!
                                  </p>
                                  <Button
                                    onClick={() => setShowQuiz(true)}
                                    className="w-full group relative overflow-hidden"
                                    style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}
                                  >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                      <Sparkles className="h-4 w-4" />
                                      Take Quiz ({item.quiz_questions.length} questions)
                                    </span>
                                    <div 
                                      className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ mixBlendMode: 'overlay' }}
                                    />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center gap-2">
                    <Button 
                      onClick={() => setShowSparklePopup(false)} 
                      variant="secondary" 
                      style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                    >
                      Close
                    </Button>
                    <div className="flex gap-2">
                      {apiResponse?.data[0].quiz_questions && apiResponse.data[0].quiz_questions.length > 0 && (
                        <Button 
                          onClick={() => setShowQuiz(true)}
                          style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Take Quiz
                          <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                            <Coins className="h-3 w-3 text-yellow-400" />
                            <span className="font-medium">
                              {(apiResponse.data[0].quiz_questions.length * 10) + 50}
                            </span>
                          </div>
                        </Button>
                      )}
                      <Button 
                        onClick={handleChatOpen} 
                        style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Ask follow-up questions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showChat && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4"
              >
                <div 
                  className="rounded-lg p-4 md:p-6 w-full max-w-2xl h-[80vh] flex flex-col" 
                  style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Chat</h2>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowChat(false)}
                      style={{ color: currentTheme.text }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <ScrollArea 
                    className="flex-1 pr-4 relative" 
                    ref={scrollAreaRef}
                    onScrollCapture={handleScroll}
                  >
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-white'
                            }`}
                            style={{ 
                              backgroundColor: message.role === 'user' 
                                ? currentTheme.primary 
                                : currentTheme.secondary 
                            }}
                          >
                            {message.image && (
                              <img 
                                src={message.image} 
                                alt="User Drawing" 
                                className="w-full h-auto rounded-lg max-h-[30vh] object-contain mb-2" 
                                onClick={() => handleImageClick(message.image || '')} 
                              />
                            )}
                            <div className="prose prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="m-0">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
                                  li: ({ children }) => <li className="my-1">{children}</li>,
                                  code: ({ children }) => (
                                    <code className="bg-gray-800 px-1 rounded">{children}</code>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="bg-gray-800 p-2 rounded my-2 overflow-x-auto">
                                      {children}
                                    </pre>
                                  ),
                                  h1: ({ children }) => (
                                    <h1 className="text-xl font-bold my-2">{children}</h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-lg font-bold my-2">{children}</h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-base font-bold my-2">{children}</h3>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic">
                                      {children}
                                    </blockquote>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-bold">{children}</strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="italic">{children}</em>
                                  ),
                                  a: ({ href, children }) => (
                                    <a 
                                      href={href} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:underline"
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Scroll to bottom button - positioned absolutely within ScrollArea */}
                  {showScrollButton && (
                    <div className="sticky bottom-4 right-4 flex justify-end">
                      <Button
                        className="rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center gap-2"
                        size="sm"
                        onClick={scrollToBottom}
                        style={{ 
                          backgroundColor: currentTheme.primary,
                          color: currentTheme.text,
                          opacity: 0.9,
                          zIndex: 50,
                        }}
                      >
                        <ChevronDown className="h-4 w-4" />
                        <span className="text-sm">New messages</span>
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Input
                      type="text"
                      placeholder={isGenerating ? "AI is generating..." : "Type your message..."}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                      disabled={isGenerating}
                      style={{ 
                        backgroundColor: currentTheme.secondary,
                        color: currentTheme.text,
                        borderColor: currentTheme.primary,
                        opacity: isGenerating ? 0.7 : 1,
                        cursor: isGenerating ? 'not-allowed' : 'text'
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isGenerating}
                      style={{ 
                        backgroundColor: currentTheme.primary, 
                        color: currentTheme.text,
                        opacity: isGenerating ? 0.7 : 1,
                        cursor: isGenerating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full" />
                          </div>
                          Generating...
                        </div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <Dialog open={showNewThemeDialog} onOpenChange={setShowNewThemeDialog}>
              <DialogContent style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
                <DialogHeader>
                  <DialogTitle>Create New Theme</DialogTitle>
                  <DialogDescription style={{ color: currentTheme.secondary }}>
                    Customize your new theme colors.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                      className="col-span-3"
                      style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="background" className="text-right">
                      Background
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="background"
                        type="color"
                        value={newTheme.background}
                        onChange={(e) => setNewTheme({ ...newTheme, background: e.target.value })}
                        className="w-12 h-12 p-1 rounded"
                      />
                      <Input
                        value={newTheme.background}
                        onChange={(e) => setNewTheme({ ...newTheme, background: e.target.value })}
                        className="flex-grow"
                        style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="text" className="text-right">
                      Text
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="text"
                        type="color"
                        value={newTheme.text}
                        onChange={(e) => setNewTheme({ ...newTheme, text: e.target.value })}
                        className="w-12 h-12 p-1 rounded"
                      />
                      <Input
                        value={newTheme.text}
                        onChange={(e) => setNewTheme({ ...newTheme, text: e.target.value })}
                        className="flex-grow"
                        style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="primary" className="text-right">
                      Primary
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="primary"
                        type="color"
                        value={newTheme.primary}
                        onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                        className="w-12 h-12 p-1 rounded"
                      />
                      <Input
                        value={newTheme.primary}
                        onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                        className="flex-grow"
                        style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="secondary" className="text-right">
                      Secondary
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="secondary"
                        type="color"
                        value={newTheme.secondary}
                        onChange={(e) => setNewTheme({ ...newTheme, secondary: e.target.value })}
                        className="w-12 h-12 p-1 rounded"
                      />
                      <Input
                        value={newTheme.secondary}
                        onChange={(e) => setNewTheme({ ...newTheme, secondary: e.target.value })}
                        className="flex-grow"
                        style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleNewThemeSubmit} style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}>
                    Create Theme
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="fixed bottom-4 left-4 bg-opacity-10 hover:bg-opacity-20"
                  onClick={handleHelpClick}
                  style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show help</p>
              </TooltipContent>
            </Tooltip>
            <CanvasIntroduction 
              isOpen={showIntroduction} 
              onClose={() => setShowIntroduction(false)} 
            />
            <MathKeyboard 
              onInsert={handleKeyboardInsert}
              theme={currentTheme}
              isVisible={showKeyboard}
              selectedTextBox={selectedTextBox}
              textBoxes={textBoxes}
            />
            <Dialog open={showCameraDialog} onOpenChange={(open) => {
              if (!open && stream) {
                stream.getTracks().forEach(track => track.stop());
              }
              setShowCameraDialog(open);
            }}>
              <DialogContent className="sm:max-w-[600px]" style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
                <DialogHeader>
                  <DialogTitle>Camera</DialogTitle>
                  <DialogDescription style={{ color: currentTheme.secondary }}>
                    Take a picture to add to your canvas
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <Select
                      onValueChange={(value) => startCamera(value)}
                    >
                      <SelectTrigger className="w-[200px]" style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: currentTheme.background }}>
                        {devices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCameraDialog(false)}
                        style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={captureImage}
                        style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}
                      >
                        Capture
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showQuiz} onOpenChange={(open) => !open && setShowQuiz(false)}>
              <DialogContent 
                className="sm:max-w-[600px]" 
                style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {quizState.showResults ? 'Quiz Results' : `Question ${quizState.currentQuestion + 1} of ${quizState.questions.length}`}
                  </DialogTitle>
                  <DialogDescription style={{ color: currentTheme.secondary }}>
                    Test your understanding of the concepts
                  </DialogDescription>
                </DialogHeader>
                
                {!quizState.showResults ? (
                  <div className="space-y-4">
                    {/* Question */}
                    <div className="text-lg font-medium">
                      {quizState.questions[quizState.currentQuestion]?.question}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {quizState.questions[quizState.currentQuestion]?.options.map((option: string, index: number) => (
                        <Button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full justify-start text-left ${
                            quizState.selectedAnswer === option
                              ? option === quizState.questions[quizState.currentQuestion].correctAnswer
                                ? 'bg-green-500'
                                : 'bg-red-500'
                              : ''
                          }`}
                          style={{ 
                            backgroundColor: quizState.selectedAnswer === option 
                              ? option === quizState.questions[quizState.currentQuestion].correctAnswer
                                ? '#22c55e'
                                : '#ef4444'
                              : currentTheme.secondary,
                            color: currentTheme.text,
                            opacity: quizState.isAnswered && option !== quizState.questions[quizState.currentQuestion].correctAnswer ? 0.5 : 1
                          }}
                          disabled={quizState.isAnswered}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {/* Explanation (shown after answering) */}
                    {quizState.isAnswered && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary }}>
                        <h3 className="font-medium mb-2">Explanation:</h3>
                        <p>{quizState.questions[quizState.currentQuestion].explanation}</p>
                      </div>
                    )}

                    {/* Next button */}
                    {quizState.isAnswered && (
                      <Button
                        onClick={handleNextQuestion}
                        className="w-full"
                        style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}
                      >
                        {quizState.currentQuestion === quizState.questions.length - 1 ? 'Show Results' : 'Next Question'}
                      </Button>
                    )}
                  </div>
                ) : (
                  // Results view
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {Math.round((quizState.score / quizState.questions.length) * 100)}%
                      </div>
                      <p className="text-lg">
                        You got {quizState.score} out of {quizState.questions.length} questions correct!
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => setShowQuiz(false)}
                      className="w-full"
                      style={{ backgroundColor: currentTheme.primary, color: currentTheme.text }}
                    >
                      Close Quiz
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <AuthDialog 
              isOpen={showAuthDialog} 
              onClose={() => setShowAuthDialog(false)}
              theme={currentTheme}
            />
            {isCollaboration && showCollabChat && userProfile && (
              <CollabChat
                sessionId={sessionId!}
                userProfile={userProfile} // Now correctly typed
                participants={collaboratorsToRecord(sessionCollaborators)}
                theme={currentTheme}
                onClose={() => setShowCollabChat(false)}
              />
            )}
          </>
        )}

        {/* Auth Dialog */}
        <AuthDialog 
          isOpen={showAuthDialog} 
          onClose={() => setShowAuthDialog(false)}
          theme={currentTheme}
        />

        {/* User profile dropdown - single instance */}
        <div className="fixed top-4 right-4 flex items-center gap-4">
          {!userProfile ? (
            <Button
              onClick={() => setShowAuthDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg animate-fadeIn"
              style={{ 
                backgroundColor: currentTheme.secondary,
                color: currentTheme.text,
                border: `1px solid ${currentTheme.primary}`,
              }}
            >
              Sign In
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8 border-2 hover:border-opacity-80 transition-all" 
                    style={{ borderColor: currentTheme.primary }}>
                    <AvatarImage 
                      src={userDbData?.profileImage || userProfile.photoURL || ''} 
                      alt={userProfile.displayName || ''} 
                    />
                    <AvatarFallback style={{ backgroundColor: currentTheme.secondary, color: currentTheme.text }}>
                      {userProfile.displayName?.charAt(0) || userProfile.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="w-[240px]"
                style={{ 
                  backgroundColor: currentTheme.background,
                  border: `1px solid ${currentTheme.primary}`,
                  color: currentTheme.text 
                }}
              >
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-12 w-12 border-2" style={{ borderColor: currentTheme.primary }}>
                    <AvatarImage src={userDbData?.profileImage || userProfile.photoURL || ''} />
                    <AvatarFallback style={{ backgroundColor: currentTheme.secondary }}>
                      {userProfile.displayName?.charAt(0) || userProfile.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{userProfile.displayName || 'User'}</span>
                    <span className="text-sm" style={{ color: currentTheme.secondary }}>{userProfile.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator style={{ backgroundColor: currentTheme.secondary }} />
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">Points: {points}</span>
                  </div>
                  <div className="text-xs" style={{ color: currentTheme.secondary }}>
                    Keep solving to earn more!
                  </div>
                </div>
                <DropdownMenuSeparator style={{ backgroundColor: currentTheme.secondary }} />
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Active Sessions</span>
                    </div>
                    {wsConnected ? (
                      <span 
                        className="text-xs font-medium"
                        style={{ color: '#22c55e' }} // Using green-500 color
                      >
                        {activeSessions}
                      </span>
                    ) : (
                      <span 
                        className="text-xs"
                        style={{ color: currentTheme.secondary }}
                      >
                        Offline
                      </span>
                    )}
                  </div>
                  {wsConnected && (
                    <div className="text-xs" style={{ color: currentTheme.secondary }}>
                      {activeSessions === 1 
                        ? "You're the only one online" 
                        : `${activeSessions - 1} other ${activeSessions === 2 ? 'person is' : 'people are'} online`
                      }
                    </div>
                  )}
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer p-3"
                  onClick={handleSignOut}
                  style={{ color: currentTheme.text }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {userProfile && wsConnected && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="fixed top-4 left-4 flex items-center gap-2 cursor-help">
                <Users className="h-4 w-4" />
                <span 
                  className="text-sm font-medium"
                  style={{ color: '#22c55e' }} // Using green-500 color
                >
                  {activeSessions}
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              className="w-60"
              style={{ 
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                border: `1px solid ${currentTheme.primary}`
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">Active Sessions</div>
                <p className="text-xs" style={{ color: currentTheme.secondary }}>
                  {activeSessions === 1 
                    ? "You're the only one using MathSketch right now" 
                    : `${activeSessions - 1} other ${activeSessions === 2 ? 'person is' : 'people are'} using MathSketch on this account`
                  }
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
        {isCollaboration && (
          <div className="fixed top-4 left-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {sessionCollaborators.length} collaborator{sessionCollaborators.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Add this helper function to convert collaborators array to record
const collaboratorsToRecord = (collaborators: CollaboratorData[]): Record<string, Participant> => {
  return collaborators.reduce((acc, collaborator) => {
    const participant: Participant = {
      id: collaborator.id,
      name: collaborator.name,
      lastActive: collaborator.lastActive,
      // Only include photoURL if it's defined and not null
      ...(collaborator.photoURL && { photoURL: collaborator.photoURL })
    };
    acc[collaborator.id] = participant;
    return acc;
  }, {} as Record<string, Participant>);
};