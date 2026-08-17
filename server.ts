import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialize or safe accessor for GoogleGenAI
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 2. Generate Multi-Brand, Multi-Platform Captions with Gemini 3.7 Flash
app.post("/api/ai/generate-post", async (req: Request, res: Response) => {
  try {
    const {
      brandName,
      brandTone,
      brandKeywords,
      productTitle,
      productCategory,
      productPrice,
      productDiscount,
      productSizes,
      targetPlatforms, // ['facebook', 'instagram', 'tiktok', 'whatsapp', 'youtube']
      customInstructions,
      format, // 'feed' | 'reel' | 'story' | 'whatsapp_broadcast'
      imageDescription,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Fallback generator if no key is supplied
      const sampleCaptions: Record<string, { caption: string; hashtags: string[]; hook: string; callToAction: string }> = {};
      
      const platforms = (targetPlatforms && targetPlatforms.length > 0) 
        ? targetPlatforms 
        : ["facebook", "instagram", "tiktok", "whatsapp", "youtube"];

      for (const p of platforms) {
        const discountText = productDiscount ? ` 🔥 بخصم خاص ${productDiscount}%` : "";
        const priceText = productPrice ? ` السعر: ${productPrice} ريال فقط!` : "";
        const sizesText = productSizes && productSizes.length ? ` المقاسات المتوفرة: ${productSizes.join(", ")}` : "";

        if (p === "whatsapp") {
          sampleCaptions[p] = {
            hook: `✨ جديد وحصري من ${brandName}!`,
            caption: `السلام عليكم أعضاء مجتمعنا المميزين 🌟\n\nوصلتنا الآن تشكيلة جديدة وفخمة: *${productTitle || "قطعة ملابس مميزة"}*! 🛍️\n\n${priceText}${discountText}\n${sizesText}\n\n📍 الكمية محدودة جداً! للطلب الفوري يرجى الرد على هذه الرسالة أو زيارة أقرب فرع.`,
            hashtags: [`#${brandName.replace(/\s+/g, "_")}`, "#عروض_خاصة", "#تسوق_اونلاين"],
            callToAction: "راسلنا الآن لحجز مقاسك قبل نفاد الكمية! 💬",
          };
        } else if (p === "tiktok" || format === "reel") {
          sampleCaptions[p] = {
            hook: `يا هلا بالزين! شوفوا تفاصيل هذه القطعة الفخمة من ${brandName} 😍✨`,
            caption: `أقوى إطلالة لهذا الموسم من ${brandName}! ${productTitle || "أحدث صيحة"}\n${priceText} ${discountText}\n\nالحق مقاسك قبل تخلص الكمية! شارك المقطع مع شخص يحب هذا الستايل 👇`,
            hashtags: [`#${brandName.replace(/\s+/g, "_")}`, "#fyp", "#تريند_الملابس", "#ستايل_اليوم", "#explore"],
            callToAction: "الرابط في البايو للطلب السريع والتوصيل لباب بيتك 🚚",
          };
        } else if (p === "instagram") {
          sampleCaptions[p] = {
            hook: `إطلالتك اليوم عنوانها الأناقة مع ${brandName} 💫`,
            caption: `وصل حديثاً في جميع فروعنا: ${productTitle || "أحدث موديل"}.\n\nخامات راقية، قصّة مريحة، وألوان تخطف الأنظار 🖤\n${priceText}${discountText}\n${sizesText}\n\n📍 اطلب عبر الخاص أو زرنا في الفروع.`,
            hashtags: [`#${brandName.replace(/\s+/g, "_")}`, "#فاشن", "#أزياء_عصرية", "#موضة_2026", "#كشخة"],
            callToAction: "أرسل لنا رسالة خاصة (DM) للطلب الفوري 📩",
          };
        } else {
          sampleCaptions[p] = {
            hook: `جديدنا المميز من ${brandName} متوفر الآن! 🏷️`,
            caption: `تشكيلة استثنائية تناسب ذوقكم الرفيع: ${productTitle || "قطعة مميزة"}.\n\n${priceText}${discountText}\n${sizesText}\n\nخدمة التوصيل السريع متاحة لجميع المناطق مع إمكانية الدفع عند الاستلام.`,
            hashtags: [`#${brandName.replace(/\s+/g, "_")}`, "#عروض_الملابس", "#تخفيضات", "#أزياء"],
            callToAction: "علّق بـ (تم) وسنرسل لك التفاصيل كاملة على الخاص 💬",
          };
        }
      }

      return res.json({
        success: true,
        source: "local-engine",
        captions: sampleCaptions,
        suggestedAngles: [
          "التركيز على الجودة العالية مع السعر المنافس",
          "خلق شعور بالندرة والكمية المحدودة",
          "إبراز سرعة التوصيل وخدمة العملاء الفورية",
        ],
      });
    }

    const systemPrompt = `
You are an expert Arabic social media strategist and e-commerce copywriter specializing in retail fashion, clothing brands, and local stores in the Gulf and Arab region.
Your goal is to produce highly engaging, natural, viral Arabic copy tailored for specific social platforms and brand identities.

Brand details:
- Name: ${brandName || "متجرنا"}
- Brand Tone: ${brandTone || "ودودة، عصرية، تشجيعية، تركز على القيمة والأناقة"}
- Brand Key Attributes: ${brandKeywords || "جودة، أناقة، سرعة توصيل"}
- Product: ${productTitle || "قطعة ملابس عصرية"}
- Category: ${productCategory || "ملابس"}
- Price: ${productPrice ? productPrice + " ريال" : "سعر مميز"}
- Discount: ${productDiscount ? productDiscount + "%" : "بدون خصم"}
- Available Sizes: ${productSizes ? productSizes.join(", ") : "جميع المقاسات"}
- Custom Instructions: ${customInstructions || "اكتب نصوصاً جذابة تزيد من المبيعات والتفاعل المباشر"}
- Image Description: ${imageDescription || "صورة جذابة لقطعة ملابس عصرية عالية الجودة"}
- Format: ${format || "feed"}

For each requested platform (${targetPlatforms ? targetPlatforms.join(", ") : "facebook, instagram, tiktok, whatsapp, youtube"}):
- Craft a specific, tailored Arabic post with:
  1. Catchy Opening Hook (سطر أول يخطف الانتباه)
  2. Full Body Caption (نص متناسق مع المنصة، استخدام رائع للإيموجي، تنسيق فقرات مريحة للعين)
  3. Tailored Hashtags (3-6 هاشتاجات متصدرة وذكية)
  4. Call To Action (دعوة واضحة لاتخاذ إجراء: التعليق، المراسلة، زيارة الرابط)
  5. Format Note (ملاحظة قصيرة إذا كان ريلز كسيناريو سريع أو ستوري أو واتساب)

Return strictly valid JSON matching the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate multi-platform Arabic social posts for product: ${productTitle}. Ensure each platform tone matches its audience (TikTok is fast & trendy with Reel hooks, WhatsApp is direct & community-focused, Instagram is visual & chic, Facebook is detailed & engaging, YouTube is search-optimized).`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.OBJECT,
              description: "Map of platform name to post content",
              properties: {
                facebook: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    callToAction: { type: Type.STRING },
                  },
                },
                instagram: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    callToAction: { type: Type.STRING },
                  },
                },
                tiktok: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    callToAction: { type: Type.STRING },
                  },
                },
                whatsapp: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    callToAction: { type: Type.STRING },
                  },
                },
                youtube: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    callToAction: { type: Type.STRING },
                  },
                },
              },
            },
            suggestedAngles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 strategic marketing tips for this campaign",
            },
          },
          required: ["captions"],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        source: "gemini-3.7-flash",
        ...parsed,
      });
    }
    throw new Error("Empty response from Gemini");
  } catch (error: any) {
    console.warn("AI generator falling back to internal copy engine:", error?.message);
    const {
      brandName,
      productTitle,
      productPrice,
      productDiscount,
      productSizes,
      targetPlatforms,
      format,
    } = req.body || {};

    const sampleCaptions: Record<string, { caption: string; hashtags: string[]; hook: string; callToAction: string }> = {};
    const platforms = (targetPlatforms && targetPlatforms.length > 0)
      ? targetPlatforms
      : ["facebook", "instagram", "tiktok", "whatsapp", "youtube"];

    const discountText = productDiscount ? ` 🔥 بخصم خاص ${productDiscount}%` : "";
    const priceText = productPrice ? ` السعر: ${productPrice} ريال فقط!` : "";
    const sizesText = productSizes && productSizes.length ? ` المقاسات: ${productSizes.join(", ")}` : "";
    const brand = brandName || "متجرنا";

    for (const p of platforms) {
      if (p === "whatsapp") {
        sampleCaptions[p] = {
          hook: `✨ جديد وحصري من ${brand}!`,
          caption: `السلام عليكم أعضاء مجتمعنا المميزين 🌟\n\nوصلتنا الآن تشكيلة جديدة: *${productTitle || "قطعة ملابس عصرية"}* 🛍️\n\n${priceText}${discountText}\n${sizesText}\n\n📍 للطلب المباشر يرجى الرد على هذه الرسالة أو زيارة أقرب فرع.`,
          hashtags: [`#${brand.replace(/\s+/g, "_")}`, "#عروض_خاصة", "#تسوق_أونلاين"],
          callToAction: "راسلنا الآن لحجز مقاسك ولونك المفضل 💬",
        };
      } else if (p === "tiktok" || format === "reel") {
        sampleCaptions[p] = {
          hook: `يا هلا بالزين! شوفوا تفاصيل هذه القطعة الفخمة من ${brand} 😍🔥`,
          caption: `أقوى إطلالة لهذا الموسم! ${productTitle || "أحدث صيحة"}\n${priceText} ${discountText}\n\nالحق مقاسك قبل نفاذ الكمية 👇`,
          hashtags: [`#${brand.replace(/\s+/g, "_")}`, "#fyp", "#تريند_الملابس", "#تنسيقات", "#explore"],
          callToAction: "الرابط في البايو للطلب السريع والتوصيل لباب بيتك 🚚",
        };
      } else if (p === "instagram") {
        sampleCaptions[p] = {
          hook: `إطلالتك اليوم عنوانها الأناقة مع ${brand} 💫`,
          caption: `وصل حديثاً في جميع فروعنا: ${productTitle || "أحدث موديل"}.\n\nخامات راقية، قصّة مريحة وألوان تخطف الأنظار 🖤\n${priceText}${discountText}\n${sizesText}\n\n📍 اطلب عبر الخاص أو زورونا في الفروع.`,
          hashtags: [`#${brand.replace(/\s+/g, "_")}`, "#فاشن", "#أزياء_عصرية", "#موضة_2026", "#كشخة"],
          callToAction: "أرسل لنا رسالة خاصة (DM) للطلب الفوري 📩",
        };
      } else {
        sampleCaptions[p] = {
          hook: `جديدنا المميز من ${brand} متوفر الآن! 🏷️`,
          caption: `تشكيلة استثنائية تناسب ذوقكم الرفيع: ${productTitle || "قطعة مميزة"}.\n\n${priceText}${discountText}\n${sizesText}\n\nخدمة التوصيل السريع متاحة لجميع المناطق والدفع عند الاستلام.`,
          hashtags: [`#${brand.replace(/\s+/g, "_")}`, "#عروض_الملابس", "#تخفيضات", "#أزياء"],
          callToAction: "علّق بـ (تم) وسنرسل لك التفاصيل كاملة على الخاص 💬",
        };
      }
    }

    return res.json({
      success: true,
      source: "resilient-engine",
      captions: sampleCaptions,
      suggestedAngles: [
        "التركيز على الجودة العالية والكميات المحدودة",
        "استغلال عروض نهاية الأسبوع وخدمة التوصيل السريع",
        "تحفيز الزبائن على المراسلة وحجز المقاسات فوراً",
      ],
    });
  }
});

// 3. AI Auto-Responder for Comments and Direct Messages
app.post("/api/ai/auto-reply", async (req: Request, res: Response) => {
  try {
    const {
      brandName,
      customerMessage,
      customerName,
      platform,
      itemContext, // e.g. "فستان صيفي أسود - السعر 180 ريال - المقاسات S, M, L, XL - التوصيل متوفر خلال 24 ساعة"
      storeRules, // custom store guidelines
      type, // 'comment' | 'dm'
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Local intelligent response generator
      let reply = `أهلاً بك يا ${customerName || "عزيزنا"} في ${brandName || "متجرنا"} 🌸 يسعدنا خدمتك!`;
      const msg = (customerMessage || "").toLowerCase();

      if (msg.includes("سعر") || msg.includes("بكم") || msg.includes("كم")) {
        reply = `أهلاً بك ${customerName ? customerName + " " : ""}🌸 السعر مميز جداً ومتاح حالياً بعرض خاص! أرسلنا لك التفاصيل والطلب عبر الخاص، أو بإمكانك كتابة مقاسك وسنخدمك فوراً ✨`;
      } else if (msg.includes("مقاس") || msg.includes("سايز") || msg.includes("size") || msg.includes("xl") || msg.includes("سمول")) {
        reply = `أهلاً بك! المقاسات متوفرة من (S إلى XXL) وبقصّة مريحة جداً. ما هو المقاس المطلوب لنؤكد لك توفره فوراً؟ 🛍️`;
      } else if (msg.includes("موقع") || msg.includes("وين") || msg.includes("مكان") || msg.includes("فرع")) {
        reply = `حياك الله في فروع ${brandName || "متجرنا"}! نسعد بزيارتك يومياً من 10 صباحاً حتى 11 مساءً، ويتوفر شحن وتوصيل فوري لباب منزلك 🚚✨`;
      } else if (msg.includes("توصيل") || msg.includes("شحن") || msg.includes("يوصل")) {
        reply = `نوفر توصيل سريع لجميع المناطق خلال 24 - 48 ساعة والدفع عند الاستلام متاح! تفضل بإرسال مدينتك لنزودك بكافة التفاصيل 📦💫`;
      }

      return res.json({
        success: true,
        source: "local-engine",
        reply,
        intent: "general",
        confidence: 0.92,
      });
    }

    const systemPrompt = `
You are a warm, courteous, professional, and sales-savvy Arabic customer support agent for "${brandName || "متجر ملابس"}".
You handle customer inquiries on social platforms (${platform || "social media"}) including comments and direct messages.

Store Knowledge & Context:
- Item Context: ${itemContext || "تشكيلة ملابس راقية وأسعار منافسة وتوصيل فوري"}
- Store Rules & Guidelines: ${storeRules || "كن ودوداً، جاوب باحترافية، شجع على الشراء، اعرض إرسال التفاصيل أو الرابط، وكن سريع البديهة"}
- Customer Name: ${customerName || "الزبون"}
- Type of interaction: ${type || "comment"}

Instructions:
1. Speak in natural, friendly Gulf/Arab customer-service tone.
2. Address the customer politely.
3. Directly resolve their question (price, sizes, location, delivery, or general compliments).
4. If it is a public comment asking for price/order, invite them to check their inbox (DM) or leave their size, while providing a helpful answer.
5. Keep it concise (1 to 3 lines max), clean formatting, and tasteful emojis.

Return strictly JSON matching the response schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Customer ${customerName || "user"} sent: "${customerMessage}". Generate the best response.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "The response message in Arabic" },
            intent: {
              type: Type.STRING,
              enum: ["price", "size", "location", "delivery", "greeting", "complaint", "general"],
            },
            confidence: { type: Type.NUMBER },
            actionSuggestion: { type: Type.STRING, description: "Action advice for store manager" },
          },
          required: ["reply", "intent"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      source: "gemini-3.7-flash",
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/auto-reply:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate auto reply",
    });
  }
});

// 4. AI Best Posting Times & Recommendations
app.post("/api/ai/suggest-times", async (req: Request, res: Response) => {
  try {
    const { brandCategory, targetAudience, platforms } = req.body;

    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: "local-heuristics",
        recommendedSlots: [
          { day: "اليوم", time: "07:30 م", reason: "ذروة التصفح المسائي بعد الدوامات والتسوق", platform: "instagram" },
          { day: "اليوم", time: "09:15 م", reason: "أعلى معدل مشاهدات وتفاعل لمقاطع الريلز والتيك توك", platform: "tiktok" },
          { day: "غداً", time: "01:30 م", reason: "استراحة الغداء وتفقد رسائل الواتساب وعروض اليوم", platform: "whatsapp" },
          { day: "غداً", time: "08:00 م", reason: "وقت عائلي مثالي لمتابعة عروض فيسبوك ويوتيوب", platform: "facebook" },
        ],
        peakWindows: "بين 7:00 م و 11:00 م طوال أيام الأسبوع، ومع ظهيرة الجمعة والسبت",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Recommend optimal posting times for ${brandCategory || "clothing stores"} targeting ${targetAudience || "shoppers in Saudi Arabia & Gulf"}.`,
      config: {
        systemInstruction: "You are a social media analytics master. Provide optimal Arabic schedule windows based on Arab world retail traffic patterns.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedSlots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  time: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  platform: { type: Type.STRING },
                },
              },
            },
            peakWindows: { type: Type.STRING },
          },
          required: ["recommendedSlots", "peakWindows"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini-3.7-flash", ...parsed });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. AI Viral Content Ideas & Video Scripts Generator
app.post("/api/ai/generate-ideas", async (req: Request, res: Response) => {
  try {
    const {
      brandName,
      brandTone,
      contentType, // 'reel' | 'carousel' | 'single_image' | 'story' | 'whatsapp_broadcast'
      themeOrGoal, // e.g. "زيادة المبيعات", "تخفيضات أسبوعية", "تنسيقات دوام", "مسابقة وتفاعل"
      keywordOrProduct, // e.g. "قميص كتان", "طقم سبور", "ملابس أطفال"
      count = 3,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // High-quality local creative generation fallback
      const sampleIdeas = [
        {
          title: `فكرة ريلز تريند: مقارنة 3 تنسيقات مختلفة لـ (${keywordOrProduct || "القطعة الأحدث"})`,
          contentType: contentType || "reel",
          targetPlatforms: ["tiktok", "instagram"],
          hook: `الناس ينقسمون لـ 3 أنواع لما يلبسون هذه القطعة.. أنت أي نوع فيهم؟ 🤔👀`,
          script: `المشهد 1 (0-3 ثوان): ظهور سريع ومفاجئ أمام الكاميرا مع هوك جذاب يسأل المتابعين عن نوعهم.\nالمشهد 2 (3-15 ثانية): الإطلالة الأولى كلاسيك هادئة، الإطلالة الثانية كاجوال عصرية، الإطلالة الثالثة جريئة وشبابية.\nالمشهد 3 (15-25 ثانية): تسليط الضوء على تفاصيل القماش الفاخرة والسعر المنافس في ${brandName || "متجرنا"}.\nالمشهد 4 (25-30 ثانية): دعوة سريعة لكتابة الرقم المفضل في التعليقات مع رابط الطلب.`,
          scenes: [
            { id: "s1", timestamp: "0:00 - 0:03", title: "الهوك الخاطف", voiceoverOrText: "أنت أي نوع من هالثلاثة لما تكشخ؟", visualDirection: "حركة سريعة وانتقال بصري Snap باليد أمام العدسة" },
            { id: "s2", timestamp: "0:03 - 0:15", title: "استعراض الإطلالات", voiceoverOrText: "النوع الأول رسمي.. الثاني كاجوال مريح.. والثالث كشخة سهرات!", visualDirection: "لقطات كاملة سريعة مع تغيير الأحذية والإكسسوارات" },
            { id: "s3", timestamp: "0:15 - 0:25", title: "إبراز التفاصيل والأسعار", voiceoverOrText: "والأهم أن الخامة قطن 100% والسعر حصري!", visualDirection: "زووم ماكرو على النسيج والياقة وكارت السعر" },
            { id: "s4", timestamp: "0:25 - 0:30", title: "الدعوة للطلب (CTA)", voiceoverOrText: "اكتب مقاسك في التعليقات أو اطلب عبر الواتساب فوراً", visualDirection: "ظهور كود الخصم ورقم الواتساب على الشاشة" }
          ],
          filmingTips: "استخدم إضاءة قوية طبيعية، واعتمد الانتقالات البصرية الحركية (Jump Cuts أو Snaps) لرفع نسبة إكمال الفيديو (Retention Rate).",
          recommendedAudioOrVibe: "إيقاع صيفي حماسي أو صوت تريند سريع (Trending Fashion Beat)",
          captionDraft: `إطلالة واحدة ما تكفي! ✨ وفرنا لكم أجمل تشكيلة من ${keywordOrProduct || "الملابس العصرية"} في ${brandName || "متجرنا"}. شاركونا رأيكم: أي ستايل يناسبك أكثر؟ 👇 الكمية محدودة جداً بجميع فروعنا.`,
          hashtags: [`#${(brandName || "متجرنا").replace(/\s+/g, "_")}`, "#تنسيقات_ملابس", "#ريلز_فاشن", "#ستايل_اليوم", "#تريند"],
          callToAction: "علّق بـ (تم) أو راسلنا على الخاص لمعرفة المقاسات المتوفرة والطلب الفوري 📩",
          estimatedDurationSeconds: 30,
          priority: "high",
        },
        {
          title: `فيديو تحدي السرعة: كيف تختار طقمك الكامل في 60 ثانية من ${brandName || "المعرض"}`,
          contentType: contentType || "reel",
          targetPlatforms: ["tiktok", "instagram", "facebook"],
          hook: `تحداني صاحب المحل أختار أفخم طقم بـ 90 ثانية وبأقل من 200 ريال! ⏱️🔥`,
          script: `المصور يبدأ بعد تنازلي سريع على الشاشة، يتنقل بين الستاندات، ينسق القميص مع البنطال والحذاء، ثم يتوجه للمرآة لاستعراض النتيجة النهائية ومجموع السعر.`,
          scenes: [
            { id: "s1", timestamp: "0:00 - 0:03", title: "بداية التحدي", voiceoverOrText: "الوقت بدأ.. هل أقدر أركب طقم كامل بهالسعر؟", visualDirection: "لقطة لعداد ثوانٍ متحرك على الشاشة وحركة كاميرا سريعة" },
            { id: "s2", timestamp: "0:03 - 0:18", title: "اختيار القطع", voiceoverOrText: "أخذنا هالقطعة الفخمة مع هذا البنطال.. شوفوا تناسق الألوان!", visualDirection: "سحب القطع من الستاند وتنسيقها بجانب بعض بسرعة" },
            { id: "s3", timestamp: "0:18 - 0:26", title: "البروفة النهائية", voiceoverOrText: "شوفوا النتيجة بعد اللبس.. طالع الطقم خيال!", visualDirection: "دوران 360 درجة أمام المرآة الكبرى بالمتجر" },
            { id: "s4", timestamp: "0:26 - 0:30", title: "الخاتمة", voiceoverOrText: "زورونا اليوم في الفرع واستفيدوا من عروض التوفير", visualDirection: "عنوان المحل ورابط الخريطة" }
          ],
          filmingTips: "كاميرا محمولة باليد (Handheld POV) لإعطاء إحساس الواقعية والمغامرة والتسوق المباشر.",
          recommendedAudioOrVibe: "موسيقى تشويق حماسية وسريعة",
          captionDraft: `التحدي كان صعب بس طلعنا بأقوى إطلالة! 🔥 كولكشن جديد متوفر الآن في ${brandName || "متجرنا"}. تعال وجرب بنفسك في المعرض أو اطلب عبر الواتساب.`,
          hashtags: [`#${(brandName || "متجرنا").replace(/\s+/g, "_")}`, "#تحدي", "#أزياء_رجالية", "#عروض_اليوم", "#fyp"],
          callToAction: "منشن صاحبك اللي دايماً يتأخر باختيار ملابسه! 😂👇",
          estimatedDurationSeconds: 30,
          priority: "urgent",
        },
        {
          title: `كاروسيل/بوست تعليمي: أسرار تنسيق ألوان الملابس للظهور بمظهر أغلى وأكثر فخامة`,
          contentType: contentType === "reel" ? "reel" : "carousel",
          targetPlatforms: ["instagram", "facebook"],
          hook: `3 قواعد في تنسيق الألوان تخلي لبسك يبان كأنه من أشهر الماركات العالمية ✨👔`,
          script: `شريحة 1: الغلاف الجذاب باللون الملكي.\nشريحة 2: قاعدة الـ 60-30-10 في توزيع ألوان الإطلالة.\nشريحة 3: درجات الألوان المحايدة الأكثر فخامة (البيج، الزيتي، الكحلي العميق).\nشريحة 4: استعراض تطبيق القواعد عملياً على قطع ${brandName || "المتجر"}.\nشريحة 5: كود خصم خاص للمتابعين مع دعوة للحفظ.`,
          filmingTips: "تصوير مسطح مسرحي (Editorial Flat Lay) على خلفيات خشبية أو رخامية مع إضاءة ستوديو ناعمة.",
          recommendedAudioOrVibe: "طابع هادئ، فاخر، وأنيق",
          captionDraft: `الأناقة علم وذوق! 💫 إليك الدليل السريع لتنسيق ألوان ملابسك لتظهر دائماً بإطلالة مميزة ومتقنة. احفظ المنشور لتستفيد منه في طلعاتك القادمة 📌 متوفر الآن في ${brandName || "متجرنا"}.`,
          hashtags: [`#${(brandName || "متجرنا").replace(/\s+/g, "_")}`, "#نصائح_فاشن", "#تنسيق_ألوان", "#أناقة", "#كشخة"],
          callToAction: "احفظ المنشور وشاركه مع شخص يهتم بالأناقة! 🖤",
          estimatedDurationSeconds: 20,
          priority: "medium",
        }
      ];

      return res.json({
        success: true,
        source: "local-creative-engine",
        ideas: sampleIdeas,
      });
    }

    const systemPrompt = `
You are an award-winning creative social media director and viral content strategist for fashion and retail stores in the Arab world (Saudi Arabia, UAE, Kuwait, etc.).
Your job is to generate highly engaging, actionable content ideas, full scene-by-scene video scripts for TikTok/Instagram Reels, and visual directions for "${brandName || "متجر أزياء"}".

Brand & Request details:
- Store Name: ${brandName || "متجرنا"}
- Brand Tone: ${brandTone || "عصري، حماسي، ودود، يركز على القيمة والجودة"}
- Content Type: ${contentType || "reel"} (e.g. reel, carousel, single_image, story, whatsapp_broadcast)
- Strategic Theme / Goal: ${themeOrGoal || "زيادة المبيعات والتفاعل وتصريف الكولكشن"}
- Focus Keyword / Product: ${keywordOrProduct || "أحدث صيحات الملابس والتنسيقات"}
- Number of ideas to generate: ${count || 3}

For each idea, output:
1. title: Engaging title for internal team management.
2. contentType: The content format.
3. targetPlatforms: Array of platform names ('tiktok', 'instagram', 'facebook', 'whatsapp').
4. hook: High-converting opening line (first 3 seconds attention grabber).
5. script: Complete script text.
6. scenes: Array of 3 to 4 sequential scenes with timestamp (e.g. '0:00 - 0:03'), title, voiceoverOrText, and visualDirection (camera motion/angles).
7. filmingTips: Practical advice for the mobile videographer in the store.
8. recommendedAudioOrVibe: Music/audio vibe recommendation.
9. captionDraft: Full ready-to-post Arabic caption with emojis.
10. hashtags: Array of 4-6 smart hashtags.
11. callToAction: Clear CTA to buy, comment, or message on WhatsApp.
12. estimatedDurationSeconds: Estimated video duration (15 to 45 seconds).
13. priority: 'low' | 'medium' | 'high' | 'urgent'.

Return strictly valid JSON conforming to the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate ${count || 3} viral Arabic content ideas and scripts for ${brandName} focusing on "${keywordOrProduct || "ملابس وتنسيقات"}" with goal "${themeOrGoal || "زيادة المبيعات والانتشار"}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  contentType: { type: Type.STRING, enum: ["reel", "carousel", "single_image", "story", "whatsapp_broadcast"] },
                  targetPlatforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  hook: { type: Type.STRING },
                  script: { type: Type.STRING },
                  scenes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        timestamp: { type: Type.STRING },
                        title: { type: Type.STRING },
                        voiceoverOrText: { type: Type.STRING },
                        visualDirection: { type: Type.STRING },
                      },
                      required: ["title", "voiceoverOrText", "visualDirection"],
                    },
                  },
                  filmingTips: { type: Type.STRING },
                  recommendedAudioOrVibe: { type: Type.STRING },
                  captionDraft: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  callToAction: { type: Type.STRING },
                  estimatedDurationSeconds: { type: Type.NUMBER },
                  priority: { type: Type.STRING, enum: ["low", "medium", "high", "urgent"] },
                },
                required: ["title", "hook", "script", "captionDraft", "hashtags"],
              },
            },
          },
          required: ["ideas"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini-3.7-flash",
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/generate-ideas:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI ideas",
    });
  }
});


// Vite & Static file serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SocialHub AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
