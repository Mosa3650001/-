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
  const [selectedAccountForApi, setSelectedAccountForApi] = useState<ConnectedAccount | null>(null);

  // New Brand Form
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandTagline, setNewBrandTagline] = useState("");
  const [newBrandColor, setNewBrandColor] = useState("#6366f1");
  const [newBrandTone, setNewBrandTone] = useState("عصري وشبابي");
  const [newBrandHashtags, setNewBrandHashtags] = useState("#أزياء, #فاشن, #تنسيقات");
  const [newBrandAiRules, setNewBrandAiRules] = useState(
    "الرد بأسلوب مرح وودي، توضيح المقاسات المتاحة، وتقديم رابط الواتساب للطلب الفوري."
  );

  // New Account Connection Modal State
  const [connectPlatform, setConnectPlatform] = useState<SocialPlatform>("instagram");
  const [connectHandle, setConnectHandle] = useState("");
  const [connectName, setConnectName] = useState("");
  const [connectToken, setConnectToken] = useState("");
  const [connectId, setConnectId] = useState("");

  const currentBrand = brands.find((b) => b.id === activeBrandTab) || brands[0];
  const brandAccounts = connectedAccounts.filter((a) => a.brandId === currentBrand?.id);

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const brand = createBrand({
      name: newBrandName,
      slug: newBrandName.toLowerCase().replace(/\s+/g, "-"),
      tagline: newBrandTagline || "متجر أزياء متكامل",
      description: `${newBrandName} - علامة تجارية للأزياء والملابس`,
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

  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand) return;
    connectNewAccount(
      currentBrand.id,
      connectPlatform,
      connectHandle || `@${currentBrand.slug}_${connectPlatform}`,
      connectName || `${currentBrand.name} - ${connectPlatform}`,
      connectToken,
      connectId
    );
    setIsConnectAccountModalOpen(false);
    setConnectHandle("");
    setConnectName("");
    setConnectToken("");
    setConnectId("");
    addToast({ type: "success", title: `تم ربط وتوثيق حساب ${connectPlatform} بنجاح!` });
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
            <span>إدارة المتاجر والعلامات التجارية</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">المتاجر والحسابات ومفاتيح الـ API</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ربط صفحات التواصل (فيسبوك، إنستغرام، تيك توك، واتساب، يوتيوب) بمفاتيح الـ Access Tokens وتوضيح حالة الاتصال الحي.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFbSyncModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2"
          >
            <Facebook className="w-4 h-4" />
            <span>🔗 ربط صفحات فيسبوك السريع (Meta SDK)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedAccountForApi(brandAccounts[0] || connectedAccounts[0] || null);
              setIsApiModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 shadow-xs"
          >
            <Key className="w-4 h-4 text-indigo-500" />
            <span>إعدادات مفاتيح الـ API (Tokens)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddStoreModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة متجر جديد</span>
          </button>
        </div>
      </div>

      {/* Brand Horizontal Tabs Switcher */}
      {brands.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {brands
            .filter((b) => b && b.name)
            .map((b) => {
              const isActive = b.id === activeBrandTab;
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
            قائمتك خالية ونظيفة من أي بيانات تجريبية. يمكنك البدء بإضافة متجرك الأول، أو مزامنة صفحات فيسبوك مباشرة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStoreModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة متجر جديد يدوي</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFbSyncModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-2"
            >
              <Facebook className="w-4 h-4" />
              <span>🔗 ربط ومزامنة صفحات فيسبوك</span>
            </button>
          </div>
        </div>
      )}

      {currentBrand && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brand Profile & AI Persona settings (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
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
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{currentBrand.tagline || "متجر أزياء متكامل"}</p>
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

            {/* Connected Social Accounts Section */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">الحسابات الاجتماعية المتصلة بهذا المتجر</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">حسابات النشر التلقائي ومزامنة التعليقات</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsConnectAccountModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ربط حساب إضافي</span>
                </button>
              </div>

              {brandAccounts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    لا توجد صفحات أو حسابات تواصل مرتبطة بهذا المتجر بعد
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    يمكنك ربط صفحة فيسبوك أو إنستغرام لهذا المتجر للبدء في النشر التلقائي ومزامنة التعليقات.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFbSyncModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>مزامنة صفحات فيسبوك</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConnectAccountModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة حساب يدوياً</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {brandAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-right"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-white shrink-0">
                          {account.platform === "instagram" && <Instagram className="w-5 h-5 text-pink-500" />}
                          {account.platform === "tiktok" && <Video className="w-5 h-5 text-cyan-400" />}
                          {account.platform === "facebook" && <Facebook className="w-5 h-5 text-blue-500" />}
                          {account.platform === "whatsapp" && <MessageCircle className="w-5 h-5 text-emerald-500" />}
                          {account.platform === "youtube" && <PlaySquare className="w-5 h-5 text-red-500" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>{account.accountName}</span>
                            {account.apiToken ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                                API ✓
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono">
                                No Token
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{account.handle}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {account.followersCount.toLocaleString("ar-SA")} متابع
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openApiModalForAccount(account)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 transition"
                            title="ضبط مفاتيح الـ API لهذا الحساب"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleAccountStatus(account.id)}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition ${
                              account.status === "connected"
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {account.status === "connected" ? "✓ متصل" : "معطل"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الحساب (${account.accountName})؟`)) {
                                deleteConnectedAccount(account.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="حذف هذا الحساب نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide & Store Stats (1 Col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>مميزات تعدد المتاجر (Multi-Brand Engine)</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed list-disc list-inside">
                <li>عزل كامل لقواعد كل متجر (الأسعار، اللهجة، الهاشتاقات).</li>
                <li>إمكانية نشر قطعة ملابس واحدة على أكثر من متجر بصياغة مختلفة بنقرة واحدة.</li>
                <li>توزيع الصلاحيات بحيث يرى كل موظف المتجر المخصص له فقط.</li>
                <li>صندوق وارد موحد يفلتر استفسارات كل علامة تجارية على حدة.</li>
              </ul>
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
                  placeholder="مثال: لافندر بوتيك (Lavender Boutique)"
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

      {/* Connect Social Account Modal */}
      {isConnectAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">ربط حساب تواصل اجتماعي جديد</h3>
              <button
                type="button"
                onClick={() => setIsConnectAccountModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectAccount} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">المنصة:</label>
                <select
                  value={connectPlatform}
                  onChange={(e) => setConnectPlatform(e.target.value as SocialPlatform)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="youtube">YouTube Shorts & Channel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">اسم الحساب أو الصفحة:</label>
                <input
                  type="text"
                  value={connectName}
                  onChange={(e) => setConnectName(e.target.value)}
                  placeholder="مثال: حساب المتجر الرسمي"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">معرّف الحساب (Username or Phone):</label>
                <input
                  type="text"
                  value={connectHandle}
                  onChange={(e) => setConnectHandle(e.target.value)}
                  placeholder="مثال: @store_official"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>رمز الوصول (Access Token - اختياري):</span>
                  <span className="text-[10px] text-slate-400 font-normal">يمكن إدخاله لاحقاً</span>
                </label>
                <input
                  type="password"
                  value={connectToken}
                  onChange={(e) => setConnectToken(e.target.value)}
                  placeholder="EAA... / act.v1..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConnectAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/25"
                >
                  تأكيد الربط
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
