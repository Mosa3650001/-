import {
  Brand,
  ConnectedAccount,
  VisualTemplate,
  CatalogProduct,
  ProductCategory,
  ProductDepartment,
  ProductItem,
  Post,
  InboxItem,
  TeamMember,
  ContentIdea,
  DailyPublishGoal,
} from "../types";

export const INITIAL_BRANDS: Brand[] = [];

export const INITIAL_CONNECTED_ACCOUNTS: ConnectedAccount[] = [];

export const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: "cat-cloth", code: "CLOTH", name: "الملابس والأزياء", nameAr: "الملابس والأزياء", icon: "Shirt" },
  { id: "cat-shoes", code: "SHOES", name: "الأحذية والحقائب", nameAr: "الأحذية والحقائب", icon: "Footprints" },
  { id: "cat-acc", code: "ACC", name: "الإكسسوارات والساعات", nameAr: "الإكسسوارات والساعات", icon: "Watch" },
  { id: "cat-beauty", code: "BEAUTY", name: "العناية والعطور", nameAr: "العناية والعطور", icon: "Sparkles" },
  { id: "cat-services", code: "SERV", name: "الخدمات والتوصيل", nameAr: "الخدمات والتوصيل", icon: "Truck" },
];

export const INITIAL_DEPARTMENTS: ProductDepartment[] = [
  { id: "dep-men-shirts", code: "MSHIRT", categoryId: "cat-cloth", name: "قمصان وتيشيرتات رجالي", nameAr: "قمصان وتيشيرتات رجالي" },
  { id: "dep-men-pants", code: "MPANTS", categoryId: "cat-cloth", name: "بناطيل وأطقم رياضية رجالي", nameAr: "بناطيل وأطقم رياضية رجالي" },
  { id: "dep-women-dresses", code: "WDRESS", categoryId: "cat-cloth", name: "فساتين وجلابيات نسائية", nameAr: "فساتين وجلابيات نسائية" },
  { id: "dep-shoes-sneakers", code: "SNEAK", categoryId: "cat-shoes", name: "أحذية سنيكرز ورياضية", nameAr: "أحذية سنيكرز ورياضية" },
  { id: "dep-perfumes", code: "PERF", categoryId: "cat-beauty", name: "عطور شرقية وبخاخات", nameAr: "عطور شرقية وبخاخات" },
];

export const INITIAL_PRODUCTS: ProductItem[] = [];

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
    sku: "SP-CLOTH-MSHIRT-1001",
    brandId: "brand-1",
    title: "قميص كتان طبيعي صيفي كلاسيك",
    description: "قميص صيفي مصنوع من أجود خيوط الكتان الطبيعي، خفيف وبارد ومثالي للدوام والمناسبات النهارية.",
    categoryId: "cat-cloth",
    categoryCode: "CLOTH",
    departmentId: "dep-mshirt",
    departmentCode: "MSHIRT",
    category: "shirts",
    categoryAr: "قمصان رجالية",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
    mediaUrls: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80"],
    price: 145,
    suggestedPrice: 145,
    originalPrice: 220,
    discountPercentage: 35,
    stockQuantity: 24,
    inStock: true,
    sizes: ["M", "L", "XL", "2XL", "3XL"],
    colors: ["بيج رملي", "أبيض ناصع", "أزرق سماوي", "زيتي هادئ"],
    tags: ["صيفي", "كتان", "رجالي", "عرض_خاص"],
  },
  {
    id: "prod-2",
    sku: "SP-CLOTH-SPORT-1002",
    brandId: "brand-1",
    title: "طقم رياضي شبابي مريح",
    description: "طقم ستريت وير عصري مريح جداً بخامات قطنية معالجة ضد الانكماش.",
    categoryId: "cat-cloth",
    categoryCode: "CLOTH",
    departmentId: "dep-sport",
    departmentCode: "SPORT",
    category: "sportswear",
    categoryAr: "أطقم رياضية",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80",
    mediaUrls: ["https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80"],
    price: 185,
    suggestedPrice: 185,
    originalPrice: 260,
    discountPercentage: 28,
    stockQuantity: 15,
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["رمادي ثلجي", "أسود ملكي", "أخضر زيتوني"],
    tags: ["رياضي", "ستريت_وير", "قطن", "تخفيضات"],
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
