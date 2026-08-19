import React from "react";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Bot,
  Calendar,
  Layers,
  ShieldCheck,
  Globe,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Flame,
  Check,
} from "lucide-react";
import { AppLogo } from "./AppLogo";

interface AboutUsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onNavigateTab }) => {
  const pillars = [
    {
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-500",
      title: "نشر ذكي على مدار 365 يوماً",
      desc: "أتمتة متكاملة للنشر والجدولة المتزامنة عبر فيسبوك، إنستغرام، تيك توك، واتساب، ويوتيوب دون توقف.",
    },
    {
      icon: Bot,
      color: "from-indigo-600 to-purple-600",
      textColor: "text-indigo-500",
      title: "ذكاء اصطناعي فائق (Gemini 3.7)",
      desc: "ابتكار أفكار ريلز فايرال، كتابة سيناريوهات تصوير احترافية، وشات بوت ذكي للرد الفوري على استفسارات الزبائن.",
    },
    {
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-500",
      title: "إدارة متعددة المتاجر والبراندات",
      desc: "تحكم مركزي بحسابات أكثر من متجر أو علامة تجارية في لوحة موحدة مع الحفاظ على خصوصية وهوية كل علامة.",
    },
    {
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-500",
      title: "أمان متوافق ومعتمد من Meta",
      desc: "ربط رسمي عبر Meta Graph API مع سياسات خصوصية صارمة، تحكم كامل بالصلاحيات وحذف فوري للبيانات عند الطلب.",
    },
  ];

  const features = [
    "مختبر الأفكار والسيناريوهات الكوميدية والتريند مع مسار إنتاج متقدم",
    "صندوق وارد موحد مع شات بوت ذكي يقترح ردوداً جاهزة بلهجات متعددة",
    "استوديو تصميم وقوالب بصرية احترافية للملابس والمتاجر الإلكترونية",
    "تحليلات دقيقة لأفضل أوقات التفاعل وسلوك الجمهور العربي والخليجي",
    "نظام إدارة فريق عمل ومساعدين بصلاحيات مخصصة ومزامنة سحابية لحظية",
    "جدولة ونشر تلقائي بالثانية والدقيقة مع توافق تام لسياسات الشبكات الاجتماعية",
  ];

  const stats = [
    { number: "365", label: "يوماً من الجاهزية والأتمتة المستمرة", badge: "تغطية سنوية" },
    { number: "+5", label: "منصات تواصل اجتماعي رئيسية مدعومة", badge: "ربط متزامن" },
    { number: "< 3s", label: "سرعة توليد الأفكار والردود الذكية", badge: "Gemini 3.7" },
    { number: "100%", label: "امتثال لسياسات حماية البيانات و Meta", badge: "أمان وخصوصية" },
  ];

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300" dir="rtl">
      {/* Hero Section with Brand Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-8 md:p-14 shadow-2xl text-center">
        {/* Background ambient lighting effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Official Animated Logo */}
          <div className="flex justify-center">
            <AppLogo size="xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs md:text-sm font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>المنصة الرائدة في أتمتة وإدارة محتوى السوشيال ميديا بالذكاء الاصطناعي</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            نحن نبني الجيل القادم من <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-indigo-400 bg-clip-text text-transparent">النشر الذكي وإدارة المتاجر</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            تأسست <strong className="text-white font-bold">SmartPost365</strong> لتمكين المتاجر ورواد الأعمال وصناع المحتوى من قيادة حضورهم الرقمي عبر منصات ميتا (فيسبوك، إنستغرام)، تيك توك، وواتساب بكل احترافية وكفاءة تفوق المعتاد على مدار 365 يوماً في السنة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("dashboard")}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <span>ابدأ إدارة متاجرك الآن</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            )}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("privacy")}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-bold text-sm transition"
              >
                سياسة الخصوصية والأمان
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1.5 transition hover:border-indigo-500/50"
          >
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              {stat.badge}
            </span>
            <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-mono pt-1">
              {stat.number}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">رؤيتنا (Our Vision)</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            أن نكون المنصة الأكثر موثوقية وذكاءً في الشرق الأوسط لإدارة شبكات التواصل الاجتماعي، ومساعدة العلامات التجارية على تحويل التفاعل والمنشورات العادية إلى مبيعات ملموسة وعلاقات عملاء دائمة بأقل جهد تشغيلي.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">رسالتنا (Our Mission)</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
            تقديم بيئة عمل برمجية شاملة تجمع بين دقة التخطيط، إبداع الذكاء الاصطناعي التوليدي، وأتمتة الردود السريعة، مع تطبيق أعلى معايير الخصوصية والأمان وحماية بيانات المستخدمين المعتمدة عالمياً.
          </p>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">ركائز القوة في SmartPost365</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            تم تصميم كل ركن في المنصة ليعالج تحديات إدارة الحسابات المتعددة وتكلفة الوقت اليومية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition hover:-translate-y-1 duration-200"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pillar.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{pillar.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Capabilities Checklist */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-slate-900 dark:via-[#0B1120] dark:to-slate-900 border border-indigo-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">ما الذي تقدمه المنصة لعلامتك التجارية؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">منظومة رقمية شاملة بدون الحاجة لأدوات متعددة ومشتتة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {features.map((feat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 flex items-start gap-3 shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance & Contact Footer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>منصة SmartPost365 ملتزمة بنسبة 100% بحماية بياناتك وخصوصيتك</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          إذا كان لديك أي استفسار أو ترغب في مساعدة حول ربط حسابات ميتا أو حذف بياناتك، بإمكانك زيارة صفحة سياسة الخصوصية أو التواصل مع الدعم الفني.
        </p>
      </div>
    </div>
  );
};
