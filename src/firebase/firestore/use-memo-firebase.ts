
'use client';

import { useMemo, useRef } from 'react';

/**
 * A specialized memoization hook for Firebase Firestore objects (Query, DocumentReference).
 * Firestore objects are often recreated on every render if not careful, 
 * which triggers infinite loops in listeners.
 * 
 * This hook uses a stringified key of the dependencies to ensure the 
 * memoized object only changes when the actual data it depends on changes.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // We use a ref to store the memoized value across renders
  const ref = useRef<T | null>(null);
  const depsRef = useRef<string>('');

  const currentDepsKey = JSON.stringify(deps);

  if (currentDepsKey !== depsRef.id) {
    ref.current = factory();
    depsRef.current = currentDepsKey;
  }

  return ref.current as T;
}
