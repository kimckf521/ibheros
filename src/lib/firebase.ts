import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBmWt55RHNqh0wkp3pPOaEaLSdDQbf4DUg",
  authDomain: "ibheros-b944c.firebaseapp.com",
  projectId: "ibheros-b944c",
  storageBucket: "ibheros-b944c.firebasestorage.app",
  messagingSenderId: "543147306936",
  appId: "1:543147306936:web:e822ecb697f2ba4da7694d",
  measurementId: "G-CM0XQE8RSS"
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, storage, db, analytics };
