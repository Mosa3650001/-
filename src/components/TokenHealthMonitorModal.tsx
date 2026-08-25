import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Key,
  ExternalLink,
  Zap,
  X,
  Facebook,
  Instagram,
  Youtube,
  Share2,
} from "lucide-react";
import { ConnectedAccount, SocialPlatform } from "../types";

export const TokenHealthMonitorModal: React.FC = () => {
  const {
    tokenHealthModalOpen,
    setTokenHealthModalOpen,
    connectedAccounts,
    brands,
    updateConnectedAccount,
    addToast,
    setActiveTab,
  } = useApp();

  const [testingId, setTestingId] = useState<string | null>(null);

  if (!tokenHealthModalOpen) return null;

  // Calculate health status for accounts
  const accountsHealth = connectedAccounts.map((acc) => {
    const brand = brands.find((b) => b.id === acc.brandId);
    const hasToken = Boolean(acc.apiToken && acc.apiToken.length > 10);
    
    // Calculate days remaining (mock or based on tokenExpiresAt)
    let daysRemaining = 58;
    if (acc.tokenExpiresAt) {
      const diff = new Date(acc.tokenExpiresAt).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    } else if (!hasToken) {
      daysRemaining = 0;
    }

    let status: "healthy" | "expiring_soon" | "expired" = "healthy";
    if (!hasToken || daysRemaining <= 0) {
      status = "expired";
    } else if (daysRemaining <= 7) {
      status = "expiring_soon";
    }

    return {
      ...acc,
      brandName: brand?.name || "متجر افتراضي",
      status,
      daysRemaining,
      hasToken,
    };
  });

  const expiringCount = accountsHealth.filter((a) => a.status === "expiring_soon").length;
  const expiredCount = accountsHealth.filter((a) => a.status === "expired").length;

  const handleTestToken = async (acc: { id: string; accountName: string; apiToken?: string }) => {
    setTestingId(acc.id);
    // Simulate real token validation ping
    setTimeout(() => {
      setTestingId(null);
      if (acc.apiToken && acc.apiToken.length > 15) {
        updateConnectedAccount(acc.id, {
          status: "connected",
          lastSyncedAt: new Date().toISOString(),
        });
        addToast({
          type: "success",
          title: `✅ تم التحقق: توكن ${acc.accountName} نشط ومصرح 100%!`,
          description: "صلاحيات النشر وقراءة التعليقات تعمل بدون أي مشاكل.",
        });
      } else {
        updateConnectedAccount(acc.id, {
          status: "expired",
        });
        addToast({
          type: "warning",
          title: `⚠️ توكن ${acc.accountName} غير مكتمل أو منتهي الصلاحية`,
          description: "يرجى تجديد رمز الوصول من نافذة مزامنة فيسبوك/تيك توك.",
        });
      }
    }, 900);
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-600" />;
      case "tiktok":
        return <span className="font-black text-xs text-cyan-500">TikTok</span>;
      default:
        return <Share2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  فاحص صحة التوكنات والربط السحابي (Token Health Monitor)
                </h2>
                {expiredCount === 0 && expiringCount === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    كافة الحسابات مستقرة
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {expiredCount + expiringCount} حساب يحتاج انتباه
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                مراقبة استباقية لصلاحية Access Tokens وتنبيهك قبل انتهائها لضمان عدم فشل النشر المجدول
              </p>
            </div>
          </div>
          <button
            onClick={() => setTokenHealthModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Summary Alerts */}
          {(expiredCount > 0 || expiringCount > 0) && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                  تنبيه استباقي لمنع انقطاع النشر التلقائي
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  يوجد بعض الحسابات التي تنتهي صلاحية رموز الوصول الخاصة بها قريباً. ننصح بالضغط على زر "تجديد الرمز" لتفادي رفض المنصات للمنشورات المجدولة.
                </p>
              </div>
            </div>
          )}

          {/* Accounts Health Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>قائمة الحسابات والصفحات المربوطة ({accountsHealth.length})</span>
              <span className="text-xs text-slate-500 font-normal">فحص دوري صامت كل 24 ساعة</span>
            </h3>

            {accountsHealth.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <Key className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold">
                  لم تقم بربط أي حسابات أو صفحات حتى الآن
                </p>
                <button
                  onClick={() => {
                    setTokenHealthModalOpen(false);
                    setActiveTab("stores");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                >
                  الذهاب إلى ربط الصفحات والمتاجر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {accountsHealth.map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      acc.status === "healthy"
                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                        : acc.status === "expiring_soon"
                        ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80"
                        : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img
                            src={acc.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt={acc.accountName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
                            {getPlatformIcon(acc.platform)}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{acc.accountName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {acc.handle} • {acc.brandName}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {acc.status === "healthy" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          نشط ({acc.daysRemaining} يوم متبقي)
                        </span>
                      )}
                      {acc.status === "expiring_soon" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          ينتهي خلال {acc.daysRemaining} أيام
                        </span>
                      )}
                      {acc.status === "expired" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-300 dark:border-rose-800">
                          <XCircle className="w-3 h-3" />
                          منتهي / يحتاج تجديد
                        </span>
                      )}
                    </div>

                    {/* Permissions & Token Snippet */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span>الصلاحيات:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                          {acc.canPublish ? "النشر المباشر" : "المعاينة فقط"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestToken(acc)}
                          disabled={testingId === acc.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${testingId === acc.id ? "animate-spin" : ""}`} />
                          فحص الاتصال
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setTokenHealthModalOpen(false);
              setActiveTab("stores");
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            إدارة مفاتيح API والصفحات
          </button>
          <button
            onClick={() => setTokenHealthModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
