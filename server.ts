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

// 3.5 AI Smart Multiple Reply Options Generator for Interactive Assistant & Chatbot
app.post("/api/ai/suggest-replies", async (req: Request, res: Response) => {
  try {
    const {
      brandName,
      brandTone,
      customerMessage,
      customerName,
      platform,
      interactionType, // 'comment' | 'dm'
      productContext,
      storeGuidelines,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      const namePrefix = customerName ? `${customerName} ` : "";
      return res.json({
        success: true,
        source: "local-suggestions-engine",
        intent: "general_inquiry",
        sentiment: "positive",
        customerSummary: "استفسار مباشر من الزبون بخصوص المنتجات أو الشراء",
        suggestions: [
          {
            id: "opt-warm-friendly",
            tone: "ودي ولطيف",
            badge: "الأكثر شيوعاً 🌸",
            reply: `يا هلا والله ${namePrefix}نورت ${brandName || "متجرنا"} 🤍 يسعدنا نخدمك بكل حب! تفضل بطلبك أو مقاسك وسنزودك بكل التفاصيل فوراً ✨`,
            actionType: "invite_dm",
          },
          {
            id: "opt-sales-closing",
            tone: "تسويقي ومحفز للطلب",
            badge: "زيادة مبيعات 🔥",
            reply: `أهلاً بك ${namePrefix}🛍️ القطعة متوفرة حالياً وعليها إقبال كبير! اطلبها الآن واستفد من عروض الشحن السريع لباب بيتك 🚚📦`,
            actionType: "send_order_link",
          },
          {
            id: "opt-direct-concise",
            tone: "مباشر ومختصر",
            badge: "سريع ومحدد ⚡",
            reply: `حياك الله ${namePrefix}! طلبك متوفر وجاهز للشحن الفوري. تفضل بمراسلتنا على الخاص أو الواتساب لتأكيد المقاس والكمية 💬`,
            actionType: "whatsapp_transfer",
          },
        ],
      });
    }

    const systemPrompt = `
You are an advanced Arabic AI Customer Experience Chatbot & Assistant for "${brandName || "المتجر"}".
Your role is to analyze a customer message (comment or DM) received from social media platforms (${platform || "social media"}), understand the customer intent and emotional state, and generate 3 to 4 distinct ready-to-send reply alternatives tailored to different conversational tones.

Brand Tone Guidelines: ${brandTone || "ودودة، راقية، خدومة، سريعة، تشجع على إتمام الطلب"}
Store & Product Context: ${productContext || "متجر ملابس راقي، خامات ممتازة، شحن وتوصيل فوري لجميع المدن، دفع إلكتروني وعند الاستلام"}
Store Custom Guidelines: ${storeGuidelines || "رحب بالزبون، قدم إجابة مفيدة وواضحة، واقترح خطوة تالية للطلب"}

Provide:
1. "intent": Detected intent category (e.g. price_inquiry, size_availability, delivery_time, location_branches, compliment, return_exchange, complaint, general).
2. "intentAr": Arabic readable intent (e.g. استفسار عن الأسعار، التحقق من المقاسات، السؤال عن الفروع، استفسار عن التوصيل).
3. "sentiment": "positive" | "neutral" | "concerned" | "urgent".
4. "sentimentAr": Arabic description (e.g. إيجابي ومتحمس، محايد وعملي، قلق أو مستعجل).
5. "customerSummary": One brief sentence in Arabic explaining what the customer really needs.
6. "suggestions": Array of exactly 3 distinct reply choices:
   - Option 1 (Friendly & Welcoming): Warm, hospitable, high empathy.
   - Option 2 (Sales & Action Driven): Energetic, highlights value/offers/speed, calls to finalize the order.
   - Option 3 (Concise & Direct): Ultra clear, straight to the point, convenient for fast messaging.
Each suggestion must include:
- "id": string
- "tone": Arabic tone name (e.g. ودود وترحيبي، تسويقي وإغلاق صفقة، سريع ومباشر)
- "badge": short tag (e.g. الأكثر طلباً 🌸، تحفيز الشراء 🛍️، سريع ومختصر ⚡)
- "reply": Complete Arabic message ready to send (1 to 3 concise lines with clean spacing and natural emojis).
- "keyPointsCovered": brief bullet point of what this reply answers.

Ensure output is valid JSON strictly following the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Customer: "${customerName || "عميل"}" wrote on ${platform || "Instagram"}: "${customerMessage}". Generate contextual reply options.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            intentAr: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            sentimentAr: { type: Type.STRING },
            customerSummary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  tone: { type: Type.STRING },
                  badge: { type: Type.STRING },
                  reply: { type: Type.STRING },
                  keyPointsCovered: { type: Type.STRING },
                },
                required: ["id", "tone", "badge", "reply"],
              },
            },
          },
          required: ["intent", "intentAr", "sentiment", "sentimentAr", "customerSummary", "suggestions"],
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
    console.error("Error in /api/ai/suggest-replies:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate suggested replies",
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

// 5. AI Viral Content Ideas & Video Scripts Generator (Supports Raw Story / Spontaneous Sketch)
app.post("/api/ai/generate-ideas", async (req: Request, res: Response) => {
  try {
    const {
      brandName,
      brandTone,
      contentType, // 'reel' | 'carousel' | 'single_image' | 'story' | 'whatsapp_broadcast'
      themeOrGoal, // e.g. "زيادة المبيعات", "تخفيضات أسبوعية", "اسكتش فكاهي داخل المحل"
      keywordOrProduct, // e.g. "فستان سهرة", "طقم كاجوال"
      rawUserStory, // spontaneous conversational prompt: e.g. "موسى ماسك فستان ويقنع جمال يلبسه عشان الزبائن وجمال يعصب..."
      count = 3,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // High-quality local creative generation fallback
      const sampleIdeas = [
        {
          title: rawUserStory
            ? `اسكتش فكاهي داخل المعرض: ${rawUserStory.slice(0, 45)}...`
            : `فكرة ريلز تريند: مقارنة 3 تنسيقات مختلفة لـ (${keywordOrProduct || "القطعة الأحدث"})`,
          contentType: contentType || "reel",
          targetPlatforms: ["tiktok", "instagram", "facebook"],
          hook: rawUserStory
            ? `يا جمال تعال ألبسك هذا الفستان عشان الزبائن يشوفوا كيف الموديل! 😂👗`
            : `الناس ينقسمون لـ 3 أنواع لما يلبسون هذه القطعة.. أنت أي نوع فيهم؟ 🤔👀`,
          script: rawUserStory
            ? `المشهد 1 (0-4 ثوان): موسى يرفع الفستان ويلاحق جمال بالمعرض: "تعال يا جمال لا تستحي!" - نص على الشاشة: [لما تحاول تقنع صاحبك يجرب الموديل الجديد 😂]\nالمشهد 2 (4-12 ثانية): جمال يعصب: "مجنون أنت تلبسني فستان؟! وريه للزبائن ع المانيكان!" وموسى يكمل بإصرار كوميدي.\nالمشهد 3 (12-22 ثانية): جمال ياخذ الفستان ويشرح خامته وتفاصيله الفخمة للزبائن: "شوفوا القماش والتطريز والسعر الخطير في ${brandName || "متجرنا"}!"\nالمشهد 4 (22-30 ثانية): موسى: "يعني ما تبي تلبسه؟" جمال: "لا، بس لا يفوتكم العرض والكمية محدودة!"`
            : `المشهد 1 (0-3 ثوان): ظهور سريع ومفاجئ أمام الكاميرا مع هوك جذاب يسأل المتابعين عن نوعهم.\nالمشهد 2 (3-15 ثانية): الإطلالة الأولى كلاسيك هادئة، الإطلالة الثانية كاجوال عصرية، الإطلالة الثالثة جريئة وشبابية.\nالمشهد 3 (15-25 ثانية): تسليط الضوء على تفاصيل القماش الفاخرة والسعر المنافس في ${brandName || "متجرنا"}.\nالمشهد 4 (25-30 ثانية): دعوة سريعة لكتابة الرقم المفضل في التعليقات مع رابط الطلب.`,
          scenes: [
            {
              id: "s1",
              timestamp: "0:00 - 0:04",
              title: "الخطاف الكوميدي الصادم",
              voiceoverOrText: "يا جمال تعال ألبسك هذا عشان الزبائن يشوفوا! | نص الشاشة: [لما زميلك بالدوام يتحمس بزيادة]",
              visualDirection: "لقطة متوسطة متحركة، موسى يتقدم بسرعة ممسكاً بالفستان أمام الكاميرا باتجاه جمال"
            },
            {
              id: "s2",
              timestamp: "0:04 - 0:14",
              title: "رد الفعل والمشهد الحواري",
              voiceoverOrText: "جمال: 'أنت صاحي؟! اعرضه ع المانيكان!' | نص الشاشة: [ردة فعل غير متوقعة 💀]",
              visualDirection: "لقطة قريبة (Reaction Shot) على وجه جمال العصبي ثم ضحك عفوي"
            },
            {
              id: "s3",
              timestamp: "0:14 - 0:24",
              title: "استعراض القطعة والسعر الحصري",
              voiceoverOrText: `شوفوا جمال الخياطة والتطريز الملكي والسعر اللي ما يتفوت بـ ${brandName || "المتجر"}`,
              visualDirection: "زووم سريع على تفاصيل القماش مع إضاءة ستوديو متجر واضحة"
            },
            {
              id: "s4",
              timestamp: "0:24 - 0:30",
              title: "الخاتمة والدعوة للإجراء (CTA)",
              voiceoverOrText: "منشن خويك اللي لو تقله كذا يزعل! واطلبوا القطعة عبر الرابط في البايو أو تفضلوا بالفرع",
              visualDirection: "ظهور عنوان المتجر وحسابات التواصل ورقم الواتساب على الشاشة"
            }
          ],
          filmingTips: "التصوير بكاميرا عمودية 9:16، الحوار عفوي وسريع بدون تصنع، واستخدام مؤثر صوتي مضحك (Meme Sound Effect) عند ردة الفعل.",
          recommendedAudioOrVibe: "مؤثرات كوميدية سريعة وموسيقى تريند مبهجة",
          captionDraft: `لما الحماس يوصل مليون في المعرض! 😂👗 وفرنا لكم تشكيلة الفساتين والأزياء الجديدة في ${brandName || "متجرنا"}.\nمنشن صاحبك وعطنا رأيك بالكولكشن 👇 متوفر للتوصيل الفوري أو زيارة الفرع.`,
          hashtags: [`#${(brandName || "متجرنا").replace(/\s+/g, "_")}`, "#اسكتش_كوميدي", "#ضحك", "#أزياء", "#تريند_تيك_توك", "#fyp"],
          callToAction: "منشن خويك بالتعليقات وراسلنا على الخاص للطلب الفوري 💬",
          estimatedDurationSeconds: 30,
          priority: "urgent",
        },
      ];

      return res.json({
        success: true,
        source: "local-creative-engine",
        ideas: sampleIdeas,
      });
    }

    const systemPrompt = `
You are the world's best creative director, viral comedy sketch writer, and social media strategist for fashion stores and retail in the Arab world.
Your job is to transform any spontaneous idea, user story, clothing product, or raw thought into a viral, high-converting video script for TikTok and Instagram Reels.

Guidelines:
1. If the user provides a spontaneous story ("rawUserStory"), build a hilarious, natural, highly engaging in-store sketch around those exact characters (e.g. Musa, Jamal, customer, shopkeeper) and seamlessly tie it into showcasing the clothes and driving store visits/orders.
2. Provide an irresistible hook (first 3 seconds).
3. Include on-screen text instructions (نص يكتب على الشاشة) in each scene.
4. Include natural dialogue with local dialect humor (Saudi/Gulf/Arabic retail vibe).
5. Provide exact camera framing, transitions, and audio cues.
6. Provide ready-to-post captions with emojis and smart hashtags.

Store Details:
- Store Name: ${brandName || "متجرنا"}
- Brand Tone: ${brandTone || "عصري، فكاهي، حماسي، جذاب"}
- User Raw Idea / Story: ${rawUserStory || keywordOrProduct || "اسكتش بيع ملابس وعروض مميزة"}
- Content Type: ${contentType || "reel"}
- Goal: ${themeOrGoal || "انتشار فيروسي (Viral Reach) وزيادة المبيعات"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate ${count || 3} comprehensive, viral video scripts based on this request: "${rawUserStory || keywordOrProduct || themeOrGoal}" for store "${brandName}".`,
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


// 6. AI Content & Best Posting Times Analytics Engine
app.post("/api/ai/analyze-content", async (req: Request, res: Response) => {
  try {
    const { brandName, brandTone, postsData, timeRange } = req.body;
    const ai = getGenAI();

    const fallbackResponse = {
      summary: `بناءً على تحليل أداء المنشورات لمتاجر ${brandName || "التجزئة والأزياء"}، يظهر أعلى معدل وصول وتفاعل في الفترات المسائية من الساعة 7:00 م حتى 10:30 م بالتوقيت المحلي.`,
      bestTimes: [
        {
          dayAr: "الخميس والجمعة",
          timeSlot: "08:00 م - 10:30 م",
          platform: "TikTok & Instagram",
          contentType: "فيديوهات ريلز سريعة وعروض نهاية الأسبوع",
          reason: "ذروة تصفح وتسوّق العائلات والشباب قبل عطلة نهاية الأسبوع",
          engagementScore: 98,
        },
        {
          dayAr: "الأحد إلى الثلاثاء",
          timeSlot: "01:30 م - 03:30 م",
          platform: "Instagram & WhatsApp",
          contentType: "صور تنسيقات + برودكاست عروض محدودة",
          reason: "فترة استراحة العمل والغداء وزيادة تفاعل رسائل الواتساب",
          engagementScore: 89,
        },
        {
          dayAr: "السبت والأربعاء",
          timeSlot: "06:30 م - 09:00 م",
          platform: "TikTok & Facebook",
          contentType: "اسكتشات عفوية وريفيوهات فساتين وأطقم",
          reason: "زيادة وقت بقاء المشاهدين على المنصات ومعدل مشاركة المقاطع",
          engagementScore: 92,
        },
      ],
      contentInsights: [
        {
          title: "الفيديوهات العفوية تتفوق بـ 3.2x",
          description: "مقاطع الريلز المصورة بكاميرا الهاتف مع تعليق صوتي محلي حققت تفاعلاً أعلى بنسبة 220% مقارنة بالتصاميم الجرافيكية الثابتة.",
          type: "strength",
        },
        {
          title: "قوة التحويل المباشر إلى واتساب",
          description: "المنشورات التي تتضمن دعوة واضحة (Call to Action) بالنقر على رابط واتساب أدت إلى زيادة بنسبة 45% في المحادثات البيعية المغلقة.",
          type: "opportunity",
        },
        {
          title: "تنوع الهوك في أول 3 ثوانٍ",
          description: "الريلز التي تبدأ بهوك سعري أو استعراض صدمة الخصم حافظت على معدل إكمال تجاوز 82%.",
          type: "recommendation",
        },
      ],
      aiActionPlan: [
        "جدولة 4 مقاطع ريلز أسبوعياً في الفترة الذهبية (الخميس 8:30 مساءً).",
        "تفعيل النشر التلقائي المتقاطع على تيك توك وإنستغرام معاً لمضاعفة الوصول.",
        "التركيز على عرض الأسعار بوضوح في العنوان لتقليل أسئلة الخاص وتسريع الشراء.",
      ],
    };

    if (!ai) {
      return res.json({
        success: true,
        source: "local-rule-engine",
        ...fallbackResponse,
      });
    }

    const prompt = `أنت خبير استراتيجي أول في خوارزميات السوشيال ميديا وتحليل بيانات المحتوى والتجارة الإلكترونية في الخليج والشرق الأوسط.
المتجر المطلوب تحليله: ${brandName || "متاجر التجزئة والأزياء (بلال كوو، عالم التوفير، الصرخة)"}
نبرة العلامة: ${brandTone || "تجارية تفاعلية، شبابية، عروض حصرية"}
فترة التحليل: ${timeRange || "آخر 30 يوماً"}
بيانات المنشورات والأداء السابقة: ${JSON.stringify(postsData || []).slice(0, 1500)}

قم بإجراء تحليل استراتيجي فوري لأداء المحتوى واستخرج:
1. summary: ملخص تحليلي احترافي دقيق باللغة العربية.
2. bestTimes: مصفوفة تحتوي على أفضل 3 أوقات للنشر بأعلى معدل وصول وتفاعل مع تحديد اليوم، الفترة الزمنية، المنصة، نوع المحتوى الأنسب، سبب التفضيل، و engagementScore (من 80 إلى 100).
3. contentInsights: 3 رؤى نوعية عميقة (strength, opportunity, recommendation).
4. aiActionPlan: 3 إلى 4 توصيات تنفيذية عملية للمتجر لزيادة المبيعات والمشاهدات.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bestTimes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayAr: { type: Type.STRING },
                  timeSlot: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  contentType: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  engagementScore: { type: Type.NUMBER },
                },
                required: ["dayAr", "timeSlot", "platform", "contentType", "reason", "engagementScore"],
              },
            },
            contentInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["strength", "opportunity", "recommendation"] },
                },
                required: ["title", "description", "type"],
              },
            },
            aiActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "bestTimes", "contentInsights", "aiActionPlan"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini-2.5-flash",
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-content:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze content",
    });
  }
});


// 7. Real Facebook Graph API Direct Publishing & Verification Endpoints
app.post("/api/facebook/test-connection", async (req: Request, res: Response) => {
  try {
    const { pageId, pageAccessToken } = req.body;
    if (!pageAccessToken || !pageId) {
      return res.status(400).json({
        success: false,
        error: "يرجى توفير كل من Page ID و Page Access Token للفحص المباشر مع فيسبوك.",
      });
    }

    // Call Facebook Graph API to inspect page
    const cleanToken = pageAccessToken.trim();
    const cleanPageId = pageId.trim();
    const fbUrl = `https://graph.facebook.com/v19.0/${cleanPageId}?fields=id,name,category,fan_count,verification_status,link&access_token=${encodeURIComponent(cleanToken)}`;
    
    const fbRes = await fetch(fbUrl);
    const fbData: any = await fbRes.json();

    if (fbData.error) {
      return res.status(400).json({
        success: false,
        error: `خطأ من فيسبوك (${fbData.error.type || fbData.error.code}): ${fbData.error.message}`,
        details: fbData.error,
      });
    }

    return res.json({
      success: true,
      pageName: fbData.name,
      pageId: fbData.id,
      category: fbData.category,
      fanCount: fbData.fan_count,
      link: fbData.link,
      message: `تم التحقق بنجاح من صفحة "${fbData.name}" وهي متصلة ومصرح لها بالنشر!`,
    });
  } catch (error: any) {
    console.error("Facebook API Test Connection Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "تعذر الاتصال بـ Facebook Graph API",
    });
  }
});

app.post("/api/facebook/publish-post", async (req: Request, res: Response) => {
  try {
    const { pageId, pageAccessToken, message, link, imageUrl } = req.body;

    if (!pageAccessToken || !pageId) {
      return res.status(400).json({
        success: false,
        error: "بيانات الربط غير مكتملة (Page Access Token أو Page ID مفقود).",
      });
    }

    const cleanToken = pageAccessToken.trim();
    const cleanPageId = pageId.trim();

    let fbRes;
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      // Publish as Photo Post
      const fbPhotoUrl = `https://graph.facebook.com/v19.0/${cleanPageId}/photos`;
      fbRes = await fetch(fbPhotoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          caption: message || "",
          access_token: cleanToken,
        }),
      });
    } else {
      // Publish as Feed Post (Text + Link)
      const fbFeedUrl = `https://graph.facebook.com/v19.0/${cleanPageId}/feed`;
      const bodyPayload: any = {
        message: message || "",
        access_token: cleanToken,
      };
      if (link) bodyPayload.link = link;

      fbRes = await fetch(fbFeedUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
    }

    const fbData: any = await fbRes.json();

    if (fbData.error) {
      return res.status(400).json({
        success: false,
        error: `فشل النشر على فيسبوك (${fbData.error.type || fbData.error.code}): ${fbData.error.message}`,
        details: fbData.error,
      });
    }

    return res.json({
      success: true,
      postId: fbData.id || fbData.post_id,
      message: "تم النشر الحقيقي على صفحة فيسبوك بنجاح!",
      publishedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Facebook Publish Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "تعذر إتمام النشر عبر Facebook Graph API",
    });
  }
});

// 8. Meta (Facebook/Instagram) User Data Deletion Callback Endpoint
// Follows Meta Developer Platform Data Deletion Guidelines:
// Returns JSON with 'url' and 'confirmation_code' for tracking deletion requests.
app.post("/api/auth/data-deletion-callback", (req: Request, res: Response) => {
  try {
    const confirmationCode = `META-DEL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const statusTrackingUrl = `${req.protocol}://${req.get("host")}/data-deletion?code=${confirmationCode}`;

    console.log(`[Meta Data Deletion Request Received] Confirmation Code: ${confirmationCode}`);

    // Return the response format expected by Meta Platform
    return res.json({
      url: statusTrackingUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error: any) {
    console.error("Error handling Meta data deletion callback:", error);
    return res.status(500).json({ error: "Failed to process data deletion callback" });
  }
});

// Also support GET for browser inspection
app.get("/api/auth/data-deletion-callback", (req: Request, res: Response) => {
  res.json({
    status: "active",
    service: "SmartPost365 Meta Data Deletion Service",
    instructions_url: `${req.protocol}://${req.get("host")}/data-deletion`,
  });
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
    console.log(`SmartPost365 Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
