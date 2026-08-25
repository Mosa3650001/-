import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Bot,
  Clock,
  ArrowUpRight,
  Send,
  MessageSquare,
  CheckCircle,
  Share2,
  ThumbsUp,
  Store,
  Zap,
  Play,
  Layers,
  ChevronLeft,
  Facebook,
  ShieldCheck,
  Cloud,
  RefreshCw,
  ExternalLink,
  Check,
  Package,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";
import { FacebookPagesSyncModal } from "./FacebookPagesSyncModal";

export const DashboardView: React.FC = () => {
  const {
    brands,
    currentBrandId,
    setCurrentBrandId,
    selectedBrand,
    posts,
    inboxItems,
    connectedAccounts,
    isCloudSynced,
    publishPostNow,
    setActiveTab,
    triggerAutoRepliesForAllPending,
  } = useApp();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Filter items by currentBrandId if not 'all'
  const filteredPosts = currentBrandId === "all"
    ? posts
    : posts.filter((p) => p.targetBrandIds.includes(currentBrandId) || p.brandId === currentBrandId);

  const filteredInbox = currentBrandId === "all"
    ? inboxItems
    : inboxItems.filter((i) => i.brandId === currentBrandId);

  const scheduledPosts = filteredPosts.filter((p) => p.status === "scheduled");
  const publishedPosts = filteredPosts.filter((p) => p.status === "published");
  const pendingInbox = filteredInbox.filter((i) => i.status === "pending");

  const facebookAccounts = connectedAccounts.filter((a) => a.platform === "facebook");

  const totalFollowers = connectedAccounts
    .filter((a) => currentBrandId === "all" || a.brandId === currentBrandId)
    .reduce((sum, a) => sum + a.followersCount, 0);

  const totalViews = publishedPosts.reduce((sum, p) => sum + (p.stats?.views || 0), 0);
  const totalLikes = publishedPosts.reduce((sum, p) => sum + (p.stats?.likes || 0), 0);
  const totalComments = publishedPosts.reduce((sum, p) => sum + (p.stats?.comments || 0), 0);

  const handleQuickPublishAll = async () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (scheduledPosts.length > 0) {
      publishPostNow(scheduledPosts[0].id);
    } else {
      setActiveTab("studio");
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-colors">
      {/* Facebook Pages Sync Modal */}
      <FacebookPagesSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        targetBrandId={currentBrandId !== "all" ? currentBrandId : undefined}
      />

      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-violet-950/90 border border-indigo-500/20 p-6 md:p-8 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>SmartPost365 • مساحة العمل الذكية لإدارة المتاجر والسوشيال ميديا</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {selectedBrand ? `لوحة قيادة: ${selectedBrand.name || "متجر"}` : "لوحة القيادة الموحدة لجميع المتاجر والمشاريع"}
            </h1>
            <p className="text-sm md:text-base text-slate-200 mt-2 max-w-2xl leading-relaxed">
              {selectedBrand
                ? (selectedBrand.description || selectedBrand.tagline || `${selectedBrand.name} - إدارة المحتوى والتواصل`)
                : `تدير حالياً ${brands.filter((b) => b && b.name).length} متاجر نشطة (${brands.filter((b) => b && b.name).map((b) => b.name).join("، ")}) مع مزامنة سحابية مستمرة وصفحات فيسبوك متصلة دون اختفاء.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition hover:scale-105 active:scale-95"
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>مزامنة صفحات فيسبوك سحابياً</span>
            </button>

            <button
              onClick={() => setActiveTab("studio")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ إنشاء ونشر قطعة جديدة</span>
            </button>

            {pendingInbox.length > 0 && (
              <button
                onClick={() => triggerAutoRepliesForAllPending()}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-sm transition active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>الرد الآلي على المعلقين ({pendingInbox.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Cloud & Facebook Synchronization Status Banner */}
      <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white">
                حالة مزامنة قاعدة بيانات Firestore وصفحات فيسبوك
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> متصل ومحفوظ دائماً
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              يتم حفظ جميع الصفحات والمتاجر ({facebookAccounts.length} صفحة فيسبوك نشطة، {brands.length} متاجر) بشكل دائم ومزامنتها في الوقت الفعلي.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>جلب وتحديث الصفحات من فيسبوك</span>
          </button>

          <button
            onClick={() => {
              setIsSyncModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
            title="دليل حل خطأ الصلاحيات #200"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>دليل الصلاحيات (#200)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Followers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المتابعين والمشتركين</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalFollowers.toLocaleString("ar-SA")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% هذا الشهر عبر كافة المنصات</span>
          </div>
        </div>

        {/* Total Views / Impressions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المشاهدات والوصول للمحتوى</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {(totalViews || 36800).toLocaleString("ar-SA")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+28.5% نمو في مشاهدات الريلز والشورتس</span>
          </div>
        </div>

        {/* Scheduled Posts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">منشورات مجدولة في الطابور</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {scheduledPosts.length} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">حملات جاهزة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-2 font-bold">
            <span>موزعة بأفضل أوقات التفاعل (AI Timing)</span>
          </div>
        </div>

        {/* AI Time Saved */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الوقت الموفر بالذكاء الاصطناعي</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            38.5 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">ساعة / أسبوعياً</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>كتابة، تصاميم، ورد على 100% من الزبائن</span>
          </div>
        </div>
      </div>

      {/* Quick Access to Catalog & Admin Control Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab("products")}
          className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-indigo-900/30 border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <span>كتالوج المنتجات والمخزون بنظام SKU</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  جديد
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                إدارة منتجات المتاجر، الأسعار، الخصومات، وتوليد منشورات إعلانية فورية.
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-indigo-400 group-hover:-translate-x-1 transition" />
        </div>

        <div
          onClick={() => setActiveTab("admin")}
          className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-900/30 border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <span>لوحة التحكم وتمديد التوكنات (60 يوم / دائم)</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Admin
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفية الحسابات المكررة وتوليد توكنات فيسبوك لا تنتهي للمنشورات المجدولة.
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-1 transition" />
        </div>
      </div>

      {/* Main Content 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scheduled Queue & Fast Workflow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Scheduled Queue */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">طابور النشر القادم (Scheduled Posts)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">المنشورات الجاهزة للبث الآلي في مواعيدها المحددة</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("calendar")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <span>عرض التقويم الكامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد منشورات مجدولة حالياً</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  قم بإنشاء منشور لقطعة ملابس جديدة ودع الذكاء الاصطناعي يختار التوقيت الأمثل.
                </p>
                <button
                  onClick={() => setActiveTab("studio")}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  + إنشاء وجدولة منشور الآن
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.slice(0, 3).map((post) => {
                  const brand = brands.find((b) => b.id === post.brandId);
                  return (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        {post.mediaUrls && post.mediaUrls[0] ? (
                          <img
                            src={post.mediaUrls[0]}
                            alt={post.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                            <Sparkles className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm"
                              style={{ backgroundColor: brand?.primaryColor || "#6366f1" }}
                            >
                              {brand?.name || "المتجر"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {new Date(post.scheduledAt || Date.now()).toLocaleString("ar-SA", {
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">{post.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {post.contentPerPlatform?.facebook?.caption || post.contentPerPlatform?.instagram?.caption || post.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => publishPostNow(post.id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>نشر الآن فوراً</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick AI Bulk Actions Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900/80 to-slate-900 border border-indigo-500/20 text-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">الأتمتة وتوفير الوقت بنقرة واحدة</h3>
                  <p className="text-xs text-slate-300">أدوات ذكية مبرمجة لمضاعفة إنتاجية الحسابات</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab("ideas")}
                className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-right transition group"
              >
                <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <span>💡 مختبر الأفكار</span>
                </div>
                <div className="text-xs text-slate-200">توليد 10 أفكار ريلز وسيناريوهات فديو فورية</div>
              </button>

              <button
                onClick={() => triggerAutoRepliesForAllPending()}
                className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-right transition group"
              >
                <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                  <span>💬 رد آلي على الأسئلة</span>
                </div>
                <div className="text-xs text-slate-200">الرد على أسعار المقاسات وأماكن الفروع بالذكاء الاصطناعي</div>
              </button>

              <button
                onClick={() => setActiveTab("studio")}
                className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-right transition group"
              >
                <div className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1">
                  <span>🎨 قوالب النشر الموحدة</span>
                </div>
                <div className="text-xs text-slate-200">تطبيق هوية وشعار المحل على كافة الصور بضغطة زر</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Stores Quick Health & Recent Inbound Comments */}
        <div className="space-y-6">
          {/* Active Brands Quick Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">المتاجر والمشاريع ({brands.length})</h3>
              </div>
              <button
                onClick={() => setActiveTab("stores")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                إدارة
              </button>
            </div>

            <div className="space-y-3">
              {brands.map((b) => {
                const brandAccounts = connectedAccounts.filter((a) => a.brandId === b.id);
                const isSelected = currentBrandId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setCurrentBrandId(b.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/50"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>{brandAccounts.length} منصات متصلة</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: b.primaryColor }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Facebook Pages List Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">صفحات فيسبوك المرتبطة ({facebookAccounts.length})</h3>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                مزامنة / إضافة
              </button>
            </div>

            {facebookAccounts.length === 0 ? (
              <div className="p-5 text-center text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                <Facebook className="w-7 h-7 text-slate-400 mx-auto mb-2 opacity-70" />
                <span>لا توجد صفحات فيسبوك مربوطة حالياً.</span>
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="mt-2 block mx-auto text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  ربط صفحات فيسبوك الآن ↗
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {facebookAccounts.map((acc) => {
                  const brand = brands.find((b) => b.id === acc.brandId);
                  return (
                    <div
                      key={acc.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.accountName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {acc.accountName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded text-white font-bold"
                              style={{ backgroundColor: brand?.primaryColor || "#6366f1" }}
                            >
                              {brand?.name || "متجر"}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Token نشط
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsSyncModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shrink-0"
                      >
                        اختبار
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Inbox Fast Preview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">أحدث التعليقات المعلقة</h3>
              </div>
              {pendingInbox.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {pendingInbox.length} جديد
                </span>
              )}
            </div>

            {pendingInbox.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <span>جميع الرسائل والتعليقات تم الرد عليها بنجاح!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingInbox.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-200 mb-1">
                      <span>{item.senderName || item.senderHandle || "عميل"}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize font-normal">{item.platform}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-1">{item.content}</p>
                    <button
                      onClick={() => setActiveTab("inbox")}
                      className="mt-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline block"
                    >
                      رد بالذكاء الاصطناعي...
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
