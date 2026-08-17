import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ContentIdea, ContentStage, ContentType, SceneBreakdown, SocialPlatform } from "../types";
import {
  Lightbulb,
  Sparkles,
  Video,
  Layers,
  Image as ImageIcon,
  MessageCircle,
  Clapperboard,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Send,
  Trash2,
  Edit3,
  Calendar,
  Eye,
  Filter,
  Check,
  Flame,
  AlertCircle,
  HelpCircle,
  Film,
  Music,
  Share2,
  Copy,
  Target,
  BarChart3,
  X,
  RefreshCw,
  Zap,
} from "lucide-react";

export const IdeaLabView: React.FC = () => {
  const {
    brands,
    currentBrandId,
    selectedBrand,
    ideas,
    createIdea,
    updateIdea,
    deleteIdea,
    advanceIdeaStage,
    sendIdeaToPostStudio,
    dailyGoals,
    updateDailyGoal,
    posts,
    addToast,
  } = useApp();

  // Active Sub-Tab: 'pipeline' (المسار والمهام) | 'generator' (مولد الأفكار بالذكاء الاصطناعي) | 'planner' (الأهداف اليومية)
  const [activeSubTab, setActiveSubTab] = useState<"pipeline" | "generator" | "planner">("pipeline");

  // Generator form state
  const [genBrandId, setGenBrandId] = useState<string>(selectedBrand ? selectedBrand.id : brands[0]?.id || "brand-bilal-koo");
  const [genContentType, setGenContentType] = useState<ContentType>("reel");
  const [genTheme, setGenTheme] = useState<string>("زيادة المبيعات وعروض التوفير");
  const [genKeyword, setGenKeyword] = useState<string>("قميص كتان صيفي وتنسيقات كاجوال");
  const [genDuration, setGenDuration] = useState<number>(30);
  const [genPlatforms, setGenPlatforms] = useState<SocialPlatform[]>(["tiktok", "instagram"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Omit<ContentIdea, "id" | "createdAt" | "updatedAt">[]>([]);

  // Pipeline Filter state
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"board" | "table">("board");

  // Modal states
  const [selectedIdeaForDetail, setSelectedIdeaForDetail] = useState<ContentIdea | null>(null);
  const [editingIdeaModal, setEditingIdeaModal] = useState<ContentIdea | null>(null);
  const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);

  // New manual idea draft
  const [manualTitle, setManualTitle] = useState("");
  const [manualBrandId, setManualBrandId] = useState(selectedBrand ? selectedBrand.id : brands[0]?.id || "");
  const [manualContentType, setManualContentType] = useState<ContentType>("reel");
  const [manualHook, setManualHook] = useState("");
  const [manualScript, setManualScript] = useState("");
  const [manualCaption, setManualCaption] = useState("");
  const [manualHashtags, setManualHashtags] = useState("#أزياء #عروض #جدة");
  const [manualAssignedTo, setManualAssignedTo] = useState("سارة المهدي (صانعة المحتوى)");
  const [manualPriority, setManualPriority] = useState<"low" | "medium" | "high" | "urgent">("high");

  const STAGES_CONFIG: { id: ContentStage; label: string; step: number; color: string; bg: string; icon: any }[] = [
    { id: "idea", label: "1. فكرة جديدة", step: 1, color: "text-amber-600 dark:text-amber-400 border-amber-500/40", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Lightbulb },
    { id: "scripting", label: "2. كتابة السيناريو", step: 2, color: "text-blue-600 dark:text-blue-400 border-blue-500/40", bg: "bg-blue-50 dark:bg-blue-500/10", icon: Edit3 },
    { id: "shooting", label: "3. تصوير بالمتجر", step: 3, color: "text-purple-600 dark:text-purple-400 border-purple-500/40", bg: "bg-purple-50 dark:bg-purple-500/10", icon: Video },
    { id: "editing", label: "4. المونتاج والقص", step: 4, color: "text-pink-600 dark:text-pink-400 border-pink-500/40", bg: "bg-pink-50 dark:bg-pink-500/10", icon: Clapperboard },
    { id: "ready", label: "5. جاهز للنشر", step: 5, color: "text-emerald-600 dark:text-emerald-400 border-emerald-500/40", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
    { id: "published", label: "6. تم النشر", step: 6, color: "text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700", bg: "bg-slate-100 dark:bg-slate-800/40", icon: Share2 },
  ];

  // Filtering ideas
  const displayedIdeas = ideas.filter((idea) => {
    if (currentBrandId !== "all" && idea.brandId !== currentBrandId) return false;
    if (filterStage !== "all" && idea.stage !== filterStage) return false;
    if (filterType !== "all" && idea.contentType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        idea.title.toLowerCase().includes(q) ||
        idea.hook.toLowerCase().includes(q) ||
        idea.brandName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle AI Idea Generation Call
  const handleGenerateAIIdeas = async () => {
    setIsGenerating(true);
    const targetBrand = brands.find((b) => b.id === genBrandId) || brands[0];

    try {
      const response = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: targetBrand.name,
          brandTone: targetBrand.voiceTone,
          contentType: genContentType,
          themeOrGoal: genTheme,
          keywordOrProduct: genKeyword,
          count: 3,
        }),
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.ideas)) {
        const formatted: Omit<ContentIdea, "id" | "createdAt" | "updatedAt">[] = data.ideas.map((item: any) => ({
          title: item.title,
          brandId: targetBrand.id,
          brandName: targetBrand.name,
          contentType: item.contentType || genContentType,
          targetPlatforms: item.targetPlatforms || genPlatforms,
          stage: "idea" as ContentStage,
          hook: item.hook || "",
          script: item.script || "",
          scenes: item.scenes || [],
          filmingTips: item.filmingTips || "",
          recommendedAudioOrVibe: item.recommendedAudioOrVibe || "",
          captionDraft: item.captionDraft || "",
          hashtags: item.hashtags || [`#${targetBrand.slug}`, "#أزياء", "#عروض"],
          callToAction: item.callToAction || "اطلب الآن عبر الرابط في البايو",
          assignedToUserName: "سارة المهدي (صانعة المحتوى)",
          targetPublishDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          estimatedDurationSeconds: item.estimatedDurationSeconds || genDuration,
          productName: genKeyword,
          priority: item.priority || "high",
          isAiGenerated: true,
        }));

        setGeneratedIdeas(formatted);
        addToast({
          type: "success",
          title: "✨ تم توليد 3 أفكار وسيناريوهات تصوير احترافية!",
          description: `المتجر: ${targetBrand.name}`,
        });
      } else {
        throw new Error(data.error || "Failed to parse ideas");
      }
    } catch (error: any) {
      console.error(error);
      addToast({
        type: "error",
        title: "تعذر توليد الأفكار",
        description: error.message || "يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add generated idea to actual pipeline
  const handleAddToPipeline = (genIdea: Omit<ContentIdea, "id" | "createdAt" | "updatedAt">) => {
    createIdea(genIdea);
    setGeneratedIdeas((prev) => prev.filter((i) => i.title !== genIdea.title));
  };

  // Add all generated ideas to pipeline
  const handleAddAllToPipeline = () => {
    generatedIdeas.forEach((idea) => {
      createIdea(idea);
    });
    setGeneratedIdeas([]);
    setActiveSubTab("pipeline");
  };

  // Submit manual idea
  const handleCreateManualIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const brand = brands.find((b) => b.id === manualBrandId) || brands[0];
    createIdea({
      title: manualTitle,
      brandId: brand.id,
      brandName: brand.name,
      contentType: manualContentType,
      targetPlatforms: ["instagram", "tiktok"],
      stage: "idea",
      hook: manualHook || manualTitle,
      script: manualScript,
      captionDraft: manualCaption || manualScript,
      hashtags: manualHashtags.split(" ").filter(Boolean),
      callToAction: "تواصل معنا عبر الواتساب للطلب والاستفسار 📲",
      assignedToUserName: manualAssignedTo,
      targetPublishDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      priority: manualPriority,
      isAiGenerated: false,
    });

    setIsNewIdeaModalOpen(false);
    setManualTitle("");
    setManualHook("");
    setManualScript("");
    setManualCaption("");
  };

  // Save edits on existing idea
  const handleSaveIdeaEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdeaModal) return;
    updateIdea(editingIdeaModal.id, editingIdeaModal);
    setEditingIdeaModal(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-white to-indigo-50 dark:from-amber-950/40 dark:via-[#0f172a] dark:to-indigo-950/50 border border-amber-200 dark:border-amber-500/20 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-300 dark:border-amber-500/30">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>مختبر الأفكار ومسار الإنتاج الذكي</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                من الفكرة 💡 إلى السيناريو ✍️ ثم التصوير 🎥 والمونتاج ✂️ والنشر 🚀
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              توليد وإدارة أفكار المحتوى وسيناريوهات الفيديوهات
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              اطلب من الذكاء الاصطناعي أفكار ريلز وتريندات ملابس جاهزة بالسيناريو وزوايا الكاميرا، وتابع مراحل تنفيذ كل قطعة حتى تكتمل وتصل لجمهورك.
            </p>
          </div>

          {/* Action Tabs & New Idea button */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsNewIdeaModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>إضافة فكرة يدوياً</span>
            </button>
            <button
              onClick={() => setActiveSubTab("generator")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 ${
                activeSubTab === "generator"
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/25"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
              }`}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>توليد أفكار بالذكاء الاصطناعي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Switcher (مسار الإنتاج | مولد الأفكار بالذكاء الاصطناعي | خطة النشر الأسبوعية) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab("pipeline")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition ${
              activeSubTab === "pipeline"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>جدول ومسار متابعة المهام ({ideas.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("generator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition ${
              activeSubTab === "generator"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>مولد السيناريوهات والأفكار الذكي</span>
            {generatedIdeas.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px]">
                {generatedIdeas.length} مقترحات
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("planner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition ${
              activeSubTab === "planner"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>خطة النشر والأهداف اليومية (Weekly Targets)</span>
          </button>
        </div>

        {/* View mode toggle for Pipeline */}
        {activeSubTab === "pipeline" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode("board")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === "board" ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                لوحة كانبان (Kanban)
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                جدول المهام والمراحل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: AI GENERATOR FORM & SUGGESTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === "generator" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">إعدادات توليد أفكار المحتوى والسيناريو</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">حدد المتجر والمنتج أو المناسبة ليقوم الذكاء الاصطناعي بكتابة سيناريو تصوير احترافي</p>
                </div>
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono border border-indigo-200 dark:border-indigo-500/20 self-start sm:self-auto">
                Gemini 3.7 Flash Creative Director
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Store Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المتجر / المشروع المطلوب:</label>
                <select
                  value={genBrandId}
                  onChange={(e) => setGenBrandId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.connectedPlatforms.length} حسابات)
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نوع وشكل المحتوى:</label>
                <select
                  value={genContentType}
                  onChange={(e) => setGenContentType(e.target.value as ContentType)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="reel">🎥 فيديو قصير / ريلز / تيك توك (Reel/Short)</option>
                  <option value="carousel">📑 منشور شرائح تعليمي / كاروسيل (Carousel)</option>
                  <option value="single_image">🖼️ صورة إعلانية مفردة مع كابشن قوي</option>
                  <option value="story">⚡ ستوري تفاعلي / استطلاع رأي (Story)</option>
                  <option value="whatsapp_broadcast">📲 رسالة برودكاست لمجتمع الواتساب</option>
                </select>
              </div>

              {/* Strategic Goal / Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الهدف الاستراتيجي / الفكرة العامة:</label>
                <select
                  value={genTheme}
                  onChange={(e) => setGenTheme(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="زيادة المبيعات وعروض التوفير">🔥 زيادة المبيعات وعروض التوفير السريعة</option>
                  <option value="تنسيقات دوام ومناسبات فاشن">👔 تنسيقات دوام ومناسبات وحلول فاشن</option>
                  <option value="تحدي تسوق وتريند تيك توك">⚡ تحدي تسوق وتريند تيك توك تفاعلي</option>
                  <option value="مسابقة وسؤال للجمهور واربح معنا">🎁 مسابقة وسؤال للجمهور وجوائز</option>
                  <option value="كواليس المتجر ووصول البضاعة الجديدة">📦 كواليس وصول بضاعة جديدة (Unboxing)</option>
                  <option value="نصائح أخطاء الملابس وتنسيق الألوان">💡 نصائح أخطاء الملابس وتنسيق الألوان</option>
                </select>
              </div>

              {/* Product / Keyword focus */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">القطعة أو المنتج أو الكلمة المفتاحية للتركيز عليها:</label>
                <input
                  type="text"
                  value={genKeyword}
                  onChange={(e) => setGenKeyword(e.target.value)}
                  placeholder="مثال: قميص كتان صيفي بيج، بليزر إيطالي رجالي، أطقم أطفال قطنية، فساتين ناعمة..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Video Duration (if reel) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المدة الزمنية المقترحة للفيديو:</label>
                <div className="flex items-center gap-2">
                  {[15, 30, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setGenDuration(sec)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                        genDuration === sec
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                      }`}
                    >
                      {sec} ثانية
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Generator Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateAIIdeas}
                disabled={isGenerating}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري كتابة السيناريوهات والأفكار عبر الذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-current" />
                    <span>توليد 3 أفكار وسيناريوهات تصوير فوراً</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Ideas Cards Display */}
          {generatedIdeas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span>الأفكار والسيناريوهات المقترحة حديثاً ({generatedIdeas.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">راجع كل سيناريو وقم بإضافته إلى مسار الإنتاج</span>
                </div>

                <button
                  onClick={handleAddAllToPipeline}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة جميع الأفكار إلى مسار الإنتاج</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {generatedIdeas.map((genIdea, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 p-5 flex flex-col justify-between space-y-4 shadow-sm transition group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          <span>{genIdea.contentType === "reel" ? "ريلز / تيك توك" : genIdea.contentType}</span>
                        </span>

                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          ⏱️ ~{genIdea.estimatedDurationSeconds} ثانية
                        </span>
                      </div>

                      {/* Title & Hook */}
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                          {genIdea.title}
                        </h4>
                        <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-amber-800 dark:text-amber-300">
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-0.5">الهوك الافتتاحي (أول 3 ثوانٍ):</span>
                          "{genIdea.hook}"
                        </div>
                      </div>

                      {/* Scenes Timeline Preview */}
                      {genIdea.scenes && genIdea.scenes.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                            تقسيم المشاهد وزوايا الكاميرا ({genIdea.scenes.length} مشاهد):
                          </span>
                          <div className="space-y-1">
                            {genIdea.scenes.slice(0, 3).map((scene, sIdx) => (
                              <div key={sIdx} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 flex items-start gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shrink-0">
                                  {scene.timestamp || `0:0${sIdx * 8}`}
                                </span>
                                <div className="text-[11px] leading-relaxed">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{scene.title}: </span>
                                  <span className="text-slate-600 dark:text-slate-300">{scene.voiceoverOrText}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Filming Tips */}
                      {genIdea.filmingTips && (
                        <div className="text-xs p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-200">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 block text-[10px] mb-0.5">🎥 نصيحة المصور في المعرض:</span>
                          {genIdea.filmingTips}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleAddToPipeline(genIdea)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة لمسار الإنتاج</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: CONTENT PRODUCTION PIPELINE (KANBAN & TABLE) */}
      {/* ========================================================================= */}
      {activeSubTab === "pipeline" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث في الأفكار والسيناريوهات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stage Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">المرحلة:</span>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">جميع المراحل</option>
                  <option value="idea">1. فكرة جديدة</option>
                  <option value="scripting">2. كتابة السيناريو</option>
                  <option value="shooting">3. تصوير بالمعرض</option>
                  <option value="editing">4. المونتاج والقص</option>
                  <option value="ready">5. جاهز للنشر</option>
                  <option value="published">6. تم النشر</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">النوع:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">جميع الصيغ</option>
                  <option value="reel">فيديو ريلز / تيك توك</option>
                  <option value="carousel">كاروسيل شرائح</option>
                  <option value="single_image">صورة مفردة</option>
                </select>
              </div>
            </div>

            {/* Pipeline Metrics Summary */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">
                إجمالي الأفكار: <span className="font-bold text-slate-900 dark:text-white">{ideas.length}</span>
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                قيد العمل: <span className="font-bold">{ideas.filter((i) => i.stage !== "published").length}</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                جاهز ومنشور: <span className="font-bold">{ideas.filter((i) => i.stage === "ready" || i.stage === "published").length}</span>
              </span>
            </div>
          </div>

          {/* KANBAN BOARD VIEW */}
          {viewMode === "board" && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {STAGES_CONFIG.map((stage) => {
                const stageIdeas = displayedIdeas.filter((item) => item.stage === stage.id);
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col h-full min-h-[500px] shadow-sm"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${stage.bg} ${stage.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{stage.label}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono">
                        {stageIdeas.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {stageIdeas.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                          <span>لا توجد مهام</span>
                        </div>
                      ) : (
                        stageIdeas.map((idea) => {
                          const brandObj = brands.find((b) => b.id === idea.brandId);
                          return (
                            <div
                              key={idea.id}
                              className="bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600 p-3 space-y-2.5 transition shadow-xs group"
                            >
                              {/* Brand & Type */}
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded font-bold truncate max-w-[110px]"
                                  style={{
                                    backgroundColor: (brandObj?.primaryColor || "#6366F1") + "25",
                                    color: brandObj?.primaryColor || "#4f46e5",
                                  }}
                                >
                                  {idea.brandName}
                                </span>

                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-medium">
                                  {idea.contentType === "reel" ? "🎥 ريلز" : "📑 منشور"}
                                </span>
                              </div>

                              {/* Title */}
                              <h4
                                onClick={() => setSelectedIdeaForDetail(idea)}
                                className="text-xs font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-300 cursor-pointer line-clamp-2 leading-snug"
                              >
                                {idea.title}
                              </h4>

                              {/* Hook Snippet */}
                              {idea.hook && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                                  "{idea.hook}"
                                </p>
                              )}

                              {/* Assigned & Target Date */}
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                                <span>👤 {idea.assignedToUserName?.split(" ")[0] || "المساعد"}</span>
                                <span>📅 {idea.targetPublishDate || "قريباً"}</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between gap-1 pt-1">
                                <button
                                  onClick={() => setSelectedIdeaForDetail(idea)}
                                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px]"
                                  title="عرض التفاصيل والسيناريو"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setEditingIdeaModal(idea)}
                                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px]"
                                  title="تعديل الفكرة"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {idea.stage !== "published" && (
                                  <button
                                    onClick={() => advanceIdeaStage(idea.id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-[10px] font-bold transition mr-auto border border-indigo-200 dark:border-transparent"
                                    title="نقل للمرحلة التالية"
                                  >
                                    <span>المرحلة التالية</span>
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}

                                {idea.stage === "ready" && (
                                  <button
                                    onClick={() => sendIdeaToPostStudio(idea)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold shadow transition"
                                    title="إرسال إلى استوديو النشر"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>نشر</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABULAR WORKFLOW VIEW */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">عنوان الفكرة والمحتوى</th>
                      <th className="py-3 px-3">المتجر</th>
                      <th className="py-3 px-3">النوع</th>
                      <th className="py-3 px-3">المرحلة الحالية</th>
                      <th className="py-3 px-3">الهوك والسيناريو</th>
                      <th className="py-3 px-3">المسؤول والموعد</th>
                      <th className="py-3 px-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayedIdeas.map((idea) => {
                      const stageConfig = STAGES_CONFIG.find((s) => s.id === idea.stage) || STAGES_CONFIG[0];

                      return (
                        <tr key={idea.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm hover:text-amber-500 cursor-pointer" onClick={() => setSelectedIdeaForDetail(idea)}>
                              {idea.title}
                            </div>
                            {idea.isAiGenerated && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
                                <Sparkles className="w-3 h-3" /> AI سيناريو مولد ذكياً
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{idea.brandName}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                              {idea.contentType}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-xs border ${stageConfig.bg} ${stageConfig.color}`}>
                                {stageConfig.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <p className="truncate text-slate-600 dark:text-slate-300 font-medium">"{idea.hook}"</p>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                            <div>{idea.assignedToUserName}</div>
                            <div className="text-[11px] text-slate-400">{idea.targetPublishDate}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedIdeaForDetail(idea)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                title="عرض السيناريو"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {idea.stage !== "published" && (
                                <button
                                  onClick={() => advanceIdeaStage(idea.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                                >
                                  <span>تم المرحلة</span>
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => sendIdeaToPostStudio(idea)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                                title="إرسال لاستوديو النشر"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>استوديو النشر</span>
                              </button>

                              <button
                                onClick={() => deleteIdea(idea.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: DAILY PUBLISHING GOALS & WEEKLY PLANNER */}
      {/* ========================================================================= */}
      {activeSubTab === "planner" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>الأهداف اليومية وخطة النشر الأسبوعية (Daily Publishing Goals)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  حدد عدد المنشورات ومقاطع الريلز المستهدفة لكل يوم من أيام الأسبوع لضمان نمو الحسابات وأفضل خوارزمية
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-850 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-750">
                <span className="text-slate-500 dark:text-slate-400">إجمالي الأهداف الأسبوعية:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dailyGoals.reduce((sum, g) => sum + g.targetReelsCount, 0)} ريلز
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {dailyGoals.reduce((sum, g) => sum + g.targetPostsCount, 0)} بوستات
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {dailyGoals.reduce((sum, g) => sum + g.targetStoriesCount, 0)} ستوري
                </span>
              </div>
            </div>

            {/* Weekly Days Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
              {dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 hover:border-emerald-500/40 p-4 space-y-3 flex flex-col justify-between transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-750 pb-2">
                      <span className="font-black text-slate-900 dark:text-white text-sm">{goal.dayNameAr}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400 font-mono uppercase">
                        {goal.dayOfWeek.slice(0, 3)}
                      </span>
                    </div>

                    {/* Targets Inputs */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">🎥 ريلز:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={goal.targetReelsCount}
                          onChange={(e) => updateDailyGoal(goal.id, { targetReelsCount: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>

                      <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">📑 بوستات:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={goal.targetPostsCount}
                          onChange={(e) => updateDailyGoal(goal.id, { targetPostsCount: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>

                      <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">⚡ ستوري:</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={goal.targetStoriesCount}
                          onChange={(e) => updateDailyGoal(goal.id, { targetStoriesCount: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-slate-100 dark:bg-slate-700 text-center font-bold text-slate-900 dark:text-white rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    {/* Daily Strategic Note */}
                    <div className="pt-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">الملاحظة والاستراتيجية:</label>
                      <textarea
                        rows={2}
                        value={goal.notes || ""}
                        onChange={(e) => updateDailyGoal(goal.id, { notes: e.target.value })}
                        placeholder="نوع المحتوى المناسب لهذا اليوم..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2 text-[11px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (DETAIL VIEW, EDITING MODAL, MANUAL ADD MODAL) */}
      {/* ========================================================================= */}

      {/* Full Script & Filming Breakdown Detail Modal */}
      {selectedIdeaForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{selectedIdeaForDetail.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>المتجر: {selectedIdeaForDetail.brandName}</span>
                    <span>•</span>
                    <span>الصيغة: {selectedIdeaForDetail.contentType}</span>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      المرحلة: {STAGES_CONFIG.find((s) => s.id === selectedIdeaForDetail.stage)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedIdeaForDetail(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hook & Concept */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200">
              <span className="font-bold text-amber-700 dark:text-amber-400 text-xs block mb-1">💡 الهوك الافتتاحي (Opening Hook):</span>
              <p className="text-sm font-semibold">"{selectedIdeaForDetail.hook}"</p>
            </div>

            {/* Scene-by-Scene Breakdown Timeline */}
            {selectedIdeaForDetail.scenes && selectedIdeaForDetail.scenes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>تفصيل المشاهد وزوايا الكاميرا (Scene by Scene):</span>
                </h4>

                <div className="space-y-2.5">
                  {selectedIdeaForDetail.scenes.map((scene, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                          المشهد {sIdx + 1}: {scene.title}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400">
                          {scene.timestamp || `المشهد ${sIdx + 1}`}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-200">
                        <span className="text-slate-500 dark:text-slate-400">الكلام / الصوت: </span>
                        {scene.voiceoverOrText}
                      </div>
                      <div className="text-xs text-amber-800 dark:text-amber-300/90 font-medium">
                        <span className="text-slate-500 dark:text-slate-400">حركة الكاميرا والإخراج: </span>
                        {scene.visualDirection}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Script */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">السيناريو الكامل (Full Script):</h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {selectedIdeaForDetail.script}
              </div>
            </div>

            {/* Filming Tips & Audio Vibes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedIdeaForDetail.filmingTips && (
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-slate-850 border border-purple-200 dark:border-slate-750 text-xs">
                  <span className="font-bold text-purple-700 dark:text-purple-400 block mb-1">🎥 نصائح التصوير بالمتجر:</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedIdeaForDetail.filmingTips}</p>
                </div>
              )}

              {selectedIdeaForDetail.recommendedAudioOrVibe && (
                <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-slate-850 border border-pink-200 dark:border-slate-750 text-xs">
                  <span className="font-bold text-pink-700 dark:text-pink-400 block mb-1">🎵 الصوت والموسيقى المقترحة:</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedIdeaForDetail.recommendedAudioOrVibe}</p>
                </div>
              )}
            </div>

            {/* Caption & Hashtags Draft */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">مسودة الكابشن والهاشتاقات:</h4>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs space-y-2">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{selectedIdeaForDetail.captionDraft}</p>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-750">
                  {selectedIdeaForDetail.hashtags.map((h, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  deleteIdea(selectedIdeaForDetail.id);
                  setSelectedIdeaForDetail(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الفكرة</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedIdeaForDetail.stage !== "published" && (
                  <button
                    onClick={() => {
                      advanceIdeaStage(selectedIdeaForDetail.id);
                      setSelectedIdeaForDetail(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <span>نقل للمرحلة التالية</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    sendIdeaToPostStudio(selectedIdeaForDetail);
                    setSelectedIdeaForDetail(null);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تجهيز ونشر في الاستوديو</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual New Idea Modal */}
      {isNewIdeaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <span>إضافة فكرة محتوى وسيناريو يدوياً</span>
              </h3>
              <button
                onClick={() => setIsNewIdeaModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualIdea} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">عنوان الفكرة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ريلز استعراض 3 فساتين صيفية بألوان تريند"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">المتجر:</label>
                  <select
                    value={manualBrandId}
                    onChange={(e) => setManualBrandId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">نوع المحتوى:</label>
                  <select
                    value={manualContentType}
                    onChange={(e) => setManualContentType(e.target.value as ContentType)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="reel">🎥 فيديو قصير / ريلز</option>
                    <option value="carousel">📑 كاروسيل شرائح</option>
                    <option value="single_image">🖼️ صورة مفردة</option>
                    <option value="story">⚡ ستوري</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">الهوك الافتتاحي (Opening Hook):</label>
                <input
                  type="text"
                  placeholder="مثال: لا تشتري ملابس صيف قبل ما تشوف هالتنسيق! 🔥"
                  value={manualHook}
                  onChange={(e) => setManualHook(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">السيناريو وتفاصيل التصوير:</label>
                <textarea
                  rows={4}
                  placeholder="المشهد 1: دخول المصور للمعرض...&#10;المشهد 2: تجربة القطعة...&#10;المشهد 3: العرض والدعوة للشراء..."
                  value={manualScript}
                  onChange={(e) => setManualScript(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">نص المنشور (الكابشن):</label>
                <textarea
                  rows={2}
                  placeholder="النص الذي سينشر على إنستغرام وتيك توك..."
                  value={manualCaption}
                  onChange={(e) => setManualCaption(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">المسؤول عن التنفيذ:</label>
                  <input
                    type="text"
                    value={manualAssignedTo}
                    onChange={(e) => setManualAssignedTo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الأولوية:</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة جداً 🔥</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewIdeaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  حفظ وإضافة للمسار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Existing Idea Modal */}
      {editingIdeaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>تعديل الفكرة والسيناريو</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingIdeaModal(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIdeaEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">عنوان الفكرة:</label>
                <input
                  type="text"
                  value={editingIdeaModal.title}
                  onChange={(e) => setEditingIdeaModal({ ...editingIdeaModal, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">مرحلة مسار الإنتاج:</label>
                  <select
                    value={editingIdeaModal.stage}
                    onChange={(e) => setEditingIdeaModal({ ...editingIdeaModal, stage: e.target.value as ContentStage })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {STAGES_CONFIG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">تاريخ النشر المستهدف:</label>
                  <input
                    type="date"
                    value={editingIdeaModal.targetPublishDate || ""}
                    onChange={(e) => setEditingIdeaModal({ ...editingIdeaModal, targetPublishDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الهوك الافتتاحي (أول 3 ثوانٍ):</label>
                <input
                  type="text"
                  value={editingIdeaModal.hook}
                  onChange={(e) => setEditingIdeaModal({ ...editingIdeaModal, hook: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">نص السيناريو والوصف:</label>
                <textarea
                  rows={4}
                  value={editingIdeaModal.script}
                  onChange={(e) => setEditingIdeaModal({ ...editingIdeaModal, script: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingIdeaModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md"
                >
                  حفظ التعديلات ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
