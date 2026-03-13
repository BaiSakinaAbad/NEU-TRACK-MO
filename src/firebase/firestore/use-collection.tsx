'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc: QueryDocumentSnapshot<T>) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setIsLoading(false);
      },
      async (err) => {
        if (err.code === 'permission-denied') {
          // Try to extract a path from the query object if it's a collection reference
          const path = (query as any)._query?.path?.segments?.join('/') || (query as any).path || 'unknown (collection query)';
          
          const permissionError = new FirestorePermissionError({
            path: path,
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