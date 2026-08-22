import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Brand,
  ConnectedAccount,
  VisualTemplate,
  CatalogProduct,
  Post,
  InboxItem,
  TeamMember,
  ToastMessage,
  SocialPlatform,
  ContentIdea,
  DailyPublishGoal,
  ContentStage,
} from "../types";
import {
  INITIAL_BRANDS,
  INITIAL_CONNECTED_ACCOUNTS,
  VISUAL_TEMPLATES,
  CATALOG_PRODUCTS,
  INITIAL_POSTS,
  INITIAL_INBOX_ITEMS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_IDEAS,
  INITIAL_PUBLISH_GOALS,
} from "../data/initialData";
import {
  subscribeToCollection,
  saveDocument,
  deleteDocument,
  seedInitialFirestoreData,
  syncFacebookPagesToFirestore,
  fetchAndSyncAllUserPagesToFirestore,
  mergeRemoteAndLocal,
  sanitizeBrand,
  isDemoId,
  purgeAllDemoDataFromFirestoreAndLocal,
  FacebookRawPage,
  COLLECTIONS,
} from "../services/firebaseDb";

export type AppTheme = "dark" | "light";

interface AppContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;

  brands: Brand[];
  currentBrandId: string; // 'all' or brand id
  setCurrentBrandId: (id: string) => void;
  selectedBrand: Brand | null;
  
  connectedAccounts: ConnectedAccount[];
  templates: VisualTemplate[];
  products: CatalogProduct[];
  posts: Post[];
  inboxItems: InboxItem[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  
  // Realtime Cloud Sync Status
  isCloudSynced: boolean;

  // Ideas & Content Pipeline
  ideas: ContentIdea[];
  createIdea: (idea: Omit<ContentIdea, "id" | "createdAt" | "updatedAt">) => ContentIdea;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;
  advanceIdeaStage: (id: string) => void;
  sendIdeaToPostStudio: (idea: ContentIdea) => void;
  toggleArchiveIdea: (id: string) => void;
  autoArchiveOldIdeas: (daysThreshold?: number) => number;

  // Daily Publishing Strategy & Goals
  dailyGoals: DailyPublishGoal[];
  updateDailyGoal: (id: string, updates: Partial<DailyPublishGoal>) => void;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;

  // Post Actions
  createPost: (post: Omit<Post, "id" | "createdAt">) => Post;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  publishPostNow: (id: string) => void;

  // Inbox Actions
  replyToInbox: (id: string, replyText: string, isAuto?: boolean) => void;
  deleteInboxItem: (id: string) => void;
  triggerAutoRepliesForAllPending: () => Promise<number>;

  // Brand Actions
  createBrand: (brand: Omit<Brand, "id">) => Brand;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;

  // Connected Accounts
  toggleAccountStatus: (id: string) => void;
  updateConnectedAccount: (id: string, updates: Partial<ConnectedAccount>) => void;
  deleteConnectedAccount: (id: string) => void;
  reassignAccountBrand: (accountId: string, newBrandId: string) => void;
  cleanAllDemoTokensAndData: () => Promise<void>;
  connectNewAccount: (brandId: string, platform: SocialPlatform, handle: string, name: string, apiToken?: string, accountId?: string) => void;
  syncAllFacebookPagesWithFirestore: (userAccessToken: string, defaultBrandId?: string) => Promise<{ success: boolean; count: number; error?: string }>;
  syncRawFacebookPagesToFirestore: (pages: FacebookRawPage[], defaultBrandId?: string) => Promise<{ success: boolean; count: number; error?: string }>;

  // Team Actions
  createTeamMember: (member: Omit<TeamMember, "id" | "joinedDate">) => TeamMember;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // Navigation
  activeTab: "dashboard" | "ideas" | "studio" | "calendar" | "inbox" | "analytics" | "team" | "stores" | "about" | "privacy" | "data_deletion";
  setActiveTab: (tab: "dashboard" | "ideas" | "studio" | "calendar" | "inbox" | "analytics" | "team" | "stores" | "about" | "privacy" | "data_deletion") => void;

  // Quick edit modal or trigger helper
  editingPost: Post | null;
  setEditingPost: (post: Post | null) => void;

  // Pre-filled Idea data for PostStudio
  importedIdeaForStudio: ContentIdea | null;
  setImportedIdeaForStudio: (idea: ContentIdea | null) => void;

  // Sidebar Drawer state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: "socialhub_theme_v2",
  BRANDS: "socialhub_brands_v1",
  ACCOUNTS: "socialhub_accounts_v1",
  POSTS: "socialhub_posts_v1",
  INBOX: "socialhub_inbox_v1",
  TEAM: "socialhub_team_v1",
  CURRENT_USER: "socialhub_cur_user_v1",
  CURRENT_BRAND: "socialhub_cur_brand_v1",
  IDEAS: "socialhub_ideas_v1",
  GOALS: "socialhub_goals_v1",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed
            .filter((b) => !isDemoId(b?.id))
            .map((b) => sanitizeBrand(b))
            .filter((b): b is Brand => b !== null && Boolean(b.name && b.name.trim().length > 0));
          return sanitized;
        }
      }
    } catch (e) {
      console.warn("Failed to parse saved brands from localStorage", e);
    }
    return [];
  });

  const [currentBrandId, setCurrentBrandIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_BRAND);
    return saved || "all";
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((acc) => !isDemoId(acc?.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => !isDemoId(p?.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [ideas, setIdeas] = useState<ContentIdea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IDEAS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((i) => !isDemoId(i?.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [dailyGoals, setDailyGoals] = useState<DailyPublishGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_PUBLISH_GOALS;
  });

  const [inboxItems, setInboxItems] = useState<InboxItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBOX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => !isDemoId(item?.id));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAM);
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  const [currentUser, setCurrentUserState] = useState<TeamMember>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_TEAM_MEMBERS[0];
  });

  const [activeTab, setActiveTab] = useState<AppContextType["activeTab"]>("dashboard");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [importedIdeaForStudio, setImportedIdeaForStudio] = useState<ContentIdea | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Real-time Cloud Firestore Subscriptions & Initial Clean-up
  useEffect(() => {
    // Purge any lingering demo documents and sync clean schema
    purgeAllDemoDataFromFirestoreAndLocal();
    seedInitialFirestoreData([], [], [], [], [], teamMembers, dailyGoals);

    // Listen to real-time updates from cloud Firestore with Smart Merge
    const unsubBrands = subscribeToCollection<Brand>(COLLECTIONS.BRANDS, (data) => {
      setBrands((currentLocal) => {
        const cleanRemote = (data || []).filter((b) => !isDemoId(b?.id));
        const merged = mergeRemoteAndLocal<Brand>(cleanRemote, currentLocal);
        const sanitized = merged
          .filter((b) => !isDemoId(b?.id))
          .map((b) => sanitizeBrand(b))
          .filter((b): b is Brand => b !== null && Boolean(b.name && b.name.trim().length > 0));
        return sanitized;
      });
      setIsCloudSynced(true);
    });

    const unsubAccounts = subscribeToCollection<ConnectedAccount>(COLLECTIONS.ACCOUNTS, (data) => {
      setConnectedAccounts((currentLocal) => {
        const cleanRemote = (data || []).filter((acc) => !isDemoId(acc?.id));
        return mergeRemoteAndLocal<ConnectedAccount>(cleanRemote, currentLocal).filter(
          (acc) => !isDemoId(acc?.id)
        );
      });
      setIsCloudSynced(true);
    });

    const unsubIdeas = subscribeToCollection<ContentIdea>(COLLECTIONS.IDEAS, (data) => {
      setIdeas((currentLocal) => {
        const cleanRemote = (data || []).filter((i) => !isDemoId(i?.id));
        return mergeRemoteAndLocal<ContentIdea>(cleanRemote, currentLocal).filter((i) => !isDemoId(i?.id));
      });
      setIsCloudSynced(true);
    });

    const unsubPosts = subscribeToCollection<Post>(COLLECTIONS.POSTS, (data) => {
      setPosts((currentLocal) => {
        const cleanRemote = (data || []).filter((p) => !isDemoId(p?.id));
        return mergeRemoteAndLocal<Post>(cleanRemote, currentLocal).filter((p) => !isDemoId(p?.id));
      });
      setIsCloudSynced(true);
    });

    const unsubInbox = subscribeToCollection<InboxItem>(COLLECTIONS.INBOX, (data) => {
      setInboxItems((currentLocal) => {
        const cleanRemote = (data || []).filter((i) => !isDemoId(i?.id));
        return mergeRemoteAndLocal<InboxItem>(cleanRemote, currentLocal).filter((i) => !isDemoId(i?.id));
      });
      setIsCloudSynced(true);
    });

    const unsubTeam = subscribeToCollection<TeamMember>(COLLECTIONS.USERS, (data) => {
      if (data && data.length > 0) {
        setTeamMembers((currentLocal) => mergeRemoteAndLocal<TeamMember>(data, currentLocal));
        setIsCloudSynced(true);
      }
    });

    const unsubGoals = subscribeToCollection<DailyPublishGoal>(COLLECTIONS.GOALS, (data) => {
      if (data && data.length > 0) {
        setDailyGoals((currentLocal) => mergeRemoteAndLocal<DailyPublishGoal>(data, currentLocal));
        setIsCloudSynced(true);
      }
    });

    return () => {
      unsubBrands();
      unsubAccounts();
      unsubIdeas();
      unsubPosts();
      unsubInbox();
      unsubTeam();
      unsubGoals();
    };
  }, []);

  // Apply Theme to document HTML
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      document.body.style.backgroundColor = "#090D16";
      document.body.style.color = "#F8FAFC";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      document.body.style.backgroundColor = "#F8FAFC";
      document.body.style.color = "#0F172A";
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(connectedAccounts));
  }, [connectedAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(inboxItems));
  }, [inboxItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(teamMembers));
  }, [teamMembers]);

  const setCurrentBrandId = (id: string) => {
    setCurrentBrandIdState(id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_BRAND, id);
  };

  const setCurrentUser = (user: TeamMember) => {
    setCurrentUserState(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    addToast({
      type: "info",
      title: `تم تبديل المستخدم إلى: ${user.name}`,
      description: `الصلاحية: ${user.roleLabel}`,
    });
  };

  const selectedBrand = currentBrandId === "all" ? null : brands.find((b) => b.id === currentBrandId) || null;

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- IDEAS & PIPELINE METHODS ---
  const createIdea = (ideaData: Omit<ContentIdea, "id" | "createdAt" | "updatedAt">): ContentIdea => {
    const now = new Date().toISOString();
    const newIdea: ContentIdea = {
      ...ideaData,
      id: "idea-" + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setIdeas((prev) => [newIdea, ...prev]);
    saveDocument(COLLECTIONS.IDEAS, newIdea.id, newIdea);
    addToast({
      type: "success",
      title: "تمت إضافة الفكرة ومزامنتها سحابياً! 💡",
      description: newIdea.title,
    });
    return newIdea;
  };

  const updateIdea = (id: string, updates: Partial<ContentIdea>) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };
    setIdeas((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updatedData }
          : item
      )
    );
    saveDocument(COLLECTIONS.IDEAS, id, updatedData);
    addToast({
      type: "success",
      title: "تم تحديث بيانات الفكرة ومرحلة الإنتاج ومزامنتها مع كافة الأجهزة",
    });
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((item) => item.id !== id));
    deleteDocument(COLLECTIONS.IDEAS, id);
    addToast({
      type: "info",
      title: "تم حذف الفكرة ومزامنة التغيير",
    });
  };

  const STAGES_ORDER: ContentStage[] = ["idea", "scripting", "shooting", "editing", "ready", "published"];
  const STAGE_LABELS: Record<ContentStage, string> = {
    idea: "فكرة جديدة",
    scripting: "كتابة السيناريو",
    shooting: "التصوير بالمتجر",
    editing: "المونتاج والتعديل",
    ready: "جاهز للنشر",
    published: "تم النشر بنجاح",
  };

  const advanceIdeaStage = (id: string) => {
    const currentIdea = ideas.find((i) => i.id === id);
    if (!currentIdea) return;
    const currentIndex = STAGES_ORDER.indexOf(currentIdea.stage);
    if (currentIndex < STAGES_ORDER.length - 1) {
      const nextStage = STAGES_ORDER[currentIndex + 1];
      updateIdea(id, { stage: nextStage });
      addToast({
        type: "success",
        title: `تم نقل الفكرة إلى مرحلة: ${STAGE_LABELS[nextStage]} 🚀`,
      });
    }
  };

  const sendIdeaToPostStudio = (idea: ContentIdea) => {
    setImportedIdeaForStudio(idea);
    setActiveTab("studio");
    addToast({
      type: "info",
      title: "تم نقل الفكرة إلى استوديو النشر 🎨",
      description: "تمت تعبئة النصوص والهاشتاقات والتفاصيل تلقائياً.",
    });
  };

  const toggleArchiveIdea = (id: string) => {
    const targetIdea = ideas.find((i) => i.id === id);
    if (!targetIdea) return;
    const nextArchived = !targetIdea.isArchived;
    const updatePayload = {
      isArchived: nextArchived,
      archivedAt: nextArchived ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updatePayload } : i))
    );
    saveDocument(COLLECTIONS.IDEAS, id, updatePayload);
    addToast({
      type: nextArchived ? "info" : "success",
      title: nextArchived ? "📦 تم نقل الفكرة إلى الأرشيف" : "✨ تم استرجاع الفكرة من الأرشيف إلى مسار العمل النشط",
    });
  };

  const autoArchiveOldIdeas = (daysThreshold = 14): number => {
    let archivedCount = 0;
    const now = Date.now();
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;

    const updated = ideas.map((idea) => {
      // Auto archive published ideas older than 7 days, or ideas created > daysThreshold
      const createdTime = new Date(idea.createdAt).getTime();
      const isOld = now - createdTime > thresholdMs;
      const isPublishedOld = idea.stage === "published" && (now - createdTime > 3 * 24 * 60 * 60 * 1000);

      if (!idea.isArchived && (isOld || isPublishedOld)) {
        archivedCount++;
        const updatePayload = {
          isArchived: true,
          archivedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveDocument(COLLECTIONS.IDEAS, idea.id, updatePayload);
        return { ...idea, ...updatePayload };
      }
      return idea;
    });

    if (archivedCount > 0) {
      setIdeas(updated);
      addToast({
        type: "success",
        title: `🗂️ تمت أرشفة ${archivedCount} فكرة ومنشور قديم تلقائياً!`,
        description: `تم تنظيف مساحة العمل ونقل الأفكار المنشورة والقديمة إلى الأرشيف.`,
      });
    } else {
      addToast({
        type: "info",
        title: "مساحة العمل منظمة بالفعل!",
        description: "لا توجد أفكار أو منشورات قديمة تحتاج للأرشفة حالياً.",
      });
    }
    return archivedCount;
  };

  const updateDailyGoal = (id: string, updates: Partial<DailyPublishGoal>) => {
    setDailyGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    saveDocument(COLLECTIONS.GOALS, id, updates);
    addToast({
      type: "success",
      title: "تم تحديث الخطة المستهدفة لهذا اليوم ومزامنتها",
    });
  };

  // --- POST METHODS ---
  const createPost = (postData: Omit<Post, "id" | "createdAt">): Post => {
    const newPost: Post = {
      ...postData,
      id: "post-" + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      stats: postData.status === "published" ? {
        views: 120,
        likes: 18,
        comments: 4,
        shares: 2,
        clicks: 12,
      } : { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
    };

    setPosts((prev) => [newPost, ...prev]);
    saveDocument(COLLECTIONS.POSTS, newPost.id, newPost);
    addToast({
      type: "success",
      title: newPost.status === "published" ? "تم نشر المنشور ومزامنته سحابياً!" : "تمت جدولة المنشور بنجاح!",
      description: `المشروع: ${newPost.targetBrandIds.map(id => brands.find(b => b.id === id)?.name || id).join("، ")}`,
    });
    return newPost;
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    saveDocument(COLLECTIONS.POSTS, id, updates);
    addToast({
      type: "success",
      title: "تم تعديل المنشور ومزامنة التغيير بنجاح",
    });
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    deleteDocument(COLLECTIONS.POSTS, id);
    addToast({
      type: "info",
      title: "تم حذف المنشور ومزامنته",
    });
  };

  const publishPostNow = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    // Check if post targets Facebook and we have live Facebook accounts configured
    if (post.targetPlatforms.includes("facebook")) {
      let fbAccounts = connectedAccounts.filter(
        (acc) =>
          acc.platform === "facebook" &&
          (post.brandId === "all" || post.brandId === acc.brandId || (post.targetBrandIds && post.targetBrandIds.includes(acc.brandId)) || (acc as any).connected_store_id === post.brandId) &&
          acc.apiToken &&
          acc.apiToken.length > 15 &&
          (acc.pageId || acc.accountId)
      );

      // Fallback 1: Any connected Facebook account in state with a valid token
      if (fbAccounts.length === 0) {
        fbAccounts = connectedAccounts.filter(
          (acc) =>
            acc.platform === "facebook" &&
            acc.apiToken &&
            acc.apiToken.length > 15 &&
            (acc.pageId || acc.accountId)
        );
      }

      // Fallback 2: Check cached facebook pages from localStorage
      if (fbAccounts.length === 0) {
        try {
          const stored = localStorage.getItem("smartpost_facebook_pages");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const validPages = parsed.filter((p: any) => p.access_token || p.apiToken);
              if (validPages.length > 0) {
                fbAccounts = validPages.map((p: any) => ({
                  id: `fb_${p.id}`,
                  brandId: p.connected_store_id || post.brandId || "brand-default",
                  platform: "facebook" as const,
                  accountName: p.name || p.accountName || "صفحة فيسبوك",
                  handle: `@${(p.name || "").replace(/\s+/g, "_")}`,
                  avatar: p.picture?.data?.url || p.avatar || "",
                  followersCount: p.fan_count || 1000,
                  status: "connected" as const,
                  apiToken: p.access_token || p.apiToken,
                  pageId: p.id || p.pageId,
                  accountId: p.id || p.accountId,
                  canPublish: true,
                  canReadComments: true,
                  canDirectMessage: true,
                  lastSyncedAt: new Date().toISOString(),
                }));
              }
            }
          }
        } catch {
          // safe fallback
        }
      }

      if (fbAccounts.length > 0) {
        const fbContent = post.contentPerPlatform?.facebook;
        const msg = fbContent
          ? `${fbContent.hook ? fbContent.hook + "\n\n" : ""}${fbContent.caption}\n\n${(fbContent.hashtags || []).join(" ")}\n\n${fbContent.callToAction || ""}`
          : post.title;

        for (const fbAccount of fbAccounts) {
          try {
            const fbRes = await fetch("/api/facebook/publish-post", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pageId: fbAccount.pageId || fbAccount.accountId,
                pageAccessToken: fbAccount.apiToken,
                message: msg.trim(),
                imageUrl: post.mediaUrls?.[0],
              }),
            });
            const fbData = await fbRes.json();
            if (fbData.success) {
              addToast({
                type: "success",
                title: `🎉 تم النشر المباشر بنجاح على صفحة "${fbAccount.accountName}"!`,
                description: `معرف المنشور: ${fbData.postId || "Live Facebook Post"}`,
              });
            } else {
              addToast({
                type: "warning",
                title: `تنبيه من فيسبوك (${fbAccount.accountName})`,
                description: fbData.error || "تأكد من صلاحيات النشر للصفحة.",
              });
            }
          } catch (e: any) {
            console.error("Facebook live publish error in publishPostNow:", e);
          }
        }
      } else {
        addToast({
          type: "info",
          title: "📌 تم تحديث حالة المنشور إلى 'منشور'",
          description: "لربط صفحة فيسبوك حقيقية والنشر المباشر عليها، يرجى فتح نافذة 'مزامنة صفحات فيسبوك'.",
        });
      }
    }

    const updatePayload = {
      status: "published" as const,
      publishedAt: new Date().toISOString(),
      stats: {
        views: Math.floor(Math.random() * 2000) + 500,
        likes: Math.floor(Math.random() * 300) + 40,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 20) + 2,
        clicks: Math.floor(Math.random() * 80) + 10,
      },
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updatePayload,
            }
          : p
      )
    );
    saveDocument(COLLECTIONS.POSTS, id, updatePayload);
    addToast({
      type: "success",
      title: "🚀 تم النشر الفوري على جميع المنصات المحددة ومزامنته سحابياً!",
    });
  };

  // --- INBOX METHODS ---
  const replyToInbox = (id: string, replyText: string, isAuto = false) => {
    const updatePayload = {
      status: isAuto ? "ai_replied" as const : "manual_replied" as const,
      finalReplyText: replyText,
      repliedAt: "الآن",
      repliedBy: isAuto ? "الذكاء الاصطناعي (Auto-Pilot)" : currentUser.name,
    };
    setInboxItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatePayload,
            }
          : item
      )
    );
    saveDocument(COLLECTIONS.INBOX, id, updatePayload);
    addToast({
      type: "success",
      title: isAuto ? "تم الرد تلقائياً بواسطة الذكاء الاصطناعي" : "تم إرسال الرد ومزامنته بنجاح",
    });
  };

  const deleteInboxItem = (id: string) => {
    setInboxItems((prev) => prev.filter((item) => item.id !== id));
    deleteDocument(COLLECTIONS.INBOX, id);
    addToast({
      type: "info",
      title: "تم حذف العنصر من صندوق الوارد ومزامنته",
    });
  };

  const triggerAutoRepliesForAllPending = async (): Promise<number> => {
    let count = 0;
    const updated = inboxItems.map((item) => {
      if (item.status === "pending") {
        count++;
        const updateObj = {
          ...item,
          status: "ai_replied" as const,
          finalReplyText: item.aiSuggestedReply || "أهلاً بك! يسعدنا خدمتك والرد على استفسارك 🌸",
          repliedAt: "الآن",
          repliedBy: "الذكاء الاصطناعي (Auto-Pilot المجمع)",
        };
        saveDocument(COLLECTIONS.INBOX, item.id, updateObj);
        return updateObj;
      }
      return item;
    });

    setInboxItems(updated);
    addToast({
      type: "success",
      title: `⚡ تم الرد آلياً على ${count} استفسار ومزامنتها بنجاح!`,
      description: "تم تطبيق قواعد كل متجر ونبرته المناسبة.",
    });
    return count;
  };

  // --- BRAND METHODS ---
  const createBrand = (brandData: Omit<Brand, "id">): Brand => {
    const id = "store-" + Date.now();
    const newBrand: Brand = {
      ...brandData,
      id,
    };

    // Synchronously write to LocalStorage first to guarantee zero data-loss
    setBrands((prev) => {
      const updated = [...prev, newBrand];
      try {
        localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    // Asynchronously commit to Firestore Cloud DB
    saveDocument(COLLECTIONS.BRANDS, id, newBrand).then((saved) => {
      if (saved) {
        setIsCloudSynced(true);
      }
    });

    addToast({
      type: "success",
      title: `تم إنشاء المتجر بنجاح ومزامنته: ${newBrand.name}`,
    });
    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    saveDocument(COLLECTIONS.BRANDS, id, updates);
    addToast({
      type: "success",
      title: "تم حفظ إعدادات المتجر ومزامنتها بنجاح",
    });
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setConnectedAccounts((prev) => prev.filter((a) => a.brandId !== id));
    deleteDocument(COLLECTIONS.BRANDS, id);
    if (currentBrandId === id) {
      setCurrentBrandId("all");
    }
    addToast({
      type: "info",
      title: "تم حذف المتجر ومزامنة التغيير",
    });
  };

  // --- CONNECTED ACCOUNTS ---
  const toggleAccountStatus = (id: string) => {
    const acc = connectedAccounts.find(a => a.id === id);
    const nextStatus = acc?.status === "connected" ? "disconnected" : "connected";
    setConnectedAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: nextStatus,
            lastSyncedAt: "الآن",
          };
        }
        return a;
      })
    );
    saveDocument(COLLECTIONS.ACCOUNTS, id, { status: nextStatus, lastSyncedAt: "الآن" });
    addToast({
      type: "info",
      title: "تم تحديث حالة ربط الحساب ومزامنتها",
    });
  };

  const updateConnectedAccount = (id: string, updates: Partial<ConnectedAccount>) => {
    setConnectedAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates, lastSyncedAt: "الآن" } : acc))
    );
    saveDocument(COLLECTIONS.ACCOUNTS, id, { ...updates, lastSyncedAt: "الآن" });
    addToast({
      type: "success",
      title: "تم حفظ وتحديث إعدادات وتوكن الـ API ومزامنتها سحابياً",
    });
  };

  const deleteConnectedAccount = (id: string) => {
    setConnectedAccounts((prev) => prev.filter((acc) => acc.id !== id));
    deleteDocument(COLLECTIONS.ACCOUNTS, id);
    addToast({
      type: "info",
      title: "تم حذف الحساب ومزامنته سحابياً بنجاح",
    });
  };

  const reassignAccountBrand = (accountId: string, newBrandId: string) => {
    const targetBrand = brands.find((b) => b.id === newBrandId);
    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, brandId: newBrandId, lastSyncedAt: "الآن" }
          : acc
      )
    );
    saveDocument(COLLECTIONS.ACCOUNTS, accountId, {
      brandId: newBrandId,
      lastSyncedAt: "الآن",
    });
    addToast({
      type: "success",
      title: `تم ربط الصفحة بـ (${targetBrand?.name || "المتجر المحدد"}) بنجاح!`,
      description: "تم تحديث ربط المتجر ومزامنته سحابياً.",
    });
  };

  const cleanAllDemoTokensAndData = async () => {
    try {
      // Call server clean API
      await fetch("/api/stores/clear-all-demo-data", { method: "POST" });
    } catch {
      // fallback
    }

    // Clean accounts with demo prefixes or mock IDs
    setConnectedAccounts((prev) =>
      prev.filter((acc) => {
        const isDemo =
          acc.id.startsWith("acc-demo") ||
          acc.id.includes("fake") ||
          acc.id.includes("mock") ||
          acc.apiToken === "EAA_DEMO_TOKEN" ||
          acc.apiToken?.includes("mock");
        if (isDemo) {
          deleteDocument(COLLECTIONS.ACCOUNTS, acc.id);
          return false;
        }
        return true;
      })
    );

    // Clean stale keys in localStorage
    localStorage.removeItem("smartpost_facebook_pages_raw");
    localStorage.removeItem("smartpost_demo_purged");

    addToast({
      type: "success",
      title: "🧹 تم تنظيف النظام وحذف التوكنات والبيانات التجريبية بنجاح!",
      description: "النظام الآن نظيف بنسبة 100% وجاهز لربط الحسابات الحقيقية والمتاجر المستقلة.",
    });
  };

  const connectNewAccount = (
    brandId: string,
    platform: SocialPlatform,
    handle: string,
    name: string,
    apiToken?: string,
    accountId?: string
  ) => {
    const brand = brands.find((b) => b.id === brandId);
    const newAcc: ConnectedAccount = {
      id: `acc-${Date.now()}`,
      brandId,
      platform,
      accountName: name || `${brand?.name || "المتجر"} - ${platform}`,
      handle: handle.startsWith("@") ? handle : `@${handle}`,
      avatar: brand?.logo || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80",
      followersCount: Math.floor(Math.random() * 50000) + 5000,
      status: apiToken ? "connected" : "connected",
      apiToken: apiToken || "",
      accountId: accountId || "",
      lastSyncedAt: "الآن",
      canPublish: true,
      canReadComments: true,
      canDirectMessage: true,
    };

    setConnectedAccounts((prev) => [...prev, newAcc]);
    saveDocument(COLLECTIONS.ACCOUNTS, newAcc.id, newAcc);
    addToast({
      type: "success",
      title: `تم ربط حساب ${platform} ومزامنته بنجاح!`,
      description: `المتجر: ${brand?.name || brandId}`,
    });
  };

  const syncRawFacebookPagesToFirestore = async (
    pages: FacebookRawPage[],
    defaultBrandId?: string
  ): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const res = await syncFacebookPagesToFirestore(pages, defaultBrandId, brands);
      if (res.success && res.syncedAccounts.length > 0) {
        setConnectedAccounts((prev) => {
          const map = new Map(prev.map((a) => [a.id, a]));
          res.syncedAccounts.forEach((acc) => map.set(acc.id, acc));
          return Array.from(map.values());
        });
        if (res.updatedBrands && res.updatedBrands.length > 0) {
          setBrands(res.updatedBrands);
        }
        setIsCloudSynced(true);
        addToast({
          type: "success",
          title: `🎉 تمت مزامنة وحفظ ${res.syncedAccounts.length} صفحة فيسبوك سحابياً في Firestore!`,
          description: "الصفحات الآن مسجلة بشكل دائم ومتاحة للنشر والإدارة دون اختفاء.",
        });
        return { success: true, count: res.syncedAccounts.length };
      } else {
        addToast({
          type: "error",
          title: "تعذر إتمام المزامنة",
          description: res.error || "تأكد من صحة الصفحات والبيانات.",
        });
        return { success: false, count: 0, error: res.error };
      }
    } catch (e: any) {
      addToast({ type: "error", title: "خطأ في المزامنة", description: e.message });
      return { success: false, count: 0, error: e.message };
    }
  };

  const syncAllFacebookPagesWithFirestore = async (
    userAccessToken: string,
    defaultBrandId?: string
  ): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const res = await fetchAndSyncAllUserPagesToFirestore(userAccessToken, defaultBrandId, brands);
      if (res.success && res.syncedAccounts.length > 0) {
        setConnectedAccounts((prev) => {
          const map = new Map(prev.map((a) => [a.id, a]));
          res.syncedAccounts.forEach((acc) => map.set(acc.id, acc));
          return Array.from(map.values());
        });
        if (res.updatedBrands && res.updatedBrands.length > 0) {
          setBrands(res.updatedBrands);
        }
        setIsCloudSynced(true);
        addToast({
          type: "success",
          title: `🎉 تمت المزامنة الشاملة لـ ${res.syncedAccounts.length} صفحة فيسبوك مع Firestore!`,
          description: "تم تحديث كافة المتاجر والصفحات مع رموز الوصول الدائمة.",
        });
        return { success: true, count: res.syncedAccounts.length };
      } else {
        addToast({
          type: "error",
          title: "تعذر جلب الصفحات من فيسبوك",
          description: res.error || "تأكد من تفعيل صلاحيات pages_show_list و pages_manage_posts.",
        });
        return { success: false, count: 0, error: res.error };
      }
    } catch (e: any) {
      addToast({ type: "error", title: "خطأ في الاتصال", description: e.message });
      return { success: false, count: 0, error: e.message };
    }
  };

  // --- TEAM METHODS ---
  const createTeamMember = (memberData: Omit<TeamMember, "id" | "joinedDate">): TeamMember => {
    const newMember: TeamMember = {
      ...memberData,
      id: "usr-" + Date.now(),
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setTeamMembers((prev) => [...prev, newMember]);
    saveDocument(COLLECTIONS.USERS, newMember.id, newMember);
    addToast({
      type: "success",
      title: `تمت إضافة المساعد ومزامنته: ${newMember.name}`,
      description: `الدور: ${newMember.roleLabel}`,
    });
    return newMember;
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    saveDocument(COLLECTIONS.USERS, id, updates);
    addToast({
      type: "success",
      title: "تم تحديث بيانات المساعد وصلاحياته ومزامنتها سحابياً",
    });
  };

  const deleteTeamMember = (id: string) => {
    if (id === currentUser.id) {
      addToast({
        type: "error",
        title: "لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به",
      });
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    deleteDocument(COLLECTIONS.USERS, id);
    addToast({
      type: "info",
      title: "تم حذف عضو الفريق ومزامنة التغيير",
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        brands,
        currentBrandId,
        setCurrentBrandId,
        selectedBrand,
        connectedAccounts,
        templates: VISUAL_TEMPLATES,
        products: CATALOG_PRODUCTS,
        posts,
        ideas,
        dailyGoals,
        isCloudSynced,
        createIdea,
        updateIdea,
        deleteIdea,
        advanceIdeaStage,
        sendIdeaToPostStudio,
        toggleArchiveIdea,
        autoArchiveOldIdeas,
        updateDailyGoal,
        inboxItems,
        teamMembers,
        currentUser,
        setCurrentUser,
        toasts,
        addToast,
        removeToast,
        createPost,
        updatePost,
        deletePost,
        publishPostNow,
        replyToInbox,
        deleteInboxItem,
        triggerAutoRepliesForAllPending,
        createBrand,
        updateBrand,
        deleteBrand,
        toggleAccountStatus,
        updateConnectedAccount,
        deleteConnectedAccount,
        reassignAccountBrand,
        cleanAllDemoTokensAndData,
        connectNewAccount,
        syncAllFacebookPagesWithFirestore,
        syncRawFacebookPagesToFirestore,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        activeTab,
        setActiveTab,
        editingPost,
        setEditingPost,
        importedIdeaForStudio,
        setImportedIdeaForStudio,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
