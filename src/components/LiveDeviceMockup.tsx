import React, { useState } from "react";
import {
  Smartphone,
  Instagram,
  Facebook,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
  Volume2,
  Music,
  Check,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { SocialPlatform, PostFormat } from "../types";

interface LiveDeviceMockupProps {
  platform: SocialPlatform;
  format?: PostFormat;
  brandName: string;
  brandLogo: string;
  caption: string;
  hashtags?: string[];
  mediaUrl: string;
  mediaType?: "image" | "video";
  price?: number | string;
  discount?: number | string;
  title?: string;
  onChangePlatform?: (platform: SocialPlatform) => void;
}

export const LiveDeviceMockup: React.FC<LiveDeviceMockupProps> = ({
  platform,
  brandName,
  brandLogo,
  caption,
  hashtags = [],
  mediaUrl,
  mediaType = "image",
  price,
  discount,
  title,
  onChangePlatform,
}) => {
  const [activeTab, setActiveTab] = useState<SocialPlatform>(platform || "instagram");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentPlatform = onChangePlatform ? platform : activeTab;
  const setPlatform = (p: SocialPlatform) => {
    if (onChangePlatform) {
      onChangePlatform(p);
    } else {
      setActiveTab(p);
    }
  };

  const formattedHashtags = (hashtags || []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");

  return (
    <div className="flex flex-col items-center space-y-3 w-full select-none" dir="ltr">
      {/* Platform Switcher Pills */}
      <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setPlatform("instagram")}
          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition ${
            currentPlatform === "instagram"
              ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram</span>
        </button>

        <button
          type="button"
          onClick={() => setPlatform("tiktok")}
          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition ${
            currentPlatform === "tiktok"
              ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="font-black text-xs">TikTok</span>
        </button>

        <button
          type="button"
          onClick={() => setPlatform("facebook")}
          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition ${
            currentPlatform === "facebook"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Facebook className="w-3.5 h-3.5" />
          <span>Facebook</span>
        </button>

        <button
          type="button"
          onClick={() => setPlatform("whatsapp")}
          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition ${
            currentPlatform === "whatsapp"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* Realistic Smartphone Shell */}
      <div className="w-[320px] sm:w-[340px] bg-slate-950 rounded-[42px] p-3 shadow-2xl border-4 border-slate-800 relative ring-1 ring-slate-700/50">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Screen Area */}
        <div className="w-full bg-black rounded-[32px] overflow-hidden text-white flex flex-col relative aspect-[9/18.5] max-h-[640px]">
          {/* Status Bar */}
          <div className="h-9 px-6 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-400 z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <div className="w-4 h-2 rounded-xs border border-slate-400 flex items-center p-0.5">
                <div className="w-full h-full bg-white rounded-2xs" />
              </div>
            </div>
          </div>

          {/* 1. INSTAGRAM VIEW */}
          {currentPlatform === "instagram" && (
            <div className="flex-1 flex flex-col bg-black overflow-y-auto text-left font-sans text-xs pb-6">
              {/* Instagram App Top Bar */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80">
                <span className="font-serif font-bold text-base tracking-tight">Instagram</span>
                <div className="flex items-center gap-3 text-slate-300">
                  <Heart className="w-4 h-4" />
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>

              {/* Post Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={brandLogo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                      <span>{brandName}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-[10px] text-slate-400">Sponsored</span>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Post Media */}
              <div className="w-full aspect-square bg-slate-900 relative overflow-hidden flex items-center justify-center">
                {mediaType === "video" ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
                {price && (
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-black text-xs flex items-center gap-1 shadow-lg">
                    <ShoppingBag className="w-3 h-3 text-pink-400" />
                    <span>{price} SAR</span>
                    {discount && <span className="text-pink-400 font-bold text-[10px]">(-{discount}%)</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setLiked(!liked)} className="transition">
                      <Heart className={`w-5 h-5 ${liked ? "fill-pink-500 text-pink-500" : "text-white"}`} />
                    </button>
                    <MessageCircle className="w-5 h-5 text-white" />
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <button onClick={() => setSaved(!saved)}>
                    <Bookmark className={`w-5 h-5 ${saved ? "fill-white text-white" : "text-white"}`} />
                  </button>
                </div>

                <div className="font-bold text-xs">1,842 likes</div>

                {/* Caption */}
                <div className="text-xs leading-relaxed text-slate-200" dir="rtl">
                  <span className="font-bold text-white ml-1.5">{brandName}</span>
                  <span>{caption}</span>
                  {formattedHashtags && (
                    <span className="block mt-1 text-blue-400 text-[11px]">{formattedHashtags}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. TIKTOK VIEW */}
          {currentPlatform === "tiktok" && (
            <div className="flex-1 relative bg-black overflow-hidden flex flex-col justify-end">
              {/* Fullscreen Video / Media */}
              <div className="absolute inset-0 z-0">
                {mediaType === "video" ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
              </div>

              {/* Right Action Rail */}
              <div className="absolute right-2 bottom-16 z-20 flex flex-col items-center space-y-4 text-xs font-bold">
                <div className="relative">
                  <img
                    src={brandLogo}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold">
                    +
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Heart className="w-6 h-6 text-white drop-shadow" />
                  <span className="text-[10px] mt-0.5">84.2K</span>
                </div>

                <div className="flex flex-col items-center">
                  <MessageCircle className="w-6 h-6 text-white drop-shadow" />
                  <span className="text-[10px] mt-0.5">1.2K</span>
                </div>

                <div className="flex flex-col items-center">
                  <Share2 className="w-6 h-6 text-white drop-shadow" />
                  <span className="text-[10px] mt-0.5">Share</span>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center animate-spin">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="p-4 z-20 space-y-2 text-left" dir="rtl">
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>@{brandName.replace(/\s+/g, "_")}</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">موصى به</span>
                </div>
                <p className="text-xs text-slate-100 line-clamp-3 leading-relaxed drop-shadow-md">
                  {caption}
                </p>
                {formattedHashtags && (
                  <p className="text-[11px] text-cyan-300 font-bold">{formattedHashtags}</p>
                )}
              </div>
            </div>
          )}

          {/* 3. FACEBOOK VIEW */}
          {currentPlatform === "facebook" && (
            <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto text-left font-sans text-xs pb-6">
              {/* Facebook App Header */}
              <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                <span className="font-black text-blue-500 text-lg tracking-tighter">facebook</span>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Post Header */}
              <div className="p-3 flex items-center gap-2.5">
                <img src={brandLogo} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-white text-xs">{brandName}</div>
                  <div className="text-[10px] text-slate-400">Just now • 🌍 Public</div>
                </div>
              </div>

              {/* Text Caption */}
              <div className="px-3 pb-2 text-xs text-slate-200 leading-relaxed" dir="rtl">
                <p>{caption}</p>
                {formattedHashtags && (
                  <p className="mt-1 text-blue-400 text-[11px]">{formattedHashtags}</p>
                )}
              </div>

              {/* Post Image */}
              <div className="w-full aspect-[4/3] bg-black">
                <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Reactions Bar */}
              <div className="p-3 border-t border-slate-800 flex items-center justify-between text-slate-400 font-bold text-xs">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    👍
                  </div>
                  <span>248 Likes</span>
                </div>
                <span>42 Comments</span>
              </div>
            </div>
          )}

          {/* 4. WHATSAPP BROADCAST VIEW */}
          {currentPlatform === "whatsapp" && (
            <div className="flex-1 flex flex-col bg-[#0b141a] overflow-y-auto font-sans text-xs pb-6">
              {/* WhatsApp Chat Header */}
              <div className="px-3 py-2 bg-[#1f2c34] flex items-center gap-2.5 text-white">
                <img src={brandLogo} alt="" className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-xs">{brandName} (Official)</div>
                  <div className="text-[10px] text-emerald-400">Broadcast Channel</div>
                </div>
              </div>

              {/* Chat Bubble Area */}
              <div className="p-3 flex-1 space-y-3">
                <div className="max-w-[90%] bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-none space-y-2 shadow-md ml-auto" dir="rtl">
                  {/* Media Preview inside WhatsApp */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/40">
                    <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="font-bold text-xs text-amber-200">{title || brandName}</div>
                  <p className="text-xs leading-relaxed text-slate-100 whitespace-pre-line">{caption}</p>

                  {price && (
                    <div className="p-2 rounded-lg bg-black/20 text-xs font-bold text-amber-300">
                      السعر: {price} ريال {discount ? `(خصم ${discount}%)` : ""}
                    </div>
                  )}

                  <div className="flex justify-end items-center gap-1 text-[10px] text-emerald-200">
                    <span>9:41 AM</span>
                    <span>✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Home Indicator */}
          <div className="h-5 flex items-center justify-center pb-1">
            <div className="w-28 h-1 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
