import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Menu,
  Sparkles,
  Plus,
  Bell,
  ShieldCheck,
  ChevronDown,
  Layers,
  UserCheck,
  Building2,
  Sun,
  Moon,
  Check,
  X,
  Cloud,
  LogIn,
  Users,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { AppLogo } from "./AppLogo";

export const Navbar: React.FC = () => {
  const {
    brands,
    currentBrandId,
    setCurrentBrandId,
    selectedBrand,
    teamMembers,
    currentUser,
    setCurrentUser,
    inboxItems,
    setActiveTab,
    theme,
    toggleTheme,
    toggleSidebar,
    sidebarOpen,
    activeTab,
    isCloudSynced,
  } = useApp();

  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const pendingCommentsCount = inboxItems.filter((i) => i.status === "pending").length;

  const PAGE_TITLES: Record<string, string> = {
    dashboard: "الرئيسية",
    ideas: "مختبر الأفكار",
    studio: "استوديو النشر",
    calendar: "جدول النشر",
    inbox: "صندوق الردود",
    analytics: "التحليلات",
    team: "إدارة الفريق",
    stores: "المتاجر والحسابات",
    about: "من نحن",
    privacy: "الخصوصية",
    data_deletion: "حذف البيانات",
  };

  return (
    <>
      {/* Click-away backdrop overlay to dismiss open dropdowns */}
      {(brandDropdownOpen || userDropdownOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[1px]"
          onClick={() => {
            setBrandDropdownOpen(false);
            setUserDropdownOpen(false);
          }}
        />
      )}

      <header className="h-16 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-40 px-3 sm:px-5 lg:px-6 flex items-center justify-between transition-colors shadow-xs select-none" dir="rtl">
        {/* Right Section: Toggle Menu + Brand Identity + Store Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Menu Drawer Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              sidebarOpen
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-inner"
                : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            }`}
            title={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة الرئيسية"}
            aria-label="القائمة الجانبية"
          >
            {sidebarOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>

          {/* SmartPost365 Official Logo */}
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center hover:opacity-90 transition active:scale-98"
            title="الرئيسية SmartPost365"
          >
            <AppLogo size="sm" showTagline={false} />
          </button>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Current Store / Brand Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBrandDropdownOpen(!brandDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition text-xs sm:text-sm font-semibold shadow-2xs ${
                brandDropdownOpen
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                  : "bg-slate-50/80 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              }`}
            >
              {selectedBrand ? (
                <>
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.name}
                    className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                  />
                  <span className="font-bold text-slate-900 dark:text-white max-w-[90px] sm:max-w-[140px] truncate text-xs sm:text-sm">
                    {selectedBrand.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-md bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0">
                    <Layers className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">جميع المتاجر</span>
                </>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${brandDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Brands Dropdown Menu */}
            {brandDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="px-3.5 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>المتجر النشط</span>
                  <span className="text-[10px]">{brands.length} متاجر</span>
                </div>

                {/* All Brands Option */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentBrandId("all");
                    setBrandDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition text-right ${
                    currentBrandId === "all"
                      ? "bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">جميع المتاجر</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">إدارة مجمّعة لكافة الحسابات</div>
                  </div>
                  {currentBrandId === "all" && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                {/* Individual Brands */}
                <div className="max-h-56 overflow-y-auto">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setCurrentBrandId(b.id);
                        setBrandDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 text-sm transition text-right ${
                        currentBrandId === b.id
                          ? "bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-bold"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 overflow-hidden text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{b.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{b.tagline}</div>
                      </div>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: b.primaryColor }}
                      />
                      {currentBrandId === b.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("stores");
                    setBrandDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>إدارة المتاجر والحسابات...</span>
                </button>
              </div>
            )}
          </div>

          {/* Current Page Tag (Clean pill on large screens) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <span>القسم:</span>
            <span className="text-indigo-600 dark:text-indigo-400">{PAGE_TITLES[activeTab] || "الرئيسية"}</span>
          </div>
        </div>

        {/* Left Section: Cloud Sync + Theme + Inbox + User + Create Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Sync Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
              isCloudSynced
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
            title="مزامنة حية مع السحابة (Firestore)"
          >
            <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? "text-emerald-500 fill-emerald-500/20 animate-pulse" : "text-slate-400"}`} />
            <span className="text-[11px]">{isCloudSynced ? "مزامنة سحابية" : "جاري الاتصال..."}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition"
            title={theme === "dark" ? "التحويل للوضع الفاتح" : "التحويل للوضع الداكن"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Inbox Notification Bell */}
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="صندوق الوارد والتعليقات"
          >
            <Bell className="w-4 h-4" />
            {pendingCommentsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs animate-bounce">
                {pendingCommentsCount}
              </span>
            )}
          </button>

          {/* Current User Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setBrandDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                userDropdownOpen
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                  : "bg-slate-50/80 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              }`}
              title="تبديل المستخدم وتجربة الصلاحيات"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
              />
              <span className="font-bold text-slate-900 dark:text-white hidden lg:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 text-right animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="px-3.5 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>المستخدم الحالي</span>
                  <span className="text-[10px]">{teamMembers.length} أعضاء</span>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setCurrentUser(member);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition text-right ${
                        currentUser.id === member.id
                          ? "bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-bold"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{member.roleLabel}</div>
                      </div>
                      {currentUser.id === member.id && (
                        <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                <div className="p-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>تسجيل دخول / حساب مساعد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("team");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>إدارة الصلاحيات والفريق...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Post Action Button */}
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span className="hidden sm:inline">إنشاء ونشر</span>
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

