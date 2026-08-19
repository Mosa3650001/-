import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail,
  Server,
  Share2,
} from "lucide-react";
import { AppLogo } from "./AppLogo";

export const PrivacyPolicyView: React.FC = () => {
  const [currentDate] = useState("19 أغسطس 2026");

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>الوثيقة الرسمية لسياسة الخصوصية وحماية البيانات</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black">سياسة الخصوصية - SmartPost365</h1>
            <p className="text-xs md:text-sm text-slate-300">
              تاريخ آخر تحديث وسريان: <span className="font-bold text-white font-mono">{currentDate}</span>
            </p>
          </div>
          <div className="shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
            <AppLogo size="md" />
          </div>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">تشفير وأمان البيانات</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            جميع رموز الوصول (Access Tokens) والبيانات مشفرة ومحمية بقواعد أمان صارمة.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">عدم مشاركة البيانات</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            لا نبيع ولا نشارك أي بيانات للمستخدمين أو المتاجر مع أي طرف ثالث تجاري أو إعلاني.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">حق الحذف الفوري</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            يحق لك طلب حذف كافة بياناتك وحساباتك من منصتنا بضغطة زر في أي وقت.
          </p>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
        {/* Section 1: Intro */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>1. المقدمة ونطاق التطبيق</span>
          </h2>
          <p>
            تلتزم منصة <strong>SmartPost365</strong> ("المنصة"، "نحن"، "لنا") باحترام خصوصية مستخدميها وحماية بياناتهم الشخصية وبيانات حسابات التواصل الاجتماعي المرتبطة بها. توضح هذه السياسة كيفية جمع البيانات، استخدامها، معالجتها، وحمايتها عند استخدامك لخدماتنا وموقعنا وتطبيقاتنا المتصلة بمنصات Meta (Facebook & Instagram Graph API) وغيرها من الشبكات الاجتماعية.
          </p>
        </section>

        {/* Section 2: Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>2. البيانات والمعلومات التي نقوم بجمعها</span>
          </h2>
          <p>عند ربطك لحسابات التواصل الاجتماعي أو إنشاء حساب في SmartPost365، نقوم بجمع الأنواع التالية من البيانات فقط لتشغيل الخدمة:</p>
          <ul className="list-disc list-inside space-y-1.5 pr-2 text-xs md:text-sm text-slate-700 dark:text-slate-300">
            <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، واسم المتجر أو العلامة التجارية.</li>
            <li><strong>بيانات الصفحات والحسابات المتصلة:</strong> معرفات الصفحات (Page IDs)، أسماء الحسابات العامة (Usernames/Handles)، ورموز الوصول الآمنة (Access Tokens) الممنوحة بموافقتك الصريحة.</li>
            <li><strong>المحتوى والرسائل:</strong> المنشورات المجدولة، نصوص التعليقات، والرسائل الواردة لغرض تمكين ميزة الرد الذكي والشات بوت فقط.</li>
            <li><strong>سجلات النظام الفنية:</strong> معلومات الاتصال الأساسية مثل نوع المتصفح وعنوان IP لضمان أمان النظام ومنع محاولات الاختراق.</li>
          </ul>
        </section>

        {/* Section 3: How We Use Data */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>3. الغرض من استخدام البيانات</span>
          </h2>
          <p>نستخدم البيانات التي نجمعها حصرياً للأغراض التالية:</p>
          <ul className="list-disc list-inside space-y-1.5 pr-2 text-xs md:text-sm text-slate-700 dark:text-slate-300">
            <li>تمكين نشر وجدولة المنشورات ومقاطع الفيديو والريلز على الحسابات المصرح بها.</li>
            <li>معالجة التعليقات والرسائل لتقديم مقترحات الردود الذكية وتسهيل خدمة العملاء.</li>
            <li>تزويدك بالتحليلات والإحصاءات المتعلقة بأداء المحتوى وأفضل أوقات التفاعل.</li>
            <li>إدارة صلاحيات فريق العمل وتخصيص الوصول بحسب المتاجر المحددة لكل موظف.</li>
          </ul>
        </section>

        {/* Section 4: Meta & Third Party APIs */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>4. الامتثال لسياسات منصات ميتا (Meta Platform Terms)</span>
          </h2>
          <p>
            تلتزم SmartPost365 امتثالاً كاملاً بجميع شروط وسياسات مطوري ميتا (Meta Developer Platform Terms). لا نستخدم بيانات Meta Graph API لإنشاء ملفات تعريفية إعلانية للمستخدمين، ولا نقوم بإعادة بيع أو نقل بيانات المستخدمين لأي سماسرة بيانات (Data Brokers).
          </p>
        </section>

        {/* Section 5: Data Retention & Deletion */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>5. الاحتفاظ بالبيانات وحذفها (User Data Deletion)</span>
          </h2>
          <p>
            نحتفظ ببياناتك فقط للمدة اللازمة لتقديم الخدمات أو حتى تطلب حذفها. يمكنك في أي وقت طلب حذف كامل لبياناتك وحساباتك من خلال الانتقال إلى صفحة <strong>تعليمات حذف البيانات</strong> في المنصة أو عبر إرسال بريد إلكتروني، وسيتم مسح كافة السجلات ورموز الوصول نهائياً دون رجعة.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>6. التواصل ومسؤول حماية البيانات</span>
          </h2>
          <p>
            إذا كانت لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو معالجة البيانات، يمكنك التواصل مع فريق الدعم الفني عبر:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div>Email: <strong className="text-indigo-600 dark:text-indigo-400">alwheeb365@gmail.com</strong></div>
            <div>Platform: <strong>SmartPost365 Management Suite</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
};
