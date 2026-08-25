import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  RotateCcw,
  Sparkles,
  Wand2,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  X,
  Layers,
  Zap,
} from "lucide-react";
import { Post, SocialPlatform } from "../types";

interface EvergreenRecyclerModalProps {
  post: Post | null;
  onClose: () => void;
}

export const EvergreenRecyclerModal: React.FC<EvergreenRecyclerModalProps> = ({
  post: propPost,
  onClose: propOnClose,
}) => {
  const {
    evergreenModalOpen,
    setEvergreenModalOpen,
    createPost,
    brands,
    posts,
    currentUser,
    addToast,
    deductAiCredits,
  } = useApp();

  const isOpen = propPost ? true : evergreenModalOpen;
  const onClose = propOnClose || (() => setEvergreenModalOpen(false));

  const [selectedPostId, setSelectedPostId] = useState<string>(propPost?.id || posts[0]?.id || "");
  const activePost = propPost || posts.find((p) => p.id === selectedPostId) || posts[0];

  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [customCaption, setCustomCaption] = useState(activePost?.title || "");
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks later
    d.setHours(20, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [aiVariations, setAiVariations] = useState<
    Array<{ type: string; title: string; caption: string }>
  >([
    {
      type: "زاوية قصصية وتجربة عميل",
      title: "قصة وراء النجاح",
      caption: `تذكرون لما أطلقنا هذا المنتج أول مرة؟ أكثر من 500 عميل أكدوا أنه غير روتينهم اليومي تماماً! 🔥 تفاصيل وتجربة استثنائية بانتظارك اليوم مجدداً.`,
    },
    {
      type: "سؤال تفاعلي وتحفيز تعليقات",
      title: "استطلاع رأي الجمهور",
      caption: `لو خيروك بين هذي القطعة وأي قطعة ثانية في المتجر إيش تختار؟ 🤔 شاركونا رأيكم في التعليقات وأقوى تعليق له كود خصم خاص!`,
    },
    {
      type: "استعجال وفرصة أخيرة (FOMO)",
      title: "عودة الكمية بناءً على طلبكم",
      caption: `بعد نفاد الكمية الأولى في وقت قياسي.. رجعنا وفرنا لكم الدفعة الثانية لأيام محدودة فقط! ⏳ اطلب الآن قبل انتهاء المخزون.`,
    },
  ]);

  if (!isOpen || !activePost) return null;

  const targetBrand = brands.find((b) => b.id === activePost.brandId) || brands[0];

  const handleGenerateFreshAngles = async () => {
    setLoadingAi(true);
    deductAiCredits(2, "إعادة تدوير محتوى ناجح وصياغة زوايا جديدة");

    try {
      const response = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: targetBrand?.name || "متجرنا",
          brandTone: "حماسي ومهني مع زوايا تسويقية متنوعة",
          productTitle: activePost.title,
          productDescription: `منشور سابق حقق نجاحاً كبيراً: ${activePost.title}`,
          platforms: ["instagram", "tiktok", "facebook"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.posts && data.posts.length > 0) {
          const freshAngles = data.posts.slice(0, 3).map((p: any, i: number) => ({
            type: i === 0 ? "زاوية حماسية محدثة" : i === 1 ? "زاوية تفاعلية وفضول" : "زاوية مبيعات مباشرة",
            title: `زاوية جديدة #${i + 1}`,
            caption: p.caption || p.content || activePost.title,
          }));
          setAiVariations(freshAngles);
          setCustomCaption(freshAngles[0].caption);
        }
      }
    } catch {
      // Keep pre-generated high quality angles
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRecyclePost = () => {
    const chosenCaption = customCaption || aiVariations[selectedHookIndex]?.caption || activePost.title;

    createPost({
      title: `${activePost.title} (نسخة معاد تدويرها)`,
      brandId: activePost.brandId,
      targetBrandIds: activePost.targetBrandIds || [activePost.brandId],
      targetPlatforms: activePost.targetPlatforms || ["instagram", "tiktok", "facebook"],
      contentPerPlatform: {
        instagram: {
          caption: chosenCaption,
          hashtags: targetBrand?.defaultHashtags || ["#إعادة_توفر", "#أزياء", "#عروض"],
          format: "feed",
          mediaUrl: activePost.mediaUrls?.[0] || "",
          mediaType: activePost.mediaType || "image",
        },
        tiktok: {
          caption: `${chosenCaption.slice(0, 100)} 🔥`,
          hashtags: targetBrand?.defaultHashtags?.slice(0, 3) || [],
          format: "reel",
          mediaUrl: activePost.mediaUrls?.[0] || "",
          mediaType: activePost.mediaType || "image",
        },
        facebook: {
          caption: chosenCaption,
          hashtags: targetBrand?.defaultHashtags || [],
          format: "feed",
          mediaUrl: activePost.mediaUrls?.[0] || "",
          mediaType: activePost.mediaType || "image",
        },
        whatsapp: {
          caption: chosenCaption,
          hashtags: [],
          format: "whatsapp_broadcast",
          mediaUrl: activePost.mediaUrls?.[0] || "",
          mediaType: activePost.mediaType || "image",
        },
      },
      mediaUrls: activePost.mediaUrls || [],
      mediaType: activePost.mediaType || "image",
      productPrice: activePost.productPrice,
      productDiscount: activePost.productDiscount,
      status: "scheduled",
      scheduledAt: new Date(scheduledDate).toISOString(),
      approvalStatus: "approved",
      contentPillar: activePost.contentPillar || "products",
      isEvergreen: true,
      recycledFromPostId: activePost.id,
      createdBy: currentUser?.id || "user_admin",
      createdByName: currentUser?.name || "مدير النظام",
    });

    addToast({
      type: "success",
      title: "♻️ تم تدوير المنشور وجدولته بزاوية جديدة بنجاح!",
      description: `الموعد الجديد: ${new Date(scheduledDate).toLocaleDateString("ar-SA")}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  إعادة تدوير المحتوى الناجح (Evergreen Content Recycler)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                  AI Repurposing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                استثمار المنشورات الأعلى تفاعلاً وإعادة صياغة الهوك (Hook) بزوايا جديدة ومبتكرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Post Selection if opened globally */}
          {!propPost && posts.length > 1 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                اختر المنشور المراد إعادة تدويره وصياغة زوايا جديدة له:
              </label>
              <select
                value={activePost.id}
                onChange={(e) => {
                  setSelectedPostId(e.target.value);
                  const p = posts.find((item) => item.id === e.target.value);
                  if (p) setCustomCaption(p.title);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              >
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status === "published" ? "✅ منشور" : "⏰ مجدول"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Original Post Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <img
              src={activePost.mediaUrls?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200"}
              alt=""
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400 font-bold">المنشور الأصلي:</div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {activePost.title}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                <span>تفاعل ممتاز: {activePost.stats?.likes || 48} إعجاب</span>
                <span>•</span>
                <span>{activePost.stats?.views || 320} مشاهدة</span>
              </div>
            </div>
          </div>

          {/* AI Variations Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-indigo-500" />
                اختر زاوية الطرح الجديدة المولدة بالذكاء الاصطناعي:
              </label>
              <button
                type="button"
                onClick={handleGenerateFreshAngles}
                disabled={loadingAi}
                className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? "animate-spin" : ""}`} />
                توليد زوايا أخرى
              </button>
            </div>

            <div className="space-y-2.5">
              {aiVariations.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedHookIndex(idx);
                    setCustomCaption(item.caption);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedHookIndex === idx
                      ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {item.type}
                    </span>
                    {selectedHookIndex === idx && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> تم الاختيار
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Editable Caption Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              تعديل نص المنشور النهائي:
            </label>
            <textarea
              rows={3}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Schedule Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              الموعد الجديد لجدولة المنشور:
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleRecyclePost}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            جدولة المنشور المعاد تدويره
          </button>
        </div>
      </div>
    </div>
  );
};
