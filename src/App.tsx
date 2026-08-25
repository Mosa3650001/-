import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Toasts } from "./components/Toasts";
import { DashboardView } from "./components/DashboardView";
import { IdeaLabView } from "./components/IdeaLabView";
import { PostStudio } from "./components/PostStudio";
import { CalendarView } from "./components/CalendarView";
import { InboxView } from "./components/InboxView";
import { AnalyticsView } from "./components/AnalyticsView";
import { TeamManagementView } from "./components/TeamManagementView";
import { StoreSettingsView } from "./components/StoreSettingsView";
import { AboutUsView } from "./components/AboutUsView";
import { PrivacyPolicyView } from "./components/PrivacyPolicyView";
import { DataDeletionView } from "./components/DataDeletionView";
import { Footer } from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BulkImportModal } from "./components/BulkImportModal";
import { AiCreditsModal } from "./components/AiCreditsModal";
import { TokenHealthMonitorModal } from "./components/TokenHealthMonitorModal";
import { ClientApprovalModal } from "./components/ClientApprovalModal";
import { EvergreenRecyclerModal } from "./components/EvergreenRecyclerModal";
import {
  LayoutDashboard,
  Lightbulb,
  Sparkles,
  CalendarDays,
  MessageSquareReply,
} from "lucide-react";

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, inboxItems, ideas } = useApp();
  const pendingInboxCount = inboxItems.filter((i) => i.status === "pending").length;
  const inProgressIdeasCount = ideas.filter((i) => i.stage !== "published").length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors" dir="rtl">
      {/* Top Navigation */}
      <Navbar />

      {/* Drawer Sidebar (opens on clicking ☰ and closes on click anywhere) */}
      <Sidebar />

      {/* Main Full-Width Content Area */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-20 md:pb-8 bg-slate-100 dark:bg-[#070b14] transition-colors">
          <div className="max-w-7xl mx-auto w-full">
            <ErrorBoundary>
              {activeTab === "dashboard" && <DashboardView />}
              {activeTab === "ideas" && <IdeaLabView />}
              {activeTab === "studio" && <PostStudio />}
              {activeTab === "calendar" && <CalendarView />}
              {activeTab === "inbox" && <InboxView />}
              {activeTab === "analytics" && <AnalyticsView />}
              {activeTab === "team" && <TeamManagementView />}
              {activeTab === "stores" && <StoreSettingsView />}
              {activeTab === "about" && <AboutUsView onNavigateTab={setActiveTab} />}
              {activeTab === "privacy" && <PrivacyPolicyView />}
              {activeTab === "data_deletion" && <DataDeletionView />}
            </ErrorBoundary>
          </div>
        </main>

        {/* Global Footer with official links */}
        <Footer onNavigateTab={setActiveTab} activeTab={activeTab} />
      </div>

      {/* Mobile Bottom Quick Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 px-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === "dashboard" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab("ideas")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition relative ${
            activeTab === "ideas" ? "text-amber-500" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Lightbulb className="w-4 h-4 mb-0.5" />
          {inProgressIdeasCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[9px] text-slate-950 flex items-center justify-center font-black">
              {inProgressIdeasCount}
            </span>
          )}
          <span>الأفكار</span>
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === "studio" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>النشر</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition ${
            activeTab === "calendar" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <CalendarDays className="w-4 h-4 mb-0.5" />
          <span>التقويم</span>
        </button>

        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition relative ${
            activeTab === "inbox" ? "text-rose-500" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <MessageSquareReply className="w-4 h-4 mb-0.5" />
          {pendingInboxCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-black">
              {pendingInboxCount}
            </span>
          )}
          <span>الردود</span>
        </button>
      </nav>

      {/* Commercial SaaS Modals */}
      <BulkImportModal />
      <AiCreditsModal />
      <TokenHealthMonitorModal />
      <ClientApprovalModal />
      <EvergreenRecyclerModal post={null} onClose={() => {}} />

      {/* Global Toast Notifications */}
      <Toasts />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
