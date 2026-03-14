
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A robust hook for real-time Firestore collections.
 * Includes protection against infinite loops and better error reporting.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Track the current query to avoid redundant loading states
  const lastQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      setData([]);
      return;
    }

    // Determine if this is a genuinely new query path/definition
    const queryKey = (query as any)._query?.path?.segments?.join('/') || 'query';
    
    if (lastQueryRef.current !== queryKey) {
      setIsLoading(true);
      lastQueryRef.current = queryKey;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc: QueryDocumentSnapshot<T>) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setIsLoading(false);
        setError(null);
      },
      async (err) => {
        if (err.code === 'permission-denied') {
          const path = (query as any)._query?.path?.segments?.join('/') || (query as any).path || 'unknown collection';
          const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        } else if (err.code === 'failed-precondition') {
          // This usually means a missing index!
          console.error("Firestore Index Required: ", err.message);
          // We don't throw here to avoid crashing the whole app, 
          // but we surface it in the console with the link to create the index.
        }
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, isLoading, error };
}
