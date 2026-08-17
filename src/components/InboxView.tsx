import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  MessageSquareReply,
  Bot,
  Send,
  Trash2,
  CheckCircle2,
  Sparkles,
  Filter,
  Check,
  Edit2,
  User,
  Zap,
  MessageCircle,
  HelpCircle,
  Settings2,
  RefreshCw,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { InboxItem, SocialPlatform } from "../types";

export const InboxView: React.FC = () => {
  const {
    inboxItems,
    brands,
    currentBrandId,
    setCurrentBrandId,
    replyToInbox,
    deleteInboxItem,
    triggerAutoRepliesForAllPending,
    addToast,
  } = useApp();

  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedReplyText, setEditedReplyText] = useState<string>("");

  // Live AI Chat Simulator state
  const [testQuestion, setTestQuestion] = useState("كم سعر البدلة السبور وعندكم مقاس L ؟");
  const [testBrandId, setTestBrandId] = useState(brands[0]?.id || "brand-bilal-koo");
  const [testPlatform, setTestPlatform] = useState<SocialPlatform>("instagram");
  const [simulatedReply, setSimulatedReply] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Filter inbox items
  const filteredItems = inboxItems.filter((item) => {
    if (currentBrandId !== "all" && item.brandId !== currentBrandId) {
      return false;
    }
    if (selectedPlatform !== "all" && item.platform !== selectedPlatform) {
      return false;
    }
    if (selectedStatus !== "all" && item.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const pendingCount = filteredItems.filter((i) => i.status === "pending").length;

  const handleSendManualReply = (item: InboxItem, text: string) => {
    if (!text.trim()) return;
    replyToInbox(item.id, text, false);
    setEditingItemId(null);
  };

  const handleApproveAiReply = (item: InboxItem) => {
    const text = item.aiSuggestedReply || "أهلاً بك وسعداء بخدمتك! 🌸";
    replyToInbox(item.id, text, true);
  };

  // Run live AI test query
  const handleRunSimulator = async () => {
    if (!testQuestion.trim()) return;
    setIsSimulating(true);
    try {
      const brand = brands.find((b) => b.id === testBrandId) || brands[0];
      const res = await fetch("/api/ai/auto-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brand.name,
          brandTone: brand.toneLabel,
          brandGuidelines: brand.aiReplyInstructions,
          customerMessage: testQuestion,
          platform: testPlatform,
          productContext: "ملابس رجالية ونسائية، تيشيرتات، قمصان وبدلات، توصيل لجميع المدن بـ 25 ريال ومجاني للطلبات فوق 200 ريال.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimulatedReply(data);
        addToast({
          type: "success",
          title: "تم توليد الرد التجريبي بواسطة الذكاء الاصطناعي!",
        });
      } else {
        throw new Error(data.error || "خطأ");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      addToast({
        type: "error",
        title: "تعذر الاتصال بخدمة الذكاء الاصطناعي",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
              <Bot className="w-3.5 h-3.5" />
              <span>نظام الردود الآلية الذكي على التعليقات والرسائل (Auto-Pilot)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">صندوق الوارد والردود الآلية</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة واستقبال كل تعليقات إنستغرام، فيسبوك، تيك توك، وواتساب مع إمكانية الرد الفوري بالذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => triggerAutoRepliesForAllPending()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ الرد الآلي على جميع المعلقين ({pendingCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>تصفية:</span>
            </span>

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

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="all">🌐 جميع المنصات</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="whatsapp">WhatsApp</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
            >
              <option value="all">📌 كل الحالات</option>
              <option value="pending">⏳ معلق بانتظار الرد</option>
              <option value="ai_replied">🤖 تم الرد بالذكاء الاصطناعي</option>
              <option value="manual_replied">👤 تم الرد يدوياً</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
            {pendingCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold">يوجد {pendingCount} استفسارات بحاجة للرد</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✨ كل التعليقات والرسائل تم الرد عليها!</span>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Left is Inbox Feed, Right is Live AI Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inbox Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl bg-white dark:bg-[#0f172a]">
              <MessageSquareReply className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد رسائل أو تعليقات مطابقة</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">صندوق الوارد نظيف تماماً.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const brand = brands.find((b) => b.id === item.brandId);
              const isPending = item.status === "pending";
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition space-y-3 text-right ${
                    isPending
                      ? "bg-white dark:bg-[#0f172a] border-indigo-300 dark:border-indigo-500/40 shadow-sm ring-1 ring-indigo-500/20"
                      : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Sender & Platform metadata header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.senderAvatar}
                        alt={item.senderName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.senderName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                            {item.platform} • {item.type === "comment" ? "تعليق" : "رسالة خاصة"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span
                            className="font-bold px-1.5 py-0.2 rounded text-white text-[10px]"
                            style={{ backgroundColor: brand?.primaryColor || "#6366f1" }}
                          >
                            {item.brandName}
                          </span>
                          <span>• {item.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                            : item.status === "ai_replied"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {isPending ? "⏳ بانتظار الرد" : item.status === "ai_replied" ? "🤖 رد آلي" : "👤 رد يدوي"}
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteInboxItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="حذف من الصندوق"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Question text */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      "{item.content}"
                    </p>
                    {item.postTitle && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                        <span>على منشور:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1">{item.postTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Reply State or AI Suggestion */}
                  {isPending ? (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-bold">
                          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>اقتراح الرد الذكي المخصص لـ ({item.brandName}):</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                          دقة {Math.round((item.confidenceScore || 0.95) * 100)}%
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={editedReplyText}
                            onChange={(e) => setEditedReplyText(e.target.value)}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendManualReply(item, editedReplyText)}
                              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs"
                            >
                              إرسال الرد المعدل
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed bg-white dark:bg-slate-950/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-800 font-medium">
                            {item.aiSuggestedReply}
                          </p>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditedReplyText(item.aiSuggestedReply || "");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>تعديل الرد</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApproveAiReply(item)}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>موافقة وإرسال الرد الآن</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Already Replied info */
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1 text-right">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1">
                          <span>الرد المرسل بواسطة {item.repliedBy || "المساعد"}:</span>
                          <span className="font-mono text-[10px]">{item.repliedAt}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {item.finalReplyText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Live AI Simulator & Rules Editor (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Simulator Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">مختبر محاكاة الرد الآلي (AI Simulator)</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">جرب أي سؤال للزبون واختبر كيف يجيب الذكاء الاصطناعي</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">اختر المتجر لتجربة أسلوبه:</label>
                <select
                  value={testBrandId}
                  onChange={(e) => setTestBrandId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.toneLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">اكتب سؤالاً أو تعليقاً من زبون:</label>
                <textarea
                  rows={3}
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="مثال: كم التوصيل لجدة؟ هل القطعة متوفرة بلون أسود؟"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulator}
                disabled={isSimulating}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التفكير وصياغة الرد...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>⚡ تشغيل اختبار الرد الذكي</span>
                  </>
                )}
              </button>

              {/* Simulation Result */}
              {simulatedReply && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 space-y-2 text-right animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>رد الذكاء الاصطناعي المباشر:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 font-mono font-bold">
                      دقة: {Math.round(simulatedReply.confidence * 100)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-medium">
                    {simulatedReply.reply}
                  </p>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>تحليل النية: {simulatedReply.intent}</span>
                    <span>المشاعر: {simulatedReply.sentiment}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Guidelines FAQ */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>كيف يعمل الرد الآلي في المنصة؟</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                الذكاء الاصطناعي يقرأ سياسات الأسعار، المقاسات، والعناوين الخاصة بكل متجر ويقوم بالرد بلباقة ولهجة مناسبة، مع تحويل الزبون إلى رابط الواتساب عند طلب الشراء.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
