import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ShieldAlert,
  Key,
  Facebook,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Store,
  Users,
  Settings,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Info,
  Sliders,
  ShieldCheck,
  Clock,
  Flame,
  ArrowRight,
} from "lucide-react";
import { getStoredFacebookAppId, saveStoredFacebookAppId } from "../utils/facebookSdk";

export const AdminManagementView: React.FC = () => {
  const {
    brands,
    connectedAccounts,
    currentUser,
    setCurrentUser,
    teamMembers,
    cleanAllDemoTokensAndData,
    deduplicateAccounts,
    syncAllFacebookPagesWithFirestore,
    addToast,
  } = useApp();

  // Exchange state
  const [exchangeAppId, setExchangeAppId] = useState<string>(() => getStoredFacebookAppId());
  const [exchangeAppSecret, setExchangeAppSecret] = useState<string>("");
  const [exchangeShortToken, setExchangeShortToken] = useState<string>("");
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [exchangeResult, setExchangeResult] = useState<{
    success: boolean;
    longLivedUserToken?: string;
    expiresInDays?: number;
    pages?: Array<{ id: string; name: string; access_token: string; tokenExpires: string }>;
    error?: string;
  } | null>(null);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<"tokens" | "dedup" | "brands" | "security">("tokens");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    addToast({ type: "success", title: "تم نسخ النص إلى الحافظة بنجاح!" });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleExchangeLongLivedToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exchangeShortToken.trim()) {
      addToast({ type: "warning", title: "يرجى إدخال رمز الوصول القصير (Short-Lived User Token)" });
      return;
    }

    setIsExchanging(true);
    setExchangeResult(null);

    try {
      if (exchangeAppId) {
        saveStoredFacebookAppId(exchangeAppId.trim());
      }

      const res = await fetch("/api/facebook/exchange-long-lived-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortLivedUserToken: exchangeShortToken.trim(),
          appId: exchangeAppId.trim() || undefined,
          appSecret: exchangeAppSecret.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setExchangeResult(data);
        addToast({
          type: "success",
          title: "🎉 تم تحويل التوكن وتمديد صلاحيته بنجاح!",
          description: `تم توليد توكن مستخدم صالح لـ ${data.expiresInDays || 60} يوماً وتوكنات صفحات دائمة لا تنتهي.`,
        });

        // Automatically sync with Firestore
        if (data.longLivedUserToken) {
          await syncAllFacebookPagesWithFirestore(data.longLivedUserToken);
        }
      } else {
        setExchangeResult({ success: false, error: data.error });
        addToast({
          type: "error",
          title: "فشل تمديد التوكن",
          description: data.error || "تأكد من إدخال App ID و App Secret بشكل صحيح من Meta for Developers.",
        });
      }
    } catch (err: any) {
      setExchangeResult({ success: false, error: err.message });
      addToast({ type: "error", title: "خطأ بالاتصال", description: err.message });
    } finally {
      setIsExchanging(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-management-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">لوحة الإدارة والتحكم التقني (Admin Hub)</h1>
          </div>
          <p className="text-sm text-slate-400">
            إدارة توكنات فيسبوك طويلة الأمد (60 يوماً / دائمة)، تصفية الحسابات المكررة، وعزل بيانات المتاجر والعلامات التجارية.
          </p>
        </div>

        {/* Current Admin Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium">{currentUser.name}</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
            {currentUser.roleLabel}
          </span>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab("tokens")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            adminTab === "tokens"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>توكنات فيسبوك الدائمة (60 يوماً / Never Expire)</span>
        </button>

        <button
          onClick={() => setAdminTab("dedup")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            adminTab === "dedup"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>تصفية التكرارات والتنظيف الشامل</span>
        </button>

        <button
          onClick={() => setAdminTab("brands")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            adminTab === "brands"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>عزل البراندات ونبرة الذاكرة ({brands.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("security")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
            adminTab === "security"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>أعضاء الفريق والصلاحيات</span>
        </button>
      </div>

      {/* Sub-tab 1: Facebook Permanent Tokens & Lifespan */}
      {adminTab === "tokens" && (
        <div className="space-y-6">
          {/* Technical Explanation Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                كيف تعمل توكنات فيسبوك ولماذا كانت تنتهي بعد ساعات؟ (التفصيل التقني)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>1. التوكن القصير (Short-Lived)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  يصدر عند تسجيل الدخول العادي بالمتصفح، وصلاحيته تتراوح بين <strong className="text-slate-200">ساعة إلى ساعتين فقط</strong>، وهو ما كان يسبب ظهور خطأ النشر بعد غياب ساعات.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>2. التوكن الممتد (Long-Lived)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  يتم تحويله عبر سيرفر التطبيق باستدعاء <code className="text-indigo-300">fb_exchange_token</code>، وتصبح صلاحيته <strong className="text-slate-200">60 يوماً كاملة</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. توكن الصفحات الدائم (Never Expire)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  عند استخراج توكن الصفحة من التوكن الممتد، يصبح توكن الصفحة <strong className="text-emerald-300">دائماً بدون تاريخ انتهاء</strong>، ويسمح بنشر المنشورات المجدولة في أي وقت دون تسجيل دخول متكرر!
                </p>
              </div>
            </div>
          </div>

          {/* Token Exchange Form */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-lg">أداة تحويل وتمديد التوكن إلى 60 يوماً وتوكنات صفحات دائمة</h3>
            </div>

            <form onSubmit={handleExchangeLongLivedToken} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Meta App ID (معرف التطبيق)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 947470438183017"
                    value={exchangeAppId}
                    onChange={(e) => setExchangeAppId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Meta App Secret (المفتاح السري للتطبيق)
                  </label>
                  <input
                    type="password"
                    placeholder="المفتاح السري من لوحة Meta App Dashboard"
                    value={exchangeAppSecret}
                    onChange={(e) => setExchangeAppSecret(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  User Access Token (رمز وصول المستخدم القصير من Graph API Explorer أو نافذة تسجيل الدخول)
                </label>
                <textarea
                  rows={3}
                  placeholder="EAABw..."
                  value={exchangeShortToken}
                  onChange={(e) => setExchangeShortToken(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>فتح Meta Graph API Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="submit"
                  disabled={isExchanging}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
                >
                  {isExchanging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري المعالجة والتبديل...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>تبديل إلى توكن دائم وحفظ سحابي</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Exchange Results Display */}
            {exchangeResult && (
              <div
                className={`p-5 rounded-xl border mt-4 space-y-3 ${
                  exchangeResult.success
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : "bg-red-950/30 border-red-500/30 text-red-300"
                }`}
              >
                {exchangeResult.success ? (
                  <>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>نجحت العملية! تم الحصول على التوكن الممتد وتوكنات الصفحات الدائمة</span>
                    </div>

                    {exchangeResult.longLivedUserToken && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/20 flex items-center justify-between gap-3">
                        <div className="truncate font-mono text-xs text-slate-300">
                          {exchangeResult.longLivedUserToken}
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(exchangeResult.longLivedUserToken!, "long_token")
                          }
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md flex items-center gap-1 shrink-0"
                        >
                          {copiedKey === "long_token" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>نسخ</span>
                        </button>
                      </div>
                    )}

                    {exchangeResult.pages && exchangeResult.pages.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-slate-200">
                          الصفحات المستخرجة ({exchangeResult.pages.length}):
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {exchangeResult.pages.map((p) => (
                            <div
                              key={p.id}
                              className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-400" />
                                <span className="font-bold text-slate-200">{p.name}</span>
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                  {p.tokenExpires}
                                </span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(p.access_token, `page_${p.id}`)}
                                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                {copiedKey === `page_${p.id}` ? "تم النسخ!" : "نسخ توكن الصفحة"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>فشل التبديل: {exchangeResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Deduplication & Purge */}
      {adminTab === "dedup" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">مركز تنظيف وتصفية الحسابات المكررة (Deduplication)</h3>
                <p className="text-xs text-slate-400">
                  فحص قاعدة بيانات Firestore وحذف أي سجلات مكررة لنفس صفحة الفيسبوك مع الإبقاء على السجل الأحدث والتوكن الفعال.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-200">
                  إجمالي الحسابات المسجلة حالياً: {connectedAccounts.length}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  الصفحات المرتبطة بفيسبوك: {connectedAccounts.filter((a) => a.platform === "facebook").length}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => deduplicateAccounts()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>تصفية وحذف التكرارات الآن (Deduplicate)</span>
                </button>

                <button
                  onClick={() => cleanAllDemoTokensAndData()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-bold rounded-xl border border-red-500/30 transition"
                >
                  <Flame className="w-4 h-4" />
                  <span>تنظيف التوكنات التجريبية بالكامل</span>
                </button>
              </div>
            </div>

            {/* List of currently connected accounts */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                الحسابات والصفحات المسجلة في النظام
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connectedAccounts.map((acc) => {
                  const b = brands.find((brand) => brand.id === acc.brandId);
                  return (
                    <div
                      key={acc.id}
                      className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.avatar || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100"}
                          alt={acc.accountName}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-200">{acc.accountName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {acc.pageId || acc.accountId || acc.id} | المتجر: {b?.name || "عام"}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                        {acc.status === "connected" ? "متصل" : "مفصول"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Multi-Brand & Isolation */}
      {adminTab === "brands" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">عزل العلامات التجارية والمتاجر المستقلة</h3>
                <p className="text-xs text-slate-400">
                  كل براند يمتلك هوية بصرية، ألوان، شعار، نبرة محادثة بالذكاء الاصطناعي، وذاكرة منشورات معزولة بنسبة 100%.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.logo}
                      alt={b.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: b.primaryColor }}
                        />
                        <h4 className="font-bold text-slate-100 text-base">{b.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400">{b.tagline}</p>
                    </div>
                  </div>

                  <div className="text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-slate-400">
                      <span className="font-bold text-slate-300">نبرة المحتوى: </span>
                      {b.toneLabel}
                    </div>
                    <div className="text-slate-400 truncate">
                      <span className="font-bold text-slate-300">الهاشتاقات الأساسية: </span>
                      {b.defaultHashtags?.join(" ")}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-bold text-slate-300">المنصات المرتبطة: </span>
                      {b.connectedPlatforms?.join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Security & Roles */}
      {adminTab === "security" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-lg">صلاحيات الفريق والمستخدمين</h3>
                <p className="text-xs text-slate-400">
                  إدارة أعضاء الفريق والصلاحيات الممنوحة لكل دور (Super Admin, Brand Manager, Editor, Viewer).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-200">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg font-bold">
                      {member.roleLabel}
                    </span>

                    {member.id !== currentUser.id && (
                      <button
                        onClick={() => setCurrentUser(member)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                      >
                        التبديل إلى هذا الحساب
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
