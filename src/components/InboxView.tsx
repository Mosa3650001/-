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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { InboxItem, SocialPlatform } from "../types";
import { SmartInboxChatbot } from "./SmartInboxChatbot";

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

  // Smart Chatbot & Assist State
  const [showSmartChatbot, setShowSmartChatbot] = useState<boolean>(true);
  const [selectedItemForAssistant, setSelectedItemForAssistant] = useState<InboxItem | null>(null);

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

  const handleApplyChatbotReply = (replyText: string, targetItemId?: string) => {
    if (targetItemId) {
      replyToInbox(targetItemId, replyText, true);
      addToast({
        type: "success",
        title: "✨ تم اعتماد وإرسال الرد الذكي للعميل مباشرة!",
      });
      setSelectedItemForAssistant(null);
    } else if (inboxItems.length > 0) {
      // Find first pending item or just apply toast
      const firstPending = inboxItems.find((i) => i.status === "pending");
      if (firstPending) {
        replyToInbox(firstPending.id, replyText, true);
        addToast({
          type: "success",
          title: `✨ تم إرسال الرد بنجاح لـ (${firstPending.senderName})!`,
        });
      } else {
        addToast({
          type: "success",
          title: "✨ تم تجهيز الرد ونسخه للاستخدام الفوري!",
        });
      }
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
              <span>نظام الشات بوت والردود الذكية على الرسائل والتعليقات (Gemini Smart Bot)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">صندوق الوارد والشات بوت الذكي</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة واستقبال كل تعليقات إنستغرام، فيسبوك، تيك توك، وواتساب مع شات بوت ذكي يقترح ردوداً جاهزة سياقية بلهجات متعددة.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSmartChatbot(!showSmartChatbot)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{showSmartChatbot ? "إخفاء الشات بوت الذكي" : "فتح الشات بوت الذكي"}</span>
              {showSmartChatbot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => triggerAutoRepliesForAllPending()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ الرد الآلي المباشر على الكل ({pendingCount})</span>
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

      {/* Smart Chatbot Module (Collapsible or Main Hero) */}
      {showSmartChatbot && (
        <div className="animate-in fade-in duration-200">
          <SmartInboxChatbot
            brands={brands}
            currentBrandId={currentBrandId}
            selectedInboxItem={selectedItemForAssistant}
            onApplyReply={handleApplyChatbotReply}
            onClose={() => {
              setShowSmartChatbot(false);
              setSelectedItemForAssistant(null);
            }}
          />
        </div>
      )}

      {/* Main Inbox Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareReply className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>رسائل وتعليقات العملاء الواردة ({filteredItems.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            انقر على "🤖 اقتراح ردود ذكية" لتحليل أي رسالة داخل الشات بوت واختيار الرد الأنسب
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl bg-white dark:bg-[#0f172a]">
            <MessageSquareReply className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد رسائل أو تعليقات مطابقة</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">صندوق الوارد نظيف تماماً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const brand = brands.find((b) => b.id === item.brandId);
              const isPending = item.status === "pending";
              const isEditing = editingItemId === item.id;
              const isSelectedForAI = selectedItemForAssistant?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition space-y-3.5 text-right ${
                    isSelectedForAI
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                      : isPending
                      ? "bg-white dark:bg-[#0f172a] border-indigo-200 dark:border-indigo-500/30 shadow-xs"
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
                        {isPending ? "⏳ معلق" : item.status === "ai_replied" ? "🤖 رد آلي" : "👤 رد يدوي"}
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
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      "{item.content}"
                    </p>
                    {item.postTitle && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>على منشور:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1">{item.postTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Reply Action Area */}
                  {isPending ? (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-bold">
                          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>الرد التلقائي المقترح لـ ({item.brandName}):</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItemForAssistant(item);
                            setShowSmartChatbot(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>فتح في الشات بوت لخيارات أخرى</span>
                        </button>
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

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemForAssistant(item);
                                setShowSmartChatbot(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold flex items-center gap-1.5 transition"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>توليد 3 خيارات بالشات بوت</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditedReplyText(item.aiSuggestedReply || "");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>تعديل</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApproveAiReply(item)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>إرسال فوري</span>
                              </button>
                            </div>
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

