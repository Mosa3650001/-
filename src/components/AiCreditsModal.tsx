import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  X,
  AlertCircle,
  Cpu,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export const AiCreditsModal: React.FC = () => {
  const { aiCreditsModalOpen, setAiCreditsModalOpen, aiWallet, addAiCredits } = useApp();
  const [selectedTopup, setSelectedTopup] = useState<number>(500);

  if (!aiCreditsModalOpen) return null;

  const remainingCredits = Math.max(0, aiWallet.totalCredits - aiWallet.usedCredits);
  const percentageUsed = Math.min(100, Math.round((aiWallet.usedCredits / aiWallet.totalCredits) * 100));

  const handleTopup = () => {
    addAiCredits(selectedTopup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  محفظة الذكاء الاصطناعي وحماية التكلفة (AI Cost Shield)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {aiWallet.tierLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                مراقبة استهلاك وحدات الذكاء الاصطناعي والتحكم في تكاليف التوليد لكافة المتاجر
              </p>
            </div>
          </div>
          <button
            onClick={() => setAiCreditsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-indigo-100 text-xs font-bold">
                <span>الرصيد المتبقي</span>
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-3xl font-black">{remainingCredits.toLocaleString("ar-SA")}</div>
              <p className="text-[11px] text-indigo-100/90 font-medium">نقطة ذكاء اصطناعي متاحة للتوليد الفوري</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>المستهلك هذا الشهر</span>
                <Cpu className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {aiWallet.usedCredits.toLocaleString("ar-SA")}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>المحرك النشط</span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.7 Flash
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">مع تدرج تلقائي ذكي لمقاومة أي ضغط</p>
            </div>
          </div>

          {/* Pricing & Consumption Guide */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-850/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              جدول تسعير العمليات بالنقاط (حماية هامش الربح)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">صياغة منشور لـ 5 منصات</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">2 نقطة</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">سكريبت فيديو ريلز وسيناريو</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">3 نقاط</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">تحليل المحتوى وخطة الأوقات</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">3 نقاط</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">الرد الذكي على تعليق/رسالة</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">1 نقطة</span>
              </div>
            </div>
          </div>

          {/* Quick Top-up Simulation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  شحن رصيد إضافي للمشروع (SaaS Ready)
                </h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-400">
                  اختر الباقة المناسبة لاحتياجات فريقك أو عملائك
                </p>
              </div>
              <button
                onClick={handleTopup}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                شحن الرصيد الآن
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { amount: 250, label: "250 نقطة", desc: "مناسب لحساب واحد" },
                { amount: 500, label: "500 نقطة", desc: "الأكثر شيوعاً للمتاجر" },
                { amount: 1500, label: "1500 نقطة", desc: "للوكالات وإدارة الفروع" },
              ].map((pack) => (
                <button
                  key={pack.amount}
                  type="button"
                  onClick={() => setSelectedTopup(pack.amount)}
                  className={`p-3 rounded-xl border text-right transition ${
                    selectedTopup === pack.amount
                      ? "bg-white dark:bg-slate-800 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                      : "bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{pack.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{pack.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Usage History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              سجل استهلاك الذكاء الاصطناعي الأخير
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              {aiWallet.history.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">لا توجد عمليات استهلاك مسجلة حتى الآن</div>
              ) : (
                aiWallet.history.map((item) => (
                  <div key={item.id} className="p-3 sm:px-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.action}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleString("ar-SA")} • {item.model || "Gemini 3.7"}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                      -{item.credits} نقطة
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setAiCreditsModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
