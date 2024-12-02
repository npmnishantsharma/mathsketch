import { auth, db } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Date;
  lastLogin: Date;
  points: number;
  profileImage: string | null;
  geminiApiKey?: string;
}

export interface QuizData {
  userId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  createdAt: Date;
  isQuiz: boolean;
}

export const createUserDocument = async (user: User) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);

  try {
    // Check if user document already exists
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Create new user document
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date(),
        lastLogin: new Date(),
        points: 0,
        profileImage: user.photoURL,
      };
      await setDoc(userRef, userData);
      console.log('User document created successfully');
      return userData;
    } else {
      // Update last login for existing user
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      console.log('User last login updated successfully');
      return docSnap.data() as UserData;
    }
  } catch (error) {
    console.error('Error creating/updating user document:', error);
    throw error;
  }
};

export const updateUserProfileImage = async (uid: string, imageBase64: string) => {
  if (!uid) return;

  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(userRef, { profileImage: imageBase64 }, { merge: true });
    console.log('Profile image updated successfully');
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  if (!uid) return null;

  const userRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const saveQuizData = async (
  userId: string, 
  quizQuestions: any[], 
  practiceQuestions: any[]
) => {
  if (!userId) return;
  if (!quizQuestions.length && !practiceQuestions.length) return;

  const quizCollectionRef = collection(db, 'quizzes');
  
  try {
    // Save quiz questions
    for (const quiz of quizQuestions) {
      const quizData: QuizData = {
        userId,
        question: quiz.question,
        options: quiz.options,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
        createdAt: new Date(),
        isQuiz: true
      };
      await addDoc(quizCollectionRef, quizData);
    }

    // Save practice questions in the same format
    for (const practice of practiceQuestions) {
      // Only process if it's in the correct format
      if (practice.question && practice.options && practice.correctAnswer) {
        const practiceData: QuizData = {
          userId,
          question: practice.question,
          options: practice.options,
          correctAnswer: practice.correctAnswer,
          explanation: practice.explanation || '',
          createdAt: new Date(),
          isQuiz: false
        };
        await addDoc(quizCollectionRef, practiceData);
      }
    }
    
    console.log('Quiz and practice data saved successfully');
  } catch (error) {
    console.error('Error saving quiz/practice data:', error);
    throw error;
  }
};

export const getUserQuizzes = async (userId: string, isQuiz?: boolean): Promise<QuizData[]> => {
  if (!userId) return [];

  try {
    const quizCollectionRef = collection(db, 'quizzes');
    const querySnapshot = await getDoc(doc(quizCollectionRef, userId));
    
    if (querySnapshot.exists()) {
      const data = querySnapshot.data().quizzes as QuizData[];
      // If isQuiz is specified, filter by question type
      if (typeof isQuiz === 'boolean') {
        return data.filter(quiz => quiz.isQuiz === isQuiz);
      }
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    return [];
  }
}; 