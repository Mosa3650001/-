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
  FacebookRawPage,
  FacebookPageData,
} from "../types";

export type { FacebookRawPage, FacebookPageData };

// Collections constants
export const COLLECTIONS = {
  USERS: "users",
  BRANDS: "brands",
  ACCOUNTS: "accounts",
  FACEBOOK_PAGES: "facebook_pages",
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
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Firestore save error on ${collectionName}/${docId}:`, error);
    return false;
  }
}

// 3. Generic Delete Document
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn(`Firestore delete error on ${collectionName}/${docId}:`, error);
    return false;
  }
}

// 4. Safe Realtime Sync & Merge Helper
export function mergeRemoteAndLocal<T extends { id: string }>(remoteList: T[], localList: T[]): T[] {
  if (!remoteList || remoteList.length === 0) return localList;
  const mergedMap = new Map<string, T>();
  // 1. Add all remote docs first
  remoteList.forEach((item) => {
    if (item && item.id) mergedMap.set(item.id, item);
  });
  // 2. Add local items if they aren't in remote yet (preventing accidental deletion before cloud sync confirms)
  localList.forEach((item) => {
    if (item && item.id && !mergedMap.has(item.id)) {
      mergedMap.set(item.id, item);
    }
  });
  return Array.from(mergedMap.values());
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

/**
 * Unified Function to Sync and Store Facebook Pages in Firestore and Local Cache
 * Stores pages in the standardized format: (id, name, access_token, category, connected_store_id)
 * to prevent data loss and ensure permanent display consistency across the dashboard.
 */
export async function syncFacebookPagesToFirestore(
  pages: FacebookRawPage[],
  defaultBrandId?: string,
  existingBrands: Brand[] = []
): Promise<{
  success: boolean;
  syncedAccounts: ConnectedAccount[];
  updatedBrands: Brand[];
  facebookPages: FacebookPageData[];
  error?: string;
}> {
  try {
    if (!pages || pages.length === 0) {
      return {
        success: false,
        syncedAccounts: [],
        updatedBrands: existingBrands,
        facebookPages: [],
        error: "لم يتم العثور على صفحات فيسبوك لمزامنتها.",
      };
    }

    const syncedAccounts: ConnectedAccount[] = [];
    const normalizedFbPages: FacebookPageData[] = [];
    const updatedBrandsMap = new Map<string, Brand>(existingBrands.map((b) => [b.id, { ...b }]));
    const nowIso = new Date().toISOString();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageId = String(page.id).trim();
      const pageName = page.name || `صفحة فيسبوك ${pageId}`;
      const pageAccessToken = (page.access_token || "").trim();
      const pageCategory = page.category || "متجر وتجزئة";
      const accountDocId = `fb_${pageId}`;

      // 1. Determine or match the connected store (connected_store_id / brandId)
      let matchedBrand = existingBrands.find(
        (b) =>
          b.name.trim().toLowerCase() === pageName.trim().toLowerCase() ||
          pageName.toLowerCase().includes(b.name.toLowerCase()) ||
          b.name.toLowerCase().includes(pageName.toLowerCase())
      );

      if (!matchedBrand && defaultBrandId && defaultBrandId !== "all") {
        matchedBrand = existingBrands.find((b) => b.id === defaultBrandId);
      }

      if (!matchedBrand && existingBrands.length > 0) {
        matchedBrand = existingBrands[i % existingBrands.length];
      }

      let connectedStoreId = matchedBrand?.id || `brand_${pageId.slice(-6)}`;

      // 2. If no brand exists, create a new brand automatically
      if (!matchedBrand) {
        const newBrand: Brand = {
          id: connectedStoreId,
          name: pageName,
          slug: pageName.toLowerCase().replace(/\s+/g, "-"),
          tagline: `المتجر والفرع الرسمي لـ ${pageName}`,
          description: `المتجر الإلكتروني وحسابات التواصل لـ ${pageName}`,
          logo:
            page.picture?.data?.url ||
            `https://graph.facebook.com/${pageId}/picture?type=large` ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
          primaryColor: "#1877F2",
          toneLabel: "تفاعلية تجارية وعروض حصرية",
          defaultHashtags: [`#${pageName.replace(/\s+/g, "_")}`, "#عروض", "#تسوق", "#متجر"],
          connectedPlatforms: ["facebook"],
          pricingTier: "mid",
          priceRangeLabel: "أسعار تنافسية وعروض مستمرة",
          isEnabled: true,
        };
        updatedBrandsMap.set(newBrand.id, newBrand);
        await saveDocument(COLLECTIONS.BRANDS, newBrand.id, newBrand);
      } else {
        // Ensure facebook is in brand connected platforms
        const platforms = new Set(matchedBrand.connectedPlatforms || []);
        platforms.add("facebook");
        matchedBrand.connectedPlatforms = Array.from(platforms);
        updatedBrandsMap.set(matchedBrand.id, matchedBrand);
        await saveDocument(COLLECTIONS.BRANDS, matchedBrand.id, {
          connectedPlatforms: matchedBrand.connectedPlatforms,
        });
      }

      // 3. Construct the standardized FacebookPageData record: (id, name, access_token, category, connected_store_id)
      const pageAvatar =
        page.picture?.data?.url ||
        `https://graph.facebook.com/${pageId}/picture?type=large` ||
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop";

      const formattedRecord: FacebookPageData = {
        // Core requested standard fields:
        id: pageId,
        name: pageName,
        access_token: pageAccessToken,
        category: pageCategory,
        connected_store_id: connectedStoreId,

        // Dashboard & Store compatibility fields:
        brandId: connectedStoreId,
        platform: "facebook",
        accountName: pageName,
        handle: `@${pageName.toLowerCase().replace(/\s+/g, "_")}`,
        apiToken: pageAccessToken,
        pageId: pageId,
        accountId: pageId,
        avatar: pageAvatar,
        followersCount: page.fan_count || 1250,
        fan_count: page.fan_count || 1250,
        tasks: page.tasks || ["ANALYZE", "ADVERTISE", "MESSAGING", "MODERATE", "CREATE_CONTENT", "MANAGE"],
        link: page.link || `https://facebook.com/${pageId}`,
        status: "connected",
        lastSync: nowIso,
        lastSyncedAt: nowIso,
        canPublish: true,
        canReadComments: true,
        canDirectMessage: true,
        updatedAt: nowIso,
      };

      // 4. Save to Firestore permanently across both collections:
      // (a) COLLECTIONS.ACCOUNTS (key: fb_123456)
      await saveDocument(COLLECTIONS.ACCOUNTS, accountDocId, formattedRecord);

      // (b) COLLECTIONS.FACEBOOK_PAGES (key: 123456)
      await saveDocument(COLLECTIONS.FACEBOOK_PAGES, pageId, formattedRecord);

      syncedAccounts.push(formattedRecord as unknown as ConnectedAccount);
      normalizedFbPages.push(formattedRecord);
    }

    // 5. Local storage backup for zero-latency UI recovery
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("smartpost_facebook_pages");
        const existingList: FacebookPageData[] = stored ? JSON.parse(stored) : [];
        const map = new Map(existingList.map((p) => [p.id, p]));
        normalizedFbPages.forEach((p) => map.set(p.id, p));
        localStorage.setItem("smartpost_facebook_pages", JSON.stringify(Array.from(map.values())));
      }
    } catch {
      // safe fallback
    }

    return {
      success: true,
      syncedAccounts,
      facebookPages: normalizedFbPages,
      updatedBrands: Array.from(updatedBrandsMap.values()),
    };
  } catch (error: any) {
    console.error("Error in syncFacebookPagesToFirestore:", error);
    return {
      success: false,
      syncedAccounts: [],
      facebookPages: [],
      updatedBrands: existingBrands,
      error: error.message || "فشلت المزامنة مع قاعدة بيانات Firestore",
    };
  }
}

/**
 * 6. Unified Full-Stack Fetch & Sync from Meta Graph API to Firestore
 */
export async function fetchAndSyncAllUserPagesToFirestore(
  userAccessToken: string,
  defaultBrandId?: string,
  existingBrands: Brand[] = []
): Promise<{
  success: boolean;
  pagesCount: number;
  syncedAccounts: ConnectedAccount[];
  facebookPages: FacebookPageData[];
  updatedBrands: Brand[];
  error?: string;
}> {
  try {
    const cleanToken = (userAccessToken || "").trim().replace(/^["']|["']$/g, "");
    if (!cleanToken) {
      return {
        success: false,
        pagesCount: 0,
        syncedAccounts: [],
        facebookPages: [],
        updatedBrands: existingBrands,
        error: "يرجى إدخال رمز وصول فيسبوك (Access Token) صالح.",
      };
    }

    const res = await fetch("/api/facebook/get-user-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAccessToken: cleanToken }),
    });

    const data = await res.json();
    if (!data.success || !data.pages || data.pages.length === 0) {
      return {
        success: false,
        pagesCount: 0,
        syncedAccounts: [],
        facebookPages: [],
        updatedBrands: existingBrands,
        error:
          data.error ||
          "لم يتم العثور على صفحات فيسبوك مرتبطة بهذا الرمز. تأكد من تفعيل صلاحيات pages_show_list و pages_manage_posts.",
      };
    }

    const syncRes = await syncFacebookPagesToFirestore(data.pages, defaultBrandId, existingBrands);
    return {
      success: syncRes.success,
      pagesCount: data.pages.length,
      syncedAccounts: syncRes.syncedAccounts,
      facebookPages: syncRes.facebookPages,
      updatedBrands: syncRes.updatedBrands,
      error: syncRes.error,
    };
  } catch (err: any) {
    console.error("fetchAndSyncAllUserPagesToFirestore error:", err);
    return {
      success: false,
      pagesCount: 0,
      syncedAccounts: [],
      facebookPages: [],
      updatedBrands: existingBrands,
      error: err.message || "حدث خطأ غير متوقع أثناء الاتصال بخادم المزامنة.",
    };
  }
}

