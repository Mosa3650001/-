import { Brand, ConnectedAccount, VisualTemplate, CatalogProduct, Post, InboxItem, TeamMember, ContentIdea, DailyPublishGoal } from "../types";

export const INITIAL_BRANDS: Brand[] = [];

export const INITIAL_CONNECTED_ACCOUNTS: ConnectedAccount[] = [];

export const VISUAL_TEMPLATES: VisualTemplate[] = [
  {
    id: "tpl-new-arrival",
    name: "New Arrival Chic",
    nameAr: "وصل حديثاً - شيك",
    category: "new_arrival",
    badgeText: "✨ وصل حديثاً NEW ARRIVAL",
    badgeStyle: "top_pill",
    primaryBg: "from-blue-600 to-indigo-700",
    textColor: "text-white",
    accentColor: "#3b82f6",
    iconName: "Sparkles",
  },
  {
    id: "tpl-mega-sale",
    name: "Mega Sale Discount",
    nameAr: "عرض التوفير الأقوى",
    category: "mega_sale",
    badgeText: "🔥 تخفيضات كبرى MEGA SALE",
    badgeStyle: "corner_ribbon",
    primaryBg: "from-red-600 to-rose-700",
    textColor: "text-white",
    accentColor: "#ef4444",
    iconName: "Zap",
  },
  {
    id: "tpl-exclusive-gold",
    name: "Luxury Exclusive Gold",
    nameAr: "الفخامة والقطع الحصرية",
    category: "exclusive",
    badgeText: "👑 تشكيلة حصرية EXCLUSIVE",
    badgeStyle: "luxury_frame",
    primaryBg: "from-purple-900 via-indigo-900 to-slate-950",
    textColor: "text-amber-300",
    accentColor: "#fbbf24",
    iconName: "Crown",
  },
  {
    id: "tpl-flash-offer",
    name: "Flash Offer Friday",
    nameAr: "عرض الجمعة المميز",
    category: "friday_offer",
    badgeText: "⚡ عرض خاص للجمعة",
    badgeStyle: "price_tag",
    primaryBg: "from-amber-500 to-orange-600",
    textColor: "text-slate-950",
    accentColor: "#f59e0b",
    iconName: "Clock",
  },
];

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "prod-1",
    title: "قميص كتان طبيعي صيفي كلاسيك",
    category: "shirts",
    categoryAr: "قمصان رجالية",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
    suggestedPrice: 145,
    originalPrice: 220,
    discountPercentage: 35,
    sizes: ["M", "L", "XL", "2XL", "3XL"],
    colors: ["بيج رملي", "أبيض ناصع", "أزرق سماوي", "زيتي هادئ"],
    description: "قميص صيفي مصنوع من أجود خيوط الكتان الطبيعي، خفيف وبارد ومثالي للدوام والمناسبات النهارية.",
  },
  {
    id: "prod-2",
    title: "طقم رياضي شبابي مريح",
    category: "sportswear",
    categoryAr: "أطقم رياضية",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80",
    suggestedPrice: 185,
    originalPrice: 260,
    discountPercentage: 28,
    sizes: ["S", "M", "L", "XL"],
    colors: ["رمادي ثلجي", "أسود ملكي", "أخضر زيتوني"],
    description: "طقم ستريت وير عصري مريح جداً بخامات قطنية معالجة ضد الانكماش.",
  },
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_INBOX_ITEMS: InboxItem[] = [];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "usr-admin",
    name: "موسى الوهيب",
    email: "alwheeb365@gmail.com",
    role: "super_admin",
    roleLabel: "المدير العام (Super Admin)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    phone: "+966 50 111 2222",
    assignedBrandIds: ["all"],
    permissions: {
      canCreatePosts: true,
      canPublishDirectly: true,
      canEditSchedule: true,
      canReplyInbox: true,
      canManageBrands: true,
      canManageTeam: true,
      canViewAnalytics: true,
    },
    status: "active",
    joinedDate: "2026-01-01",
    lastActive: "نشط الآن",
  },
];

export const INITIAL_IDEAS: ContentIdea[] = [];

export const INITIAL_PUBLISH_GOALS: DailyPublishGoal[] = [
  { id: "g-sat", dayOfWeek: "saturday", dayNameAr: "السبت", brandId: "all", targetReelsCount: 2, targetPostsCount: 1, targetStoriesCount: 3, notes: "يوم تسوق عائلي، التركيز على عروض الويكند والريلز التفاعلي" },
  { id: "g-sun", dayOfWeek: "sunday", dayNameAr: "الأحد", brandId: "all", targetReelsCount: 1, targetPostsCount: 2, targetStoriesCount: 2, notes: "بداية الأسبوع، منشورات تنسيقات الدوام والأطقم الكلاسيكية" },
  { id: "g-mon", dayOfWeek: "monday", dayNameAr: "الإثنين", brandId: "all", targetReelsCount: 2, targetPostsCount: 1, targetStoriesCount: 2, notes: "ريلز سريع وتريند وتنسيقات كاجوال خفيفة" },
  { id: "g-tue", dayOfWeek: "tuesday", dayNameAr: "الثلاثاء", brandId: "all", targetReelsCount: 1, targetPostsCount: 1, targetStoriesCount: 2, notes: "نصائح فاشن وأسئلة واستطلاعات رأي بالستوري" },
  { id: "g-wed", dayOfWeek: "wednesday", dayNameAr: "الأربعاء", brandId: "all", targetReelsCount: 2, targetPostsCount: 1, targetStoriesCount: 3, notes: "إعلان عروض نهاية الأسبوع والقطع الأكثر طلباً" },
  { id: "g-thu", dayOfWeek: "thursday", dayNameAr: "الخميس", brandId: "all", targetReelsCount: 3, targetPostsCount: 2, targetStoriesCount: 4, notes: "ذروة التفاعل! 3 ريلز سريعة للإطلالات المسائية وعروض الخصم" },
  { id: "g-fri", dayOfWeek: "friday", dayNameAr: "الجمعة", brandId: "all", targetReelsCount: 2, targetPostsCount: 1, targetStoriesCount: 3, notes: "جمعة مباركة، كولكشن الأناقة بعد الصلاة ومساء الجمعة" },
];
