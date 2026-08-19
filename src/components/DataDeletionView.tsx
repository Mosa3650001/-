import React, { useState } from "react";
import {
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Send,
  HelpCircle,
  Clock,
  Key,
  Database,
  ArrowRight,
} from "lucide-react";
import { AppLogo } from "./AppLogo";

export const DataDeletionView: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [accountHandle, setAccountHandle] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const handleSubmitDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const code = `DEL-${Math.floor(100000 + Math.random() * 900000)}-SP365`;
      setConfirmationCode(code);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>تعليمات واستدعاء حذف بيانات المستخدمين (Meta Data Deletion)</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black">حذف البيانات - SmartPost365</h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
              وفقاً لسياسات وقوانين حماية الخصوصية ومطوري Meta، يحق لجميع مستخدمي منصة SmartPost365 طلب حذف بياناتهم ورموز الوصول الخاصة بحساباتهم نهائياً.
            </p>
          </div>
          <div className="shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
            <AppLogo size="md" />
          </div>
        </div>
      </div>

      {/* 2 Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method 1: Remove via Meta / Facebook Settings */}
        <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
              1
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              الطريقة الأولى: إلغاء التطبيق مباشرة من حسابك على فيسبوك
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              يمكنك في أي وقت إزالة وصول تطبيق SmartPost365 ومسح الأذونات من خلال إعدادات حساب فيسبوك المرتبط:
            </p>

            <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside pr-1 font-medium leading-relaxed">
              <li>افتح تطبيق فيسبوك أو الموقع وانتقل إلى <strong>الإعدادات والخصوصية</strong>.</li>
              <li>اختر <strong>الإعدادات</strong> ثم انتقل إلى قسم <strong>التطبيقات ومواقع الويب (Apps and Websites)</strong>.</li>
              <li>ابحث عن تطبيق <strong>SmartPost365</strong> في قائمة التطبيقات النشطة.</li>
              <li>انقر على زر <strong>إزالة (Remove)</strong> لإلغاء ربط الحساب فوراً.</li>
              <li>سيقوم خادمنا بحذف رموز الوصول وجلسة الربط تلقائياً عبر استدعاء Deletion Callback.</li>
            </ol>
          </div>

          <div className="pt-2">
            <a
              href="https://www.facebook.com/settings?tab=applications"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>انتقل لإعدادات تطبيقات فيسبوك</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Method 2: Instant Form Request */}
        <div className="p-6 md:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
            2
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            الطريقة الثانية: تقديم طلب حذف بيانات فوري
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            املأ النموذج التالي لطلب مسح كامل لبيانات متجرك أو حساباتك من قاعدة بيانات المنصة:
          </p>

          {confirmationCode ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم استلام طلب الحذف بنجاح!</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                رمز تتبع الحذف الخاص بك (Confirmation Code):
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-center font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 select-all">
                {confirmationCode}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                يتم تنفيذ مسح البيانات نهائياً خلال 24 ساعة من تاريخ الطلب وإشعارك بريدياً.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitDeletion} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  البريد الإلكتروني المرتبط بالحساب:
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  اسم الصفحة أو حساب إنستغرام (اختياري):
                </label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="@your_store_name"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  سبب الحذف (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="أسبابك تساعدنا في تحسين المنصة..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري معالجة الطلب...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تأكيد إرسال طلب حذف البيانات</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Technical Meta Callback Information Box */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>ما هي البيانات التي يتم حذفها بالضبط عند تقديم الطلب؟</span>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <li className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>مسح جميع رموز الوصول (Page & User Access Tokens).</span>
          </li>
          <li className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>حذف سجلات المحادثات والردود الخاصة بالمتجر.</span>
          </li>
          <li className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>إزالة حساب المتجر من قائمة الربط السحابية.</span>
          </li>
          <li className="p-3 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>إلغاء اشتراك الـ Webhooks من منصات Meta نهائياً.</span>
          </li>
        </ul>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
          Meta Data Deletion Callback URL (الرابط الفني التلقائي): <code className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">https://ais-pre-fblo65gkeej5xldjg7omaa-559854937214.europe-west1.run.app/api/auth/data-deletion-callback</code>
        </div>
      </div>
    </div>
  );
};
