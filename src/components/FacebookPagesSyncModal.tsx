import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Facebook,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
  Zap,
  Sparkles,
  ShieldCheck,
  Key,
  Layers,
  Send,
  Check,
  Copy,
  Sliders,
  Store,
  Info,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import {
  initFacebookSdk,
  loginAndFetchFacebookPages,
  publishDirectToFacebook,
  getStoredFacebookAppId,
  saveStoredFacebookAppId,
  FacebookPageItem,
} from "../utils/facebookSdk";

interface FacebookPagesSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBrandId?: string;
  onSelectForWizard?: (pageId: string, pageName: string, token: string, brandId: string) => void;
}

export const FacebookPagesSyncModal: React.FC<FacebookPagesSyncModalProps> = ({
  isOpen,
  onClose,
  targetBrandId,
  onSelectForWizard,
}) => {
  const {
    brands,
    connectedAccounts,
    updateConnectedAccount,
    connectNewAccount,
    syncRawFacebookPagesToFirestore,
    syncAllFacebookPagesWithFirestore,
    addToast,
  } = useApp();

  const [appId, setAppId] = useState<string>(() => getStoredFacebookAppId());
  const [isEditingAppId, setIsEditingAppId] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});
  const [discoveredPages, setDiscoveredPages] = useState<FacebookPageItem[]>(() => {
    try {
      const stored = localStorage.getItem("smartpost_facebook_pages");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            id: p.id || p.pageId || p.accountId,
            name: p.name || p.accountName,
            category: p.category || "متجر وتجزئة",
            access_token: p.access_token || p.apiToken,
            picture: {
              data: {
                url: p.picture?.data?.url || p.avatar || `https://graph.facebook.com/${p.id}/picture?type=large`,
              },
            },
            link: p.link || `https://facebook.com/${p.id}`,
            fan_count: p.fan_count || p.followersCount,
          }));
        }
      }
    } catch {
      // safe fallback
    }
    return [];
  });
  const [selectedBrandForPage, setSelectedBrandForPage] = useState<Record<string, string>>({});
  const [manualUserToken, setManualUserToken] = useState<string>("");
  const [manualPageIdInput, setManualPageIdInput] = useState<string>("");
  const [manualPageNameInput, setManualPageNameInput] = useState<string>("");
  const [manualPageTokenInput, setManualPageTokenInput] = useState<string>("");
  const [manualPageCategoryInput, setManualPageCategoryInput] = useState<string>("متجر وتجزئة");
  const [isManualAddingPage, setIsManualAddingPage] = useState<boolean>(false);
  const [showManualAddDirect, setShowManualAddDirect] = useState<boolean>(false);
  const [isFetchingManual, setIsFetchingManual] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState<boolean>(false);

  // Test Post State
  const [testPageId, setTestPageId] = useState<string>("");
  const [testPostMessage, setTestPostMessage] = useState<string>(
    "تجربة نشر تلقائي حي ومباشر من منصة SmartPost365 لإدارة المتاجر 🚀✨"
  );
  const [testImageUrl, setTestImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
  );
  const [isPublishingTest, setIsPublishingTest] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    postId?: string;
    postUrl?: string;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      initFacebookSdk(appId);
      
      // Auto-load connected accounts into discovered pages list
      const existingFbAccounts = connectedAccounts.filter(
        (a) => a.platform === "facebook" && (a.pageId || a.accountId)
      );

      if (existingFbAccounts.length > 0) {
        setDiscoveredPages((prev) => {
          const map = new Map<string, FacebookPageItem>();
          prev.forEach((p) => map.set(p.id, p));
          existingFbAccounts.forEach((acc) => {
            const pid = acc.pageId || acc.accountId || acc.id;
            if (pid && !map.has(pid)) {
              map.set(pid, {
                id: pid,
                name: acc.accountName,
                category: "متجر وتجزئة",
                access_token: acc.apiToken || "",
                picture: { data: { url: acc.avatar || `https://graph.facebook.com/${pid}/picture?type=large` } },
                link: `https://facebook.com/${pid}`,
                fan_count: acc.followersCount,
              });
            }
          });
          return Array.from(map.values());
        });
      }

      // Initialize brand selection defaults
      const defaultBrand = targetBrandId || brands[0]?.id || "";
      const map: Record<string, string> = {};
      connectedAccounts
        .filter((a) => a.platform === "facebook")
        .forEach((a) => {
          const pid = a.pageId || a.accountId;
          if (pid && a.brandId) {
            map[pid] = a.brandId;
          }
        });
      discoveredPages.forEach((p) => {
        if (!map[p.id]) map[p.id] = defaultBrand;
      });
      setSelectedBrandForPage((prev) => ({ ...map, ...prev }));

      if (!testPageId && discoveredPages.length > 0) {
        setTestPageId(discoveredPages[0].id);
      }
    }
  }, [isOpen, appId, targetBrandId, brands, connectedAccounts]);

  if (!isOpen) return null;

  const handleSaveAppId = () => {
    if (!appId.trim()) return;
    saveStoredFacebookAppId(appId.trim());
    setIsEditingAppId(false);
    initFacebookSdk(appId.trim());
    addToast({
      type: "success",
      title: "تم حفظ رقم التطبيق (Meta App ID)",
      description: `App ID: ${appId}`,
    });
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setPublishResult(null);

    try {
      const res = await loginAndFetchFacebookPages(appId);

      if (res.success && res.pages.length > 0) {
        setDiscoveredPages(res.pages);
        // Default brand mappings
        const defaultBrand = targetBrandId || brands[0]?.id || "";
        const map: Record<string, string> = {};
        res.pages.forEach((p) => {
          map[p.id] = defaultBrand;
        });
        setSelectedBrandForPage(map);

        if (!testPageId) {
          setTestPageId(res.pages[0].id);
        }

        // Automatically sync with Firestore for permanent persistence
        await syncRawFacebookPagesToFirestore(res.pages, defaultBrand);

        addToast({
          type: "success",
          title: `🎉 تم جلب ${res.pages.length} صفحة واستخراج التوكنات بنجاح!`,
          description: "يمكنك الآن ربط كل صفحة بمتجرها المخصص أو نسخ التوكنات مباشرة.",
        });
      } else if (res.success && res.pages.length === 0) {
        addToast({
          type: "warning",
          title: "لم يتم العثور على صفحات مرتبطة",
          description: "تأكد من أن حسابك يدير صفحات فيسبوك مفعلة ومنح إذن pages_show_list.",
        });
      } else {
        addToast({
          type: "error",
          title: "فشل الاتصال بفيسبوك",
          description: res.error || "تأكد من إعدادات النطاق في Meta for Developers.",
        });
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "خطأ في نافذة فيسبوك",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchManualPages = async () => {
    if (!manualUserToken.trim()) {
      addToast({ type: "warning", title: "يرجى لصق User Access Token أولاً" });
      return;
    }

    setIsFetchingManual(true);
    try {
      const syncResult = await syncAllFacebookPagesWithFirestore(
        manualUserToken.trim(),
        targetBrandId || brands[0]?.id
      );

      if (syncResult.success && syncResult.count > 0) {
        // Also fetch list for current preview
        const res = await fetch("/api/facebook/get-user-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAccessToken: manualUserToken.trim() }),
        });
        const data = await res.json();
        if (data.pages) {
          setDiscoveredPages(data.pages);
          if (data.pages.length > 0 && !testPageId) {
            setTestPageId(data.pages[0].id);
          }
        }
      }
    } catch (e: any) {
      addToast({ type: "error", title: "خطأ بالاتصال", description: e.message });
    } finally {
      setIsFetchingManual(false);
    }
  };

  const handleDirectAddSinglePage = async () => {
    const pageId = manualPageIdInput.trim();
    const pageName = manualPageNameInput.trim() || `صفحة فيسبوك ${pageId}`;
    const pageToken = manualPageTokenInput.trim();

    if (!pageId) {
      addToast({ type: "warning", title: "يرجى إدخال معرف الصفحة (Page ID)" });
      return;
    }
    if (!pageToken) {
      addToast({ type: "warning", title: "يرجى إدخال رمز وصول الصفحة (Page Access Token)" });
      return;
    }

    setIsManualAddingPage(true);
    try {
      const singlePage: FacebookPageItem = {
        id: pageId,
        name: pageName,
        category: manualPageCategoryInput.trim() || "متجر وتجزئة",
        access_token: pageToken,
        picture: {
          data: {
            url: `https://graph.facebook.com/${pageId}/picture?type=large`,
          },
        },
        link: `https://facebook.com/${pageId}`,
      };

      const selectedBrand = targetBrandId || brands[0]?.id;
      connectNewAccount(
        selectedBrand,
        "facebook",
        pageName.toLowerCase().replace(/\s+/g, "_"),
        pageName,
        pageToken,
        pageId
      );

      await syncRawFacebookPagesToFirestore([singlePage], selectedBrand);

      setDiscoveredPages((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        map.set(singlePage.id, singlePage);
        return Array.from(map.values());
      });
      setTestPageId(singlePage.id);
      setManualPageIdInput("");
      setManualPageNameInput("");
      setManualPageTokenInput("");
      setShowManualAddDirect(false);
      addToast({
        type: "success",
        title: `تمت إضافة وربط صفحة "${pageName}" بنجاح!`,
      });
    } catch (err: any) {
      addToast({ type: "error", title: "فشل الحفظ المباشر", description: err.message });
    } finally {
      setIsManualAddingPage(false);
    }
  };

  const handleConnectSinglePage = async (page: FacebookPageItem) => {
    const brandId = selectedBrandForPage[page.id] || targetBrandId || brands[0]?.id;
    const targetBrand = brands.find((b) => b.id === brandId);

    // 1. Direct local connection
    connectNewAccount(
      brandId,
      "facebook",
      page.name.toLowerCase().replace(/\s+/g, "_"),
      page.name,
      page.access_token,
      page.id
    );

    // 2. Sync Firestore
    await syncRawFacebookPagesToFirestore([page], brandId);

    addToast({
      type: "success",
      title: `✅ تم ربط وتوثيق صفحة "${page.name}" بـ "${targetBrand?.name || "المتجر"}" بنجاح!`,
      description: "الصفحة جاهزة الآن للنشر الفوري واستقبال الردود الحية.",
    });
  };

  const handleConnectAllPages = async () => {
    if (discoveredPages.length === 0) return;
    setIsSyncingCloud(true);
    try {
      for (const page of discoveredPages) {
        const brandId = selectedBrandForPage[page.id] || targetBrandId || brands[0]?.id;
        connectNewAccount(
          brandId,
          "facebook",
          page.name.toLowerCase().replace(/\s+/g, "_"),
          page.name,
          page.access_token,
          page.id
        );
        await syncRawFacebookPagesToFirestore([page], brandId);
      }
      addToast({
        type: "success",
        title: `🎉 تم ربط وتفعيل كافة الصفحات (${discoveredPages.length}) بالمتاجر بنجاح!`,
        description: "كافة الحسابات الآن جاهزة ومربوطة للنشر المباشر وإدارة المحتوى.",
      });
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleExecuteLiveTestPublish = async () => {
    const targetPage = discoveredPages.find((p) => p.id === testPageId) || {
      id: testPageId,
      name: "صفحة فيسبوك",
      access_token:
        connectedAccounts.find((a) => a.pageId === testPageId || a.accountId === testPageId)?.apiToken || "",
    };

    if (!targetPage.id || !targetPage.access_token) {
      addToast({
        type: "warning",
        title: "البيانات غير مكتملة",
        description: "يرجى اختيار صفحة تحتوي على Page Access Token صالح.",
      });
      return;
    }

    setIsPublishingTest(true);
    setPublishResult(null);

    try {
      const res = await publishDirectToFacebook(
        targetPage.id,
        targetPage.access_token,
        testPostMessage,
        testImageUrl
      );

      if (res.success) {
        setPublishResult({
          success: true,
          postId: res.postId,
          postUrl: res.postUrl || `https://facebook.com/${res.postId}`,
          message: "تم النشر الحقيقي على صفحتك في فيسبوك بنجاح!",
        });
        addToast({
          type: "success",
          title: "🎉 تم نشر المنشور الحقيقي على فيسبوك بنجاح!",
          description: `معرف المنشور: ${res.postId}`,
        });
      } else {
        setPublishResult({
          success: false,
          error: res.error || "تعذر إتمام النشر عبر فيسبوك",
        });
        addToast({
          type: "error",
          title: "فشل النشر على فيسبوك",
          description: res.error,
        });
      }
    } catch (err: any) {
      setPublishResult({
        success: false,
        error: err.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsPublishingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-900 dark:text-slate-100 my-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Facebook className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                  مركز ربط صفحات فيسبوك واستخراج التوكنات (Meta SDK)
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-500/30">
                  ربط بضغطة زر
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تسجيل الدخول الرسمي، استخراج الـ Page Access Tokens ومعرفات الصفحات، وتخصيص كل صفحة لمتجرها.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Permission Guide Alert / Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-amber-900 dark:text-amber-300">
                  الصلاحيات المطلوبة للنشر الحي وإدارة الردود
                </h4>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                  (pages_show_list, pages_read_engagement, pages_manage_posts, pages_messaging)
                </p>
              </div>
            </div>
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>فتح Meta Graph API Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Primary Action: One Click Facebook SDK Login */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>الربط التلقائي المعتمد من Meta</span>
                </div>
                <h3 className="text-xl font-black">تسجيل الدخول وجلب كافة صفحات فيسبوك واستخراج التوكنات</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  تفتح نافذة فيسبوك الرسمية، تسجل دخولك، ويقوم النظام تلقائياً بقراءة كل الصفحات واستخراج الـ Page Access Tokens ومعرفات الـ Page IDs لربطها بمتاجرك أو نسخها.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm shadow-lg shadow-black/10 transition flex items-center justify-center gap-2.5 shrink-0 disabled:opacity-75 cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري الاتصال بفيسبوك...</span>
                  </>
                ) : (
                  <>
                    <Facebook className="w-5 h-5 fill-current" />
                    <span>تسجيل الدخول بفيسبوك واستخراج التوكنات</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Discovered Pages Section */}
          {discoveredPages.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                    الصفحات المكتشفة وبيانات التوكن ({discoveredPages.length} صفحة)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleConnectAllPages}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ربط جميع الصفحات وتفعيلها ({discoveredPages.length})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveredPages.map((page) => {
                  const isAlreadyConnected = connectedAccounts.some(
                    (a) =>
                      a.platform === "facebook" &&
                      (a.pageId === page.id || a.accountId === page.id) &&
                      a.status === "connected"
                  );
                  const isTokenVisible = !!visibleTokens[page.id];

                  return (
                    <div
                      key={page.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            page.picture?.data?.url ||
                            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80"
                          }
                          alt={page.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {page.name}
                            </h4>
                            {isAlreadyConnected ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3" /> متصلة بالمتجر
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                                بانتظار التثبيت
                              </span>
                            )}
                          </div>

                          {/* Page ID with Copy button */}
                          <div className="mt-1 flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px]">Page ID:</span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold select-all text-[11px] truncate flex-1">
                              {page.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(page.id);
                                addToast({ type: "info", title: `تم نسخ معرّف الصفحة: ${page.id}` });
                              }}
                              className="text-slate-500 hover:text-indigo-600 transition shrink-0"
                              title="نسخ معرف الصفحة (Page ID)"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Page Access Token with Show/Hide & Copy */}
                          {page.access_token ? (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                                Token:
                              </span>
                              <span className="font-mono text-emerald-800 dark:text-emerald-300 text-[10px] truncate flex-1">
                                {isTokenVisible ? page.access_token : `${page.access_token.slice(0, 10)}••••••••••••`}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setVisibleTokens((prev) => ({ ...prev, [page.id]: !prev[page.id] }))
                                }
                                className="text-emerald-600 hover:text-emerald-800 transition shrink-0"
                                title={isTokenVisible ? "إخفاء الرمز" : "إظهار الرمز"}
                              >
                                {isTokenVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(page.access_token);
                                  addToast({ type: "success", title: "تم نسخ رمز الـ Page Access Token بنجاح!" });
                                }}
                                className="text-emerald-600 hover:text-emerald-800 transition shrink-0"
                                title="نسخ رمز وصول الصفحة (Page Access Token)"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                              ⚠️ لم يتم العثور على رمز وصول للصفحة
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs flex-1 min-w-0">
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">المتجر:</span>
                            <select
                              value={selectedBrandForPage[page.id] || brands[0]?.id}
                              onChange={(e) =>
                                setSelectedBrandForPage({
                                  ...selectedBrandForPage,
                                  [page.id]: e.target.value,
                                })
                              }
                              className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none w-full truncate"
                            >
                              {brands
                                .filter((b) => b && b.name && b.name.trim().length > 0)
                                .map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setTestPageId(page.id);
                                addToast({
                                  type: "info",
                                  title: `تم اختيار صفحة "${page.name}" لاختبار النشر`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>تجربة</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConnectSinglePage(page)}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isAlreadyConnected ? "تحديث التثبيت" : "ربط الصفحة بالمتجر"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Direct handoff to 4-step wizard if callback is provided */}
                        {onSelectForWizard && (
                          <button
                            type="button"
                            onClick={() => {
                              const bId = selectedBrandForPage[page.id] || targetBrandId || brands[0]?.id;
                              onSelectForWizard(page.id, page.name, page.access_token, bId);
                              onClose();
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800/50"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>تعبئة هذه الصفحة والتوكن في دليل الربط (4 خطوات)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback Option: Manual User Access Token / Graph Explorer Import */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Info className="w-4 h-4 text-blue-500" />
                <span>جلب الصفحات عبر رمز الوصول (User Token أو Page Token)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualAddDirect(!showManualAddDirect)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showManualAddDirect ? "إخفاء الإضافة اليدوية" : "إضافة صفحة يدوياً مباشرة"}</span>
                </button>
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Graph Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {showManualAddDirect ? (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in duration-200">
                <div className="font-bold text-xs text-indigo-900 dark:text-indigo-300">
                  إدخال صفحة فيسبوك ورمز الـ Token يدوياً:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      معرف الصفحة (Page ID):
                    </label>
                    <input
                      type="text"
                      value={manualPageIdInput}
                      onChange={(e) => setManualPageIdInput(e.target.value)}
                      placeholder="مثال: 1083928172910"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      اسم الصفحة:
                    </label>
                    <input
                      type="text"
                      value={manualPageNameInput}
                      onChange={(e) => setManualPageNameInput(e.target.value)}
                      placeholder="مثال: متجر الأناقة"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="text-xs">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    رمز وصول الصفحة (Page Access Token):
                  </label>
                  <input
                    type="password"
                    value={manualPageTokenInput}
                    onChange={(e) => setManualPageTokenInput(e.target.value)}
                    placeholder="EAA..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleDirectAddSinglePage}
                    disabled={isManualAddingPage}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isManualAddingPage ? "جاري الحفظ..." : "حفظ الصفحة وربطها بالمتجر"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={manualUserToken}
                  onChange={(e) => setManualUserToken(e.target.value)}
                  placeholder="الصق رمز User Access Token المستخرج من Graph API Explorer..."
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleFetchManualPages}
                  disabled={isFetchingManual}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingManual ? "animate-spin" : ""}`} />
                  <span>{isFetchingManual ? "جاري الجلب..." : "جلب الصفحات الآن"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            SmartPost365 • التكامل المباشر مع Meta Graph API v19.0
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
