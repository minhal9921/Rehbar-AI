/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAI, VertexAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rehbaraii.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rehbaraii",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rehbaraii.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "75780859823",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:75780859823:web:626bd1fb09ee31abfab15a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TZ6B5WTFEH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const vertexAI = getAI(app, { backend: new VertexAIBackend() });
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only in supported environments (browser)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export default app;
