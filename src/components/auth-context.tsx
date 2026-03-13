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
      setIsLoading(true);
      setError(null);

      if (firebaseUser) {
        // Enforce domain check
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
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
              role: 'STUDENT',
              isBlocked: false,
            };
            // Ensure document is created before continuing
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (err: any) {
          console.error('Firestore initialization error:', err);
          // If Firestore is not ready or rules fail, we still want to stop loading
          // but user will be null, triggering redirect to login
          setUser(null);
          if (err.code === 'permission-denied') {
            setError('Access denied. Please ensure your email domain is @neu.edu.ph and Firestore rules are set to Test Mode.');
          } else {
            setError('Failed to sync user profile with database.');
          }
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
      let message = 'Invalid email or password. Please try again.';
      
      if (error.code === 'auth/configuration-not-found') {
        message = "Email/Password sign-in is not enabled in Firebase Console.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Incorrect email or password.";
      } else if (error.code === 'auth/invalid-credential') {
        message = "Invalid credentials provided.";
      }
      
      return { success: false, message };
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
