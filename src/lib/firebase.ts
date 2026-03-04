import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "convertfilesapp.firebaseapp.com",
    projectId: "convertfilesapp",
    storageBucket: "convertfilesapp.firebasestorage.app",
    messagingSenderId: "779230354365",
    appId: "1:779230354365:web:4367c874a101c6d7dd10d4",
    measurementId: "G-RT8EL9FFQK",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
