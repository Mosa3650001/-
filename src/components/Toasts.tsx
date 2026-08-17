import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle;
        let borderColor = "border-emerald-500/30";
        let iconColor = "text-emerald-400";
        let bg = "bg-slate-850/95";

        if (toast.type === "error") {
          Icon = AlertCircle;
          borderColor = "border-rose-500/30";
          iconColor = "text-rose-400";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          borderColor = "border-amber-500/30";
          iconColor = "text-amber-400";
        } else if (toast.type === "info") {
          Icon = Info;
          borderColor = "border-indigo-500/30";
          iconColor = "text-indigo-400";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl ${bg} backdrop-blur-md border ${borderColor} shadow-2xl flex items-start gap-3 text-right animate-in fade-in slide-in-from-bottom-3 duration-200`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white leading-tight">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
