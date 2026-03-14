'use client';

import { useRef } from 'react';

/**
 * A highly stable memoization hook for Firebase Firestore objects.
 * Uses strict reference comparison to prevent infinite re-render loops.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<T | null>(null);
  const prevDeps = useRef<any[]>([]);

  const changed = 
    prevDeps.current.length !== deps.length || 
    deps.some((dep, i) => dep !== prevDeps.current[i]);

  if (changed || ref.current === null) {
    ref.current = factory();
    prevDeps.current = deps;
  }

  return ref.current as T;
}
