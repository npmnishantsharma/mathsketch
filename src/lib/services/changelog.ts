import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, addDoc } from 'firebase/firestore';

export interface ChangelogEntry {
  id: string;
  date: string;
  version: string;
  tag: string;
  tagColor: string;
  description: string;
  features: {
    text: string;
    image?: string;
  }[];
  images?: string[];
  isCurrent?: boolean
}

export async function getChangelogs(): Promise<ChangelogEntry[]> {
  const changelogsRef = collection(db, 'changelogs');
  const q = query(changelogsRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ChangelogEntry[];
}

export async function createChangelog(changelog: Omit<ChangelogEntry, 'id'>) {
  const changelogsRef = collection(db, 'changelogs');
  const docRef = await addDoc(changelogsRef, changelog);
  return docRef.id;
} 