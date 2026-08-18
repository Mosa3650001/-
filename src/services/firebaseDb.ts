import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Brand,
  ConnectedAccount,
  ContentIdea,
  Post,
  InboxItem,
  TeamMember,
  DailyPublishGoal,
} from "../types";

// Collections constants
export const COLLECTIONS = {
  USERS: "users",
  BRANDS: "brands",
  ACCOUNTS: "accounts",
  IDEAS: "ideas",
  POSTS: "posts",
  INBOX: "inbox",
  GOALS: "goals",
};

// 1. Realtime Listeners with local fallback
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as T[];
        onData(items);
      },
      (error) => {
        console.warn(`Firestore subscription failed on [${collectionName}]:`, error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn(`Error setting up Firestore subscriber on ${collectionName}:`, err);
    return () => {};
  }
}

// 2. Generic Save Document (Insert or Update)
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn(`Firestore save error on ${collectionName}/${docId}:`, error);
  }
}

// 3. Generic Delete Document
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete error on ${collectionName}/${docId}:`, error);
  }
}

// 4. Initial Seed Function to copy initial data to cloud if collection is empty
export async function seedInitialFirestoreData(
  initialBrands: Brand[],
  initialAccounts: ConnectedAccount[],
  initialIdeas: ContentIdea[],
  initialPosts: Post[],
  initialInbox: InboxItem[],
  initialTeam: TeamMember[],
  initialGoals: DailyPublishGoal[]
): Promise<void> {
  try {
    const brandsSnap = await getDocs(collection(db, COLLECTIONS.BRANDS));
    if (brandsSnap.empty) {
      console.log("Seeding initial brands to cloud Firestore...");
      for (const brand of initialBrands) {
        await setDoc(doc(db, COLLECTIONS.BRANDS, brand.id), brand);
      }
      for (const acc of initialAccounts) {
        await setDoc(doc(db, COLLECTIONS.ACCOUNTS, acc.id), acc);
      }
      for (const idea of initialIdeas) {
        await setDoc(doc(db, COLLECTIONS.IDEAS, idea.id), idea);
      }
      for (const post of initialPosts) {
        await setDoc(doc(db, COLLECTIONS.POSTS, post.id), post);
      }
      for (const inbox of initialInbox) {
        await setDoc(doc(db, COLLECTIONS.INBOX, inbox.id), inbox);
      }
      for (const member of initialTeam) {
        await setDoc(doc(db, COLLECTIONS.USERS, member.id), member);
      }
      for (const goal of initialGoals) {
        await setDoc(doc(db, COLLECTIONS.GOALS, goal.id), goal);
      }
      console.log("Firestore cloud seed complete.");
    }
  } catch (error) {
    console.warn("Could not seed Firestore (might be offline or permissions):", error);
  }
}
