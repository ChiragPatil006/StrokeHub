// ─────────────────────────────────────────────────────
//  PASTE YOUR FIREBASE CONFIG HERE
//  Firebase Console → Project Settings → Your Apps → Web
// ─────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:            "AIzaSyBABVyFJVIyD3WTCSzGoDVJvmpZAQVn7Oc",
  authDomain:        "strokehub-1dc5d.firebaseapp.com",
  databaseURL:       "https://strokehub-1dc5d-default-rtdb.firebaseio.com",
  projectId:         "strokehub-1dc5d",
  storageBucket:     "strokehub-1dc5d.firebasestorage.app",
  messagingSenderId: "583547962197",
  appId:             "1:583547962197:web:4df52b89d0d906eeabe5dc",
  measurementId:     "G-QCCRRJ3VTT",
};

const app = initializeApp(firebaseConfig);
export const db  = getDatabase(app);
