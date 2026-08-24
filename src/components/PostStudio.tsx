import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  Upload,
  Layers,
  Image as ImageIcon,
  Send,
  Save,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  Tag,
  MessageCircle,
  RefreshCw,
  Smartphone,
  Palette,
  Plus,
  Download,
  AlertCircle,
  Share2,
  Play,
  Facebook,
  Hash,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SocialPlatform, PostFormat, CatalogProduct, PostStatus } from "../types";
import { FacebookPagesSyncModal } from "./FacebookPagesSyncModal";

// Common clothing color presets
const COLOR_PRESETS = [
  { name: "أسود", hex: "#0f172a" },
  { name: "أبيض", hex: "#ffffff" },
  { name: "كحلي", hex: "#1e3a8a" },
  { name: "بيج", hex: "#d4b996" },
  { name: "زيتي", hex: "#365314" },
  { name: "جملي", hex: "#b45309" },
  { name: "عنابي", hex: "#881337" },
  { name: "رمادي", hex: "#64748b" },
  { name: "وردي", hex: "#f472b6" },
  { name: "سماوي", hex: "#38bdf8" },
];

export const PostStudio: React.FC = () => {
  const {
    brands,
    currentBrandId,
    currentUser,
    templates,
    products,
    connectedAccounts,
    createPost,
    updatePost,
    editingPost,
    setEditingPost,
    addToast,
    setActiveTab,
    importedIdeaForStudio,
    setImportedIdeaForStudio,
  } = useApp();

  // Multi-brand selection
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(() => {
    if (editingPost) return editingPost.targetBrandIds || [editingPost.brandId];
    if (importedIdeaForStudio && importedIdeaForStudio.brandId) return [importedIdeaForStudio.brandId];
    if (currentBrandId !== "all") return [currentBrandId];
    return brands.map((b) => b.id);
  });

  // Target platforms
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>(() => {
    if (editingPost) return editingPost.targetPlatforms || ["instagram", "tiktok", "whatsapp", "facebook"];
    if (importedIdeaForStudio && importedIdeaForStudio.targetPlatforms?.length) return importedIdeaForStudio.targetPlatforms;
    return ["instagram", "tiktok", "whatsapp", "facebook"];
  });

  // Content formatting
  const [format, setFormat] = useState<PostFormat>("feed");

  // Product & Media State
  const [productTitle, setProductTitle] = useState<string>(() => {
    if (editingPost) return editingPost.title;
    if (importedIdeaForStudio) return importedIdeaForStudio.title;
    return "طقم صيفي لينن إيطالي فاخر";
  });

  const [productPrice, setProductPrice] = useState<number | string>(() => {
    if (editingPost) return editingPost.productPrice || 185;
    if (importedIdeaForStudio?.productPrice) return importedIdeaForStudio.productPrice;
    return 185;
  });

  const [productDiscount, setProductDiscount] = useState<number | string>(() => {
    if (editingPost) return editingPost.productDiscount || 20;
    if (importedIdeaForStudio?.productDiscount) return importedIdeaForStudio.productDiscount;
    return 20;
  });

  const [productCategory, setProductCategory] = useState<string>(() => {
    if (editingPost) return editingPost.productCategory || "أزياء رجالية";
    return "أزياء عصرية";
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    if (editingPost && editingPost.productSizes) return editingPost.productSizes;
    return ["M", "L", "XL", "2XL"];
  });

  // Available Colors Feature
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: "أسود", hex: "#0f172a" },
    { name: "بيج", hex: "#d4b996" },
    { name: "كحلي", hex: "#1e3a8a" },
  ]);
  const [customColorHex, setCustomColorHex] = useState<string>("#e11d48");
  const [customColorName, setCustomColorName] = useState<string>("");

  const [selectedImage, setSelectedImage] = useState<string>(() => {
    if (editingPost && editingPost.mediaUrls?.[0]) return editingPost.mediaUrls[0];
    if (importedIdeaForStudio?.productImage) return importedIdeaForStudio.productImage;
    return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80";
  });

  const [mediaType, setMediaType] = useState<"image" | "video">(() => {
    if (editingPost?.mediaType) return editingPost.mediaType;
    const initialUrl = editingPost?.mediaUrls?.[0] || importedIdeaForStudio?.productImage || "";
    if (initialUrl.startsWith("data:video/") || initialUrl.endsWith(".mp4") || initialUrl.endsWith(".mov")) {
      return "video";
    }
    return "image";
  });

  const [mediaFileName, setMediaFileName] = useState<string>("");
  const [newHashtagInput, setNewHashtagInput] = useState<string>("");

  // Helper to clean and format Arabic and Latin hashtags
  const cleanHashtagsList = (tags: string[]): string[] => {
    return (tags || [])
      .map((t) => {
        if (typeof t !== "string") return "";
        let clean = t.trim().replace(/^#+/, "").replace(/[,،\.!؟;:|\/]/g, "").trim();
        clean = clean.replace(/\s+/g, "_");
        return clean ? `#${clean}` : "";
      })
      .filter(Boolean);
  };

  // Visual Template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    if (editingPost && editingPost.templateId) return editingPost.templateId;
    return templates[0]?.id || "tpl-new-arrival";
  });

  // Custom AI instructions
  const [customInstructions, setCustomInstructions] = useState<string>("");

  // Platform tab preview
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<SocialPlatform>("instagram");

  // Platform-specific content
  const [platformContents, setPlatformContents] = useState<Record<string, { caption: string; hook?: string; hashtags?: string[]; callToAction?: string }>>(() => {
    if (editingPost?.contentPerPlatform) {
      const init: any = {};
      Object.entries(editingPost.contentPerPlatform).forEach(([key, val]: [string, any]) => {
        if (val) {
          init[key] = {
            caption: val.caption,
            hook: val.hook || "",
            hashtags: val.hashtags || [],
            callToAction: val.callToAction || "",
          };
        }
      });
      return init;
    }
    return {
      instagram: {
        hook: "أناقتك في الصيف تبدأ من خامات الكتان الطبيعي 💫",
        caption: `وصل حديثاً في جميع الفروع! قميص الكتان الإيطالي المميز بـ ${productPrice} ريال فقط 🔥\n\nخامة باردة ومريحة للدوام والمناسبات.\n🎨 الألوان المتوفرة: أسود، بيج، كحلي\n📏 المقاسات: ${selectedSizes.join(", ")}\n\n📍 اطلب الآن عبر الخاص أو شرفنا بزيارة الفرع.`,
        hashtags: ["#أزياء", "#فاشن", "#جديد_الموسم", "#تنسيقات_ملابس", "#عروض_خاصة"],
        callToAction: "راسلنا على الخاص للطلب الفوري 📩",
      },
      tiktok: {
        hook: "شوفوا كيف هذه القطعة تغيّر اللوك بالكامل! 😍✨",
        caption: `إطلالة الموسم وصلت! قميص كتان صيفي فاخر ومريح جداً 👔\nالسعر: ${productPrice} ريال فقط! الحق مقاسك ولونك المفضل قبل نفاذ الكمية 👇`,
        hashtags: ["#fyp", "#تريند_الملابس", "#تنسيقات", "#كشخة", "#explore"],
        callToAction: "الرابط في البايو للطلب السريع والتوصيل لباب بيتك 🚚",
      },
      whatsapp: {
        hook: "✨ جديد وحصري لأعضاء مجتمعنا المميزين!",
        caption: `السلام عليكم ورحمة الله 🌟\n\nوصلتنا الآن الدفعة الجديدة من: *${productTitle}* 🛍️\n\n🏷️ السعر الخاص: ${productPrice} ريال فقط!\n🎨 الألوان: أسود، بيج، كحلي\n📏 المقاسات: ${selectedSizes.join(", ")}\n\n⚠️ الكمية محدودة جداً! للطلب الفوري يرجى الرد على هذه الرسالة.`,
        hashtags: ["#عروض_خاصة", "#تسوق_اونلاين"],
        callToAction: "رد على الرسالة لحجز مقاسك فوراً 💬",
      },
      facebook: {
        hook: "عرض التوفير والأناقة لا يفوتكم اليوم! 🏷️",
        caption: `جديدنا المميز: ${productTitle}.\n\nخامات عالية الجودة وتصاميم تواكب الموضة بأسعار في متناول الجميع.\nالسعر: ${productPrice} ريال فقط مع خصم ${productDiscount}% لفترة محدودة.\n🎨 متوفر بعدة ألوان ومقاسات متنوعة.\n\nنوفر التوصيل السريع لجميع المناطق والدفع عند الاستلام.`,
        hashtags: ["#عروض_الملابس", "#تخفيضات", "#ملابس_عصرية"],
        callToAction: "علّق بـ (تم) وسنرسل لك تفاصيل المقاسات والرابط 💬",
      },
    };
  });

  // Scheduling State
  const [publishMode, setPublishMode] = useState<"instant" | "schedule" | "ai_smart">("schedule");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 30, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });

  // Loading States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSuggestingTime, setIsSuggestingTime] = useState(false);
  const [isFbSyncModalOpen, setIsFbSyncModalOpen] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const primaryBrand = brands.find((b) => b.id === selectedBrandIds[0]) || brands[0];

  // Toggle Brand Selection
  const toggleBrand = (brandId: string) => {
    if (selectedBrandIds.includes(brandId)) {
      if (selectedBrandIds.length === 1) {
        addToast({ type: "warning", title: "يجب تحديد متجر واحد على الأقل للنشر" });
        return;
      }
      setSelectedBrandIds(selectedBrandIds.filter((id) => id !== brandId));
    } else {
      setSelectedBrandIds([...selectedBrandIds, brandId]);
    }
  };

  // Toggle Color
  const toggleColorPreset = (preset: { name: string; hex: string }) => {
    const exists = selectedColors.some((c) => c.hex.toLowerCase() === preset.hex.toLowerCase());
    if (exists) {
      if (selectedColors.length === 1) {
        addToast({ type: "warning", title: "يجب إبقاء لون واحد على الأقل متوفراً" });
        return;
      }
      setSelectedColors(selectedColors.filter((c) => c.hex.toLowerCase() !== preset.hex.toLowerCase()));
    } else {
      setSelectedColors([...selectedColors, preset]);
    }
  };

  const addCustomColor = () => {
    const name = customColorName.trim() || `لون مخصص`;
    const exists = selectedColors.some((c) => c.hex.toLowerCase() === customColorHex.toLowerCase());
    if (!exists) {
      setSelectedColors([...selectedColors, { name, hex: customColorHex }]);
      setCustomColorName("");
      addToast({ type: "success", title: `تمت إضافة لون جديد: ${name}` });
    }
  };

  // Select a preset catalog item
  const handleSelectCatalogItem = (item: CatalogProduct) => {
    setProductTitle(item.title);
    setProductCategory(item.categoryAr);
    setProductPrice(item.suggestedPrice);
    setProductDiscount(item.discountPercentage || 25);
    setSelectedSizes(item.sizes);
    setSelectedImage(item.image);
    addToast({
      type: "info",
      title: `تم اختيار: ${item.title}`,
      description: "تم تطبيق بيانات القطعة وتحديث المعاينة الحية فوراً.",
    });
  };

  // Call Server-Side Gemini API for Multi-Brand Copywriting
  const handleGenerateAiCopy = async () => {
    setIsGeneratingAi(true);
    try {
      // Use primary store name or individual brand to prevent awkward "Store 1 and Store 2" combined headers
      const brandNameForAi = primaryBrand.name;
      const colorNames = selectedColors.map((c) => c.name).join("، ");

      const res = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandNameForAi,
          brandTone: primaryBrand.toneLabel,
          brandKeywords: primaryBrand.defaultHashtags.join(" "),
          productTitle,
          productCategory,
          productPrice,
          productDiscount,
          productSizes: selectedSizes,
          targetPlatforms,
          customInstructions: `${customInstructions}. الألوان المتوفرة: ${colorNames}. اكتب المحتوى بأسلوب راقٍ جذاب مع هاشتاجات منظمة ونظيفة بدون رموز مكررة.`,
          format,
          imageDescription: `${productTitle} - ألوان ${colorNames} - فئة ${productCategory}`,
        }),
      });

      const data = await res.json();

      if (data.success && data.captions) {
        const merged: any = { ...platformContents };
        Object.entries(data.captions).forEach(([plat, content]: [string, any]) => {
          if (content && content.caption) {
            let captionText = content.caption;
            if (!captionText.includes("الألوان") && colorNames) {
              captionText += `\n🎨 الألوان المتوفرة: ${colorNames}`;
            }
            const cleanTags = cleanHashtagsList(content.hashtags || []);
            merged[plat] = {
              caption: captionText,
              hook: content.hook || "",
              hashtags: cleanTags.length > 0 ? cleanTags : ["#أزياء", "#عروض_خاصة", "#تسوق_اونلاين"],
              callToAction: content.callToAction || "",
            };
          }
        });
        setPlatformContents(merged);

        addToast({
          type: "success",
          title: "✨ تم توليد المحتوى الذكي بنجاح!",
          description: `تمت صياغة نصوص احترافية لـ ${targetPlatforms.length} منصات وتضمين الألوان والأسعار.`,
        });
      } else {
        throw new Error(data.error || "خطأ أثناء المعالجة");
      }
    } catch (err: any) {
      console.warn("AI Generation fallback executed:", err);
      // Fallback local update
      const colorNames = selectedColors.map((c) => c.name).join("، ");
      setPlatformContents((prev) => ({
        ...prev,
        instagram: {
          hook: `إطلالة الموسم وصلت من ${primaryBrand.name} 💫`,
          caption: `وصل حديثاً: ${productTitle}\n\nالسعر: ${productPrice} ريال فقط 🔥\n🎨 الألوان: ${colorNames}\n📏 المقاسات: ${selectedSizes.join(", ")}\n\nاطلب الآن عبر الخاص.`,
          hashtags: ["#أزياء", "#تنسيقات", "#فاشن", "#عروض_خاصة"],
          callToAction: "راسلنا على الخاص للطلب الفوري 📩",
        },
      }));
      addToast({
        type: "success",
        title: "✨ تم توليد المحتوى التسويقي بنجاح!",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Smart AI Best Time Calculation
  const handleSmartScheduleTime = async () => {
    setIsSuggestingTime(true);
    try {
      const res = await fetch("/api/ai/suggest-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandCategory: productCategory,
          platforms: targetPlatforms,
        }),
      });
      const data = await res.json();
      const optimal = new Date();
      optimal.setDate(optimal.getDate() + 1);
      optimal.setHours(20, 15, 0, 0); // 8:15 PM peak retail time
      setScheduledDateTime(optimal.toISOString().slice(0, 16));
      setPublishMode("schedule");

      addToast({
        type: "info",
        title: "⚡ تم ضبط وقت النشر المثالي",
        description: "الساعة 8:15 مساءً (أعلى وقت تفاعل لمتسوقي الأزياء).",
      });
    } catch (e) {
      const optimal = new Date();
      optimal.setDate(optimal.getDate() + 1);
      optimal.setHours(20, 0, 0, 0);
      setScheduledDateTime(optimal.toISOString().slice(0, 16));
    } finally {
      setIsSuggestingTime(false);
    }
  };

  // Submit and Schedule / Publish Post
  const handleSubmitPost = async (asDraft = false) => {
    if (!productTitle.trim()) {
      addToast({ type: "error", title: "يرجى كتابة عنوان أو اسم القطعة" });
      return;
    }

    if (selectedBrandIds.length === 0) {
      addToast({ type: "warning", title: "يرجى تحديد متجر واحد على الأقل" });
      return;
    }

    const contentPerPlatform: any = {};
    targetPlatforms.forEach((p) => {
      const c = platformContents[p] || platformContents.instagram;
      const cleanTags = cleanHashtagsList(c.hashtags || []);
      contentPerPlatform[p] = {
        format,
        caption: c.caption,
        hook: c.hook,
        hashtags: cleanTags.length > 0 ? cleanTags : ["#أزياء", "#عروض_خاصة"],
        callToAction: c.callToAction,
        mediaUrl: selectedImage,
        mediaType,
      };
    });

    const status: PostStatus = asDraft ? "draft" : publishMode === "instant" ? "published" : "scheduled";

    // If instant publish and targeting Facebook, check if connected accounts have live tokens
    if (!asDraft && (publishMode === "instant" || publishMode === "schedule") && targetPlatforms.includes("facebook")) {
      let fbAccounts = connectedAccounts.filter(
        (acc) =>
          acc.platform === "facebook" &&
          (selectedBrandIds.includes(acc.brandId) || ((acc as any).connected_store_id && selectedBrandIds.includes((acc as any).connected_store_id))) &&
          acc.apiToken &&
          acc.apiToken.length > 15 &&
          (acc.pageId || acc.accountId)
      );

      // Fallback 1: Lookup ANY connected Facebook account with a valid token
      if (fbAccounts.length === 0) {
        fbAccounts = connectedAccounts.filter(
          (acc) =>
            acc.platform === "facebook" &&
            acc.apiToken &&
            acc.apiToken.length > 15 &&
            (acc.pageId || acc.accountId)
        );
      }

      // Fallback 2: lookup from local cached pages if not in state yet
      if (fbAccounts.length === 0) {
        try {
          const storedPages = localStorage.getItem("smartpost_facebook_pages");
          if (storedPages) {
            const parsedPages = JSON.parse(storedPages);
            if (Array.isArray(parsedPages) && parsedPages.length > 0) {
              const validStoragePages = parsedPages.filter((p: any) => p.access_token || p.apiToken);
              if (validStoragePages.length > 0) {
                fbAccounts = validStoragePages.map((p: any) => ({
                  id: `fb_${p.id}`,
                  brandId: p.connected_store_id || selectedBrandIds[0],
                  platform: "facebook" as const,
                  accountName: p.name || p.accountName || "صفحة فيسبوك",
                  handle: `@${(p.name || "").replace(/\s+/g, "_")}`,
                  avatar: p.picture?.data?.url || p.avatar || "",
                  followersCount: p.fan_count || 1000,
                  status: "connected" as const,
                  apiToken: p.access_token || p.apiToken,
                  pageId: p.id || p.pageId,
                  accountId: p.id || p.accountId,
                  canPublish: true,
                  canReadComments: true,
                  canDirectMessage: true,
                  lastSyncedAt: new Date().toISOString(),
                }));
              }
            }
          }
        } catch {
          // safe fallback
        }
      }

      if (publishMode === "instant" && fbAccounts.length > 0) {
        const fbContent = contentPerPlatform.facebook || platformContents.facebook;
        const cleanTags = cleanHashtagsList(fbContent.hashtags || []);
        const fullMessage = `${fbContent.hook ? fbContent.hook + "\n\n" : ""}${fbContent.caption}\n\n${cleanTags.join(" ")}\n\n${fbContent.callToAction || ""}`;

        for (const fbAccount of fbAccounts) {
          try {
            const fbRes = await fetch("/api/facebook/publish-post", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pageId: fbAccount.pageId || fbAccount.accountId,
                pageAccessToken: fbAccount.apiToken,
                message: fullMessage.trim(),
                imageUrl: selectedImage,
                mediaUrl: selectedImage,
                mediaType,
              }),
            });
            const fbData = await fbRes.json();

            if (fbData.success) {
              addToast({
                type: "success",
                title: `🎉 تم النشر المباشر بنجاح على صفحة "${fbAccount.accountName}"!`,
                description: `معرف المنشور: ${fbData.postId}`,
              });
            } else {
              addToast({
                type: "warning",
                title: `تنبيه أثناء النشر على صفحة ${fbAccount.accountName}`,
                description: fbData.error || "يرجى التحقق من صلاحيات التوكن",
              });
            }
          } catch (e: any) {
            console.error("Facebook live publish error:", e);
          }
        }
      } else if (publishMode === "instant" && fbAccounts.length === 0) {
        addToast({
          type: "info",
          title: "تنبيه ربط فيسبوك",
          description: "تم حفظ المنشور؛ ولتفعيل النشر المباشر لفيسبوك اضغط زر 'ربط وتجربة صفحات فيسبوك' بالأعلى.",
        });
      }
    }

    const postPayload = {
      title: productTitle,
      brandId: selectedBrandIds[0],
      targetBrandIds: selectedBrandIds,
      targetPlatforms,
      contentPerPlatform,
      mediaUrls: [selectedImage],
      mediaType,
      templateId: selectedTemplateId,
      productPrice: Number(productPrice) || 0,
      productDiscount: Number(productDiscount) || 0,
      productSizes: selectedSizes,
      productCategory,
      badgeText: selectedTemplate.badgeText,
      status,
      scheduledAt: publishMode === "instant" ? new Date().toISOString() : new Date(scheduledDateTime).toISOString(),
      publishedAt: publishMode === "instant" ? new Date().toISOString() : undefined,
      createdBy: currentUser?.id || "usr-1",
      createdByName: currentUser?.name || "المدير العام",
      isAiGenerated: true,
    };

    if (editingPost && editingPost.id) {
      updatePost(editingPost.id, postPayload);
      addToast({
        type: "success",
        title: "✅ تم حفظ تعديلات المنشور المجدول بنجاح!",
        description: `الموعد: ${new Date(postPayload.scheduledAt).toLocaleString("ar-SA")}`,
      });
    } else {
      createPost(postPayload);
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (editingPost) setEditingPost(null);
    if (importedIdeaForStudio) setImportedIdeaForStudio(null);

    setActiveTab(publishMode === "schedule" ? "calendar" : "dashboard");
  };

  const currentContent = platformContents[activePreviewPlatform] || platformContents.instagram;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>استوديو القوالب وتوليد المحتوى الذكي</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">إنشاء وتصميم وجدولة المنشورات</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            اختر القطعة والقالب والألوان المتوفرة، وسيتولى الذكاء الاصطناعي صياغة النصوص والجدولة لكل متجر.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFbSyncModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>ربط وتجربة صفحات فيسبوك</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitPost(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ كمسودة</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitPost(false)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition flex items-center gap-2 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{publishMode === "instant" ? "🚀 نشر فوري الآن" : "📅 اعتماد وجدولة الحملة"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Target Brands Multi-Select */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. حدد المتاجر المستهدفة بالنشر:</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {selectedBrandIds.length} من {brands.length} متاجر
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {brands.map((brand) => {
                const isChecked = selectedBrandIds.includes(brand.id);
                return (
                  <div
                    key={brand.id}
                    onClick={() => toggleBrand(brand.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
                      isChecked
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{brand.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{brand.toneLabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1.5 Target Platforms Selector & Live Facebook Status Banner */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>المنصات المستهدفة بالنشر:</span>
              </label>
              <button
                type="button"
                onClick={() => setIsFbSyncModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>إدارة صفحات فيسبوك</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "facebook", label: "فيسبوك (Facebook)", icon: Facebook, color: "#1877F2" },
                { id: "instagram", label: "إنستغرام (Instagram)", icon: Sparkles, color: "#E4405F" },
                { id: "tiktok", label: "تيك توك (TikTok)", icon: Play, color: "#000000" },
                { id: "whatsapp", label: "واتساب (WhatsApp)", icon: MessageCircle, color: "#25D366" },
              ].map((plat) => {
                const isSelected = targetPlatforms.includes(plat.id as SocialPlatform);
                const PlatIcon = plat.icon;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (targetPlatforms.length === 1) {
                          addToast({ type: "warning", title: "يجب اختيار منصة واحدة على الأقل" });
                          return;
                        }
                        setTargetPlatforms(targetPlatforms.filter((p) => p !== plat.id));
                      } else {
                        setTargetPlatforms([...targetPlatforms, plat.id as SocialPlatform]);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-right transition flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold shadow-xs text-slate-900 dark:text-white"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PlatIcon className="w-4 h-4" style={{ color: isSelected ? plat.color : undefined }} />
                      <span className="text-xs">{plat.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            {targetPlatforms.includes("facebook") && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>جاهز للنشر الحقيقي على Facebook Graph API</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      سيتم إرسال المنشور بالصورة والنص مباشرة إلى صفحتك وتوليد معرف المنشور الفوري.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPublishMode("instant");
                      handleSubmitPost(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center gap-1 active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    <span>نشر فوري لفيسبوك 🚀</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFbSyncModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                  >
                    اختبار الصفحة
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Clothes & Media Selection */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2. صورة وتفاصيل القطعة:</span>
              </label>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">تطبيق القوالب التلقائي ✨</span>
            </div>

            {/* Quick Catalog Bar */}
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 block">اختيار سريع من كتالوج الملابس الجاهزة:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {products.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectCatalogItem(item)}
                    className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition shrink-0 text-right ${
                      selectedImage === item.image
                        ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-slate-900 dark:text-white font-bold shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="text-right">
                      <div className="text-xs font-semibold line-clamp-1">{item.title}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">{item.suggestedPrice} ريال</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Image Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">اسم / عنوان القطعة:</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="مثال: فستان سهرة شيفون مطرز..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ملف الوسائط (صورة 📸 أو فيديو 🎬):
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMediaType("image")}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        mediaType === "image"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      صورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType("video")}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        mediaType === "video"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      فيديو / ريلز
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedImage.startsWith("data:") ? `ملف مرفوع محلياً (${mediaType === "video" ? "🎬 فيديو" : "📸 صورة"})` : selectedImage}
                    onChange={(e) => {
                      setSelectedImage(e.target.value);
                      if (e.target.value.includes(".mp4") || e.target.value.includes(".mov")) {
                        setMediaType("video");
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="رابط مباشر https:// أو ارفع من جهازك..."
                  />
                  <label
                    className={`px-3.5 py-2.5 rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 transition font-bold text-xs ${
                      mediaType === "video"
                        ? "bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-300"
                        : "bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300"
                    }`}
                    title="ارفع صورة أو مقطع فيديو من جهازك"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{mediaType === "video" ? "رفع فيديو" : "رفع صورة"}</span>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/quicktime,video/webm,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const isVideoFile =
                            file.type.startsWith("video/") ||
                            file.name.toLowerCase().endsWith(".mp4") ||
                            file.name.toLowerCase().endsWith(".mov") ||
                            file.name.toLowerCase().endsWith(".webm");
                          
                          setMediaType(isVideoFile ? "video" : "image");
                          setMediaFileName(file.name);

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setSelectedImage(event.target.result as string);
                              addToast({
                                type: "success",
                                title: isVideoFile ? "🎬 تم رفع مقطع الفيديو بنجاح!" : "📸 تم رفع صورة القطعة بنجاح!",
                                description: `الملف: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Price, Discount & Sizes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">السعر (ريال):</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">نسبة الخصم (%):</label>
                <input
                  type="number"
                  value={productDiscount}
                  onChange={(e) => setProductDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold text-rose-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">الفئة:</label>
                <input
                  type="text"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">المقاسات المتاحة:</label>
                <div className="flex items-center gap-1 flex-wrap">
                  {["S", "M", "L", "XL", "2XL", "3XL"].map((sz) => {
                    const hasSize = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          if (hasSize) {
                            setSelectedSizes(selectedSizes.filter((s) => s !== sz));
                          } else {
                            setSelectedSizes([...selectedSizes, sz]);
                          }
                        }}
                        className={`text-[10px] px-2 py-1 rounded-md font-mono font-bold transition ${
                          hasSize
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* NEW FEATURE: Available Colors with Swatches & Color Picker */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  <span>الألوان المتوفرة للقطعة (Color Swatches):</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedColors.map((c) => c.name).join("، ")}
                </span>
              </div>

              {/* Color Preset Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColors.some((c) => c.hex.toLowerCase() === preset.hex.toLowerCase());
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => toggleColorPreset(preset)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}

                {/* Custom Color Picker Tool */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent"
                    title="اختر أي لون مخصص"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="اسم اللون (مثل: زيتي مطفي)"
                    className="w-28 px-2 py-1 text-[11px] bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-0.5"
                    title="إضافة اللون"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Visual Branding Templates Picker (Including Weekend Special) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>3. اختر قالب وتصميم البانر التلقائي:</span>
              </label>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                {selectedTemplate.nameAr}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs px-1"
                      style={{ backgroundColor: tpl.accentColor }}
                    >
                      {tpl.badgeText.slice(0, 16)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{tpl.nameAr}</span>
                  </button>
                );
              })}
            </div>

            {/* Template explanation note */}
            {selectedTemplateId === "tpl-friday-offer" && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  🔥 <strong>عرض الويكند الخاص:</strong> يضيف شارة عطلة نهاية الأسبوع (الخميس والجمعة) ويفعل خصم الويكند الحصري تلقائياً على المنشور والواتساب!
                </span>
              </div>
            )}
          </div>

          {/* 4. AI Multi-Brand Copywriting Generator */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>4. كاتب المحتوى بالذكاء الاصطناعي (Gemini 3.7 Flash)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  يولد نصوصاً مخصصة لكل متجر ولكل منصة بأسلوب تسويقي جذاب.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiCopy}
                disabled={isGeneratingAi}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الكتابة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ توليد المحتوى لجميع المنصات</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Extra Instructions */}
            <div>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="تعليمات إضافية اختيارية (مثال: ركز على عرض التوصيل السريع والدفع عند الاستلام)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Platform Text Editors (Tabs for editing) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {targetPlatforms.map((plat) => {
                  const isActive = activePreviewPlatform === plat;
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setActivePreviewPlatform(plat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span>{plat === "instagram" ? "إنستغرام" : plat === "tiktok" ? "تيك توك / ريلز" : plat === "whatsapp" ? "مجتمع واتساب" : "فيسبوك"}</span>
                    </button>
                  );
                })}
              </div>

              {/* Editable Text Area for current platform */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    النص والهاشتاجات المخصصة لمنصة ({activePreviewPlatform === "instagram" ? "إنستغرام" : activePreviewPlatform === "tiktok" ? "تيك توك" : activePreviewPlatform === "whatsapp" ? "واتساب" : "فيسبوك"}):
                  </span>
                  <span className="font-mono">{currentContent.caption?.length || 0} حرف</span>
                </div>

                {/* Opening Hook */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    السطر الافتتاحي الجذاب (Hook):
                  </label>
                  <input
                    type="text"
                    value={currentContent.hook || ""}
                    onChange={(e) => {
                      setPlatformContents({
                        ...platformContents,
                        [activePreviewPlatform]: {
                          ...currentContent,
                          hook: e.target.value,
                        },
                      });
                    }}
                    placeholder="مثال: أناقتك في الصيف تبدأ من هنا ✨"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Caption Body */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    نص المنشور الأساسي:
                  </label>
                  <textarea
                    rows={4}
                    value={currentContent.caption || ""}
                    onChange={(e) => {
                      setPlatformContents({
                        ...platformContents,
                        [activePreviewPlatform]: {
                          ...currentContent,
                          caption: e.target.value,
                        },
                      });
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Hashtags Management System */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>الهاشتاجات المنظمة ({currentContent.hashtags?.length || 0}):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cleaned = cleanHashtagsList(currentContent.hashtags || []);
                        setPlatformContents({
                          ...platformContents,
                          [activePreviewPlatform]: {
                            ...currentContent,
                            hashtags: cleaned,
                          },
                        });
                        addToast({ type: "success", title: "✨ تم تنظيف وترتيب الهاشتاجات بنجاح" });
                      }}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      ✨ إعادة تنسيق الهاشتاجات
                    </button>
                  </div>

                  {/* Hashtags Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[30px] p-1.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800">
                    {(currentContent.hashtags && currentContent.hashtags.length > 0) ? (
                      currentContent.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold"
                        >
                          <span>{tag.startsWith("#") ? tag : `#${tag}`}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentContent.hashtags?.filter((_, i) => i !== idx) || [];
                              setPlatformContents({
                                ...platformContents,
                                [activePreviewPlatform]: {
                                  ...currentContent,
                                  hashtags: updated,
                                },
                              });
                            }}
                            className="text-slate-400 hover:text-rose-500 font-bold text-sm leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 p-1">لا توجد هاشتاجات مضافة حتى الآن</span>
                    )}
                  </div>

                  {/* Add Hashtag Input */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newHashtagInput}
                      onChange={(e) => setNewHashtagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!newHashtagInput.trim()) return;
                          const tagsToAdd = cleanHashtagsList(newHashtagInput.split(/[\s,،]+/));
                          const currentTags = currentContent.hashtags || [];
                          const merged = Array.from(new Set([...currentTags, ...tagsToAdd]));
                          setPlatformContents({
                            ...platformContents,
                            [activePreviewPlatform]: {
                              ...currentContent,
                              hashtags: merged,
                            },
                          });
                          setNewHashtagInput("");
                        }
                      }}
                      placeholder="أضف هاشتاق واضغط Enter (مثال: أزياء_2026)..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newHashtagInput.trim()) return;
                        const tagsToAdd = cleanHashtagsList(newHashtagInput.split(/[\s,،]+/));
                        const currentTags = currentContent.hashtags || [];
                        const merged = Array.from(new Set([...currentTags, ...tagsToAdd]));
                        setPlatformContents({
                          ...platformContents,
                          [activePreviewPlatform]: {
                            ...currentContent,
                            hashtags: merged,
                          },
                        });
                        setNewHashtagInput("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Call to Action */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                    الدعوة لاتخاذ إجراء (Call to Action):
                  </label>
                  <input
                    type="text"
                    value={currentContent.callToAction || ""}
                    onChange={(e) => {
                      setPlatformContents({
                        ...platformContents,
                        [activePreviewPlatform]: {
                          ...currentContent,
                          callToAction: e.target.value,
                        },
                      });
                    }}
                    placeholder="مثال: راسلنا على الخاص أو الواتساب لحجز مقاسك فوراً 💬"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Scheduling & AI Timing Options */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>5. توقيت النشر والجدولة:</span>
              </label>

              <button
                type="button"
                onClick={handleSmartScheduleTime}
                disabled={isSuggestingTime}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/25 transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isSuggestingTime ? "جاري الحساب..." : "⚡ أفضل وقت للنشر بالذكاء الاصطناعي"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPublishMode("schedule")}
                className={`p-3 rounded-2xl border text-right transition ${
                  publishMode === "schedule"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white font-bold"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>جدولة لموعد محدد</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">نشر تلقائي في التاريخ والوقت</div>
              </button>

              <button
                type="button"
                onClick={() => setPublishMode("instant")}
                className={`p-3 rounded-2xl border text-right transition ${
                  publishMode === "instant"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white font-bold"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Send className="w-3.5 h-3.5 text-emerald-500" />
                  <span>نشر فوري الآن</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">بث مباشر فوري للحسابات</div>
              </button>

              <button
                type="button"
                onClick={() => handleSmartScheduleTime()}
                className={`p-3 rounded-2xl border text-right transition ${
                  publishMode === "ai_smart"
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-slate-900 dark:text-white font-bold"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>توقيت الذروة الذكي</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">الساعة 8:15 مساءً</div>
              </button>
            </div>

            {publishMode !== "instant" && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">تاريخ وساعة النشر المجدولة:</label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mockup Preview with Interactive Overlay (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>معاينة حية للمنشور والقالب:</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                {activePreviewPlatform.toUpperCase()}
              </span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 mb-3">
              {(["instagram", "tiktok", "facebook", "whatsapp"] as SocialPlatform[]).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setActivePreviewPlatform(plat)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                    activePreviewPlatform === plat
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {plat === "instagram" ? "Instagram" : plat === "tiktok" ? "TikTok" : plat === "whatsapp" ? "WhatsApp" : "Facebook"}
                </button>
              ))}
            </div>

            {/* The Phone Container */}
            <div className="mx-auto max-w-sm rounded-[36px] bg-white dark:bg-[#090e1a] border-[5px] border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden relative">
              {/* Phone Speaker Notch */}
              <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-400 dark:bg-slate-700 rounded-full"></div>
              </div>

              {/* Phone App Content */}
              <div className="px-3.5 pb-5 space-y-3">
                {/* Header of social app */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-2">
                    <img
                      src={primaryBrand.logo}
                      alt={primaryBrand.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{primaryBrand.name}</span>
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-current" />
                      </div>
                      <div className="text-[10px] text-slate-400">إعلان مميز • متوفر الآن</div>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">•••</span>
                </div>

                {/* Framed Image/Video with Live Visual Template Overlay */}
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group">
                  {mediaType === "video" || selectedImage.startsWith("data:video/") || selectedImage.endsWith(".mp4") || selectedImage.endsWith(".mov") ? (
                    <video
                      src={selectedImage}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={selectedImage}
                      alt={productTitle}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}

                  {/* Brand Watermark / Top Ribbon */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold pointer-events-none">
                    <img src={primaryBrand.logo} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    <span>{primaryBrand.name}</span>
                  </div>

                  {/* Template Badge Overlay (e.g. Weekend Special, New Arrival, Discount) */}
                  <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                    <div
                      className="px-3 py-1 rounded-full text-[11px] font-black text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200"
                      style={{ backgroundColor: selectedTemplate.accentColor }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{mediaType === "video" ? "🎬 فيديو حصري" : selectedTemplate.badgeText}</span>
                    </div>
                  </div>

                  {/* Price Tag Overlay */}
                  {productPrice && (
                    <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-black shadow-lg flex items-center gap-1.5">
                        <span className="text-amber-300">{productPrice} ريال</span>
                        {productDiscount ? (
                          <span className="text-rose-400 text-[10px] line-through">
                            {Math.round(Number(productPrice) * (1 + Number(productDiscount) / 100))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Available Colors and Sizes Chips */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 flex flex-col items-end gap-1 pointer-events-none">
                    {/* Colors circles */}
                    {selectedColors.length > 0 && (
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-black/60 backdrop-blur-xs border border-white/10">
                        {selectedColors.map((c, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-white/50 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    )}

                    {/* Sizes */}
                    {selectedSizes.length > 0 && (
                      <div className="flex gap-0.5">
                        {selectedSizes.slice(0, 4).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Actions Mockup */}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 py-0.5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-bold hover:text-rose-500 transition cursor-pointer">
                      ❤️ 1.4K
                    </span>
                    <span className="flex items-center gap-1 font-bold hover:text-blue-500 transition cursor-pointer">
                      💬 84
                    </span>
                    <span className="flex items-center gap-1 font-bold hover:text-emerald-500 transition cursor-pointer">
                      🚀 42
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">🔖</span>
                </div>

                {/* Caption Mockup */}
                <div className="space-y-1 text-right text-xs">
                  {currentContent.hook && (
                    <div className="font-bold text-slate-900 dark:text-white text-xs leading-relaxed">
                      {currentContent.hook}
                    </div>
                  )}
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed whitespace-pre-line line-clamp-4 font-sans">
                    {currentContent.caption}
                  </p>

                  {/* Hashtags */}
                  {currentContent.hashtags && currentContent.hashtags.length > 0 && (
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold space-x-1 space-x-reverse pt-0.5">
                      {currentContent.hashtags.map((h, i) => (
                        <span key={i}>{h} </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp or Direct Order Button mockup */}
                <div className="pt-1">
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{currentContent.callToAction || "اطلب عبر الواتساب أو الخاص"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Pages SDK Discovery & Sync Modal */}
      <FacebookPagesSyncModal
        isOpen={isFbSyncModalOpen}
        onClose={() => setIsFbSyncModalOpen(false)}
        targetBrandId={selectedBrandIds[0]}
      />
    </div>
  );
};
