import { db } from '@/lib/firebase';
import { collection, getDocs, query, updateDoc, doc, orderBy, getDoc, Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  profileImage?: string;
  isAdmin?: boolean;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  provider?: string;
  providerAccountId?: string;
}

export async function getUsers(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

export async function getUser(email: string): Promise<User | null> {
  const userRef = doc(db, 'users', email);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return null;
  
  return {
    id: userDoc.id,
    ...userDoc.data()
  } as User;
}

export async function updateUser(userId: string, data: Partial<User>) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}

export async function toggleUserAdmin(email: string, isAdmin: boolean) {
  const userRef = doc(db, 'users', email);
  await updateDoc(userRef, { isAdmin });
} 