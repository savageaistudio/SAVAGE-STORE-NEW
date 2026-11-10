import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBd5Rk5m3CD6HgvA2x1s1ho9PDmPOdCsoI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "savage-store-d153a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "savage-store-d153a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "savage-store-d153a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "362231763619",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:362231763619:web:4b00668b1b06a08fa7a516"
};

// Designated administrator credentials from configuration
export const PRIMARY_ADMIN_UID = "h5SWaCFwWiRPtRYcDJNtlCgF2yH3";
export const PRIMARY_ADMIN_EMAIL = "strvboys512@gmail.com";
export const AUTHORIZED_ADMIN_EMAILS = [
  "strvboys512@gmail.com",
  "arsuvoroy@gmail.com"
];

// Official SAVAGE STORE Logo Asset
export const OFFICIAL_LOGO_PATH = `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`;

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
    }
  };
  console.error('[SAVAGE Store Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(errInfo.error);
}

// Test connectivity on initial load without breaking offline or cold starts
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'store'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline cache mode.');
    }
    return false;
  }
}
