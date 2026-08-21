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
}

export const FacebookPagesSyncModal: React.FC<FacebookPagesSyncModalProps> = ({
  isOpen,
  onClose,
  targetBrandId,
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
  const [discoveredPages, setDiscoveredPages] = useState<FacebookPageItem[]>([]);
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
      // Initialize brand selection defaults
      const defaultBrand = targetBrandId || brands[0]?.id || "";
      const map: Record<string, string> = {};
      discoveredPages.forEach((p) => {
        map[p.id] = defaultBrand;
      });
      setSelectedBrandForPage((prev) => ({ ...map, ...prev }));
    }
  }, [isOpen, appId, targetBrandId, brands]);

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
          title: `🎉 تم جلب ومزامنة ${res.pages.length} صفحة فيسبوك في Firestore!`,
          description: "الصفحات الآن مسجلة بشكل دائم في قاعدة البيانات دون اختفاء.",
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
      const res = await syncRawFacebookPagesToFirestore([singlePage], selectedBrand);

      if (res.success) {
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
      }
    } catch (err: any) {
      addToast({ type: "error", title: "فشل الحفظ المباشر", description: err.message });
    } finally {
      setIsManualAddingPage(false);
    }
  };

  const handleConnectSinglePage = async (page: FacebookPageItem) => {
    const brandId = selectedBrandForPage[page.id] || brands[0]?.id;
    if (!brandId) return;

    await syncRawFacebookPagesToFirestore([page], brandId);
  };

  const handleConnectAllPages = async () => {
    if (discoveredPages.length === 0) return;
    setIsSyncingCloud(true);
    try {
      await syncRawFacebookPagesToFirestore(discoveredPages, targetBrandId || brands[0]?.id);
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
                  مركز ربط صفحات فيسبوك السريع (Meta SDK & Pages)
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-500/30">
                  ربط بضغطة زر
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تسجيل الدخول الرسمي وجلب كل صفحات فيسبوك تلقائياً واستخراج رموز الـ Page Tokens وتجربة النشر الحي.
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
              <div className="text-xs">
                <div className="font-bold text-amber-900 dark:text-amber-200">
                  هل تواجه خطأ (#200) أو مشاكل في أذونات النشر؟
                </div>
                <div className="text-amber-700 dark:text-amber-400">
                  شاهد الشرح الشامل لإعداد الصلاحيات ودور المستخدم واستخراج Page Access Token الصحيح.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPermissionGuide(!showPermissionGuide)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showPermissionGuide ? "إخفاء الدليل" : "عرض دليل حل خطأ (#200)"}</span>
            </button>
          </div>

          {/* Expandable Error 200 Guide */}
          {showPermissionGuide && (
            <div className="p-5 rounded-3xl bg-slate-900 text-slate-100 border border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h4 className="font-black text-sm text-white">
                  دليل إدارة الصلاحيات وتفادي خطأ (#200) Permission Error في فيسبوك
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>1. استخدام Page Token بدلاً من User Token</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    خطأ (#200) يحدث غالباً عند محاولة النشر على رابط الصفحة <code>/{`{page-id}`}/feed</code> باستخدام رمز وصول المستخدم (User Token) بدلاً من رمز وصول الصفحة (Page Access Token). عند المزامنة، يقوم تطبيقنا تلقائياً باستخراج الـ Page Token الخاص بكل صفحة وحفظه سحابياً.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>2. الصلاحيات (Scopes) الإلزامية في Meta</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    عند إنشاء التوكن في Graph API Explorer، يجب تحديد الصلاحيات التالية:
                  </p>
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">pages_show_list</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">pages_read_engagement</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">pages_manage_posts</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">publish_video</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <span>3. دور الحساب داخل الصفحة (Page Access Tasks)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    في تجربة الصفحات الجديدة (New Pages Experience)، ادخل إلى إعدادات الصفحة ⟵ <b>وصول الصفحة (Page Access)</b> وتأكد أن حسابك يمتلك صلاحية <b>إنشاء المحتوى (Content Creation)</b> أو <b>التحكم الكامل (Full Control)</b>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                  <div className="font-bold text-violet-300 flex items-center gap-1.5">
                    <span>4. وضع التطبيق (Development vs Live Mode)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    إذا كان تطبيق Meta App الخاص بك في وضع التطوير (Development Mode)، فلن يُسمح بالنشر إلا للمستخدمين المضافين كـ <b>Admins/Developers/Testers</b> داخل لوحة Meta Developers. لنشر أي صفحة أخرى، انقل التطبيق إلى Live Mode أو أضف الحساب في لوحة الأدوار.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* App ID Quick Configuration Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">رقم التطبيق (Meta App ID): </span>
                {!isEditingAppId ? (
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {appId || "غير محدد"}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="مثال: 1524992344722897"
                    className="mt-1 sm:mt-0 font-mono text-xs px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    dir="ltr"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isEditingAppId ? (
                <button
                  type="button"
                  onClick={() => setIsEditingAppId(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                >
                  تعديل App ID
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAppId}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                >
                  حفظ وتطبيق
                </button>
              )}
            </div>
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
                <h3 className="text-xl font-black">تسجيل الدخول وجلب كافة صفحات فيسبوك بضغطة واحدة</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  تفتح نافذة فيسبوك الرسمية، تسجل دخولك، ويقوم النظام تلقائياً بقراءة كل الصفحات واستخراج الـ Page Access Tokens الدائمة بصلاحيات النشر الكاملة.
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
                    <span>تسجيل الدخول بفيسبوك وجلب الصفحات</span>
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
                    الصفحات المكتشفة ({discoveredPages.length} صفحة)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleConnectAllPages}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ربط جميع الصفحات دفعة واحدة ({discoveredPages.length})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {discoveredPages.map((page) => {
                  const isAlreadyConnected = connectedAccounts.some(
                    (a) => a.platform === "facebook" && (a.pageId === page.id || a.accountId === page.id)
                  );

                  return (
                    <div
                      key={page.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
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
                            {isAlreadyConnected && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3" /> متصلة
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                            <span>ID: {page.id}</span>
                            <span>•</span>
                            <span>{page.category || "صفحة نشاط"}</span>
                          </div>

                          <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>صلاحيات النشر وإدارة المحتوى مفعلة</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">المتجر:</span>
                          <select
                            value={selectedBrandForPage[page.id] || brands[0]?.id}
                            onChange={(e) =>
                              setSelectedBrandForPage({
                                ...selectedBrandForPage,
                                [page.id]: e.target.value,
                              })
                            }
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                          >
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
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
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isAlreadyConnected ? "تحديث الربط" : "ربط الصفحة"}</span>
                          </button>
                        </div>
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
                  <span>فتح Graph API Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualUserToken}
                onChange={(e) => setManualUserToken(e.target.value)}
                placeholder="الصق Access Token (يبدأ عادة بـ EAA...) لجلب الصفحات ومزامنتها فوراً..."
                className="flex-1 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleFetchManualPages}
                disabled={isFetchingManual}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                {isFetchingManual ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>جلب ومزامنة Firestore</span>
              </button>
            </div>

            {/* Direct Page Input Form (When User already has Page ID + Page Token) */}
            {showManualAddDirect && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-2 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                  <Key className="w-4 h-4 text-emerald-500" />
                  <span>إدخال بيانات الصفحة وحفظها مباشرة في Firestore:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      معرف الصفحة (Page ID):
                    </label>
                    <input
                      type="text"
                      value={manualPageIdInput}
                      onChange={(e) => setManualPageIdInput(e.target.value)}
                      placeholder="مثال: 1083928172910"
                      className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      اسم الصفحة:
                    </label>
                    <input
                      type="text"
                      value={manualPageNameInput}
                      onChange={(e) => setManualPageNameInput(e.target.value)}
                      placeholder="مثال: بلال كوو للأزياء"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      تصنيف الصفحة:
                    </label>
                    <input
                      type="text"
                      value={manualPageCategoryInput}
                      onChange={(e) => setManualPageCategoryInput(e.target.value)}
                      placeholder="متجر وتجزئة"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    رمز وصول الصفحة الدائم (Page Access Token):
                  </label>
                  <input
                    type="text"
                    value={manualPageTokenInput}
                    onChange={(e) => setManualPageTokenInput(e.target.value)}
                    placeholder="EAA..."
                    className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleDirectAddSinglePage}
                    disabled={isManualAddingPage}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {isManualAddingPage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>حفظ الصفحة وربطها سحابياً بالمتجر</span>
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Live Post Publishing Tester Section */}
          <div className="p-5 md:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                    🚀 مختبر النشر المباشر الحقيقي على صفحة فيسبوك
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    اختبر النشر الفوري للتأكد 100% من ظهور المنشور على صفحتك في فيسبوك الآن.
                  </p>
                </div>
              </div>

              {/* Page Selector for Test */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">الصفحة المستهدفة:</span>
                <select
                  value={testPageId}
                  onChange={(e) => setTestPageId(e.target.value)}
                  className="font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  {discoveredPages.length > 0 ? (
                    discoveredPages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))
                  ) : (
                    connectedAccounts
                      .filter((a) => a.platform === "facebook" && (a.pageId || a.accountId))
                      .map((a) => (
                        <option key={a.id} value={a.pageId || a.accountId}>
                          {a.accountName} ({a.pageId || a.accountId})
                        </option>
                      ))
                  )}
                </select>
              </div>
            </div>

            {/* Test Post Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص المنشور التجريبي:
                </label>
                <textarea
                  rows={2}
                  value={testPostMessage}
                  onChange={(e) => setTestPostMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط صورة المنشور (اختياري):
                </label>
                <input
                  type="text"
                  value={testImageUrl}
                  onChange={(e) => setTestImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full font-mono text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleExecuteLiveTestPublish}
                  disabled={isPublishingTest || !testPageId}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isPublishingTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري النشر المباشر على فيسبوك...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>نشر المنشور الآن على فيسبوك 🚀</span>
                    </>
                  )}
                </button>
              </div>

              {/* Publish Result Card */}
              {publishResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs animate-in fade-in duration-200 ${
                    publishResult.success
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {publishResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-black text-sm">
                        {publishResult.success ? publishResult.message : "فشل النشر على فيسبوك"}
                      </div>
                      {publishResult.postId && (
                        <div className="font-mono text-[11px] opacity-90">
                          معرف المنشور (Post ID): {publishResult.postId}
                        </div>
                      )}
                      {publishResult.error && <div>{publishResult.error}</div>}

                      {publishResult.postUrl && (
                        <div className="pt-2">
                          <a
                            href={publishResult.postUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs"
                          >
                            <span>فتح المنشور على صفحة فيسبوك مباشرة ↗</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>يتم تخزين الرموز وتأمينها مشفرة على السيرفر للاتصال المباشر.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
