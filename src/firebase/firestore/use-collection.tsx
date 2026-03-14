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
 * Robust hook for real-time Firestore collections.
 * Optimized to prevent UI flicker and redundant state updates.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(!!query);
  const [error, setError] = useState<Error | null>(null);
  
  const queryRef = useRef<string>('');

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      setData([]);
      return;
    }

    // Identify the query to avoid resetting loading unnecessarily
    const currentQueryKey = JSON.stringify((query as any)._query || {});
    if (queryRef.current !== currentQueryKey) {
      setIsLoading(true);
      queryRef.current = currentQueryKey;
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
          const path = (query as any)._query?.path?.segments?.join('/') || 'collection';
          const permissionError = new FirestorePermissionError({
            path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, isLoading, error };
}
