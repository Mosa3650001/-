import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Facebook,
  Instagram,
  Video,
  PlaySquare,
  MessageCircle,
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
  Tv,
} from "lucide-react";
import { SocialPlatform } from "../types";
import { initFacebookSdk, loginAndFetchFacebookPages } from "../utils/facebookSdk";

interface MultiPlatformSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: SocialPlatform;
  targetBrandId?: string;
}

export const MultiPlatformSyncModal: React.FC<MultiPlatformSyncModalProps> = ({
  isOpen,
  onClose,
  initialPlatform = "facebook",
  targetBrandId,
}) => {
  const {
    brands,
    connectedAccounts,
    connectNewAccount,
    updateConnectedAccount,
    addToast,
  } = useApp();

  const [activePlatform, setActivePlatform] = useState<SocialPlatform>(initialPlatform);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(targetBrandId || brands[0]?.id || "");

  // Form Inputs
  const [accountName, setAccountName] = useState("");
  const [accountHandle, setAccountHandle] = useState("");
  const [accountIdOrPageId, setAccountIdOrPageId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [apiSecretOrWaba, setApiSecretOrWaba] = useState("");
  const [showToken, setShowToken] = useState(false);

  // States
  const [isTesting, setIsTesting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredIgAccounts, setDiscoveredIgAccounts] = useState<any[]>([]);
  const [testStatus, setTestStatus] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Auto-switch brand when prop changes
  useEffect(() => {
    if (targetBrandId) {
      setSelectedBrandId(targetBrandId);
    }
  }, [targetBrandId]);

  // Reset form when switching platforms
  useEffect(() => {
    setAccountName("");
    setAccountHandle("");
    setAccountIdOrPageId("");
    setApiToken("");
    setApiSecretOrWaba("");
    setTestStatus(null);
    setDiscoveredIgAccounts([]);

    // Autofill if account already exists for selected brand
    const existing = connectedAccounts.find(
      (a) => a.platform === activePlatform && (selectedBrandId === "all" || a.brandId === selectedBrandId)
    );
    if (existing) {
      setAccountName(existing.accountName);
      setAccountHandle(existing.handle);
      setAccountIdOrPageId(existing.pageId || existing.accountId || "");
      setApiToken(existing.apiToken || "");
      setApiSecretOrWaba(existing.apiSecret || "");
    }
  }, [activePlatform, selectedBrandId]);

  if (!isOpen) return null;

  const currentBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  // 1. One-Click Discover Instagram Accounts from Meta Token
  const handleDiscoverInstagram = async () => {
    setIsDiscovering(true);
    setTestStatus(null);

    // Look for existing Facebook token in connected accounts or localStorage
    let fbToken = apiToken;
    if (!fbToken) {
      const fbAccount = connectedAccounts.find((a) => a.platform === "facebook" && a.apiToken);
      if (fbAccount) fbToken = fbAccount.apiToken;
    }

    if (!fbToken) {
      // Trigger Meta Facebook SDK Login first to acquire token
      try {
        const loginRes = await loginAndFetchFacebookPages();
        if (loginRes.success && loginRes.user?.accessToken) {
          fbToken = loginRes.user.accessToken;
        } else if (loginRes.pages?.[0]?.access_token) {
          fbToken = loginRes.pages[0].access_token;
        }
      } catch (err) {
        console.warn("FB SDK Login fallback:", err);
      }
    }

    if (!fbToken) {
      setIsDiscovering(false);
      setTestStatus({
        success: false,
        message: "يرجى إدخال User Access Token أو ربط حساب فيسبوك أولاً لجلب حسابات إنستغرام المرتبطة تلقائياً.",
      });
      return;
    }

    try {
      const res = await fetch("/api/instagram/get-user-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAccessToken: fbToken }),
      });
      const data = await res.json();

      if (data.success && data.accounts?.length > 0) {
        setDiscoveredIgAccounts(data.accounts);
        addToast({
          type: "success",
          title: `🎉 تم اكتشاف ${data.accounts.length} حساب إنستغرام تجاري!`,
          description: "اختر الحساب المطلوب لربطه بالمتجر بضغطة زر.",
        });
      } else {
        setTestStatus({
          success: false,
          message: data.error || "لم يتم العثور على حساب إنستغرام احترافي مرتبط بصفحاتك.",
          details: "تأكد من تحويل حساب إنستغرام إلى Professional/Creator وربطه بصفحة فيسبوك في Meta Business Suite.",
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: "تعذر الاتصال بـ Instagram Graph API",
        details: err.message,
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  // 2. Select Discovered Instagram Account
  const handleSelectDiscoveredIg = (ig: any) => {
    setAccountName(ig.name || ig.username);
    setAccountHandle(ig.handle || `@${ig.username}`);
    setAccountIdOrPageId(ig.igUserId || ig.id);
    setApiToken(ig.accessToken);
    setTestStatus({
      success: true,
      message: `✅ تم اختيار حساب إنستغرام (@${ig.username}) بنجاح!`,
      details: `المتابعون: ${ig.followersCount} - منشورات: ${ig.mediaCount} - جاهز للربط بالمتجر.`,
    });
  };

  // 3. Test Connection based on current Platform
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);

    try {
      let endpoint = "/api/social/test-page-api";
      let body: any = {};

      if (activePlatform === "facebook") {
        endpoint = "/api/facebook/test-connection";
        body = { pageId: accountIdOrPageId, pageAccessToken: apiToken };
      } else if (activePlatform === "instagram") {
        endpoint = "/api/instagram/test-connection";
        body = { igUserId: accountIdOrPageId, accessToken: apiToken };
      } else if (activePlatform === "tiktok") {
        endpoint = "/api/tiktok/test-connection";
        body = { clientKey: apiSecretOrWaba, openId: accountIdOrPageId, accessToken: apiToken };
      } else if (activePlatform === "youtube") {
        endpoint = "/api/youtube/test-connection";
        body = { channelId: accountIdOrPageId, apiKey: apiToken, accessToken: apiToken };
      } else if (activePlatform === "whatsapp") {
        endpoint = "/api/whatsapp/test-connection";
        body = { phoneNumberId: accountIdOrPageId, wabaId: apiSecretOrWaba, systemAccessToken: apiToken };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus({
          success: true,
          message: data.message || "✅ تم التحقق المباشر من الـ API بنجاح تام!",
          details: data.details || `الحساب جاهز للنشر والمزامنة والتكامل.`,
        });
        if (data.pageName || data.accountName || data.username || data.channelTitle || data.verifiedName) {
          setAccountName(data.pageName || data.accountName || data.username || data.channelTitle || data.verifiedName);
        }
        if (data.handle) {
          setAccountHandle(data.handle);
        }
        addToast({
          type: "success",
          title: `تم التحقق بنجاح من ربط ${activePlatform.toUpperCase()}!`,
        });
      } else {
        setTestStatus({
          success: false,
          message: data.error || "فشل التحقق من مفاتيح المنصة.",
          details: data.helpTip || data.details || "يرجى مراجعة المعرف والرمز المدخل.",
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: "خطأ أثناء محاولة الاتصال بالخادم",
        details: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 4. Save and Connect Account
  const handleSaveAndConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() && !accountIdOrPageId.trim()) {
      addToast({
        type: "warning",
        title: "يرجى إدخال اسم الحساب أو المعرف على الأقل",
      });
      return;
    }

    connectNewAccount(
      selectedBrandId,
      activePlatform,
      accountHandle.trim() || `@${accountName.replace(/\s+/g, "_") || activePlatform}`,
      accountName.trim() || `حساب ${activePlatform}`,
      apiToken.trim(),
      accountIdOrPageId.trim()
    );

    addToast({
      type: "success",
      title: `🎉 تم ربط حساب ${activePlatform.toUpperCase()} بمتجر (${currentBrand?.name}) بنجاح!`,
      description: "الحساب متاح الآن في استوديو النشر وصندوق الوارد الذكي.",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-900 dark:text-slate-100"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                  مركز ربط ومزامنة القنوات الاجتماعية (5 منصات)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  تكامل شامل
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إدارة وربط حسابات فيسبوك، إنستغرام، تيك توك، يوتيوب، وواتساب السحابي بضغطة زر واحدة.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition"
          >
            ✕
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 p-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActivePlatform("facebook")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activePlatform === "facebook"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Facebook className="w-4 h-4" />
            <span className="hidden sm:inline">فيسبوك</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform("instagram")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activePlatform === "instagram"
                ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span className="hidden sm:inline">إنستغرام</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform("tiktok")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activePlatform === "tiktok"
                ? "bg-slate-950 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">تيك توك</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform("youtube")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activePlatform === "youtube"
                ? "bg-red-600 text-white shadow-md shadow-red-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span className="hidden sm:inline">يوتيوب</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform("whatsapp")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activePlatform === "whatsapp"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">واتساب</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Target Store Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  المتجر المستهدف لربط القناة:
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  سيتم تعيين هذا الحساب لنشر المحتوى وإدارة الرسائل الخاصة بالمتجر المختار
                </div>
              </div>
            </div>

            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 min-w-[200px]"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Special Instagram Auto-Discovery Banner */}
          {activePlatform === "instagram" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    اكتشاف حسابات إنستغرام التجارية المرتبطة بـ Meta تلقائياً:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDiscoverInstagram}
                  disabled={isDiscovering}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ فحص وجلب حسابات Instagram من Meta</span>
                    </>
                  )}
                </button>
              </div>

              {discoveredIgAccounts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-pink-500/20">
                  {discoveredIgAccounts.map((ig) => (
                    <div
                      key={ig.id}
                      onClick={() => handleSelectDiscoveredIg(ig)}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-pink-200 dark:border-pink-900/50 hover:border-pink-500 cursor-pointer flex items-center gap-3 transition"
                    >
                      <img
                        src={ig.avatar || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100"}
                        alt={ig.name}
                        className="w-9 h-9 rounded-full object-cover border border-pink-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {ig.name || ig.username}
                        </div>
                        <div className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">
                          @{ig.username} • {ig.followersCount} متابع
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-300 font-bold">
                        اختر ↵
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form for manual / quick credentials input */}
          <form onSubmit={handleSaveAndConnect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اسم الحساب أو القناة:
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={
                    activePlatform === "facebook"
                      ? "صفحة المتجر على فيسبوك"
                      : activePlatform === "instagram"
                      ? "متجر الأزياء العصرية"
                      : activePlatform === "tiktok"
                      ? "حساب تيك توك للمتجر"
                      : activePlatform === "youtube"
                      ? "قناة المتجر الرسمية"
                      : "واتساب المتجر للطلب الفوري"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              {/* Handle / Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  المعرف أو رقم الحساب (Handle / Phone):
                </label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder={
                    activePlatform === "whatsapp"
                      ? "+966 50 123 4567"
                      : `@${activePlatform}_store`
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activePlatform === "facebook"
                    ? "معرف الصفحة (Page ID):"
                    : activePlatform === "instagram"
                    ? "معرف حساب إنستغرام التجاري (IG User ID):"
                    : activePlatform === "tiktok"
                    ? "معرف TikTok Open ID / Advertiser ID:"
                    : activePlatform === "youtube"
                    ? "معرف قناة يوتيوب (Channel ID):"
                    : "معرف رقم الهاتف السحابي (Phone Number ID):"}
                </label>
                <input
                  type="text"
                  value={accountIdOrPageId}
                  onChange={(e) => setAccountIdOrPageId(e.target.value)}
                  placeholder={
                    activePlatform === "youtube"
                      ? "UC_x5XG1OV2P6uZZ5FSM9Ttw"
                      : "109283746592817"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Secret / WABA / Client Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activePlatform === "whatsapp"
                    ? "معرف حساب واتساب للأعمال (WABA ID):"
                    : activePlatform === "tiktok"
                    ? "TikTok Client Key / Secret:"
                    : activePlatform === "youtube"
                    ? "Client Secret (اختياري):"
                    : "App Secret / Client ID (اختياري):"}
                </label>
                <input
                  type="text"
                  value={apiSecretOrWaba}
                  onChange={(e) => setApiSecretOrWaba(e.target.value)}
                  placeholder="اختياري أو WABA ID..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Token Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activePlatform === "whatsapp"
                    ? "رمز وصول مستخدم النظام الدائم (Permanent System User Token):"
                    : activePlatform === "youtube"
                    ? "YouTube Data API Key / OAuth Access Token:"
                    : "رمز الوصول الدائم (Permanent Access Token):"}
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showToken ? "إخفاء الرمز" : "إظهار الرمز"}</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder={
                  activePlatform === "whatsapp"
                    ? "EAAG..."
                    : activePlatform === "youtube"
                    ? "AIzaSy... أو ya29..."
                    : "EAA... أو IGAA..."
                }
                className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500 ${
                  !showToken && apiToken ? "filter blur-[3px] hover:blur-none transition" : ""
                }`}
              />
            </div>

            {/* Test Status Banner */}
            {testStatus && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  testStatus.success
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testStatus.message}</div>
                  {testStatus.details && (
                    <div className="text-[11px] opacity-80 mt-0.5">{testStatus.details}</div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !apiToken.trim()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري اختبار الاتصال بالـ API...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>فحص واختبار الـ API المباشر</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وربط الحساب بالمتجر</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
