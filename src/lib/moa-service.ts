
'use client';

import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { MOA, MOAStatus, User } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Service to handle MOA operations with integrated audit logging.
 * Uses non-blocking firestore updates as per guidelines.
 */
export async function createMOA(db: Firestore, user: User, moaData: Partial<MOA>) {
  const moaRef = doc(collection(db, 'moas'));
  const logRef = doc(collection(db, 'audit_logs'));
  
  const batch = writeBatch(db);
  
  const newMoa = {
    ...moaData,
    id: moaRef.id,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  batch.set(moaRef, newMoa);
  
  batch.set(logRef, {
    userId: user.id,
    userName: user.name,
    operation: 'CREATE',
    moaId: moaRef.id,
    moaName: moaData.companyName,
    details: `Created new MOA for ${moaData.companyName}`,
    timestamp: new Date().toISOString(),
  });

  // Non-blocking commit
  batch.commit().catch(async (err) => {
    if (err.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: 'moas (batch)',
        operation: 'create',
        requestResourceData: newMoa,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  });
}

export async function updateMOA(db: Firestore, user: User, moaId: string, newData: Partial<MOA>) {
  const moaRef = doc(db, 'moas', moaId);
  const logRef = doc(collection(db, 'audit_logs'));
  
  const batch = writeBatch(db);
  
  const updatedData = {
    ...newData,
    updatedAt: new Date().toISOString()
  };

  batch.update(moaRef, updatedData);
  
  batch.set(logRef, {
    userId: user.id,
    userName: user.name,
    operation: 'UPDATE',
    moaId: moaId,
    moaName: newData.companyName,
    details: `Updated record for ${newData.companyName}`,
    timestamp: new Date().toISOString(),
  });

  // Non-blocking commit
  batch.commit().catch(async (err) => {
    if (err.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: `moas/${moaId}`,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  });
}

export async function updateMOAStatus(db: Firestore, user: User, moa: MOA, newStatus: MOAStatus) {
  const moaRef = doc(db, 'moas', moa.id);
  const logRef = doc(collection(db, 'audit_logs'));
  
  const batch = writeBatch(db);
  
  batch.update(moaRef, { 
    status: newStatus,
    updatedAt: new Date().toISOString()
  });
  
  batch.set(logRef, {
    userId: user.id,
    userName: user.name,
    operation: 'UPDATE',
    moaId: moa.id,
    moaName: moa.companyName,
    details: `Updated status to ${newStatus}`,
    timestamp: new Date().toISOString(),
  });

  return batch.commit();
}

export async function softDeleteMOA(db: Firestore, user: User, moa: MOA) {
  const moaRef = doc(db, 'moas', moa.id);
  const logRef = doc(collection(db, 'audit_logs'));
  
  const batch = writeBatch(db);
  
  batch.update(moaRef, { isDeleted: true, updatedAt: new Date().toISOString() });
  
  batch.set(logRef, {
    userId: user.id,
    userName: user.name,
    operation: 'SOFT_DELETE',
    moaId: moa.id,
    moaName: moa.companyName,
    details: 'Moved to Recycle Bin',
    timestamp: new Date().toISOString(),
  });

  // Non-blocking commit
  batch.commit().catch(async (err) => {
    if (err.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: `moas/${moa.id}`,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  });
}

export async function recoverMOA(db: Firestore, user: User, moa: MOA) {
  const moaRef = doc(db, 'moas', moa.id);
  const logRef = doc(collection(db, 'audit_logs'));
  
  const batch = writeBatch(db);
  
  batch.update(moaRef, { isDeleted: false, updatedAt: new Date().toISOString() });
  
  batch.set(logRef, {
    userId: user.id,
    userName: user.name,
    operation: 'RECOVER',
    moaId: moa.id,
    moaName: moa.companyName,
    details: 'Recovered from Recycle Bin',
    timestamp: new Date().toISOString(),
  });

  // Non-blocking commit
  batch.commit().catch(async (err) => {
    if (err.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: `moas/${moa.id}`,
        operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  });
}
