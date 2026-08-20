export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "whatsapp" | "youtube";

export type PostFormat = "feed" | "reel" | "story" | "whatsapp_broadcast";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  primaryColor: string;
  accentColor?: string;
  badgeBg?: string;
  phone?: string;
  whatsappNumber?: string;
  whatsappLink?: string;
  address?: string;
  workingHours?: string;
  tone?: "youthful_trendy" | "discount_energetic" | "luxury_classy" | "friendly_casual" | "formal_commercial";
  toneLabel: string;
  aiReplyInstructions?: string;
  customAiInstructions?: string;
  defaultHashtags: string[];
  priceRange?: "budget" | "medium" | "luxury";
  priceRangeLabel?: string;
  pricingTier?: "budget" | "mid" | "luxury";
  isEnabled?: boolean;
  connectedPlatforms: SocialPlatform[];
  autoReplyEnabled?: boolean;
  autoReplyDelaySeconds?: number;
}

export interface ConnectedAccount {
  id: string;
  brandId: string;
  platform: SocialPlatform;
  accountName: string;
  handle: string;
  avatar: string;
  pageId?: string;
  accountId?: string;
  apiToken?: string;
  apiSecret?: string;
  webhookUrl?: string;
  tokenExpiresAt?: string;
  followersCount: number;
  status: "connected" | "expired" | "disconnected" | "syncing";
  lastSyncedAt: string;
  canPublish: boolean;
  canReadComments: boolean;
  canDirectMessage: boolean;
}

export interface VisualTemplate {
  id: string;
  name: string;
  nameAr: string;
  category: "new_arrival" | "mega_sale" | "exclusive" | "friday_offer" | "minimal";
  badgeText: string;
  badgeStyle: "top_pill" | "corner_ribbon" | "price_tag" | "glow_border" | "luxury_frame";
  primaryBg: string;
  textColor: string;
  accentColor: string;
  iconName: string;
}

export interface CatalogProduct {
  id: string;
  title: string;
  category: "shirts" | "dresses" | "pants" | "sportswear" | "suits" | "shoes";
  categoryAr: string;
  image: string;
  suggestedPrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  sizes: string[];
  colors: string[];
  description: string;
}

export interface PlatformPostContent {
  caption: string;
  hashtags: string[];
  hook?: string;
  callToAction?: string;
  format: PostFormat;
  mediaUrl?: string;
  customized?: boolean;
}

export interface Post {
  id: string;
  title: string;
  brandId: string; // or 'all' if broadcasted
  targetBrandIds: string[];
  targetPlatforms: SocialPlatform[];
  contentPerPlatform: Partial<Record<SocialPlatform, PlatformPostContent>>;
  mediaUrls: string[];
  templateId?: string;
  productPrice?: number;
  productDiscount?: number;
  productSizes?: string[];
  productCategory?: string;
  badgeText?: string;
  status: PostStatus;
  scheduledAt: string; // ISO string
  publishedAt?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  stats?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
  };
  notes?: string;
  isAiGenerated?: boolean;
}

export interface InboxItem {
  id: string;
  brandId: string;
  brandName: string;
  platform: SocialPlatform;
  type: "comment" | "message";
  senderName: string;
  senderAvatar: string;
  senderHandle?: string;
  content: string;
  postTitle?: string;
  postImage?: string;
  timestamp: string;
  status: "pending" | "ai_replied" | "manual_replied" | "ignored";
  intent: "price" | "size" | "location" | "delivery" | "greeting" | "complaint" | "general";
  intentLabel: string;
  aiSuggestedReply: string;
  finalReplyText?: string;
  repliedAt?: string;
  repliedBy?: string;
  confidenceScore?: number;
}

export type UserRole = "super_admin" | "brand_manager" | "content_creator" | "inbox_agent" | "admin" | "editor" | "customer_support" | "viewer" | "owner" | "support";
export type TeamRole = UserRole;

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  roleLabel: string;
  avatar: string;
  phone?: string;
  assignedBrandIds: string[]; // empty or ['all'] means all brands
  permissions: {
    canCreatePosts?: boolean;
    canPublishDirectly?: boolean;
    canEditSchedule?: boolean;
    canSchedulePosts?: boolean;
    canReplyInbox?: boolean;
    canManageBrands?: boolean;
    canManageStoreSettings?: boolean;
    canManageTeam?: boolean;
    canViewAnalytics?: boolean;
    canUseAiTools?: boolean;
  };
  status: "active" | "invited" | "disabled";
  joinedDate: string;
  lastActive?: string;
}

export interface AnalyticsMetric {
  totalFollowers: number;
  followersGrowth: number;
  totalReach: number;
  reachGrowth: number;
  engagementRate: number;
  engagementGrowth: number;
  totalPostsThisMonth: number;
  autoRepliesCount: number;
  aiTimeSavedHours: number;
}

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  description?: string;
}

export type ContentStage = "idea" | "scripting" | "shooting" | "editing" | "ready" | "published";

export type ContentType = "reel" | "carousel" | "single_image" | "story" | "whatsapp_broadcast";

export interface SceneBreakdown {
  id: string;
  timestamp: string; // e.g. "0:00 - 0:03"
  title: string;
  voiceoverOrText: string;
  visualDirection: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  brandId: string;
  brandName?: string;
  contentType: ContentType;
  targetPlatforms: SocialPlatform[];
  stage: ContentStage;
  hook: string;
  script?: string;
  scenes?: SceneBreakdown[];
  filmingTips?: string;
  recommendedAudioOrVibe?: string;
  captionDraft?: string;
  hashtags: string[];
  callToAction?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  targetPublishDate?: string;
  estimatedDurationSeconds?: number;
  productName?: string;
  productPrice?: number;
  productDiscount?: number;
  productImage?: string;
  priority: "low" | "medium" | "high" | "urgent";
  notes?: string;
  isAiGenerated: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPublishGoal {
  id: string;
  dayOfWeek: "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  dayNameAr: string;
  brandId: string;
  targetReelsCount: number;
  targetPostsCount: number;
  targetStoriesCount: number;
  notes?: string;
}

export interface UserPermissions {
  canManageStores: boolean;
  canManageApiKeys: boolean;
  canPublishImmediately: boolean;
  canCreateIdeas: boolean;
  canEditIdeas: boolean;
  canDeleteIdeas: boolean;
  canReplyInbox: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
}

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

export interface FacebookPageData {
  id: string; // Facebook Page ID (e.g., "1083928172910")
  name: string; // Facebook Page Name (e.g., "بلال كوو للأزياء")
  access_token: string; // Permanent Page Access Token
  category: string; // Category e.g., "متجر وتجزئة" or "Clothing Store"
  connected_store_id: string; // Associated Store/Brand ID
  
  // Dashboard & Firestore compatibility fields:
  brandId: string; // Same as connected_store_id
  platform: "facebook";
  accountName: string; // Same as name
  handle: string; // @handle
  apiToken: string; // Same as access_token
  pageId: string; // Page ID
  accountId: string; // Account ID
  avatar: string;
  followersCount: number;
  fan_count?: number;
  tasks?: string[];
  link?: string;
  status: "connected" | "expired" | "disconnected" | "syncing";
  lastSync: string;
  lastSyncedAt: string;
  canPublish: boolean;
  canReadComments: boolean;
  canDirectMessage: boolean;
  updatedAt?: string;
}


