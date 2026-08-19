import React from "react";
import { Sparkles, Zap } from "lucide-react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  showTagline = false,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-7 h-7 text-xs rounded-lg",
    md: "w-9 h-9 text-sm rounded-xl",
    lg: "w-12 h-12 text-base rounded-2xl",
    xl: "w-16 h-16 text-xl rounded-3xl",
  };

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl md:text-3xl",
  };

  const zapSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} dir="rtl">
      {/* Visual Logo Emblem */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 p-[2px] shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0 group relative overflow-hidden transition-transform duration-300 hover:scale-105`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[inherit] flex items-center justify-center relative overflow-hidden">
          {/* Subtle glowing animated gradient behind the icon */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-amber-500/30 opacity-75 group-hover:opacity-100 transition-opacity" />
          <Zap className={`${zapSizes[size]} text-amber-400 fill-amber-400/40 relative z-10`} />
          <Sparkles className="w-2.5 h-2.5 text-indigo-300 absolute top-1 right-1 z-10 animate-pulse" />
        </div>
      </div>

      {/* Typography Branding */}
      <div className="flex flex-col text-right">
        <div className={`font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1.5 ${titleSizes[size]}`}>
          <span className="bg-gradient-to-l from-indigo-600 via-purple-600 to-indigo-500 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
            SmartPost
          </span>
          <span className="font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono text-[10px] md:text-xs tracking-normal shadow-xs">
            365
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            المنصة الذكية لإدارة ونشر محتوى المتاجر
          </span>
        )}
      </div>
    </div>
  );
};
