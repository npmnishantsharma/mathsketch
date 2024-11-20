'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, X, AtSign, Bell, Users } from "lucide-react"
import { Theme } from "@/types/index"
import { UserProfile } from "@/types/interfaces"
import { getDatabase, ref, push, onValue, set } from "firebase/database"
import NotificationBadge from './NotificationBadge';

interface Participant {
  id: string;
  name: string | null;
  lastActive: string;
  photoURL?: string;
}

interface CollabChatProps {
  sessionId: string;
  userProfile: UserProfile;
  participants: Record<string, Participant>;
  theme: Theme;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  mentions: string[];
}

interface MentionSuggestion {
  id: string;
  name: string;
  type: 'user' | 'special';
  description?: string;
}

const SPECIAL_MENTIONS: MentionSuggestion[] = [
  {
    id: 'everyone',
    name: '@everyone',
    type: 'special',
    description: 'Notify all participants'
  },
  {
    id: 'here',
    name: '@here',
    type: 'special',
    description: 'Notify active participants'
  }
];

const MENTION_TIPS = [
  {
    title: "How to mention users",
    tips: [
      "Type @ to show a list of participants",
      "Click a name or use arrow keys to select",
      "Press Enter or click to insert the mention",
      "Mentioned users will receive a notification"
    ]
  },
  {
    title: "Mention shortcuts",
    tips: [
      "@everyone - Mention all participants",
      "@here - Mention active participants",
      "Up/Down arrows to navigate suggestions",
      "Esc to close suggestions"
    ]
  }
];

const CollaboratorList = ({ participants, theme, currentUserId }: {
  participants: Record<string, Participant>;
  theme: Theme;
  currentUserId: string;
}) => {
  const sortedParticipants = Object.values(participants).sort((a, b) => {
    const aActive = new Date(a.lastActive).getTime();
    const bActive = new Date(b.lastActive).getTime();
    const now = new Date().getTime();
    const aOnline = now - aActive < 30000;
    const bOnline = now - bActive < 30000;
    
    if (aOnline !== bOnline) return bOnline ? 1 : -1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="border-b" style={{ borderColor: theme.secondary }}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Collaborators ({sortedParticipants.length})</span>
          </h3>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {sortedParticipants.map((participant) => {
            const lastActive = new Date(participant.lastActive).getTime();
            const now = new Date().getTime();
            const isOnline = now - lastActive < 30000;
            
            return (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: theme.secondary + '10' }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback style={{ backgroundColor: theme.primary }}>
                        {participant.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span 
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
                        style={{ 
                          backgroundColor: '#22c55e',
                          borderColor: theme.background
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium flex items-center gap-1">
                      {participant.name}
                      {participant.id === currentUserId && (
                        <span 
                          className="text-xs px-1 rounded"
                          style={{ backgroundColor: theme.primary + '20' }}
                        >
                          you
                        </span>
                      )}
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: theme.secondary }}
                    >
                      {isOnline ? 'Active now' : `Last seen ${new Date(lastActive).toLocaleTimeString()}`}
                    </span>
                  </div>
                </div>
                <div 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: isOnline ? '#22c55e20' : theme.secondary + '20',
                    color: isOnline ? '#22c55e' : theme.secondary
                  }}
                >
                  {isOnline ? 'Online' : 'Away'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function CollabChat({ sessionId, userProfile, participants, theme, onClose }: CollabChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rtdb = getDatabase();
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionSearchText, setMentionSearchText] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const [selectionStart, setSelectionStart] = useState<number>(0);

  // Listen for new messages
  useEffect(() => {
    const messagesRef = ref(rtdb, `sessions/${sessionId}/chat`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList = Object.entries(messagesData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setMessages(messagesList.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [sessionId, rtdb]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Extract mentions using @username pattern
    const mentions = message.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
    
    // Create message object
    const newMessage: Omit<ChatMessage, 'id'> = {
      userId: userProfile.uid,
      userName: userProfile.displayName || 'Anonymous',
      content: message,
      timestamp: new Date().toISOString(),
      mentions
    };

    try {
      // Add message to chat
      const chatRef = ref(rtdb, `sessions/${sessionId}/chat`);
      await push(chatRef, newMessage);

      // Send notifications for mentions
      if (mentions.length > 0) {
        const notificationsRef = ref(rtdb, `sessions/${sessionId}/notifications`);
        mentions.forEach(async (mention) => {
          const mentionedUser = Object.values(participants).find(p => 
            p.name?.toLowerCase() === mention.toLowerCase()
          );
          if (mentionedUser) {
            await push(notificationsRef, {
              userId: mentionedUser.id,
              type: 'mention',
              from: userProfile.displayName,
              message: message,
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      setMessage('');
      setShowMentions(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '@') {
      const start = e.currentTarget.selectionStart || 0;
      setMentionStartIndex(start);
      setSelectionStart(start);
      setMentionSearchText('');
      setMentionSuggestions(getMentionSuggestions(''));
      setSelectedMentionIndex(0);
    } else if (mentionStartIndex !== -1) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : mentionSuggestions.length - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < mentionSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (mentionSuggestions.length > 0) {
            insertMention(mentionSuggestions[selectedMentionIndex]);
          }
          break;
        case 'Escape':
          setMentionStartIndex(-1);
          setMentionSuggestions([]);
          break;
        case ' ':
          setMentionStartIndex(-1);
          setMentionSuggestions([]);
          break;
      }
    }
  };

  const insertMention = (suggestion: MentionSuggestion) => {
    const beforeMention = message.slice(0, mentionStartIndex);
    const afterMention = message.slice(message.length);
    setMessage(`${beforeMention}@${suggestion.name} ${afterMention}`);
    setMentionStartIndex(-1);
    setMentionSuggestions([]);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    if (mentionStartIndex !== -1) {
      const currentPosition = e.target.selectionStart || 0;
      const searchText = newValue.slice(mentionStartIndex + 1, currentPosition);
      setMentionSearchText(searchText);
      setMentionSuggestions(getMentionSuggestions(searchText));
    }
  };

  const getMentionSuggestions = (searchText: string): MentionSuggestion[] => {
    const userSuggestions: MentionSuggestion[] = Object.values(participants)
      .filter(p => p.name?.toLowerCase().includes(searchText.toLowerCase()))
      .map(p => ({
        id: p.id,
        name: p.name || '',
        type: 'user'
      }));

    const specialSuggestions = SPECIAL_MENTIONS.filter(m => 
      m.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return [...userSuggestions, ...specialSuggestions];
  };

  const filteredParticipants = Object.values(participants).filter(p =>
    p.name?.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div 
      className="fixed right-4 bottom-20 w-80 rounded-lg shadow-lg"
      style={{ backgroundColor: theme.background, border: `1px solid ${theme.secondary}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme.secondary }}>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge
            sessionId={sessionId}
            userId={userProfile.uid}
            theme={theme}
          />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collaborator List */}
      <CollaboratorList 
        participants={participants}
        theme={theme}
        currentUserId={userProfile.uid}
      />

      {/* Messages */}
      <ScrollArea className="h-96 p-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-2 mb-4 ${msg.userId === userProfile.uid ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={participants[msg.userId]?.photoURL || ''} />
              <AvatarFallback style={{ backgroundColor: theme.primary }}>
                {msg.userName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div 
              className={`rounded-lg p-2 max-w-[70%] ${
                msg.userId === userProfile.uid ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">{msg.userName}</div>
              <div className="break-words">
                {msg.content.split(/(@\w+)/).map((part, index) => {
                  if (part.startsWith('@')) {
                    const username = part.substring(1);
                    const isMentionedUser = username.toLowerCase() === userProfile.displayName?.toLowerCase();
                    return (
                      <span
                        key={index}
                        style={{
                          color: isMentionedUser ? theme.primary : theme.text,
                          fontWeight: isMentionedUser ? 'bold' : 'normal',
                          backgroundColor: isMentionedUser ? `${theme.primary}20` : 'transparent',
                          padding: isMentionedUser ? '0 4px' : '0',
                          borderRadius: '4px',
                        }}
                      >
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Mention suggestions */}
      {mentionSuggestions.length > 0 && (
        <div 
          className="absolute left-0 right-0 bottom-[100%] rounded-t-lg shadow-lg mb-1"
          style={{ 
            backgroundColor: theme.background,
            border: `1px solid ${theme.secondary}`,
            borderBottom: 'none',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <div className="sticky top-0 p-2 border-b z-10" 
            style={{ 
              backgroundColor: theme.background,
              borderColor: theme.secondary 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: theme.primary }} />
                <span className="text-sm font-medium">
                  {mentionSuggestions.length} Collaborator{mentionSuggestions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: theme.secondary + '20' }}>
            {/* Active collaborators first */}
            {mentionSuggestions
              .filter(s => s.type === 'user')
              .sort((a, b) => {
                const aActive = new Date(participants[a.id]?.lastActive || 0).getTime();
                const bActive = new Date(participants[b.id]?.lastActive || 0).getTime();
                return bActive - aActive;
              })
              .map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-opacity-10 ${
                    index === selectedMentionIndex ? 'bg-opacity-20' : 'bg-opacity-0'
                  }`}
                  style={{ 
                    backgroundColor: theme.secondary,
                    borderLeft: index === selectedMentionIndex ? `2px solid ${theme.primary}` : 'none'
                  }}
                  onClick={() => insertMention(suggestion)}
                  onMouseEnter={() => setSelectedMentionIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={participants[suggestion.id]?.photoURL || ''} />
                      <AvatarFallback style={{ backgroundColor: theme.primary }}>
                        {suggestion.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{suggestion.name}</span>
                        {suggestion.id === userProfile.uid && (
                          <span 
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ 
                              backgroundColor: theme.primary + '20',
                              color: theme.primary 
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: theme.secondary }}>
                        {(() => {
                          const lastActive = new Date(participants[suggestion.id]?.lastActive || 0);
                          const now = new Date();
                          const diff = now.getTime() - lastActive.getTime();
                          if (diff < 30000) return 'Active now';
                          if (diff < 60000) return 'Active < 1m ago';
                          if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`;
                          return `Last seen ${lastActive.toLocaleTimeString()}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {/* Special mentions at the bottom */}
            {mentionSuggestions
              .filter(s => s.type === 'special')
              .map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-opacity-10"
                  style={{ backgroundColor: theme.secondary + '10' }}
                  onClick={() => insertMention(suggestion)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primary + '20' }}
                    >
                      <Users className="w-4 h-4" style={{ color: theme.primary }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{suggestion.name}</span>
                      <span className="text-xs" style={{ color: theme.secondary }}>
                        {suggestion.description}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t relative" style={{ borderColor: theme.secondary }}>
        {/* Replace MentionTips with UserList when @ is typed and no specific mention is being entered */}
        {message.includes('@') && !showMentions && (
          <CollaboratorList 
            participants={participants}
            theme={theme}
            currentUserId={userProfile.uid}
          />
        )}
        
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type @ to mention someone..."
            className="flex-1"
            style={{ backgroundColor: theme.secondary + '20' }}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            style={{ 
              backgroundColor: message.trim() ? theme.primary : theme.secondary,
              opacity: message.trim() ? 1 : 0.5
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 