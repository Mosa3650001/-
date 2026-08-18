import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, getDocFromServer, doc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore Database (support named database if specified)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate Firestore Connection (as per skill guidelines)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase Firestore connected successfully.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client is offline or initializing.");
    }
    return false;
  }
}
