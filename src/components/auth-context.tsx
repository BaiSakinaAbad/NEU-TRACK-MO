'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { isFirebaseConfigValid } from '@/firebase/config';

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
  updateUser: (updatedUser: User) => void;
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
        // Domain validation
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
            // Auto-provision new user as STUDENT
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
              role: 'STUDENT',
              isBlocked: false,
              lastLogin: new Date().toISOString(),
            };
            
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (err: any) {
          if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: `/users/${firebaseUser.uid}`,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
          }
          setError('An error occurred while initializing your profile.');
          setUser(null);
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
      let message = 'Invalid email or password.';
      if (error.code === 'auth/configuration-not-found') {
        message = "Email/Password sign-in is not enabled in the Firebase Console.";
      }
      return { success: false, message };
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigValid) {
      setError("Firebase is not fully configured. Please ensure NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is set in your .env.local file.");
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      hd: 'neu.edu.ph',
      prompt: 'select_account' 
    });

    try {
      setError(null);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      let message = error.message;
      
      if (error.code === 'auth/popup-blocked') {
        message = 'The login popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = 'Login cancelled. Please try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google Sign-in is not enabled in the Firebase Console.';
      } else if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        message = `This domain (${domain}) is not authorized for login. Please add it to "Authorized Domains" in your Firebase Console settings.`;
      }
      
      setError(message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading, error, updateUser }}>
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
