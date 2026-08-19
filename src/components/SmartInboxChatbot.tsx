import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
  MessageCircle,
  HelpCircle,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { Brand, InboxItem, SocialPlatform } from "../types";

interface AISmartReplySuggestion {
  id: string;
  tone: string;
  badge: string;
  reply: string;
  keyPointsCovered?: string;
}

interface SmartReplyResult {
  intent: string;
  intentAr: string;
  sentiment: string;
  sentimentAr: string;
  customerSummary: string;
  suggestions: AISmartReplySuggestion[];
}

interface SmartInboxChatbotProps {
  brands: Brand[];
  currentBrandId: string;
  selectedInboxItem?: InboxItem | null;
  onApplyReply: (replyText: string, targetItemId?: string) => void;
  onClose?: () => void;
}

export const SmartInboxChatbot: React.FC<SmartInboxChatbotProps> = ({
  brands,
  currentBrandId,
  selectedInboxItem,
  onApplyReply,
  onClose,
}) => {
  const initialBrand =
    brands.find((b) => (selectedInboxItem ? b.id === selectedInboxItem.brandId : b.id === currentBrandId)) ||
    brands[0] || {
      id: "default",
      name: "المتجر",
      toneLabel: "ودودة وعصرية",
      primaryColor: "#6366f1",
      aiReplyInstructions: "ترحيب بالزبون وتقديم مساعدة فورية",
    };

  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrand.id);
  const [customerName, setCustomerName] = useState<string>(selectedInboxItem?.senderName || "الزبون");
  const [customerMessage, setCustomerMessage] = useState<string>(
    selectedInboxItem?.content || "السلام عليكم، كم سعر هذا الموديل وهل متوفر منه مقاس L وشحن سريع لجدة؟"
  );
  const [platform, setPlatform] = useState<SocialPlatform>(selectedInboxItem?.platform || "instagram");
  const [interactionType, setInteractionType] = useState<"comment" | "dm">(selectedInboxItem?.type || "comment");
  const [productContext, setProductContext] = useState<string>(
    selectedInboxItem?.postTitle
      ? `منشور: ${selectedInboxItem.postTitle}`
      : "تشكيلة ملابس وموديلات عصرية، شحن سريع، أسعار خاصة وتوصيل لجميع المدن"
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SmartReplyResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customizedReply, setCustomizedReply] = useState<string>("");
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);

  const activeBrand = brands.find((b) => b.id === selectedBrandId) || initialBrand;

  const quickSamples = [
    {
      title: "استفسار عن السعر والمقاس 🛍️",
      text: "بكم سعر هذا الفستان؟ وهل متوفر مقاس M ولون كحلي؟",
      type: "comment" as const,
    },
    {
      title: "مدة التوصيل والدفع 🚚",
      text: "لو طلبت اليوم متى يوصل الرياض؟ وهل الدفع عند الاستلام متاح؟",
      type: "dm" as const,
    },
    {
      title: "استبدال أو إرجاع 🔄",
      text: "وصلني المقاس أصغر من المطلوب، كيف طريقة الاستبدال لو سمحتوا؟",
      type: "dm" as const,
    },
    {
      title: "إعجاب ومدح للمنتج ✨",
      text: "ما شاء الله الخامات تجنن والتوصيل كان سريع جداً، شكراً لكم! 😍",
      type: "comment" as const,
    },
  ];

  const handleGenerateSuggestions = async () => {
    if (!customerMessage.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/suggest-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: activeBrand.name,
          brandTone: activeBrand.toneLabel,
          customerMessage,
          customerName,
          platform,
          interactionType,
          productContext,
          storeGuidelines: activeBrand.aiReplyInstructions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (data.suggestions && data.suggestions.length > 0) {
          setActiveSuggestionId(data.suggestions[0].id);
          setCustomizedReply(data.suggestions[0].reply);
        }
      } else {
        throw new Error(data.error || "خطأ أثناء المعالجة");
      }
    } catch (error) {
      console.error("Smart replies error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectSuggestion = (sug: AISmartReplySuggestion) => {
    setActiveSuggestionId(sug.id);
    setCustomizedReply(sug.reply);
  };

  const handleApplyCurrentReply = () => {
    if (!customizedReply.trim()) return;
    onApplyReply(customizedReply, selectedInboxItem?.id);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col transition">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                مساعد الردود الذكي (AI Smart Inbox Bot)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>مدعوم بـ Gemini 3.7 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              يقوم بتحليل سياق رسالة الزبون واقتراح 3 خيارات ردود جاهزة بلهجات متعددة تناسب هوية المتجر.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            إغلاق
          </button>
        )}
      </div>

      <div className="p-5 md:p-6 space-y-6">
        {/* Context Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">المتجر / البراند:</label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
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
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">منصة الرسالة:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="instagram">Instagram (إنستغرام)</option>
              <option value="tiktok">TikTok (تيك توك)</option>
              <option value="whatsapp">WhatsApp (واتساب)</option>
              <option value="facebook">Facebook (فيسبوك)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">نوع الاستفسار:</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setInteractionType("comment")}
                className={`py-1.5 rounded-lg font-bold transition ${
                  interactionType === "comment"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                💬 تعليق عام
              </button>
              <button
                type="button"
                onClick={() => setInteractionType("dm")}
                className={`py-1.5 rounded-lg font-bold transition ${
                  interactionType === "dm"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                📩 رسالة خاصة (DM)
              </button>
            </div>
          </div>
        </div>

        {/* Customer Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>نص رسالة أو تعليق العميل:</span>
            </label>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>اسم العميل:</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الزبون"
                className="w-24 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
              />
            </div>
          </div>

          <textarea
            rows={3}
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            placeholder="اكتب أو الصق رسالة العميل هنا..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white text-xs md:text-sm focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
          />

          {/* Quick Click Samples */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400">نماذج سريعة:</span>
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCustomerMessage(sample.text);
                  setInteractionType(sample.type);
                }}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-750 font-medium transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Trigger Button */}
        <button
          type="button"
          onClick={handleGenerateSuggestions}
          disabled={isLoading || !customerMessage.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري تحليل الرسالة وتوليد الردود الذكية بـ Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>✨ تحليل الرسالة واقتراح ردود جاهزة للإرسال</span>
            </>
          )}
        </button>

        {/* Results Showcase */}
        {result && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-200">
            {/* Analysis Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">النية المكتشفة:</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                    {result.intentAr || result.intent}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">المشاعر:</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold">
                    {result.sentimentAr || result.sentiment}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{result.customerSummary}</p>
              </div>
            </div>

            {/* 3 Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.suggestions.map((sug) => {
                const isSelected = activeSuggestionId === sug.id;
                return (
                  <div
                    key={sug.id}
                    onClick={() => handleSelectSuggestion(sug)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                        : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                          <span>{sug.tone}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold">
                          {sug.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        "{sug.reply}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(sug.reply, sug.id);
                        }}
                        className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                      >
                        {copiedId === sug.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ النص</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyReply(sug.reply, selectedInboxItem?.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>إرسال هذا الرد</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Edit Box before Final Send */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                تعديل وتخصيص الرد قبل إرساله النهائي للزبون:
              </label>
              <textarea
                rows={2}
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-medium"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {selectedInboxItem ? `سيتم الرد على استفسار (${selectedInboxItem.senderName})` : "رد جاهز للاستخدام المباشر"}
                </span>
                <button
                  type="button"
                  onClick={handleApplyCurrentReply}
                  disabled={!customizedReply.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تأكيد واعتماد الرد النهائي</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
