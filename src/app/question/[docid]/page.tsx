'use client';

import { Suspense, lazy } from 'react';
import { useEffect, useState } from 'react';
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

// Lazy load Framer Motion
const motion = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion })));

// Static loading component
const LoadingSpinner = () => (
  <div className="rounded-full h-16 w-16 border-4 border-white border-t-transparent animate-spin" />
);

interface QuizQuestion {
  question: string;
  options: string[];
  explanation: string;
  isQuiz: boolean;
}

// Add interface for QuestionContent props
interface QuestionContentProps {
  question: QuizQuestion;
  selectedOption: number | null;
  handleOptionSelect: (index: number) => void;
  showExplanation: boolean;
}

// Separate QuestionContent component for better code splitting
const QuestionContent = ({ 
  question, 
  selectedOption, 
  handleOptionSelect, 
  showExplanation 
}: QuestionContentProps) => (
  <div className="max-w-2xl mx-auto bg-white/15 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
    <h1 className="text-3xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
      {question.question}
    </h1>
    
    <div className="space-y-4">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleOptionSelect(index)}
          disabled={selectedOption !== null}
          className={`w-full p-4 text-left rounded-lg transition-colors
            ${selectedOption === index 
              ? 'bg-white text-purple-600 font-medium shadow-lg' 
              : 'bg-white/20 text-white hover:bg-white/30'
            } ${selectedOption !== null && selectedOption !== index ? 'opacity-50' : ''}
            disabled:cursor-not-allowed group`}
        >
          <span className="inline-block w-8 h-8 mr-3 text-center rounded-full bg-white/20 group-hover:bg-white/30">
            {String.fromCharCode(65 + index)}
          </span>
          {option}
        </button>
      ))}
    </div>

    {showExplanation && (
      <div className="mt-8 p-6 bg-white/20 rounded-lg border border-white/10 backdrop-blur-sm">
        <h2 className="font-bold mb-3 text-white text-xl">Explanation</h2>
        <p className="text-white leading-relaxed">{question.explanation}</p>
      </div>
    )}
  </div>
);

export default function QuestionPage({ params }: { params: { docid: string } }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const docRef = doc(db, "quizzes", params.docid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Question not found');
        }

        const questionData = docSnap.data();
        setQuestion({
          question: questionData.question,
          options: questionData.options,
          explanation: questionData.explanation,
          isQuiz: questionData.isQuiz,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.docid]);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white">
          Question not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <QuestionContent
          question={question}
          selectedOption={selectedOption}
          handleOptionSelect={handleOptionSelect}
          showExplanation={showExplanation}
        />
      </Suspense>
    </div>
  );
} 