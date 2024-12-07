'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

interface QuizQuestion {
  question: string;
  options: string[];
  explanation: string;
  isQuiz: boolean;
}

export default function QuestionPage({ params }: { params: { docid: string } }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        // Get the document from Firestore
        const docRef = doc(db, "quizzes", params.docid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Question not found');
        }

        // Get the document data
        const questionData = docSnap.data();
        
        // Set only necessary fields
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="rounded-full h-16 w-16 border-4 border-white border-t-transparent"
      />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white">
        Error: {error}
      </div>
    </div>
  );

  if (!question) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 text-white">
        Question not found
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto bg-white/15 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100"
        >
          {question.question}
        </motion.h1>
        
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              onClick={() => handleOptionSelect(index)}
              disabled={selectedOption !== null}
              className={`w-full p-4 text-left rounded-lg transition-all duration-300
                ${selectedOption === index 
                  ? 'bg-white text-purple-600 font-medium shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
                } ${selectedOption !== null && selectedOption !== index ? 'opacity-50' : ''}
                disabled:cursor-not-allowed group`}
            >
              <motion.span 
                className="inline-block w-8 h-8 mr-3 text-center rounded-full bg-white/20 group-hover:bg-white/30"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {String.fromCharCode(65 + index)}
              </motion.span>
              {option}
            </motion.button>
          ))}
        </div>

        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 p-6 bg-white/20 rounded-lg border border-white/10 backdrop-blur-sm"
          >
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-bold mb-3 text-white text-xl"
            >
              Explanation
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white leading-relaxed"
            >
              {question.explanation}
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 