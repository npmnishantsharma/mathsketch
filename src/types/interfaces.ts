export interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: 'google' | 'email';
  uid: string;
  profileImage?: string;
}

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
  isEditing?: boolean;
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

export interface Theme {
  name: string;
  background: string;
  text: string;
  primary: string;
  secondary: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  preview?: string;
  description?: string;
  price?: number;
}

export interface UserData {
  points: number;
  customThemes?: Theme[];
  currentTheme?: Theme;
  totalQuizzesTaken?: number;
  totalQuizPoints?: number;
  lastQuizDate?: Date;
  quizHistory?: {
    date: string;
    score: number;
    total: number;
    pointsEarned: number;
  }[];
  profileImage?: string;
  lastUpdated?: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin?: boolean;
  createdAt: any; // or Timestamp from firebase
  lastLogin: any; // or Timestamp from firebase
  profileImage?: string;
} 