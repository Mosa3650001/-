import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Link,
  Shield,
  Bot,
  MessageCircle,
  Instagram,
  Facebook,
  Video,
  Share2,
  X,
  Check,
  RefreshCw,
  ExternalLink,
  Settings,
  Key,
  Radio,
  Sliders,
  PlaySquare,
  ArrowRightLeft,
  AlertCircle,
  HelpCircle,
  Copy,
  Zap,
} from "lucide-react";
import { Brand, ConnectedAccount, SocialPlatform } from "../types";
import { ApiIntegrationsModal } from "./ApiIntegrationsModal";
import { FacebookPagesSyncModal } from "./FacebookPagesSyncModal";

export const StoreSettingsView: React.FC = () => {
  const {
    brands,
    createBrand,
    updateBrand,
    deleteBrand,
    connectedAccounts,
    toggleAccountStatus,
    updateConnectedAccount,
    deleteConnectedAccount,
    reassignAccountBrand,
    cleanAllDemoTokensAndData,
    connectNewAccount,
    addToast,
  } = useApp();

  const [activeBrandTab, setActiveBrandTab] = useState<string>(brands[0]?.id || "");

  // Ensure activeBrandTab always points to a valid existing brand
  React.useEffect(() => {
    if (brands.length > 0 && !brands.some((b) => b.id === activeBrandTab)) {
      setActiveBrandTab(brands[0].id);
    }
  }, [brands, activeBrandTab]);

  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [isConnectAccountModalOpen, setIsConnectAccountModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isFbSyncModalOpen, setIsFbSyncModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [selectedAccountForApi, setSelectedAccountForApi] = useState<ConnectedAccount | null>(null);

  // Live API test state for existing accounts
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // New Brand Form
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandTagline, setNewBrandTagline] = useState("");
  const [newBrandColor, setNewBrandColor] = useState("#6366f1");
  const [newBrandTone, setNewBrandTone] = useState("عصري وشبابي");
  const [newBrandHashtags, setNewBrandHashtags] = useState("#أزياء, #فاشن, #تنسيقات");
  const [newBrandAiRules, setNewBrandAiRules] = useState(
    "الرد بأسلوب مرح وودي، توضيح المقاسات المتاحة، وتقديم رابط الواتساب للطلب الفوري."
  );

  // Guided 4-Step Link Wizard State
  const [wizardStoreId, setWizardStoreId] = useState<string>(brands[0]?.id || "");
  const [wizardPlatform, setWizardPlatform] = useState<SocialPlatform>("facebook");
  const [wizardPageId, setWizardPageId] = useState("");
  const [wizardPageName, setWizardPageName] = useState("");
  const [wizardHandle, setWizardHandle] = useState("");
  const [wizardToken, setWizardToken] = useState("");
  const [isTestingWizardApi, setIsTestingWizardApi] = useState(false);
  const [wizardTestStatus, setWizardTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuidedWizard, setShowGuidedWizard] = useState(false);

  const currentBrand = brands.find((b) => b.id === activeBrandTab) || brands[0];
  const brandAccounts = connectedAccounts.filter((a) => a.brandId === currentBrand?.id);

  // Update wizardStoreId when brand changes
  React.useEffect(() => {
    if (activeBrandTab) {
      setWizardStoreId(activeBrandTab);
    }
  }, [activeBrandTab]);

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const brand = createBrand({
      name: newBrandName,
      slug: newBrandName.toLowerCase().replace(/\s+/g, "-"),
      tagline: newBrandTagline || "متجر متكامل",
      description: `${newBrandName} - علامة تجارية`,
      logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80",
      primaryColor: newBrandColor,
      toneLabel: newBrandTone,
      aiReplyInstructions: newBrandAiRules,
      defaultHashtags: newBrandHashtags.split(",").map((h) => h.trim()),
      connectedPlatforms: ["facebook", "instagram", "tiktok", "whatsapp", "youtube"],
      pricingTier: "mid",
    });

    setActiveBrandTab(brand.id);
    setIsAddStoreModalOpen(false);
    setNewBrandName("");
    setNewBrandTagline("");
    addToast({ type: "success", title: `تمت إضافة متجر (${newBrandName}) بنجاح!` });
  };

  const handleCleanSystem = async () => {
    if (
      !confirm(
        "هل تريد بالتأكيد تصفير وتنظيف جميع التوكنات والبيانات التجريبية القديمة لضمان نظافة النظام تماماً؟"
      )
    ) {
      return;
    }
    setIsCleaning(true);
    try {
      await cleanAllDemoTokensAndData();
    } finally {
      setIsCleaning(false);
    }
  };

  const handleTestAccountApi = async (account: ConnectedAccount) => {
    setTestingAccountId(account.id);
    setTestResult(null);
    try {
      const res = await fetch("/api/social/test-page-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: account.platform,
          pageId: account.pageId || account.accountId || account.id,
          pageAccessToken: account.apiToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          id: account.id,
          success: true,
          message: data.message || "✅ التوكن سليم ومصرح له بالنشر والإدارة!",
        });
        addToast({
          type: "success",
          title: `تم فحص وتوثيق (${account.accountName}) بنجاح!`,
        });
      } else {
        setTestResult({
          id: account.id,
          success: false,
          message: data.error || "فشل الاتصال بالـ API. تأكد من صحة التوكن.",
        });
        addToast({
          type: "error",
          title: "فشل التحقق من الـ API",
          description: data.helpTip || data.error,
        });
      }
    } catch (e: any) {
      setTestResult({
        id: account.id,
        success: false,
        message: e.message || "حدث خطأ أثناء فحص الـ API",
      });
    } finally {
      setTestingAccountId(null);
    }
  };

  const handleTestWizardApi = async () => {
    if (!wizardPageId.trim()) {
      addToast({ type: "warning", title: "يرجى كتابة معرّف الصفحة (Page ID)" });
      return;
    }
    if (!wizardToken.trim()) {
      addToast({ type: "warning", title: "يرجى كتابة رمز الوصول (Page Access Token)" });
      return;
    }

    setIsTestingWizardApi(true);
    setWizardTestStatus(null);
    try {
      const res = await fetch("/api/social/test-page-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: wizardPlatform,
          pageId: wizardPageId.trim(),
          pageAccessToken: wizardToken.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWizardTestStatus({
          success: true,
          message: data.message || "✅ تم فحص الصفحة والتوكن بنجاح تام!",
        });
        if (data.pageName && !wizardPageName) {
          setWizardPageName(data.pageName);
        }
      } else {
        setWizardTestStatus({
          success: false,
          message: data.error || "تعذر التحقق من الصفحة أو التوكن غير صالح.",
        });
      }
    } catch (err: any) {
      setWizardTestStatus({
        success: false,
        message: err.message || "تعذر الاتصال بالخادم",
      });
    } finally {
      setIsTestingWizardApi(false);
    }
  };

  const handleSaveWizardLinkedAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardStoreId) {
      addToast({ type: "error", title: "يرجى اختيار المتجر المراد ربط الصفحة به" });
      return;
    }
    if (!wizardPageId.trim()) {
      addToast({ type: "error", title: "معرّف الصفحة (Page ID) مطلوب" });
      return;
    }

    const selectedStore = brands.find((b) => b.id === wizardStoreId);

    try {
      // Call dedicated linking API
      const res = await fetch("/api/social/link-page-to-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: wizardStoreId,
          brandName: selectedStore?.name,
          platform: wizardPlatform,
          pageId: wizardPageId.trim(),
          pageName: wizardPageName.trim() || `${selectedStore?.name} - ${wizardPlatform}`,
          pageAccessToken: wizardToken.trim(),
          handle: wizardHandle.trim() || `@${wizardPageId.trim()}`,
        }),
      });
      const data = await res.json();

      if (data.success && data.account) {
        connectNewAccount(
          wizardStoreId,
          wizardPlatform,
          data.account.handle,
          data.account.accountName,
          data.account.apiToken,
          data.account.pageId
        );
        addToast({
          type: "success",
          title: `🎉 تم ربط الصفحة بمتجر (${selectedStore?.name}) بنجاح!`,
          description: "أصبحت الصفحة جاهزة للنشر وإدارة التعليقات فوراً.",
        });
        setShowGuidedWizard(false);
        setWizardPageId("");
        setWizardPageName("");
        setWizardHandle("");
        setWizardToken("");
        setWizardTestStatus(null);
      } else {
        addToast({
          type: "error",
          title: "تعذر إتمام الربط",
          description: data.error || "يرجى التأكد من البيانات والمحاولة مجدداً.",
        });
      }
    } catch {
      // Direct fallback
      connectNewAccount(
        wizardStoreId,
        wizardPlatform,
        wizardHandle || `@${wizardPageId}`,
        wizardPageName || `${selectedStore?.name} - ${wizardPlatform}`,
        wizardToken,
        wizardPageId
      );
      setShowGuidedWizard(false);
      addToast({
        type: "success",
        title: `تم ربط الصفحة بمتجر (${selectedStore?.name}) بنجاح!`,
      });
    }
  };

  const openApiModalForAccount = (account: ConnectedAccount) => {
    setSelectedAccountForApi(account);
    setIsApiModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>إدارة المتاجر وربط الصفحات المنفصلة</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">إعدادات المتاجر وتخصيص الصفحات</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ربط كل صفحة تواصل بمتجر محدد بشكل منفصل، مع اختبار حي للـ API وتصفير التوكنات السابقة لضمان نظافة النظام.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Clean System Button */}
          <button
            type="button"
            onClick={handleCleanSystem}
            disabled={isCleaning}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800/60 transition flex items-center gap-2 shadow-xs"
            title="حذف أي بيانات أو توكنات تجريبية سابقة لضمان نظافة النظام"
          >
            <RefreshCw className={`w-4 h-4 ${isCleaning ? "animate-spin" : ""}`} />
            <span>{isCleaning ? "جاري التنظيف..." : "🧹 تنظيف التوكنات والبيانات السابقة"}</span>
          </button>

          {/* Guided Link Wizard Button */}
          <button
            type="button"
            onClick={() => setShowGuidedWizard((prev) => !prev)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>⚡ دليل ربط صفحة بمتجر (4 خطوات)</span>
          </button>

          {/* Quick Meta Sync Modal */}
          <button
            type="button"
            onClick={() => setIsFbSyncModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2"
          >
            <Facebook className="w-4 h-4" />
            <span>مزامنة Meta SDK</span>
          </button>

          {/* Add Store Button */}
          <button
            type="button"
            onClick={() => setIsAddStoreModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة متجر جديد</span>
          </button>
        </div>
      </div>

      {/* Guided 4-Step Interactive Link Wizard Panel */}
      {showGuidedWizard && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-white to-violet-900/10 dark:from-indigo-950/40 dark:via-[#0f172a] dark:to-violet-950/40 border-2 border-indigo-500/40 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-200 text-right">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  دليل ربط وتوثيق صفحة تواصل بمتجر مخصص (4 خطوات واضحة ومباشرة)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  اتبع الخطوات أدناه لربط صفحة فيسبوك أو إنستغرام أو أي منصة بالمتجر الذي تريده وتثبيت صلاحيات النشر الحي.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuidedWizard(false)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveWizardLinkedAccount} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Step 1: Target Store */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>المتجر المستهدف</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">اختر المتجر الذي تتبع له هذه الصفحة:</p>
                <select
                  value={wizardStoreId}
                  onChange={(e) => setWizardStoreId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                  required
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-400">
                  المتجر المختار سيتلقى كافة المنشورات والردود الخاصة بهذه الصفحة حصرياً.
                </div>
              </div>

              {/* Step 2: Platform Selection */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>منصة التواصل</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">حدد المنصة المراد ربطها:</p>
                <select
                  value={wizardPlatform}
                  onChange={(e) => setWizardPlatform(e.target.value as SocialPlatform)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                >
                  <option value="facebook">Facebook Pages (فيسبوك)</option>
                  <option value="instagram">Instagram Professional (إنستغرام)</option>
                  <option value="tiktok">TikTok (تيك توك)</option>
                  <option value="whatsapp">WhatsApp Business (واتساب)</option>
                  <option value="youtube">YouTube Shorts (يوتيوب)</option>
                </select>
                <div className="text-[10px] text-slate-400">
                  يدعم فيسبوك وإنستغرام النشر المباشر عبر Meta Graph API v19.0.
                </div>
              </div>

              {/* Step 3: Page ID & Name */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>معرّف الصفحة (Page ID)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">رقم معرّف الصفحة من فيسبوك:</p>
                <input
                  type="text"
                  required
                  value={wizardPageId}
                  onChange={(e) => setWizardPageId(e.target.value)}
                  placeholder="مثال: 1083928172910"
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={wizardPageName}
                  onChange={(e) => setWizardPageName(e.target.value)}
                  placeholder="اسم الصفحة (اختياري، يكتشف تلقائياً)"
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Step 4: Token & Verification */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>رمز الوصول (Token) والفحص</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">رمز الـ Page Access Token الدائم:</p>
                <input
                  type="password"
                  required
                  value={wizardToken}
                  onChange={(e) => setWizardToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleTestWizardApi}
                  disabled={isTestingWizardApi || !wizardToken || !wizardPageId}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingWizardApi ? "animate-spin" : ""}`} />
                  <span>{isTestingWizardApi ? "جاري الفحص..." : "🔍 فحص الاتصال بالـ API"}</span>
                </button>
              </div>
            </div>

            {/* Test Status Banner */}
            {wizardTestStatus && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
                  wizardTestStatus.success
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                }`}
              >
                {wizardTestStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div className="flex-1 font-medium">{wizardTestStatus.message}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/50">
              <button
                type="button"
                onClick={() => setShowGuidedWizard(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وربط الصفحة بالمتجر المحدد</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Brand Horizontal Tabs Switcher */}
      {brands.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {brands
            .filter((b) => b && b.name)
            .map((b) => {
              const isActive = b.id === activeBrandTab;
              const storeAccountsCount = connectedAccounts.filter((a) => a.brandId === b.id).length;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBrandTab(b.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition shrink-0 ${
                    isActive
                      ? "bg-white dark:bg-[#0f172a] border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <img
                    src={b.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80"}
                    alt={b.name}
                    className="w-6 h-6 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span>{b.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {storeAccountsCount} صفحات
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.primaryColor || "#6366f1" }} />
                </button>
              );
            })}
        </div>
      )}

      {/* Empty State when no brands exist */}
      {!currentBrand && (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">لا يوجد أي متجر مضاف حالياً</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            قائمتك خالية ونظيفة من أي بيانات تجريبية. يمكنك البدء بإضافة متجرك الأول، أو استخدام دليل الربط التفاعلي.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStoreModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة متجر جديد</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGuidedWizard(true)}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>⚡ دليل الربط (4 خطوات)</span>
            </button>
          </div>
        </div>
      )}

      {currentBrand && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brand Profile & Connected Social Accounts (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connected Social Accounts for THIS STORE */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-right">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      صفحات التواصل المرتبطة بـ ({currentBrand.name})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      كل صفحة هنا مخصصة لهذا المتجر فقط، ويتم النشر التلقائي ومزامنة التعليقات من خلالها.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWizardStoreId(currentBrand.id);
                      setShowGuidedWizard(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ربط صفحة بهذا المتجر</span>
                  </button>
                </div>
              </div>

              {brandAccounts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    لا توجد صفحات مرتبطة بمتجر ({currentBrand.name}) حالياً
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    يمكنك ربط صفحة فيسبوك أو حساب إنستغرام مخصص لهذا المتجر عبر دليل الربط الفوري أو مزامنة Meta SDK.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWizardStoreId(currentBrand.id);
                        setShowGuidedWizard(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>دليل ربط الصفحة بـ ({currentBrand.name})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFbSyncModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>مزامنة Meta SDK</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {brandAccounts.map((account) => {
                    const isTesting = testingAccountId === account.id;
                    const hasTestResult = testResult && testResult.id === account.id;

                    return (
                      <div
                        key={account.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-right"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-white shrink-0 shadow-xs">
                              {account.platform === "instagram" && <Instagram className="w-5 h-5 text-pink-500" />}
                              {account.platform === "tiktok" && <Video className="w-5 h-5 text-cyan-400" />}
                              {account.platform === "facebook" && <Facebook className="w-5 h-5 text-blue-500" />}
                              {account.platform === "whatsapp" && <MessageCircle className="w-5 h-5 text-emerald-500" />}
                              {account.platform === "youtube" && <PlaySquare className="w-5 h-5 text-red-500" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 flex-wrap">
                                <span>{account.accountName}</span>
                                {account.apiToken ? (
                                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                                    Token Active ✓
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">
                                    No Token
                                  </span>
                                )}
                                {account.pageId && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                                    ID: {account.pageId}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{account.handle}</div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                {account.followersCount?.toLocaleString("ar-SA") || 0} متابع
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* Live API Test Button */}
                            <button
                              type="button"
                              onClick={() => handleTestAccountApi(account)}
                              disabled={isTesting || !account.apiToken}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition disabled:opacity-50"
                              title="فحص صلاحيات النشر والاتصال بـ Meta Graph API"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-indigo-500" : ""}`} />
                              <span>{isTesting ? "جاري الفحص..." : "فحص الـ API"}</span>
                            </button>

                            {/* Token Configuration Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => openApiModalForAccount(account)}
                              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 transition"
                              title="تعديل مفتاح الـ API والـ Access Token"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Status Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleAccountStatus(account.id)}
                              className={`text-[10px] px-2.5 py-1.5 rounded-xl font-bold transition ${
                                account.status === "connected"
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {account.status === "connected" ? "✓ نشط" : "معطل"}
                            </button>

                            {/* Delete Account */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الحساب (${account.accountName})؟`)) {
                                  deleteConnectedAccount(account.id);
                                }
                              }}
                              className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                              title="حذف هذا الحساب نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Reassign Store Bar */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                            <span>نقل أو ربط هذه الصفحة بمتجر آخر:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={account.brandId}
                              onChange={(e) => reassignAccountBrand(account.id, e.target.value)}
                              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white"
                            >
                              {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name} {b.id === account.brandId ? "(المتجر الحالي)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* API Test Feedback Banner */}
                        {hasTestResult && (
                          <div
                            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                              testResult.success
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200"
                                : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-200"
                            }`}
                          >
                            {testResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <div className="font-medium text-[11px]">{testResult.message}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Store Profile Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-right">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentBrand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80"}
                    alt={currentBrand.name || "متجر"}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{currentBrand.name || "متجر جديد"}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{currentBrand.tagline || "متجر متكامل"}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{currentBrand.description || ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: currentBrand.primaryColor || "#6366f1" }}
                  >
                    اللون المعتمد
                  </span>
                </div>
              </div>

              {/* Brand Configuration Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">اسم المتجر:</label>
                  <input
                    type="text"
                    value={currentBrand.name || ""}
                    onChange={(e) => updateBrand(currentBrand.id, { name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">نبرة وصوت المحتوى (Tone of Voice):</label>
                  <input
                    type="text"
                    value={currentBrand.toneLabel || ""}
                    onChange={(e) => updateBrand(currentBrand.id, { toneLabel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الهاشتاقات المعتمدة تلقائياً لكل المنشورات:</label>
                  <input
                    type="text"
                    value={Array.isArray(currentBrand.defaultHashtags) ? currentBrand.defaultHashtags.join(", ") : ""}
                    onChange={(e) =>
                      updateBrand(currentBrand.id, {
                        defaultHashtags: e.target.value.split(",").map((h) => h.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>تعليمات وقواعد الذكاء الاصطناعي في الردود التلقائية:</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">تطبق تلقائياً على كل الرسائل</span>
                  </label>
                  <textarea
                    rows={3}
                    value={currentBrand.aiReplyInstructions || currentBrand.customAiInstructions || ""}
                    onChange={(e) => updateBrand(currentBrand.id, { aiReplyInstructions: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guide & Store Stats (1 Col) */}
          <div className="space-y-6">
            {/* 4 Steps Checklist Info Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-right">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>خطوات ربط الصفحات بالمتجر</span>
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span><strong>اختر المتجر</strong> المراد نشر منتجاته وإدارته.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span><strong>أدخل الـ Page ID والـ Token</strong> لصفحة فيسبوك أو إنستغرام التابعة للمتجر.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>اضغط <strong>"فحص الـ API"</strong> للتأكد من صلاحيات النشر الحي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                  <span>احفظ الربط وسيتم <strong>عزل ونشر محتوى هذا المتجر على هذه الصفحة فقط</strong>!</span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => {
                  setWizardStoreId(currentBrand.id);
                  setShowGuidedWizard(true);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>فتح الدليل والربط الآن</span>
              </button>
            </div>

            {/* Danger Zone: Delete Store */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/40 space-y-3 text-right">
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">حذف هذا المتجر</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                سيؤدي هذا الإجراء إلى إزالة المتجر ({currentBrand.name}) وحساباته المربوطة من المنصة.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`هل أنت متأكد من حذف متجر (${currentBrand.name})؟`)) {
                    deleteBrand(currentBrand.id);
                    const remaining = brands.filter((b) => b.id !== currentBrand.id);
                    setActiveBrandTab(remaining[0]?.id || "");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد حذف المتجر</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Brand Modal */}
      {isAddStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>إضافة متجر أو علامة تجارية جديدة</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStoreModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">اسم المتجر / العلامة التجارية:</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="مثال: متجر بلال كوو للأزياء"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الشعار اللفظي أو الوصف المختصر:</label>
                <input
                  type="text"
                  value={newBrandTagline}
                  onChange={(e) => setNewBrandTagline(e.target.value)}
                  placeholder="مثال: فساتين سهرة وأزياء راقية"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">لون العلامة التجارية:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">نبرة المحتوى:</label>
                  <input
                    type="text"
                    value={newBrandTone}
                    onChange={(e) => setNewBrandTone(e.target.value)}
                    placeholder="فخم وراقي / مرح وشبابي"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تعليمات الرد التلقائي الخاصة بالمتجر:</label>
                <textarea
                  rows={2}
                  value={newBrandAiRules}
                  onChange={(e) => setNewBrandAiRules(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/25"
                >
                  إنشاء المتجر الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global API Integrations Modal */}
      <ApiIntegrationsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        targetAccount={selectedAccountForApi}
      />

      {/* Facebook Pages SDK Quick Sync Modal */}
      <FacebookPagesSyncModal
        isOpen={isFbSyncModalOpen}
        onClose={() => setIsFbSyncModalOpen(false)}
        targetBrandId={activeBrandTab}
      />
    </div>
  );
};
