'use client';

import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  enableMultiTabIndexedDbPersistence 
} from 'firebase/firestore';
import { firebaseConfig } from './config';

// Singletons to prevent re-initialization issues in HMR
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

/**
 * Initializes and returns the Firebase app and its services.
 * This is designed to be used on the client side.
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);

    // Enable persistence for offline support
    if (typeof window !== 'undefined' && firebaseConfig.projectId) {
      enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence unimplemented: Browser not supported.');
        }
      });
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
  }

  return { app, auth, firestore };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
export { useMemoFirebase } from './firestore/use-memo-firebase';
