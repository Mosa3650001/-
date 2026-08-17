import React from "react";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  MessageSquareReply,
  TrendingUp,
  Users,
  Store,
  Zap,
  Lightbulb,
  X,
  ChevronLeft,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    inboxItems,
    posts,
    ideas,
    connectedAccounts,
    sidebarOpen,
    setSidebarOpen,
  } = useApp();

  const pendingInboxCount = inboxItems.filter((i) => i.status === "pending").length;
  const scheduledPostsCount = posts.filter((p) => p.status === "scheduled").length;
  const inProgressIdeasCount = ideas.filter((i) => i.stage !== "published").length;

  const navItems = [
    {
      id: "dashboard" as const,
      label: "لوحة التحكم الرئيسية",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "ideas" as const,
      label: "مختبر الأفكار ومسار الإنتاج",
      icon: Lightbulb,
      badge: inProgressIdeasCount > 0 ? `${inProgressIdeasCount}` : null,
      badgeColor: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold",
    },
    {
      id: "studio" as const,
      label: "استوديو النشر والقوالب",
      icon: Sparkles,
      badge: "AI",
      badgeColor: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-bold",
    },
    {
      id: "calendar" as const,
      label: "تقويم وجدول النشر",
      icon: CalendarDays,
      badge: scheduledPostsCount > 0 ? `${scheduledPostsCount}` : null,
      badgeColor: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold",
    },
    {
      id: "inbox" as const,
      label: "صندوق الوارد والردود",
      icon: MessageSquareReply,
      badge: pendingInboxCount > 0 ? `${pendingInboxCount}` : null,
      badgeColor: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold",
    },
    {
      id: "analytics" as const,
      label: "التحليلات ومتابعة الأداء",
      icon: TrendingUp,
      badge: null,
    },
    {
      id: "team" as const,
      label: "المساعدين وصلاحيات الفريق",
      icon: Users,
      badge: null,
    },
    {
      id: "stores" as const,
      label: "المتاجر والحسابات المتصلة",
      icon: Store,
      badge: `${connectedAccounts.length}`,
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    },
  ];

  if (!sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay - clicking anywhere closes the sidebar */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#0B1120] border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 shadow-2xl transition-transform animate-in slide-in-from-right duration-250 select-none"
        dir="rtl"
      >
        {/* Brand / Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400/30" />
              </div>
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5">
                <span>سوشيال هب</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                  PRO
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">إدارة محتوى ومتاجر الأزياء</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            أقسام النظام
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition text-right group ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-transform" />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info in drawer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          <span>انقر في أي مكان خارج القائمة للإغلاق ومتابعة العمل</span>
        </div>
      </aside>
    </>
  );
};
