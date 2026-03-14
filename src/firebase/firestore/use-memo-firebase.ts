
'use client';

import { useRef, useEffect } from 'react';

/**
 * A specialized memoization hook for Firebase Firestore objects (Query, DocumentReference).
 * Prevents infinite re-render loops by ensuring the reference only changes when 
 * actual dependencies change.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<T | null>(null);
  const prevDeps = useRef<any[]>([]);

  // We use a manual comparison to avoid JSON.stringify circular issues
  const changed = deps.length !== prevDeps.current.length || deps.some((dep, i) => {
    return dep !== prevDeps.current[i];
  });

  if (changed || ref.current === null) {
    ref.current = factory();
    prevDeps.current = deps;
  }

  return ref.current as T;
}
