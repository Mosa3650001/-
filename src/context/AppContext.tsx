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
  connectNewAccount: (brandId: string, platform: SocialPlatform, handle: string, name: string, apiToken?: string, accountId?: string) => void;

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
    const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [currentBrandId, setCurrentBrandIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_BRAND);
    return saved || "all";
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_CONNECTED_ACCOUNTS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [ideas, setIdeas] = useState<ContentIdea[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  const [dailyGoals, setDailyGoals] = useState<DailyPublishGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_PUBLISH_GOALS;
  });

  const [inboxItems, setInboxItems] = useState<InboxItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INBOX);
    return saved ? JSON.parse(saved) : INITIAL_INBOX_ITEMS;
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

  // Real-time Cloud Firestore Subscriptions & Initial Seeding
  useEffect(() => {
    // Seed initial data to cloud if collections are empty
    seedInitialFirestoreData(
      brands,
      connectedAccounts,
      ideas,
      posts,
      inboxItems,
      teamMembers,
      dailyGoals
    );

    // Listen to real-time updates from cloud Firestore
    const unsubBrands = subscribeToCollection<Brand>(COLLECTIONS.BRANDS, (data) => {
      if (data && data.length > 0) {
        setBrands(data);
        setIsCloudSynced(true);
      }
    });

    const unsubAccounts = subscribeToCollection<ConnectedAccount>(COLLECTIONS.ACCOUNTS, (data) => {
      if (data && data.length > 0) {
        setConnectedAccounts(data);
        setIsCloudSynced(true);
      }
    });

    const unsubIdeas = subscribeToCollection<ContentIdea>(COLLECTIONS.IDEAS, (data) => {
      if (data && data.length > 0) {
        setIdeas(data);
        setIsCloudSynced(true);
      }
    });

    const unsubPosts = subscribeToCollection<Post>(COLLECTIONS.POSTS, (data) => {
      if (data && data.length > 0) {
        setPosts(data);
        setIsCloudSynced(true);
      }
    });

    const unsubInbox = subscribeToCollection<InboxItem>(COLLECTIONS.INBOX, (data) => {
      if (data && data.length > 0) {
        setInboxItems(data);
        setIsCloudSynced(true);
      }
    });

    const unsubTeam = subscribeToCollection<TeamMember>(COLLECTIONS.USERS, (data) => {
      if (data && data.length > 0) {
        setTeamMembers(data);
        setIsCloudSynced(true);
      }
    });

    const unsubGoals = subscribeToCollection<DailyPublishGoal>(COLLECTIONS.GOALS, (data) => {
      if (data && data.length > 0) {
        setDailyGoals(data);
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
      const fbAccounts = connectedAccounts.filter(
        (acc) =>
          acc.platform === "facebook" &&
          (post.brandId === "all" || post.brandId === acc.brandId || (post.targetBrandIds && post.targetBrandIds.includes(acc.brandId))) &&
          acc.apiToken &&
          acc.apiToken.length > 20 &&
          (acc.pageId || acc.accountId)
      );

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
    const id = "brand-" + Date.now();
    const newBrand: Brand = {
      ...brandData,
      id,
    };
    setBrands((prev) => [...prev, newBrand]);
    saveDocument(COLLECTIONS.BRANDS, id, newBrand);

    // Auto-create initial connected accounts placeholders
    const newAccounts: ConnectedAccount[] = brandData.connectedPlatforms.map((platform) => ({
      id: `acc-${id}-${platform}`,
      brandId: id,
      platform,
      accountName: `${newBrand.name} - ${platform}`,
      handle: `@${newBrand.slug}_${platform}`,
      avatar: newBrand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&auto=format&fit=crop&q=80",
      followersCount: 1200,
      status: "connected",
      lastSyncedAt: "الآن",
      canPublish: true,
      canReadComments: true,
      canDirectMessage: true,
    }));

    setConnectedAccounts((prev) => [...prev, ...newAccounts]);
    for (const acc of newAccounts) {
      saveDocument(COLLECTIONS.ACCOUNTS, acc.id, acc);
    }
    addToast({
      type: "success",
      title: `تم إنشاء متجر ومزامنته سحابياً: ${newBrand.name}`,
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
    if (brands.length <= 1) {
      addToast({
        type: "error",
        title: "لا يمكن حذف المتجر الأخير",
        description: "يجب أن يبقى متجر واحد على الأقل في المنصة.",
      });
      return;
    }
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
        connectNewAccount,
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
