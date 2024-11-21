"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, ChevronDown } from "lucide-react"
import { rtdb as database } from '@/lib/firebase';
import { ref, push, onValue, off, serverTimestamp, set } from 'firebase/database';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import PingNotification from './PingNotification';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '../types';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  timestamp: number;
}

interface Collaborator {
  displayName: string;
  photoURL: string;
  lastActive: number;
}

interface CollaborativeChatProps {
  sessionId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  theme: Theme;
  collaborators: { [key: string]: Collaborator };
}

interface Mention {
  id: string;
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  message: string;
  timestamp: number;
}

// Add this interface for the API response
interface BotApiResponse {
  message: string;
  status: string;
  data?: {
    type: 'tool' | 'math' | 'general';
    suggestions?: string[];
  };
}

// Add this helper function near the top of the file, before the component
const getTextWidth = (text: string, element: HTMLElement): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;

  // Get the computed style of the input element
  const computedStyle = window.getComputedStyle(element);
  context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

  // Measure the text width
  const metrics = context.measureText(text);
  return metrics.width;
};

export default function CollaborativeChat({ 
  sessionId, 
  userId, 
  userName, 
  userPhoto,
  theme,
  collaborators 
}: CollaborativeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionListPosition, setMentionListPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  // Add a memoized update function
  const updateMessages = useCallback((messagesData: any) => {
    const messagesList = Object.values(messagesData) as ChatMessage[];
    // Sort once and memoize the result
    setMessages(prev => {
      const newMessages = messagesList.sort((a, b) => a.timestamp - b.timestamp);
      // Only update if messages have actually changed
      return JSON.stringify(prev) !== JSON.stringify(newMessages) ? newMessages : prev;
    });
  }, []);

  // Update the messages useEffect
  useEffect(() => {
    if (!sessionId) return;

    const messagesRef = ref(database, `collaborativeSessions/${sessionId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        updateMessages(snapshot.val());
      }
    }, {
      // Add this option to prevent unnecessary updates
      onlyOnce: false
    });

    return () => {
      off(messagesRef);
    };
  }, [sessionId, updateMessages]);

  // Update the mentions useEffect to be more stable
  const updateMentions = useCallback((mentionsData: any) => {
    const mentionsList = Object.values(mentionsData) as Mention[];
    setMentions(prev => {
      const newMentions = mentionsList.sort((a, b) => b.timestamp - a.timestamp);
      return JSON.stringify(prev) !== JSON.stringify(newMentions) ? newMentions : prev;
    });
  }, []);

  useEffect(() => {
    if (!sessionId || !userId) return;

    const mentionsRef = ref(database, `collaborativeSessions/${sessionId}/mentions/${userId}`);
    
    const unsubscribe = onValue(mentionsRef, (snapshot) => {
      if (snapshot.exists()) {
        updateMentions(snapshot.val());
      }
    }, {
      // Add this option to prevent unnecessary updates
      onlyOnce: false
    });

    return () => off(mentionsRef);
  }, [sessionId, userId, updateMentions]);

  // Add debounced collaborators update
  const [stableCollaborators, setStableCollaborators] = useState(collaborators);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStableCollaborators(prev => {
        // Only update if there are actual changes
        return JSON.stringify(prev) !== JSON.stringify(collaborators) ? collaborators : prev;
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [collaborators]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (event: any) => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Update the generateBotResponse function to use the API
  const generateBotResponse = async (userMessage: string): Promise<string> => {
    try {
      // First try to get response from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_URL}/bot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            sessionId,
            userId,
            userName
          }
        })
      });

      if (!response.ok) {
        throw new Error('API response was not ok');
      }

      const data: BotApiResponse = await response.json();
      
      if (data.status === 'success') {
        return data.message;
      }

      // Fallback to local responses if API fails or returns error
      throw new Error('API returned error status');

    } catch (error) {
      console.warn('Failed to get bot response from API, using fallback:', error);
      
      // Fallback responses
      if (userMessage.toLowerCase().includes('help')) {
        return "Hi! I'm here to help. You can ask me about:\n- How to use the drawing tools\n- Math concepts\n- Solving problems\n\nWhat would you like to know?";
      }
      
      if (userMessage.toLowerCase().includes('tool')) {
        return "Here are the main tools:\n️ Brush - Free drawing\n✏️ Text - Add text boxes\n⌨️ Math Keyboard - Special math symbols\n✨ Solve - Get AI help with math";
      }

      if (userMessage.toLowerCase().includes('math') || userMessage.toLowerCase().includes('solve')) {
        return "To solve math problems:\n1. Draw your problem on the canvas\n2. Click the ✨ Sparkle button\n3. I'll help analyze and solve it!\n\nYou can also use the Math Keyboard (⌨️) for complex equations.";
      }

      if (userMessage.toLowerCase().includes('keyboard')) {
        return "The Math Keyboard (⌨️) helps you type mathematical symbols and equations. You'll find:\n- Basic operators (+, -, ×, ÷)\n- Greek letters (α, β, π)\n- Advanced symbols (∫, ∑, √)\n- Fractions and exponents\n\nClick the keyboard icon to show/hide it!";
      }
      
      // Default response
      return "I'm here to help with math and drawing tools. You can ask about:\n- Using specific tools\n- Math concepts\n- Solving problems\n- Keyboard shortcuts\n\nWhat would you like to know more about?";
    }
  };

  // Update handleSendMessage to handle API errors gracefully
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const messagesRef = ref(database, `collaborativeSessions/${sessionId}/messages`);
    
    // Check for @MathSketch mention
    const isMathSketchMentioned = currentMessage.toLowerCase().includes('@mathsketch');
    
    try {
      await push(messagesRef, {
        id: Date.now().toString(),
        userId,
        userName,
        userPhoto,
        content: currentMessage,
        timestamp: serverTimestamp(),
        mentions: mentionedUsers
      });

      setCurrentMessage('');
      setMentionedUsers([]);
      scrollToBottom();

      // Handle bot response if mentioned
      if (isMathSketchMentioned) {
        setIsBotTyping(true);
        
        try {
          // Simulate bot typing delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          const botResponse = await generateBotResponse(currentMessage);
          
          await push(messagesRef, {
            id: Date.now().toString(),
            userId: 'mathsketch-bot',
            userName: 'MathSketch',
            userPhoto: '/mathsketch-avatar.png',
            content: botResponse,
            timestamp: serverTimestamp(),
            isBot: true
          });
        } catch (error) {
          console.error('Error generating bot response:', error);
          
          // Send error message if bot response fails
          await push(messagesRef, {
            id: Date.now().toString(),
            userId: 'mathsketch-bot',
            userName: 'MathSketch',
            userPhoto: '/mathsketch-avatar.png',
            content: "I'm having trouble processing your request right now. Please try again later or ask a different question.",
            timestamp: serverTimestamp(),
            isBot: true,
            isError: true
          });
        } finally {
          setIsBotTyping(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle message send error
      // You could show a toast notification here
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentMessage(newValue);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.slice(atIndex + 1).toLowerCase();
      setMentionSearch(searchTerm);
      setShowMentionList(true);
      
      if (inputRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const textWidth = getTextWidth(textBeforeCursor.slice(0, atIndex), inputRef.current);
        
        setMentionListPosition({
          x: textWidth,
          y: inputRect.height
        });
      }
    } else {
      setShowMentionList(false);
    }

    // Check for mentions
    const mentions = newValue.match(/@(\w+)/g);
    if (mentions) {
      setMentionedUsers(mentions.map(m => m.substring(1)));
    } else {
      setMentionedUsers([]);
    }
  };

  const handleMention = (mentionedUser: { id: string; name: string }) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = currentMessage.slice(0, cursorPosition);
    const textAfterCursor = currentMessage.slice(cursorPosition);
    
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.slice(0, lastAtIndex) + 
      `@${mentionedUser.name} ` + 
      textAfterCursor;
    
    setCurrentMessage(newText);
    setShowMentionList(false);
    
    if (mentionedUser.id !== userId) {
      const mentionsRef = ref(database, `collaborativeSessions/${sessionId}/mentions/${mentionedUser.id}`);
      push(mentionsRef, {
        id: Date.now().toString(),
        from: {
          id: userId,
          name: userName
        },
        to: mentionedUser,
        message: newText,
        timestamp: Date.now()
      });
    }
  };

  const handleMentionSelect = (collaboratorId: string, collaborator: Collaborator) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = currentMessage.slice(0, cursorPosition);
    const textAfterCursor = currentMessage.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      textBeforeCursor.slice(0, lastAtIndex) + 
      `@${collaborator.displayName} ` + 
      textAfterCursor;
    
    setCurrentMessage(newText);
    setShowMentionList(false);
    
    if (collaboratorId !== userId) {
      const mentionsRef = ref(database, `collaborativeSessions/${sessionId}/mentions/${collaboratorId}`);
      push(mentionsRef, {
        id: Date.now().toString(),
        from: {
          id: userId,
          name: userName
        },
        to: {
          id: collaboratorId,
          name: collaborator.displayName
        },
        message: newText,
        timestamp: Date.now()
      });
    }
  };

  // Add this helper function to highlight mentions in messages
  const highlightMentions = (text: string, theme: Theme) => {
    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) { // This is a mention
        return (
          <span
            key={index}
            style={{ 
              color: theme.primary,
              fontWeight: 'bold',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            className="hover:opacity-80 transition-all"
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg"
        style={{ backgroundColor: theme.primary, color: theme.text }}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>

      {/* Mention notifications */}
      <AnimatePresence>
        {mentions.map((mention) => (
          <PingNotification
            key={mention.id}
            message={mention.message}
            sender={mention.from.name}
            theme={theme}
            onDismiss={() => {
              setMentions(prev => prev.filter(m => m.id !== mention.id));
              const mentionRef = ref(database, `collaborativeSessions/${sessionId}/mentions/${userId}/${mention.id}`);
              set(mentionRef, null);
            }}
          />
        ))}
      </AnimatePresence>

      {/* Chat Window - Updated positioning */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-16 right-0 w-80 rounded-lg shadow-xl max-h-[calc(100vh-120px)]"
          style={{ 
            backgroundColor: theme.background, 
            border: `1px solid ${theme.primary}`,
            transform: 'translateY(0)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme.secondary }}>
            <h3 className="font-semibold" style={{ color: theme.text }}>Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              style={{ color: theme.text }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea 
            className="h-96 p-4" 
            ref={scrollAreaRef}
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-2 ${msg.userId === userId ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.userPhoto} />
                    <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div 
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.userId === userId ? 'ml-auto' : ''
                    }`}
                    style={{ 
                      backgroundColor: msg.userId === userId ? theme.primary : theme.secondary,
                      color: theme.text 
                    }}
                  >
                    <div 
                      className="text-xs mb-1 hover:underline cursor-pointer transition-all" 
                      style={{ 
                        color: theme.text + '80',
                        textDecoration: 'none',
                        textDecorationColor: theme.text
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {msg.userId === userId ? 'You' : msg.userName}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {highlightMentions(msg.content, theme)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              className="absolute bottom-20 right-4 rounded-full shadow-lg"
              size="sm"
              onClick={scrollToBottom}
              style={{ backgroundColor: theme.primary, color: theme.text }}
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              New messages
            </Button>
          )}

          {/* Input */}
          <div className="p-3 border-t relative" style={{ borderColor: theme.secondary }}>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder="Type @ to mention someone..."
                className="flex-1"
                style={{ 
                  backgroundColor: theme.secondary,
                  color: theme.text,
                  borderColor: theme.primary
                }}
              />
              <Button
                onClick={handleSendMessage}
                style={{ backgroundColor: theme.primary, color: theme.text }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Mention list */}
            {showMentionList && (
              <div 
                className="absolute left-0 right-0 bottom-full mb-2 rounded-lg shadow-lg overflow-hidden"
                style={{ 
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.primary}`,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {Object.entries(stableCollaborators)
                  .filter(([id, data]) => 
                    id !== userId && 
                    data.displayName.toLowerCase().includes(mentionSearch.toLowerCase())
                  )
                  .map(([id, data]) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:opacity-80 transition-all"
                      style={{ backgroundColor: theme.secondary }}
                      onClick={() => handleMentionSelect(id, data)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={data.photoURL} />
                        <AvatarFallback>{data.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <span style={{ color: theme.text }}>{data.displayName}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
} 