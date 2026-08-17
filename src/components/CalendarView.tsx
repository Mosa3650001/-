import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Send,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Layers,
  ChevronRight,
  ChevronLeft,
  Filter,
  Sparkles,
  AlertCircle,
  X,
  Share2,
  Video,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { Post, SocialPlatform } from "../types";

export const CalendarView: React.FC = () => {
  const {
    posts,
    brands,
    currentBrandId,
    setCurrentBrandId,
    deletePost,
    publishPostNow,
    setEditingPost,
    setActiveTab,
    addToast,
    updatePost,
  } = useApp();

  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // In-calendar fast rescheduling modal state
  const [selectedPostForQuickEdit, setSelectedPostForQuickEdit] = useState<Post | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState<string>("");

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (currentBrandId !== "all" && !post.targetBrandIds.includes(currentBrandId) && post.brandId !== currentBrandId) {
      return false;
    }
    if (selectedPlatform !== "all" && !post.targetPlatforms.includes(selectedPlatform as SocialPlatform)) {
      return false;
    }
    if (selectedStatus !== "all" && post.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const openQuickEdit = (post: Post) => {
    setSelectedPostForQuickEdit(post);
    try {
      const dt = new Date(post.scheduledAt);
      setRescheduleDateTime(dt.toISOString().slice(0, 16));
    } catch {
      setRescheduleDateTime(new Date().toISOString().slice(0, 16));
    }
  };

  const handleSaveReschedule = () => {
    if (!selectedPostForQuickEdit || !rescheduleDateTime) return;
    updatePost(selectedPostForQuickEdit.id, {
      scheduledAt: new Date(rescheduleDateTime).toISOString(),
      status: "scheduled",
    });
    addToast({
      type: "success",
      title: "✅ تم تحديث موعد النشر مباشرة!",
      description: `الموعد الجديد: ${new Date(rescheduleDateTime).toLocaleString("ar-SA")}`,
    });
    setSelectedPostForQuickEdit(null);
  };

  const handlePublishDirectly = (post: Post) => {
    publishPostNow(post.id);
    setSelectedPostForQuickEdit(null);
  };

  const handleFullStudioEdit = (post: Post) => {
    setEditingPost(post);
    setActiveTab("studio");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Filters */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>جدول النشر والتقويم الذكي التفاعلي</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">تقويم المحتوى وجدول المواعيد</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              استعراض وتعديل مواعيد النشر مباشرة من التقويم لكل المتاجر والمنصات.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === "month" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                شهري
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === "week" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                أسبوعي
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === "list" ? "bg-indigo-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                قائمة مفصلة
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setActiveTab("studio");
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موعد</span>
            </button>
          </div>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>تصفية:</span>
            </span>

            {/* Brand Filter */}
            <select
              value={currentBrandId}
              onChange={(e) => setCurrentBrandId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="all">🏢 جميع المتاجر</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="all">🌐 كل المنصات</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="youtube">YouTube</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="all">📌 كل الحالات</option>
              <option value="scheduled">⏰ مجدول فقط</option>
              <option value="published">✅ تم النشر</option>
              <option value="draft">📝 مسودات</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
            إجمالي المنشورات: <span className="text-slate-900 dark:text-white">{filteredPosts.length}</span>
          </div>
        </div>
      </div>

      {/* View Mode: Month Grid View */}
      {viewMode === "month" && (
        <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">أغسطس 2026 (August)</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> مجدول
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> منشور
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> مسودة
              </span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>الأحد</div>
            <div>الإثنين</div>
            <div>الثلاثاء</div>
            <div>الأربعاء</div>
            <div>الخميس</div>
            <div>الجمعة</div>
            <div>السبت</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {currentMonthDays.map((dayNum) => {
              const dayPosts = filteredPosts.filter((p) => {
                const date = new Date(p.scheduledAt);
                return date.getDate() === dayNum;
              });

              const isToday = dayNum === 17;

              return (
                <div
                  key={dayNum}
                  className={`min-h-[120px] p-2 rounded-2xl border transition flex flex-col justify-between ${
                    isToday
                      ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                        isToday ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                        {dayPosts.length} منشور
                      </span>
                    )}
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-24">
                    {dayPosts.map((post) => {
                      const brand = brands.find((b) => b.id === post.brandId);
                      return (
                        <div
                          key={post.id}
                          onClick={() => openQuickEdit(post)}
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition cursor-pointer text-right group shadow-xs"
                          title="انقر لتعديل الموعد أو النشر المباشر"
                        >
                          <div className="flex items-center justify-between text-[9px]">
                            <span
                              className="font-bold px-1 rounded text-white truncate max-w-[65px]"
                              style={{ backgroundColor: brand?.primaryColor || "#6366f1" }}
                            >
                              {brand?.name || "متجر"}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-mono">
                              {new Date(post.scheduledAt).toLocaleTimeString("ar-SA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {post.title}
                          </div>

                          {/* Platforms icons */}
                          <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                            {post.targetPlatforms.map((p) => (
                              <span key={p} className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-[8px] font-bold">
                                {p === "instagram" ? "IG" : p === "tiktok" ? "TT" : p === "whatsapp" ? "WA" : "FB"}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode: Detailed List View */}
      {(viewMode === "list" || viewMode === "week") && (
        <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">قائمة المنشورات التفصيلية ({filteredPosts.length})</h3>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-750 rounded-2xl">
              <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد منشورات تطابق معايير التصفية</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">جرب تغيير التصفية أو أنشئ منشوراً جديداً.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const brand = brands.find((b) => b.id === post.brandId);
                const isScheduled = post.status === "scheduled";
                const isPublished = post.status === "published";

                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start md:items-center gap-3.5">
                      {post.mediaUrls?.[0] ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt={post.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: brand?.primaryColor || "#6366f1" }}
                          >
                            {brand?.name || "متجر"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPublished
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : isScheduled
                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {isPublished ? "✅ منشور" : isScheduled ? "⏰ مجدول" : "📝 مسودة"}
                          </span>

                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(post.scheduledAt).toLocaleString("ar-SA", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</h4>

                        {/* Platforms badges */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          <span>المنصات:</span>
                          {post.targetPlatforms.map((plat) => (
                            <span
                              key={plat}
                              className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                            >
                              {plat === "instagram" ? "Instagram" : plat === "tiktok" ? "TikTok" : plat === "whatsapp" ? "WhatsApp" : "Facebook"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => openQuickEdit(post)}
                        className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5"
                        title="تعديل الموعد مباشرة"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>تعديل الموعد ⏰</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFullStudioEdit(post)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                        title="تعديل كامل في الاستوديو"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {post.status !== "published" && (
                        <button
                          type="button"
                          onClick={() => publishPostNow(post.id)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>نشر الآن</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deletePost(post.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                        title="حذف المنشور"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QUICK IN-CALENDAR RESCHEDULE MODAL */}
      {selectedPostForQuickEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>تعديل موعد النشر مباشرة</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPostForQuickEdit(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white mb-0.5">{selectedPostForQuickEdit.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  المنصات: {selectedPostForQuickEdit.targetPlatforms.join(", ")}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">اختر التاريخ والوقت الجديد:</label>
                <input
                  type="datetime-local"
                  value={rescheduleDateTime}
                  onChange={(e) => setRescheduleDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handlePublishDirectly(selectedPostForQuickEdit)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر فوري الآن</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPostForQuickEdit(null)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReschedule}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                  >
                    حفظ الموعد ✅
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
