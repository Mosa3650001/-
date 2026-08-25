import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Package,
  Plus,
  Search,
  Filter,
  Tag,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  DollarSign,
  Percent,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Video,
  Send,
  Sliders,
  ChevronDown,
  FolderPlus,
  ShoppingBag,
  Info,
  Check,
  RefreshCw,
} from "lucide-react";
import { CatalogProduct, ProductCategory, ProductDepartment } from "../types";

export const ProductsCatalogView: React.FC = () => {
  const {
    brands,
    currentBrandId,
    selectedBrand,
    products,
    categories,
    departments,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    createDepartment,
    deleteDepartment,
    generateProductSku,
    setActiveTab,
    setImportedIdeaForStudio,
    addToast,
  } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>(currentBrandId || "all");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);

  // New Product Form State
  const [formBrandId, setFormBrandId] = useState<string>(
    currentBrandId !== "all" ? currentBrandId : brands[0]?.id || ""
  );
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id || "");
  const [formDepartmentId, setFormDepartmentId] = useState(departments[0]?.id || "");
  const [formPrice, setFormPrice] = useState<number>(100);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(150);
  const [formStockQuantity, setFormStockQuantity] = useState<number>(25);
  const [formInStock, setFormInStock] = useState<boolean>(true);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formSizesInput, setFormSizesInput] = useState("S, M, L, XL");
  const [formColorsInput, setFormColorsInput] = useState("أسود, أبيض, كحلي");
  const [formTagsInput, setFormTagsInput] = useState("جديد, عرض_خاص, صيفي");
  const [formSku, setFormSku] = useState("");

  // New Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatCode, setNewCatCode] = useState("");
  const [newDepName, setNewDepName] = useState("");
  const [newDepCode, setNewDepCode] = useState("");
  const [newDepCatId, setNewDepCatId] = useState(categories[0]?.id || "");

  // Auto SKU update when brand/category/dep changes
  const handleRegenerateSku = () => {
    const sku = generateProductSku(formBrandId, formCategoryId, formDepartmentId);
    setFormSku(sku);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormBrandId(currentBrandId !== "all" ? currentBrandId : brands[0]?.id || "");
    setFormTitle("");
    setFormDescription("");
    setFormCategoryId(categories[0]?.id || "");
    setFormDepartmentId(departments[0]?.id || "");
    setFormPrice(120);
    setFormOriginalPrice(180);
    setFormStockQuantity(20);
    setFormInStock(true);
    setFormImageUrl("https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80");
    setFormVideoUrl("");
    setFormSizesInput("S, M, L, XL");
    setFormColorsInput("أسود, بيج, كحلي");
    setFormTagsInput("أحدث_صيحة, تخفيضات, شحن_مجاني");
    setFormSku(generateProductSku(formBrandId, categories[0]?.id, departments[0]?.id));
    setIsAddProductOpen(true);
  };

  const handleOpenEditModal = (prod: CatalogProduct) => {
    setEditingProduct(prod);
    setFormBrandId(prod.brandId || brands[0]?.id || "");
    setFormTitle(prod.title || "");
    setFormDescription(prod.description || "");
    setFormCategoryId(prod.categoryId || categories[0]?.id || "");
    setFormDepartmentId(prod.departmentId || departments[0]?.id || "");
    setFormPrice(prod.price || prod.suggestedPrice || 0);
    setFormOriginalPrice(prod.originalPrice || 0);
    setFormStockQuantity(prod.stockQuantity ?? 10);
    setFormInStock(prod.inStock !== false);
    setFormImageUrl(prod.mediaUrls?.[0] || prod.image || "");
    setFormVideoUrl(prod.videoUrl || "");
    setFormSizesInput(Array.isArray(prod.sizes) ? prod.sizes.join(", ") : "");
    setFormColorsInput(Array.isArray(prod.colors) ? prod.colors.join(", ") : "");
    setFormTagsInput(Array.isArray(prod.tags) ? prod.tags.join(", ") : "");
    setFormSku(prod.sku || generateProductSku(prod.brandId, prod.categoryId, prod.departmentId));
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast({ type: "warning", title: "يرجى كتابة اسم المنتج أو الخدمة" });
      return;
    }

    const targetCat = categories.find((c) => c.id === formCategoryId);
    const targetDep = departments.find((d) => d.id === formDepartmentId);

    const sizes = formSizesInput.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = formColorsInput.split(",").map((c) => c.trim()).filter(Boolean);
    const tags = formTagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const mediaUrls = formImageUrl ? [formImageUrl] : [];

    const discountPercentage =
      formOriginalPrice > formPrice
        ? Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)
        : 0;

    const payload: Omit<CatalogProduct, "id" | "createdAt" | "updatedAt"> = {
      sku: formSku || generateProductSku(formBrandId, formCategoryId, formDepartmentId),
      brandId: formBrandId,
      title: formTitle.trim(),
      description: formDescription.trim(),
      categoryId: formCategoryId,
      categoryCode: targetCat?.code || "CAT",
      departmentId: formDepartmentId,
      departmentCode: targetDep?.code || "DEP",
      price: Number(formPrice),
      originalPrice: Number(formOriginalPrice),
      discountPercentage,
      stockQuantity: Number(formStockQuantity),
      inStock: formInStock,
      mediaUrls,
      image: formImageUrl,
      suggestedPrice: Number(formPrice),
      videoUrl: formVideoUrl.trim() || undefined,
      sizes,
      colors,
      tags,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      createProduct(payload);
    }

    setIsAddProductOpen(false);
    setEditingProduct(null);
  };

  const handleCreatePostForProduct = (prod: CatalogProduct) => {
    // Transfer product details to PostStudio
    const brand = brands.find((b) => b.id === prod.brandId);
    setImportedIdeaForStudio({
      id: `idea-prod-${prod.id}`,
      brandId: prod.brandId,
      brandName: brand?.name || "المتجر",
      title: `عرض حصري: ${prod.title} (رمز: ${prod.sku})`,
      hook: `لا تفوّت عرض ${prod.title} الآن بخصم حصري!`,
      captionDraft: prod.description || `تسوق الآن ${prod.title} بأفضل سعر وجودة مضمونة!`,
      contentType: "single_image",
      targetPlatforms: ["facebook", "instagram"],
      stage: "ready",
      hashtags: prod.tags?.map((t) => `#${t}`) || ["#عروض", "#تسوق"],
      productName: prod.title,
      productImage: prod.mediaUrls?.[0] || prod.image,
      productPrice: prod.price || prod.suggestedPrice,
      productDiscount: prod.discountPercentage,
      priority: "high",
      isAiGenerated: true,
      notes: `SKU: ${prod.sku} | الألوان: ${prod.colors?.join(", ")} | المقاسات: ${prod.sizes?.join(", ")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setActiveTab("studio");
    addToast({
      type: "success",
      title: `🚀 تم نقل بيانات المنتج (${prod.title}) لاستوديو النشر!`,
      description: "يمكنك الآن صياغة منشور إعلاني بالذكاء الاصطناعي وجدولته فوراً.",
    });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedBrandFilter !== "all" && p.brandId !== selectedBrandFilter) return false;
    if (selectedCategoryFilter !== "all" && p.categoryId !== selectedCategoryFilter) return false;
    if (inStockOnly && p.inStock === false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (p.title || "").toLowerCase().includes(q);
      const matchSku = (p.sku || "").toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSku && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" id="products-catalog-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">كتالوج المنتجات والخدمات والمخزون</h1>
          </div>
          <p className="text-sm text-slate-400">
            إدارة متكاملة لمنتجات ومخزون كل براند بنظام أكواد تسلسلية هرمية (SKU) وتوليد المنشورات الإعلانية بضغطة زر.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsManageCatsOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>إدارة التصنيفات والأقسام</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج / خدمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، كود الـ SKU (مثال: SP365-CLOTH-MSHIRT-1042)، أو الوسوم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">جميع المتاجر والبراندات</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">جميع التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingBag className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">لا توجد منتجات مطابقة في الكتالوج</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            أضف منتجاتك وخدماتك الحقيقية بصورها وأسعارها وتخفيضاتها ليتمكن الذكاء الاصطناعي من صياغة منشورات احترافية تلقائية لها.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول منتج للكتالوج الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const prodBrand = brands.find((b) => b.id === prod.brandId);
            const mainImg = prod.mediaUrls?.[0] || prod.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80";

            return (
              <div
                key={prod.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col group"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={mainImg}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Discount Badge */}
                  {prod.discountPercentage ? (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                      خصم {prod.discountPercentage}%
                    </span>
                  ) : null}

                  {/* Stock Status */}
                  <span
                    className={`absolute bottom-3 right-3 text-xs px-2 py-0.5 rounded-md font-medium backdrop-blur-md ${
                      prod.inStock
                        ? "bg-emerald-500/80 text-white"
                        : "bg-rose-500/80 text-white"
                    }`}
                  >
                    {prod.inStock ? `متوفر (${prod.stockQuantity} قطعة)` : "نفد من المخزون"}
                  </span>

                  {/* Brand Tag */}
                  {prodBrand && (
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: prodBrand.primaryColor || "#3B82F6" }}
                      />
                      {prodBrand.name}
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* SKU Code */}
                    <div className="text-[11px] font-mono font-medium text-indigo-400 mb-1">
                      {prod.sku || "SKU-GEN"}
                    </div>

                    <h3 className="font-bold text-slate-100 text-base line-clamp-1">{prod.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description || "لا يوجد وصف مدخل لهذا المنتج."}
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-emerald-400">
                          {prod.price || prod.suggestedPrice} ر.س
                        </span>
                        {prod.originalPrice && prod.originalPrice > (prod.price || 0) && (
                          <span className="text-xs text-slate-500 line-through">
                            {prod.originalPrice} ر.س
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sizes / Colors Summary */}
                    {prod.sizes && prod.sizes.length > 0 && (
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {prod.sizes.length} مقاسات
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => handleCreatePostForProduct(prod)}
                      className="col-span-2 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>صناعة منشور إعلاني</span>
                    </button>

                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition"
                        title="تعديل المنتج"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف المنتج (${prod.title})؟`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">
                    {editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج / خدمة جديدة"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    أدخل تفاصيل المنتج ليتم ربطه بالمتجر وتوليد رمز تسلسلي هرمي فريد.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">المتجر / البراند</label>
                  <select
                    value={formBrandId}
                    onChange={(e) => {
                      setFormBrandId(e.target.value);
                      const sku = generateProductSku(e.target.value, formCategoryId, formDepartmentId);
                      setFormSku(sku);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SKU Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">رمز المنتج (SKU)</label>
                    <button
                      type="button"
                      onClick={handleRegenerateSku}
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      توليد جديد
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-slate-800 font-mono text-indigo-300 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Product Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم المنتج / الخدمة</label>
                <input
                  type="text"
                  placeholder="مثال: قميص كتان صيفي كلاسيكي بياقة أنيقة"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">التصنيف الرئيسي</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      setFormCategoryId(e.target.value);
                      const sku = generateProductSku(formBrandId, e.target.value, formDepartmentId);
                      setFormSku(sku);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">القسم الفرعي</label>
                  <select
                    value={formDepartmentId}
                    onChange={(e) => {
                      setFormDepartmentId(e.target.value);
                      const sku = generateProductSku(formBrandId, formCategoryId, e.target.value);
                      setFormSku(sku);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">السعر الفعلي (ر.س)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الكمية بالمخزون</label>
                  <input
                    type="number"
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Media URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">رابط صورة المنتج (URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">وصف المنتج وتفاصيل الخامة</label>
                <textarea
                  rows={3}
                  placeholder="وصف تفصيلي يبرز مميزات القطعة، الخامة، طريقة الغسيل، أسباب الشراء..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sizes, Colors, Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">المقاسات (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={formSizesInput}
                    onChange={(e) => setFormSizesInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الألوان (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={formColorsInput}
                    onChange={(e) => setFormColorsInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* In-Stock Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formInStock}
                  onChange={(e) => setFormInStock(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="inStockCheck" className="text-sm text-slate-300 cursor-pointer">
                  المنتج متوفر وجاهز للطلب الفوري في المخزن
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  {editingProduct ? "حفظ التعديلات ومزامنتها" : "إضافة المنتج وحفظه سحابياً"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories & Departments Modal */}
      {isManageCatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-lg">هيكلية التصنيفات والأقسام</h3>
              </div>
              <button
                onClick={() => setIsManageCatsOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1.5"
              >
                ✕
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">التصنيفات الرئيسية المسجلة</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                        {c.code}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{c.name}</span>
                    </div>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="text-slate-500 hover:text-red-400 p-1 text-xs"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Category Form */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="اسم التصنيف (مثال: الإلكترونيات)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                />
                <input
                  type="text"
                  placeholder="الكود (مثال: ELEC)"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCatName && newCatCode) {
                      createCategory({
                        code: newCatCode.trim(),
                        name: newCatName.trim(),
                        nameAr: newCatName.trim(),
                      });
                      setNewCatName("");
                      setNewCatCode("");
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Existing Departments List */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">الأقسام الفرعية المسجلة</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {departments.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                        {d.code}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{d.name}</span>
                    </div>
                    <button
                      onClick={() => deleteDepartment(d.id)}
                      className="text-slate-500 hover:text-red-400 p-1 text-xs"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Department Form */}
              <div className="flex items-center gap-2 pt-2">
                <select
                  value={newDepCatId}
                  onChange={(e) => setNewDepCatId(e.target.value)}
                  className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-200"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="اسم القسم الفرعي (مثال: أطقم نسائية)"
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                />
                <input
                  type="text"
                  placeholder="الكود (مثال: WSET)"
                  value={newDepCode}
                  onChange={(e) => setNewDepCode(e.target.value.toUpperCase())}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDepName && newDepCode) {
                      createDepartment({
                        categoryId: newDepCatId,
                        code: newDepCode.trim(),
                        name: newDepName.trim(),
                        nameAr: newDepName.trim(),
                      });
                      setNewDepName("");
                      setNewDepCode("");
                    }
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
                >
                  إضافة
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsManageCatsOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
