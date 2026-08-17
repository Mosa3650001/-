import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Video,
  Play,
  ArrowUpRight,
  Flame,
  Award,
  Users,
  Store,
  Filter,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const {
    brands,
    currentBrandId,
    setCurrentBrandId,
    posts,
    connectedAccounts,
  } = useApp();

  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "quarter" | "custom">("30d");
  const [customStartDate, setCustomStartDate] = useState<string>("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState<string>("2026-08-17");

  const filteredPosts = posts.filter(
    (p) => currentBrandId === "all" || p.targetBrandIds.includes(currentBrandId) || p.brandId === currentBrandId
  );

  const publishedPosts = filteredPosts.filter((p) => p.status === "published");

  // Multiplier for mock dynamic metrics based on range
  const multiplier = timeRange === "today" ? 0.08 : timeRange === "7d" ? 0.35 : timeRange === "quarter" ? 2.8 : 1;

  // Mock Top Video / Reels
  const topReels = [
    {
      id: "reel-1",
      title: "تنسيق قميص الكتان الإيطالي 3 ستايلات مختلفة 🔥",
      brandName: "محل بلال كوو",
      platform: "TikTok",
      views: Math.round(84200 * multiplier),
      likes: Math.round(6420 * multiplier),
      shares: Math.round(1280 * multiplier),
      comments: Math.round(342 * multiplier),
      retention: "84%",
      thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: "reel-2",
      title: "عروض التوفير الأسبوعية على التيشيرتات القطنية ⚡",
      brandName: "محل عالم التوفير",
      platform: "Instagram",
      views: Math.round(45900 * multiplier),
      likes: Math.round(3120 * multiplier),
      shares: Math.round(890 * multiplier),
      comments: Math.round(184 * multiplier),
      retention: "78%",
      thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: "reel-3",
      title: "إطلالة فستان الشيفون الراقي للأعراس والمناسبات ✨",
      brandName: "محل الصرخة",
      platform: "Instagram",
      views: Math.round(68400 * multiplier),
      likes: Math.round(5800 * multiplier),
      shares: Math.round(2150 * multiplier),
      comments: Math.round(490 * multiplier),
      retention: "91%",
      thumbnail: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>تقارير الأداء ومتابعة الفيديوهات والتفاعل</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">إحصائيات وتحليلات الصفحات والفيديوهات</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              مراقبة نمو المتابعين، تفاعل المنشورات، وأداء مقاطع الريلز والشورتس عبر كافة المتاجر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Store Filter */}
            <select
              value={currentBrandId}
              onChange={(e) => setCurrentBrandId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="all">🏢 جميع المتاجر (مقارنة شاملة)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Time Range Selector */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-wrap gap-0.5">
              <button
                type="button"
                onClick={() => setTimeRange("today")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeRange === "today" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("7d")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeRange === "7d" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                آخر 7 أيام
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("30d")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeRange === "30d" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                آخر 30 يوماً
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("quarter")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeRange === "quarter" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                الربع الحالي
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("custom")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeRange === "custom" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                مخصص 📅
              </button>
            </div>
          </div>
        </div>

        {/* Custom Range Inputs if selected */}
        {timeRange === "custom" && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>حدد الفترة الزمنية المخصصة:</span>
            </span>
            <div className="flex items-center gap-2">
              <label className="text-slate-600 dark:text-slate-300">من:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-600 dark:text-slate-300">إلى:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المشاهدات</span>
            <Eye className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {Math.round(198500 * multiplier).toLocaleString("ar-SA")}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">↑ +32.4% مقارنة بالفترة السابقة</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل التفاعل الإجمالي</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">7.8%</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">أعلى من متوسط قطاع الأزياء (4.2%)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">التعليقات والردود الآلية</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {Math.round(1480 * multiplier).toLocaleString("ar-SA")}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">100% نسبة الاستجابة السريعة</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نقرات واتساب والطلب</span>
            <Share2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {Math.round(840 * multiplier).toLocaleString("ar-SA")}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">معدل تحويل 42% إلى محادثات بيع</span>
        </div>
      </div>

      {/* Top Videos & Reels Performance Table */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">أداء مقاطع الفيديو والريلز (Top Video Analytics)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">الفيديوهات الأكثر تحقيقاً للمبيعات والمشاهدات</p>
            </div>
          </div>

          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">ترتيب حسب الأعلى وصولاً</span>
        </div>

        <div className="space-y-3">
          {topReels.map((reel, index) => (
            <div
              key={reel.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="w-16 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[9px] px-1 rounded bg-black/80 text-white font-mono font-bold">
                    #{index + 1}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                      {reel.brandName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {reel.platform}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{reel.title}</h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    نسبة الإكمال ومشاهدة المقطع: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{reel.retention}</span>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-4 gap-4 text-center border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pr-4">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{reel.views.toLocaleString("ar-SA")}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">مشاهدة</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">{reel.likes.toLocaleString("ar-SA")}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">إعجاب</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{reel.shares.toLocaleString("ar-SA")}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">مشاركة</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{reel.comments.toLocaleString("ar-SA")}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">تعليق</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
