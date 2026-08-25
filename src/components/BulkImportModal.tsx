import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  FileSpreadsheet,
  Upload,
  Download,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { BulkPostRow, Post, PostFormat, SocialPlatform, ContentPillar } from "../types";

const SAMPLE_CSV = `عنوان المنتج,السعر,الخصم,المنصة,نوع المحتوى,عمود المحتوى,النص الترويجي,رابط الصورة
قميص لينن أبيض صيفي,195,15,instagram,feed,products,إطلالة نقية ومريحة لأيام الصيف الحارة مع قماش الكتان الإيطالي الفاخر ☀️ متوفر الآن بكافة المقاسات,https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800
تيشيرت بولو كلاسيك كحلي,120,20,tiktok,reel,offers,عرض الجمعة لا يفوتك! خامة قطنية 100% مع خياطة دقيقة تدوم طويلاً 🔥 اطلبه الآن مع شحن مجاني,https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800
فستان شيفون مطرز بالخرز,380,10,instagram,feed,products,سحر الأناقة في كل تفصيلة ✨ فستان سهرة مميز لحفلاتك الخاصة والمناسبات السعيدة,https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800
طقم رياضي هودي وبنطال,160,25,facebook,feed,offers,راحة مطلقة وأناقة عصرية في التمارين والمشاوير اليومية 💪 ألوان متعددة بانتظارك,https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800
عباية كريب حريري أسود,290,0,whatsapp,whatsapp_broadcast,products,إشراقة فاخرة مع سواد فاحم وقماش غير قابل للتجعد ✨ احجزي قطعتك عبر الواتساب مباشرة,https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800`;

export const BulkImportModal: React.FC = () => {
  const {
    bulkImportModalOpen,
    setBulkImportModalOpen,
    brands,
    currentBrandId,
    bulkCreatePosts,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"csv" | "table">("table");
  const [csvText, setCsvText] = useState<string>(SAMPLE_CSV);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(() => {
    return currentBrandId !== "all" ? currentBrandId : brands[0]?.id || "";
  });

  // Scheduling strategy
  const [scheduleMode, setScheduleMode] = useState<"daily_peak" | "interval_hours" | "smart_ai">("daily_peak");
  const [startDateTime, setStartDateTime] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [intervalHours, setIntervalHours] = useState<number>(4);

  // Parsed rows
  const [rows, setRows] = useState<BulkPostRow[]>(() => {
    return parseCsvToRows(SAMPLE_CSV, brands[0]?.id || "brand_1");
  });

  if (!bulkImportModalOpen) return null;

  function parseCsvToRows(rawCsv: string, defaultBrand: string): BulkPostRow[] {
    const lines = rawCsv.trim().split("\n");
    if (lines.length <= 1) return [];

    const dataRows = lines.slice(1);
    const parsed: BulkPostRow[] = [];

    dataRows.forEach((line, idx) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 2) return;

      const title = cols[0] || `منتج رقم ${idx + 1}`;
      const price = parseFloat(cols[1]) || 150;
      const discount = parseFloat(cols[2]) || 0;
      const platformRaw = (cols[3] || "instagram").toLowerCase() as SocialPlatform;
      const formatRaw = (cols[4] || "feed") as PostFormat;
      const pillarRaw = (cols[5] || "products") as ContentPillar;
      const caption = cols[6] || `${title} - متوفر الآن بسعر ${price} ريال`;
      const mediaUrl = cols[7] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800";

      // Calculate scheduled date based on index
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 1 + idx);
      baseDate.setHours(19, 0, 0, 0);

      parsed.push({
        id: `row_${idx}`,
        title,
        price,
        discount,
        caption,
        mediaUrl,
        mediaType: "image",
        format: formatRaw,
        platforms: [platformRaw, "whatsapp", "facebook"],
        scheduledAt: baseDate.toISOString(),
        brandId: defaultBrand,
        contentPillar: pillarRaw,
      });
    });

    return parsed;
  }

  const handleApplyCsv = () => {
    const parsed = parseCsvToRows(csvText, selectedBrandId);
    if (parsed.length === 0) {
      addToast({
        type: "warning",
        title: "لم يتم التعرف على أسطر صالحة في ملف CSV",
        description: "يرجى التأكد من التنسيق والفواصل بين الأعمدة.",
      });
      return;
    }
    setRows(parsed);
    setActiveTab("table");
    addToast({
      type: "success",
      title: `✅ تم استيراد ${parsed.length} منتج وجاهز للمعاينة والجدولة!`,
    });
  };

  const handleDownloadSample = () => {
    const blob = new Blob(["\uFEFF" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "smartpost_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAutoSpaceSchedule = () => {
    const startDate = new Date(startDateTime);
    const updated = rows.map((row, index) => {
      const scheduledDate = new Date(startDate);
      if (scheduleMode === "daily_peak") {
        scheduledDate.setDate(scheduledDate.getDate() + index);
      } else if (scheduleMode === "interval_hours") {
        scheduledDate.setHours(scheduledDate.getHours() + index * intervalHours);
      } else {
        // Smart distribution: Alternate between 1:00 PM, 6:00 PM, and 9:00 PM
        const dayOffset = Math.floor(index / 2);
        const isEvening = index % 2 === 1;
        scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
        scheduledDate.setHours(isEvening ? 20 : 14, 0, 0, 0);
      }
      return {
        ...row,
        scheduledAt: scheduledDate.toISOString(),
      };
    });

    setRows(updated);
    addToast({
      type: "success",
      title: "⚡ تم توزيع أوقات النشر ذكياً بالتساوي!",
      description: "تم تحديث مواعيد المنشورات لتفادي التداخل والنشر في أوقات الذروة.",
    });
  };

  const handleExecuteBulkSchedule = () => {
    if (rows.length === 0) return;

    const postsToCreate: Omit<Post, "id" | "createdAt">[] = rows.map((row) => {
      const targetBrand = brands.find((b) => b.id === (row.brandId || selectedBrandId)) || brands[0];
      return {
        title: row.title,
        brandId: targetBrand?.id || "brand_1",
        targetBrandIds: [targetBrand?.id || "brand_1"],
        targetPlatforms: row.platforms || ["instagram", "tiktok", "facebook"],
        contentPerPlatform: {
          instagram: {
            caption: row.caption,
            hashtags: targetBrand?.defaultHashtags || ["#أزياء", "#عروض_الموسم", "#تخفيضات"],
            format: row.format,
            mediaUrl: row.mediaUrl,
            mediaType: row.mediaType,
          },
          tiktok: {
            caption: `${row.title} 🔥 ${row.price} ريال فقط! ${targetBrand?.defaultHashtags?.slice(0, 3).join(" ") || ""}`,
            hashtags: targetBrand?.defaultHashtags || ["#ملابس", "#تيك_توك"],
            format: "reel",
            mediaUrl: row.mediaUrl,
            mediaType: row.mediaType,
          },
          facebook: {
            caption: row.caption,
            hashtags: targetBrand?.defaultHashtags || [],
            format: row.format,
            mediaUrl: row.mediaUrl,
            mediaType: row.mediaType,
          },
          whatsapp: {
            caption: `*${row.title}*\nالسعر: ${row.price} ريال ${row.discount ? `(خصم ${row.discount}%)` : ""}\n\n${row.caption}\n\nللطلب المباشر تواصل معنا عبر هذا المحادثة!`,
            hashtags: [],
            format: "whatsapp_broadcast",
            mediaUrl: row.mediaUrl,
            mediaType: row.mediaType,
          },
        },
        mediaUrls: [row.mediaUrl],
        mediaType: row.mediaType,
        productPrice: row.price,
        productDiscount: row.discount,
        status: "scheduled",
        scheduledAt: row.scheduledAt,
        createdBy: "bulk_importer",
        createdByName: "مستورد الإكسل الذكي",
        approvalStatus: "approved",
        contentPillar: row.contentPillar,
      };
    });

    bulkCreatePosts(postsToCreate);
    setBulkImportModalOpen(false);
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  الاستيراد والجدولة الجماعية من ملفات Excel / CSV
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Bulk CSV Importer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                جدولة 50 إلى 100 منشور ومقطع فيديو دفعة واحدة مع توزيع ذكي لمواعيد النشر
              </p>
            </div>
          </div>
          <button
            onClick={() => setBulkImportModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Strategy Bar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === "table"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              جدول المنشورات ({rows.length})
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === "csv"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              لصق بيانات CSV / نص
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              تحميل نموذج CSV جاهز
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Strategy & Smart Auto-Spacing */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                  محرك التوزيع الزمني التلقائي (Smart Auto-Spacer)
                </span>
              </div>
              <button
                onClick={handleAutoSpaceSchedule}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Clock className="w-3.5 h-3.5" />
                تطبيق التوزيع الذكي على كافة الأسطر
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  تاريخ ووقت البداية:
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  نمط توزيع النشر:
                </label>
                <select
                  value={scheduleMode}
                  onChange={(e: any) => setScheduleMode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="daily_peak">منشور يومياً في وقت الذروة (7:00 م)</option>
                  <option value="interval_hours">فاصل زمني ثابت (كل بضع ساعات)</option>
                  <option value="smart_ai">توزيع ذكي (ظهراً ومساءً بالتناوب)</option>
                </select>
              </div>

              {scheduleMode === "interval_hours" && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    الفاصل بالساعات:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tab 1: CSV Text Raw Mode */}
          {activeTab === "csv" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                الصق محتوى جدول الإكسل أو ملف CSV هنا:
              </label>
              <textarea
                rows={10}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="عنوان المنتج,السعر,الخصم,المنصة,نوع المحتوى..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                dir="ltr"
              />
              <button
                onClick={handleApplyCsv}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                تحويل البيانات إلى جدول ومعاينة المنشورات
              </button>
            </div>
          )}

          {/* Tab 2: Table Interactive Grid */}
          {activeTab === "table" && (
            <div className="space-y-3">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto bg-white dark:bg-slate-900 shadow-xs">
                <table className="w-full text-right text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-850 font-bold text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">الصورة</th>
                      <th className="p-3">عنوان المنتج</th>
                      <th className="p-3">السعر</th>
                      <th className="p-3">العمود</th>
                      <th className="p-3">موعد النشر</th>
                      <th className="p-3">نص المنشور</th>
                      <th className="p-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          لا توجد أسطر مستوردة. انقر على "لصق بيانات CSV" لإضافة منشوراتك.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3">
                            <img
                              src={row.mediaUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                              onError={(e: any) => {
                                e.target.src = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200";
                              }}
                            />
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white max-w-[150px] truncate">
                            {row.title}
                          </td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                            {row.price} ر.س
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              {row.contentPillar === "offers"
                                ? "عروض"
                                : row.contentPillar === "engagement"
                                ? "تفاعلي"
                                : row.contentPillar === "educational"
                                ? "تثقيفي"
                                : "منتجات"}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {new Date(row.scheduledAt).toLocaleString("ar-SA", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-slate-600 dark:text-slate-400">
                            {row.caption}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteRow(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                              title="حذف هذا السطر"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            جاهز لجدولة <strong className="text-slate-900 dark:text-white font-bold">{rows.length}</strong> منشور بنقرة واحدة
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkImportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleExecuteBulkSchedule}
              disabled={rows.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              تأكيد الجدولة الجماعية الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
