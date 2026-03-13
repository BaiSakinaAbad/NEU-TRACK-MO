'use client';

import React, { useMemo, ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * A provider that initializes Firebase once on the client side and provides
 * the Firebase instances to its children.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, firestore, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
