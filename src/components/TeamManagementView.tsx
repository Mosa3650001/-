import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  Check,
  X,
  Mail,
  UserCheck,
  Sparkles,
  Layers,
  Lock,
} from "lucide-react";
import { TeamMember, TeamRole } from "../types";

export const TeamManagementView: React.FC = () => {
  const {
    teamMembers,
    currentUser,
    setCurrentUser,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    brands,
    addToast,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("editor");
  const [assignedBrandIds, setAssignedBrandIds] = useState<string[]>(brands.map((b) => b.id));
  const [permissions, setPermissions] = useState({
    canCreatePosts: true,
    canPublishDirectly: false,
    canSchedulePosts: true,
    canReplyInbox: true,
    canManageStoreSettings: false,
    canUseAiTools: true,
  });

  const openAddModal = () => {
    setName("");
    setEmail("");
    setRole("editor");
    setAssignedBrandIds(brands.map((b) => b.id));
    setPermissions({
      canCreatePosts: true,
      canPublishDirectly: false,
      canSchedulePosts: true,
      canReplyInbox: true,
      canManageStoreSettings: false,
      canUseAiTools: true,
    });
    setEditingMember(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setAssignedBrandIds(member.assignedBrandIds || []);
    setPermissions({
      canCreatePosts: Boolean(member.permissions?.canCreatePosts),
      canPublishDirectly: Boolean(member.permissions?.canPublishDirectly),
      canSchedulePosts: Boolean(member.permissions?.canSchedulePosts ?? member.permissions?.canEditSchedule),
      canReplyInbox: Boolean(member.permissions?.canReplyInbox),
      canManageStoreSettings: Boolean(member.permissions?.canManageStoreSettings ?? member.permissions?.canManageBrands),
      canUseAiTools: Boolean(member.permissions?.canUseAiTools ?? true),
    });
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      addToast({ type: "warning", title: "يرجى كتابة الاسم والبريد الإلكتروني" });
      return;
    }

    let roleLabel = "مساعد نشر ومحرر محتوى";
    if (role === "admin") roleLabel = "مدير المنصة (كامل الصلاحيات)";
    else if (role === "customer_support") roleLabel = "خدمة عملاء وردود";
    else if (role === "viewer") roleLabel = "مراقب إحصائيات فقط";

    if (editingMember) {
      updateTeamMember(editingMember.id, {
        name,
        email,
        role,
        roleLabel,
        assignedBrandIds,
        permissions,
      });
      addToast({ type: "success", title: "تم تحديث بيانات المساعد بنجاح" });
    } else {
      createTeamMember({
        name,
        email,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=100&auto=format&fit=crop&q=80`,
        role,
        roleLabel,
        assignedBrandIds,
        permissions,
        status: "active",
      });
      addToast({ type: "success", title: "تمت إضافة المساعد الجديد بنجاح" });
    }

    setIsAddModalOpen(false);
  };

  const toggleBrandAssignment = (brandId: string) => {
    if (assignedBrandIds.includes(brandId)) {
      if (assignedBrandIds.length === 1) {
        addToast({ type: "warning", title: "يجب تعيين متجر واحد على الأقل للمساعد" });
        return;
      }
      setAssignedBrandIds(assignedBrandIds.filter((id) => id !== brandId));
    } else {
      setAssignedBrandIds([...assignedBrandIds, brandId]);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>إدارة فريق العمل والمساعدين</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">المساعدين وتوزيع الصلاحيات على المتاجر</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            إضافة مساعدين وتحديد أي المتاجر يحق لهم النشر فيها وما إذا كان بإمكانهم النشر المباشر أو الرد على الزبائن.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ إضافة مساعد جديد</span>
        </button>
      </div>

      {/* Team Members Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const isCurrent = currentUser.id === member.id;
          return (
            <div
              key={member.id}
              className={`p-5 rounded-3xl border transition space-y-4 text-right relative flex flex-col justify-between ${
                isCurrent
                  ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                  : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header with avatar & role */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                            أنت حالياً
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{member.roleLabel}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(member)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                      title="تعديل الصلاحيات"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteTeamMember(member.id)}
                        className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Assigned Brands */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>المتاجر المخوّل بالنشر فيها:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.assignedBrandIds.map((bId) => {
                      const brand = brands.find((b) => b.id === bId);
                      if (!brand) return null;
                      return (
                        <span
                          key={bId}
                          className="text-[10px] px-2 py-0.5 rounded-md font-bold text-white shadow-xs"
                          style={{ backgroundColor: brand.primaryColor }}
                        >
                          {brand.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Permission Badges */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الصلاحيات الممنوحة:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div
                      className={`flex items-center gap-1 font-medium ${
                        member.permissions.canPublishDirectly ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 line-through"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>نشر فوري مباشر</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 font-medium ${
                        member.permissions.canSchedulePosts ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 line-through"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>جدولة المواعيد</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 font-medium ${
                        member.permissions.canReplyInbox ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 line-through"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>الرد على الزبائن</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 font-medium ${
                        member.permissions.canUseAiTools ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 line-through"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>أدوات الذكاء الاصطناعي</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Switch button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(member);
                    addToast({
                      type: "info",
                      title: `تم التبديل إلى حساب (${member.name})`,
                      description: `أنت تعمل الآن بصلاحيات: ${member.roleLabel}`,
                    });
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-default"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isCurrent ? "الحساب النشط حالياً" : "تجربة العمل بهذا الحساب"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingMember ? "تعديل صلاحيات المساعد" : "إضافة مساعد جديد للمنصة"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">اسم المساعد:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: خالد العتيبي"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="khalid@fashionhub.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">نوع الدور الأساسي:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamRole)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="editor">محرر ومصمم محتوى (نشر وجدولة)</option>
                  <option value="customer_support">خدمة عملاء (ردود على التعليقات والرسائل)</option>
                  <option value="viewer">مراقب إحصائيات ومحلل أداء فقط</option>
                  <option value="admin">مدير عام (كامل الصلاحيات)</option>
                </select>
              </div>

              {/* Assign Brands */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">المتاجر التي يحق له إدارتها:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {brands.map((b) => {
                    const isSelected = assignedBrandIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBrandAssignment(b.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-right transition ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.primaryColor }} />
                          <span className="truncate">{b.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">الصلاحيات الدقيقة:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPublishDirectly}
                      onChange={(e) => setPermissions({ ...permissions, canPublishDirectly: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">النشر الفوري المباشر</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canSchedulePosts}
                      onChange={(e) => setPermissions({ ...permissions, canSchedulePosts: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">جدولة المنشورات</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canReplyInbox}
                      onChange={(e) => setPermissions({ ...permissions, canReplyInbox: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">الرد على الرسائل والتعليقات</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canUseAiTools}
                      onChange={(e) => setPermissions({ ...permissions, canUseAiTools: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">استخدام أدوات الذكاء الاصطناعي</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/25"
                >
                  {editingMember ? "حفظ التعديلات" : "إضافة المساعد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
