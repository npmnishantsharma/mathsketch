import { rtdb } from '@/lib/firebase';
import { ref, get, onValue, off, set, update, push } from 'firebase/database';

export interface Session {
  id: string;
  createdAt: string;
  lastActive: string;
  createdBy: string;
  participants: string[];
  title?: string;
  status: 'active' | 'ended';
  duration?: number;
  canvas?: {
    elements: any[];
    version: number;
  };
}

export async function getSessions(): Promise<Session[]> {
  const sessionsRef = ref(rtdb, 'sessions');
  const snapshot = await get(sessionsRef);
  
  if (!snapshot.exists()) return [];
  
  return Object.entries(snapshot.val()).map(([id, data]) => ({
    id,
    ...(data as any)
  }));
}

export async function getActiveSessions(): Promise<Session[]> {
  const sessionsRef = ref(rtdb, 'sessions');
  const snapshot = await get(sessionsRef);
  
  if (!snapshot.exists()) return [];
  
  return Object.entries(snapshot.val())
    .filter(([_, data]) => (data as any).status === 'active')
    .map(([id, data]) => ({
      id,
      ...(data as any)
    }));
}

export function subscribeToSession(sessionId: string, callback: (session: Session) => void) {
  const sessionRef = ref(rtdb, `sessions/${sessionId}`);
  onValue(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: sessionId,
        ...snapshot.val()
      });
    }
  });

  return () => off(sessionRef);
}

export async function createSession(userId: string, title?: string): Promise<string> {
  const sessionRef = ref(rtdb, 'sessions');
  const newSessionRef = push(sessionRef);
  
  const session: Omit<Session, 'id'> = {
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    createdBy: userId,
    participants: [userId],
    title,
    status: 'active',
    canvas: {
      elements: [],
      version: 0
    }
  };

  await set(newSessionRef, session);
  return newSessionRef.key!;
}

export async function joinSession(sessionId: string, userId: string) {
  const sessionRef = ref(rtdb, `sessions/${sessionId}`);
  const snapshot = await get(sessionRef);
  
  if (!snapshot.exists()) throw new Error('Session not found');
  
  const session = snapshot.val();
  const participants = session.participants || [];
  
  if (!participants.includes(userId)) {
    await update(sessionRef, {
      participants: [...participants, userId],
      lastActive: new Date().toISOString()
    });
  }
}

export async function leaveSession(sessionId: string, userId: string) {
  const sessionRef = ref(rtdb, `sessions/${sessionId}`);
  const snapshot = await get(sessionRef);
  
  if (!snapshot.exists()) return;
  
  const session = snapshot.val();
  const participants = session.participants || [];
  
  await update(sessionRef, {
    participants: participants.filter((id: string) => id !== userId),
    lastActive: new Date().toISOString()
  });
} 