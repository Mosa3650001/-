import React from "react";
import { useApp } from "../context/AppContext";
import {
  Layers,
  PieChart as PieIcon,
  Tag,
  ShoppingBag,
  Sparkles,
  BookOpen,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { ContentPillar } from "../types";

export const ContentPillarsWidget: React.FC = () => {
  const { posts, currentBrandId } = useApp();

  // Filter posts by selected brand
  const filteredPosts = posts.filter(
    (p) =>
      currentBrandId === "all" ||
      p.brandId === currentBrandId ||
      (p.targetBrandIds && p.targetBrandIds.includes(currentBrandId))
  );

  const total = Math.max(1, filteredPosts.length);

  // Group by pillars
  const counts: Record<ContentPillar, number> = {
    offers: 0,
    products: 0,
    engagement: 0,
    educational: 0,
    bts: 0,
  };

  filteredPosts.forEach((p) => {
    const pillar: ContentPillar = p.contentPillar || (p.productDiscount ? "offers" : "products");
    counts[pillar] = (counts[pillar] || 0) + 1;
  });

  const percentages = {
    offers: Math.round((counts.offers / total) * 100),
    products: Math.round((counts.products / total) * 100),
    engagement: Math.round((counts.engagement / total) * 100),
    educational: Math.round((counts.educational / total) * 100),
  };

  // Recommended benchmarks: Offers ~25%, Products ~35%, Engagement ~20%, Educational ~20%
  const isBalanced = percentages.offers <= 40 && percentages.engagement >= 10;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4" dir="rtl">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              توزيع أعمدة المحتوى (Content Pillars Strategy)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              توازن خطة النشر بين البيع، التفاعل، وتثقيف الجمهور
            </p>
          </div>
        </div>
        {isBalanced ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            توازن ممتاز
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3" />
            يحتاج تنويع
          </span>
        )}
      </div>

      {/* Segmented Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${percentages.offers}%` }}
            title={`عروض وخصومات: ${percentages.offers}%`}
          />
          <div
            className="bg-indigo-600 h-full transition-all duration-500"
            style={{ width: `${percentages.products}%` }}
            title={`استعراض منتجات: ${percentages.products}%`}
          />
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${percentages.engagement}%` }}
            title={`تفاعلي وأسئلة: ${percentages.engagement}%`}
          />
          <div
            className="bg-purple-500 h-full transition-all duration-500"
            style={{ width: `${percentages.educational}%` }}
            title={`تثقيفي وخلف الكواليس: ${percentages.educational}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
          <span>0%</span>
          <span>إجمالي المنشورات: {filteredPosts.length} منشور</span>
          <span>100%</span>
        </div>
      </div>

      {/* Grid of 4 Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. Offers */}
        <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              عروض وتخفيضات
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-black text-amber-900 dark:text-amber-100">{percentages.offers}%</span>
            <span className="text-[10px] text-slate-400 font-bold">{counts.offers} منشور</span>
          </div>
          <span className="text-[9px] text-slate-400 block font-medium">الموصى به: ~25%</span>
        </div>

        {/* 2. Products */}
        <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-1">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 text-xs font-bold">
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
              استعراض منتجات
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-black text-indigo-900 dark:text-indigo-100">{percentages.products}%</span>
            <span className="text-[10px] text-slate-400 font-bold">{counts.products} منشور</span>
          </div>
          <span className="text-[9px] text-slate-400 block font-medium">الموصى به: ~35%</span>
        </div>

        {/* 3. Engagement */}
        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              تفاعلي وأسئلة
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">{percentages.engagement}%</span>
            <span className="text-[10px] text-slate-400 font-bold">{counts.engagement} منشور</span>
          </div>
          <span className="text-[9px] text-slate-400 block font-medium">الموصى به: ~20%</span>
        </div>

        {/* 4. Educational */}
        <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-1">
          <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 text-xs font-bold">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              تثقيفي وكواليس
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-black text-purple-900 dark:text-purple-100">{percentages.educational}%</span>
            <span className="text-[10px] text-slate-400 font-bold">{counts.educational} منشور</span>
          </div>
          <span className="text-[9px] text-slate-400 block font-medium">الموصى به: ~20%</span>
        </div>
      </div>

      {/* AI Strategy Advisor Box */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5 text-xs">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="font-bold text-slate-900 dark:text-white">نصيحة المستشار الذكي: </strong>
          {percentages.offers > 45 ? (
            <span>
              نسبة العروض المباشرة مرتفعة ({percentages.offers}%). ننصح بإضافة منشورات تفاعلية وقصص خلف الكواليس لرفع خوارزمية الوصول الطبيعي وتفادي ملل المتابعين.
            </span>
          ) : percentages.engagement < 10 ? (
            <span>
              نسبة المحتوى التفاعلي منخفضة. ننصح بجدولة منشور استطلاع رأي أو "هذا أم ذاك" في نهاية الأسبوع لتحفيز التعليقات.
            </span>
          ) : (
            <span>
              توزيع خطة المحتوى متوازن ومثالي لبناء علامة تجارية قوية ومبيعات مستدامة في نفس الوقت!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
