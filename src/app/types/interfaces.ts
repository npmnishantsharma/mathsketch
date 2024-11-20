export interface FontStyle {
  name: string;
  value: string;
}

export interface TextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  isDragging: boolean;
  isEditing: boolean;
  fontStyle?: string;
  touchOffset?: {
    x: number;
    y: number;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  score: number;
  showResults: boolean;
  selectedAnswer: string | null;
  isAnswered: boolean;
}

export interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: 'email' | 'google';
  uid: string;
}

export interface Participant {
  id: string;
  name: string | null;
  lastActive: string;
  photoURL?: string | undefined;
}

export interface CollaborationSession {
  sessionId: string;
  participants: string[];
  code: string;
} 