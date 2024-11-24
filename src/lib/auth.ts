import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

const ADMIN_EMAILS = [
  'admin@example.com',
  'another-admin@example.com',
  'nishantapps55@gmail.com'
];

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user?.email) {
        // Get user data from Firestore
        const userRef = doc(db, 'users', session.user.email);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Update session with Firestore data
        session.user = {
          ...session.user,
          ...userData,
          isAdmin: token.isAdmin as boolean,
          id: userDoc.id,
        };
      }
      return session;
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.isAdmin = ADMIN_EMAILS.includes(user.email ?? '');
        token.id = user.email; // Use email as ID
      }
      return token;
    },
    signIn: async ({ user, account, profile }) => {
      if (!user.email) return false;

      const userRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userRef);

      const userData = {
        email: user.email,
        displayName: user.name,
        image: user.image,
        isAdmin: ADMIN_EMAILS.includes(user.email),
        lastLogin: Timestamp.now(),
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
        createdAt: userDoc.exists() ? userDoc.data().createdAt : Timestamp.now(),
      };

      if (!userDoc.exists()) {
        await setDoc(userRef, userData);
      } else {
        await updateDoc(userRef, userData);
      }

      return true;
    }
  }
};

export const getAuthSession = () => getServerSession(authOptions); 