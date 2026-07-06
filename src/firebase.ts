import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-my-FWhwePQENvxWWIkxQRyofzLDHEM4",
  authDomain: "helical-way-wgtt6.firebaseapp.com",
  projectId: "helical-way-wgtt6",
  storageBucket: "helical-way-wgtt6.firebasestorage.app",
  messagingSenderId: "662130748953",
  appId: "1:662130748953:web:55a4075098e1ab58484488"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
// Use initializeFirestore to specify the custom firestoreDatabaseId as the third argument
export const db = initializeFirestore(app, {}, "ai-studio-241b11ed-a78e-4bff-83ac-afd2ebdcc080");
