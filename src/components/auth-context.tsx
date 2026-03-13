'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      if (firebaseUser) {
        if (!firebaseUser.email?.endsWith('@neu.edu.ph')) {
          await signOut(auth);
          setUser(null);
          setError('Only institutional @neu.edu.ph email accounts are allowed.');
          setIsLoading(false);
          return;
        }

        try {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.isBlocked) {
              await signOut(auth);
              setUser(null);
              setError('Your account has been blocked. Please contact an administrator.');
            } else {
              setUser({ ...userData, id: firebaseUser.uid });
            }
          } else {
            // New user logic - Default to STUDENT role
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'New User',
              role: 'STUDENT',
              isBlocked: false,
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (err: any) {
          console.error('Firestore error:', err);
          if (err.code === 'unavailable' || err.message?.includes('offline')) {
            setError('Database connection lost. Please check your internet or ensure Firestore is enabled in the Firebase Console.');
          } else {
            setError('Failed to load user profile. Please refresh the page.');
          }
          // We don't sign out here so they can try to refresh/reconnect
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/configuration-not-found') {
        return { 
          success: false, 
          message: "Email/Password sign-in is not enabled. Please go to the Firebase Console > Authentication > Sign-in method and enable 'Email/Password'." 
        };
      }
      if (error.code === 'auth/invalid-api-key') {
        return {
          success: false,
          message: "Invalid API Key. Please ensure your .env.local file contains the correct Firebase credentials."
        };
      }
      return { 
        success: false, 
        message: error.message || "Invalid email or password. Please try again." 
      };
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: 'neu.edu.ph' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
