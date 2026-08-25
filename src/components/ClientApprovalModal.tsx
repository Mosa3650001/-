import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Share2,
  Calendar,
  Clock,
  Send,
  Eye,
  Copy,
  ExternalLink,
  Sparkles,
  X,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { LiveDeviceMockup } from "./LiveDeviceMockup";
import { Post, SocialPlatform } from "../types";

export const ClientApprovalModal: React.FC = () => {
  const {
    clientReviewPost,
    setClientReviewPost,
    updatePostApprovalStatus,
    brands,
    addToast,
  } = useApp();

  const [feedback, setFeedback] = useState<string>("");
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("instagram");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!clientReviewPost) return null;

  const targetBrand = brands.find(
    (b) => b.id === clientReviewPost.brandId || (clientReviewPost.targetBrandIds && clientReviewPost.targetBrandIds.includes(b.id))
  ) || brands[0];

  const platformContent = clientReviewPost.contentPerPlatform?.[activePlatform] || {
    caption: clientReviewPost.title,
    hashtags: targetBrand?.defaultHashtags || [],
  };

  const handleApprove = () => {
    updatePostApprovalStatus(clientReviewPost.id, "approved", feedback);
    setClientReviewPost(null);
  };

  const handleRequestChanges = () => {
    if (!feedback.trim()) {
      addToast({
        type: "warning",
        title: "يرجى كتابة الملاحظات أو التعديل المطلوب للعميل",
      });
      return;
    }
    updatePostApprovalStatus(clientReviewPost.id, "changes_requested", feedback);
    setClientReviewPost(null);
  };

  const handleCopyShareableLink = () => {
    const fakeLink = `${window.location.origin}/review/${clientReviewPost.id}?token=rev_${Date.now()}`;
    navigator.clipboard.writeText(fakeLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    addToast({
      type: "success",
      title: "📋 تم نسخ رابط مراجعة العميل بنجاح!",
      description: "يمكنك إرسال الرابط للعميل لمراجعة المنشور واعتماده من جواله مباشرة.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-white dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  معاينة وموافقة العميل (Client Approval Portal)
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    clientReviewPost.approvalStatus === "approved"
                      ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                      : clientReviewPost.approvalStatus === "changes_requested"
                      ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200"
                      : "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200"
                  }`}
                >
                  {clientReviewPost.approvalStatus === "approved"
                    ? "معتمد للنشر"
                    : clientReviewPost.approvalStatus === "changes_requested"
                    ? "طلب تعديل"
                    : "بانتظار موافقة العميل"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                مراجعة المنشور كما يظهر للمتابعين على شاشات الجوال واعتماده بنقرة واحدة
              </p>
            </div>
          </div>
          <button
            onClick={() => setClientReviewPost(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split between Mockup & Review Actions */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): True Device Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
            <LiveDeviceMockup
              platform={activePlatform}
              brandName={targetBrand?.name || "متجر بلال كوو"}
              brandLogo={targetBrand?.logo || ""}
              caption={platformContent.caption || clientReviewPost.title}
              hashtags={platformContent.hashtags || []}
              mediaUrl={clientReviewPost.mediaUrls?.[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"}
              mediaType={clientReviewPost.mediaType || "image"}
              price={clientReviewPost.productPrice}
              discount={clientReviewPost.productDiscount}
              title={clientReviewPost.title}
              onChangePlatform={setActivePlatform}
            />
          </div>

          {/* Right Column (7 cols): Details & Feedback Engine */}
          <div className="lg:col-span-7 space-y-5">
            {/* Shareable Review Link Generator for Agency */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  رابط المعاينة المباشر للعميل (Shareable Client Review Link)
                </span>
                <button
                  onClick={handleCopyShareableLink}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLink ? "تم النسخ!" : "نسخ الرابط"}
                </button>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                يمكنك إرسال هذا الرابط للعميل عبر الواتساب ليفتح صفحة جوال نظيفة تماماً للموافقة بضغطة زر دون الحاجة لتسجيل دخول.
              </p>
            </div>

            {/* Post Specs Table */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">تفاصيل المنشور والجدولة:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">المتجر</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{targetBrand?.name}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">موعد النشر</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                    {new Date(clientReviewPost.scheduledAt).toLocaleString("ar-SA", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">السعر المقترح</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {clientReviewPost.productPrice ? `${clientReviewPost.productPrice} ر.س` : "غير محدد"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Previous Feedback Note if any */}
            {clientReviewPost.approvalFeedback && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  ملاحظات المراجعة السابقة (من: {clientReviewPost.approvalReviewedBy || "العميل"}):
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  "{clientReviewPost.approvalFeedback}"
                </p>
              </div>
            )}

            {/* Client Feedback Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                ملاحظات العميل أو التعديلات المطلوبة (اختياري عند الموافقة، إجباري عند طلب تعديل):
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="مثال: يرجى تعديل السعر إلى 170 ريال أو إضافة هاشتاق #عروض_الخميس..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleApprove}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                اعتماد المنشور فوراً (Approve & Schedule)
              </button>

              <button
                onClick={handleRequestChanges}
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
              >
                <XCircle className="w-4 h-4" />
                طلب تعديل وإعادة للمسودات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
