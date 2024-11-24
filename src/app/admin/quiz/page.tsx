'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  explanation: string;
  isQuiz: boolean;
}

const popupVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    backdropFilter: "blur(0px)",
    background: "linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(0,0,0,1) 100%)"
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.5
    }
  },
  hover: {
    scale: 1.02,
    backdropFilter: "blur(12px)",
    background: "linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(0,0,0,0.8) 100%)",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98
  }
};

export default function QuizManagement() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    explanation: '',
    isQuiz: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      const fetchedQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuizQuestion[];
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'quizzes'), {
        question: newQuestion.question,
        options: newQuestion.options,
        explanation: newQuestion.explanation,
        isQuiz: newQuestion.isQuiz,
        createdAt: new Date()
      });
      
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        explanation: '',
        isQuiz: true
      });
      
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'quizzes', questionId));
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Quiz Management
        </h1>

        {/* Add New Question Form */}
        <motion.form 
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 mb-8 shadow-lg border border-gray-800/50 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Add New Question
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">Question</label>
            <input
              type="text"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              className="w-full p-2 rounded bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">Options</label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <span className="bg-gray-800 text-gray-300 px-3 py-2 rounded-l border-y border-l border-gray-700">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 p-2 rounded-r bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">Explanation</label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              className="w-full p-2 rounded bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Add Question
          </motion.button>
        </motion.form>

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Existing Questions
          </h2>
          
          <div className="space-y-4">
            {questions.map((question) => (
              <motion.div
                key={question.id}
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-6 
                           shadow-lg border border-gray-800/50 backdrop-blur-sm
                           hover:border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 
                           transition-all duration-300 relative overflow-hidden
                           before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br 
                           before:from-purple-500/10 before:to-pink-500/10 before:opacity-0 
                           hover:before:opacity-100 before:transition-opacity"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-100">
                    {question.question}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-lg
                             hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                    onClick={() => handleDelete(question.id)}
                  >
                    Delete
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-800 text-gray-300 
                                   rounded-full mr-2 border border-gray-700/50">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-300 pl-2">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                  <strong className="text-gray-300">Explanation:</strong>{' '}
                  {question.explanation}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 