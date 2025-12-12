// Firebase initialization (client-side only)
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
};

// Ensure we don't re-initialize during HMR
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Optional: analytics only on client and when supported
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      if (await isSupported()) {
        getAnalytics(app);
      }
    } catch (_) {
      // ignore
    }
  }
};

export const storage = getStorage(app);

export default app;
