export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Simple validation to help catch common setup errors
if (typeof window !== 'undefined' && (!firebaseConfig.apiKey || !firebaseConfig.authDomain)) {
  console.warn(
    'Firebase configuration is incomplete. Please ensure you have added the correct values to your .env.local file ' +
    'and that they match your project settings in the Firebase Console.'
  );
}
