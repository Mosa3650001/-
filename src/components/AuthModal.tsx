import React, { useState } from "react";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useApp } from "../context/AppContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { addToast, teamMembers, createTeamMember, setCurrentUser } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        // Find existing team member or match
        const matchedMember = teamMembers.find(
          (m) => m.email.toLowerCase() === fbUser.email?.toLowerCase()
        );

        if (matchedMember) {
          setCurrentUser(matchedMember);
        }

        addToast({
          type: "success",
          title: "تم تسجيل الدخول بنجاح! 👋",
          description: `أهلاً بك مجدداً ${fbUser.displayName || fbUser.email}`,
        });
        onClose();
      } else {
        if (!name.trim()) {
          setErrorMessage("يرجى إدخال اسمك الكامل أو اسم المساعد");
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName: name });

        // Add to team members
        const newMember = createTeamMember({
          name: name.trim(),
          email: fbUser.email || email,
          role: "editor",
          roleLabel: "مساعد محتوى ومحرر",
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
          assignedBrandIds: ["all"],
          permissions: {
            canCreatePosts: true,
            canPublishDirectly: false,
            canSchedulePosts: true,
            canReplyInbox: true,
            canManageStoreSettings: false,
            canUseAiTools: true,
          },
          status: "active",
        });

        setCurrentUser(newMember);

        addToast({
          type: "success",
          title: "تم إنشاء الحساب بنجاح! 🚀",
          description: "تم تعيينك بصلاحيات محرر محتوى.",
        });
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = "حدث خطأ أثناء المصادقة، يرجى التحقق من البيانات والمحاولة مجدداً.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "بيانات تسجيل الدخول غير صحيحة (البريد أو كلمة المرور).";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول.";
      } else if (err.code === "auth/weak-password") {
        msg = "كلمة المرور ضعيفة، يرجى إدخال 6 خانات على الأقل.";
      } else if (err.code === "auth/user-not-found") {
        msg = "لا يوجد حساب مسجل بهذا البريد الإلكتروني.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const matched = teamMembers.find(
        (m) => m.email.toLowerCase() === user.email?.toLowerCase()
      );

      if (matched) {
        setCurrentUser(matched);
      } else {
        const newMember = createTeamMember({
          name: user.displayName || "مستخدم جديد",
          email: user.email || "",
          role: "editor",
          roleLabel: "مساعد محتوى ومحرر",
          avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          assignedBrandIds: ["all"],
          permissions: {
            canCreatePosts: true,
            canPublishDirectly: false,
            canSchedulePosts: true,
            canReplyInbox: true,
            canManageStoreSettings: false,
            canUseAiTools: true,
          },
          status: "active",
        });
        setCurrentUser(newMember);
      }

      addToast({
        type: "success",
        title: "تم تسجيل الدخول عبر Google بنجاح!",
        description: `أهلاً بك ${user.displayName || user.email}`,
      });
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMessage("تعذر إتمام الدخول عبر Google، يرجى المحاولة باستخدام البريد وكلمة المرور.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 text-right relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>نظام المصادقة وحماية المتاجر</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {mode === "login" ? "تسجيل الدخول للمنصة" : "إنشاء حساب مساعد جديد"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === "login"
              ? "أدخل بياناتك للوصول إلى المتاجر وتنسيق النشر المباشر والردود."
              : "أنشئ حساباً للمساعد لتحديد المتاجر والصلاحيات المسموحة له."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>الاسم الكامل</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد المحمد"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>البريد الإلكتروني</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-left"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>كلمة المرور</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-left"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>جاري المعالجة...</span>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>إنشاء الحساب وتفعيله</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-[#0f172a] px-3 text-[11px] font-bold text-slate-400 absolute">
            أو
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>المتابعة باستخدام حساب Google</span>
        </button>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === "login" ? (
            <span>
              ليس لديك حساب؟{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage("");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </span>
          ) : (
            <span>
              لديك حساب بالفعل؟{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
