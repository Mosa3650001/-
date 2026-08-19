import React from "react";
import { AppLogo } from "./AppLogo";
import { ShieldCheck, Info, Trash2, Heart } from "lucide-react";

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  activeTab: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, activeTab }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-xs py-6 px-4 sm:px-6 transition-colors select-none" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <AppLogo size="sm" showTagline={false} />
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="text-slate-500 dark:text-slate-400">
            المنصة السحابية الذكية لإدارة المتاجر وحملات السوشيال ميديا 365 يوماً
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-600 dark:text-slate-300 font-semibold">
          <button
            type="button"
            onClick={() => onNavigateTab("about")}
            className={`flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
              activeTab === "about" ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""
            }`}
          >
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>من نحن</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("privacy")}
            className={`flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
              activeTab === "privacy" ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>سياسة الخصوصية</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("data_deletion")}
            className={`flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
              activeTab === "data_deletion" ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>تعليمات حذف البيانات</span>
          </button>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1">
          <span>© {new Date().getFullYear()} SmartPost365. جميع الحقوق محفوظة.</span>
        </div>
      </div>
    </footer>
  );
};
