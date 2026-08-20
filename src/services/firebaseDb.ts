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
export async function saveDocument<T extends Record<string, any> = Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<T> | Record<string, any>
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

// 5. Unified Function to Sync Facebook Pages with Firestore Permanently
export interface FacebookRawPage {
  id: string;
  name: string;
  category?: string;
  access_token?: string;
  tasks?: string[];
  fan_count?: number;
  picture?: {
    data?: {
      url?: string;
    };
  };
  link?: string;
}

export async function syncFacebookPagesToFirestore(
  pages: FacebookRawPage[],
  defaultBrandId?: string,
  existingBrands: Brand[] = []
): Promise<{
  success: boolean;
  syncedAccounts: ConnectedAccount[];
  updatedBrands: Brand[];
  error?: string;
}> {
  try {
    if (!pages || pages.length === 0) {
      return { success: false, syncedAccounts: [], updatedBrands: existingBrands, error: "لا توجد صفحات لمزامنتها" };
    }

    const syncedAccounts: ConnectedAccount[] = [];
    const updatedBrandsMap = new Map<string, Brand>(existingBrands.map((b) => [b.id, { ...b }]));

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const accountDocId = `fb_${page.id}`;
      
      // Determine the best matching brand:
      // 1. Try to find a brand with matching or containing name
      // 2. If single page and defaultBrandId provided, use defaultBrandId
      // 3. Match by index or create a brand if none exists
      let matchedBrand = existingBrands.find(
        (b) =>
          b.name.trim().toLowerCase() === page.name.trim().toLowerCase() ||
          page.name.toLowerCase().includes(b.name.toLowerCase()) ||
          b.name.toLowerCase().includes(page.name.toLowerCase())
      );

      if (!matchedBrand && defaultBrandId && defaultBrandId !== "all") {
        matchedBrand = existingBrands.find((b) => b.id === defaultBrandId);
      }

      if (!matchedBrand) {
        // Find by index if available
        matchedBrand = existingBrands[i % Math.max(1, existingBrands.length)];
      }

      let brandId = matchedBrand?.id || `brand_${page.id.slice(-6)}`;

      // If no brand exists at all or a new one is needed
      if (!matchedBrand) {
        const newBrand: Brand = {
          id: brandId,
          name: page.name,
          category: page.category || "متجر وتجزئة",
          tone: "تفاعلية تجارية وعروض حصرية",
          primaryColor: "#1877F2",
          logo: page.picture?.data?.url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
          coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
          description: `المتجر والصفحة الرسمية لـ ${page.name}`,
          connectedAccounts: ["facebook"],
          targetAudience: "المتسوقون والعملاء في المملكة والخليج",
        };
        updatedBrandsMap.set(newBrand.id, newBrand);
        await saveDocument(COLLECTIONS.BRANDS, newBrand.id, newBrand);
      } else {
        // Ensure facebook is included in brand's connectedAccounts
        if (!matchedBrand.connectedAccounts.includes("facebook")) {
          matchedBrand.connectedAccounts = [...matchedBrand.connectedAccounts, "facebook"];
          updatedBrandsMap.set(matchedBrand.id, matchedBrand);
          await saveDocument(COLLECTIONS.BRANDS, matchedBrand.id, {
            connectedAccounts: matchedBrand.connectedAccounts,
          });
        }
      }

      const accountData: ConnectedAccount = {
        id: accountDocId,
        brandId,
        platform: "facebook",
        accountName: page.name,
        handle: `@${page.name.toLowerCase().replace(/\s+/g, "_")}`,
        avatar:
          page.picture?.data?.url ||
          `https://graph.facebook.com/${page.id}/picture?type=large` ||
          "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop",
        status: "connected",
        followersCount: page.fan_count || 1250,
        apiToken: page.access_token || "",
        pageId: page.id,
        accountId: page.id,
        category: page.category,
        lastSync: new Date().toISOString(),
      };

      // Save to Firestore permanently with merge: true
      await saveDocument(COLLECTIONS.ACCOUNTS, accountDocId, accountData);
      syncedAccounts.push(accountData);
    }

    return {
      success: true,
      syncedAccounts,
      updatedBrands: Array.from(updatedBrandsMap.values()),
    };
  } catch (error: any) {
    console.error("Error in syncFacebookPagesToFirestore:", error);
    return {
      success: false,
      syncedAccounts: [],
      updatedBrands: existingBrands,
      error: error.message || "فشلت المزامنة مع Firestore",
    };
  }
}

// 6. Bulk Fetch from Meta Graph API and Directly Commit to Firestore
export async function fetchAndSyncAllUserPagesToFirestore(
  userAccessToken: string,
  defaultBrandId?: string,
  existingBrands: Brand[] = []
): Promise<{
  success: boolean;
  pagesCount: number;
  syncedAccounts: ConnectedAccount[];
  updatedBrands: Brand[];
  error?: string;
}> {
  try {
    const res = await fetch("/api/facebook/get-user-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAccessToken: userAccessToken.trim() }),
    });

    const data = await res.json();
    if (!data.success || !data.pages) {
      return {
        success: false,
        pagesCount: 0,
        syncedAccounts: [],
        updatedBrands: existingBrands,
        error: data.error || "تعذر جلب الصفحات من فيسبوك. تأكد من صحة رمز الوصول والصلاحيات.",
      };
    }

    const syncRes = await syncFacebookPagesToFirestore(data.pages, defaultBrandId, existingBrands);
    return {
      success: syncRes.success,
      pagesCount: data.pages.length,
      syncedAccounts: syncRes.syncedAccounts,
      updatedBrands: syncRes.updatedBrands,
      error: syncRes.error,
    };
  } catch (err: any) {
    return {
      success: false,
      pagesCount: 0,
      syncedAccounts: [],
      updatedBrands: existingBrands,
      error: err.message || "حدث خطأ غير متوقع أثناء الاتصال بالخادم",
    };
  }
}
