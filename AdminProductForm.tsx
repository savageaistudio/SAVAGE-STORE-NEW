import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Sparkles,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Package,
  CheckCircle2
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { uploadImageWithFallback } from '../../lib/imageUpload';
import { useStore } from '../../context/StoreContext';
import { Product, ProductColor, ProductVariant, Gender } from '../../types';

interface AdminProductFormProps {
  initialProduct?: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const PRESET_COLORS: ProductColor[] = [
  { name: 'Jet Black', hex: '#111111' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Heather Gray', hex: '#6b7280' },
  { name: 'Olive Green', hex: '#3f6212' },
];

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  onSaved,
  onCancel,
}) => {
  const { categories, refreshProducts } = useStore();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [description, setDescription] = useState(
    initialProduct?.description || 'প্রিমিয়াম কোয়ালিটি ১০০% সুতি কটন ফেব্রিক, আরামদায়ক ও ড্রপ-শোল্ডার ওভারসাইজ ফিটিং।'
  );
  const [categoryId, setCategoryId] = useState(
    initialProduct?.categoryId || categories[0]?.id || 'cat_tshirts'
  );
  const [brand, setBrand] = useState(initialProduct?.brand || 'SAVAGE STORE');
  const [gender, setGender] = useState<Gender>(initialProduct?.gender || 'Unisex');
  const [fabric, setFabric] = useState(
    initialProduct?.fabric || '100% Combed Cotton (240 GSM Heavyweight)'
  );

  // Pricing & Stock
  const [price, setPrice] = useState<number>(initialProduct?.price || 950);
  const [salePrice, setSalePrice] = useState<number | undefined>(
    initialProduct?.salePrice || undefined
  );
  const [totalStock, setTotalStock] = useState<number>(initialProduct?.totalStock ?? 30);

  // Images
  const [images, setImages] = useState<string[]>(
    initialProduct?.images?.length ? initialProduct.images : [OFFICIAL_LOGO_PATH]
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sizes & Colors
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialProduct?.sizes?.length ? initialProduct.sizes : ['M', 'L', 'XL']
  );
  const [colors, setColors] = useState<ProductColor[]>(
    initialProduct?.colors?.length
      ? initialProduct.colors
      : [{ name: 'Jet Black', hex: '#111111' }, { name: 'Pure White', hex: '#ffffff' }]
  );

  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#ef4444');

  // Flags
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [featured, setFeatured] = useState(initialProduct?.featured ?? true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialProduct) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated || `drop-${Date.now().toString().slice(-4)}`);
      if (!sku) {
        setSku(`SVG-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  };

  // Multiple image upload handler with canvas compression & fallback
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg('');
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const downloadUrl = await uploadImageWithFallback(files[i], 'products');
        newUrls.push(downloadUrl);
      } catch (err: any) {
        console.warn('Image upload notice:', err);
      }
    }

    if (newUrls.length > 0) {
      // If previous images only had default logo, replace it
      if (images.length === 1 && images[0] === OFFICIAL_LOGO_PATH) {
        setImages(newUrls);
      } else {
        setImages((prev) => [...prev, ...newUrls]);
      }
      setSuccessMsg(`${newUrls.length} টি ছবি সফলভাবে যোগ হয়েছে!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setUploadingImage(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      if (selectedSizes.length === 1) return; // Keep at least one size
      setSelectedSizes(selectedSizes.filter((s) => s !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const togglePresetColor = (c: ProductColor) => {
    const exists = colors.some((col) => col.name === c.name);
    if (exists) {
      if (colors.length === 1) return;
      setColors(colors.filter((col) => col.name !== c.name));
    } else {
      setColors([...colors, c]);
    }
  };

  const addCustomColor = () => {
    if (!customColorName.trim()) return;
    const newCol: ProductColor = {
      name: customColorName.trim(),
      hex: customColorHex
    };
    if (!colors.some((c) => c.name.toLowerCase() === newCol.name.toLowerCase())) {
      setColors([...colors, newCol]);
    }
    setCustomColorName('');
  };

  const removeColor = (colorName: string) => {
    if (colors.length === 1) return;
    setColors(colors.filter((c) => c.name !== colorName));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('প্রোডাক্টের নাম লিখুন (Product name is required)');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('কমপক্ষে একটি ছবি আপলোড করুন (Please upload at least one image)');
      return;
    }

    setSaving(true);
    try {
      const prodId = initialProduct?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const selectedCategory = categories.find((c) => c.id === categoryId);

      // Auto-generate variants evenly from sizes and colors
      const countCombinations = Math.max(1, selectedSizes.length * colors.length);
      const stockPerVariant = Math.max(1, Math.round(totalStock / countCombinations));

      const variants: ProductVariant[] = [];
      for (const s of selectedSizes) {
        for (const c of colors) {
          variants.push({
            id: `${s}-${c.name}`.toLowerCase().replace(/\s+/g, '-'),
            sku: `${sku || 'SVG'}-${s}-${c.name.slice(0, 2).toUpperCase()}`,
            size: s,
            colorName: c.name,
            colorHex: c.hex,
            stock: stockPerVariant
          });
        }
      }

      const payload: Product = {
        id: prodId,
        name: name.trim(),
        slug: slug.trim() || `prod-${prodId}`,
        sku: sku.trim() || `SVG-${Date.now().toString().slice(-4)}`,
        description: description.trim(),
        categoryId: categoryId || categories[0]?.id || 'cat_all',
        categoryName: selectedCategory?.name || 'Streetwear Apparel',
        brand: brand.trim() || 'SAVAGE STORE',
        gender,
        fabric: fabric.trim(),
        images,
        thumbnail: images[0] || OFFICIAL_LOGO_PATH,
        price: Number(price),
        salePrice: salePrice && Number(salePrice) < Number(price) ? Number(salePrice) : undefined,
        sizes: selectedSizes,
        colors,
        variants,
        totalStock: Number(totalStock),
        tags: [gender.toLowerCase(), 'streetwear', 'cotton', selectedCategory?.name?.toLowerCase() || 'apparel'].filter(Boolean),
        featured,
        newArrival: true,
        bestSeller: false,
        active,
        createdAt: initialProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'products', prodId), payload);
      await refreshProducts();
      setSuccessMsg('প্রোডাক্ট সফলভাবে সেভ হয়েছে!');
      setTimeout(() => {
        onSaved();
      }, 500);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'প্রোডাক্ট সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 border border-neutral-300 hover:border-black rounded-xl hover:bg-neutral-50 text-neutral-700 transition-colors"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-neutral-900">
              {initialProduct ? 'প্রোডাক্ট এডিট করুন (Edit Product)' : 'নতুন প্রোডাক্ট যোগ করুন (Add New Product)'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              সহজ উপায়ে নাম, দাম, ছবি এবং সাইজ সিলেক্ট করে প্রোডাক্ট পাবলিশ করুন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-neutral-500 hover:text-black"
        >
          বাতিল (Cancel)
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Photos (Upload Image Only - NO URL) */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>১. প্রোডাক্টের ছবি আপলোড (Product Photos)</span>
                <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                কম্পিউটার বা ফোন থেকে ছবি সিলেক্ট করুন। প্রথম ছবিটি প্রধান থাম্বনেইল হিসেবে শো করবে।
              </p>
            </div>
          </div>

          {/* Upload Dropzone / Button */}
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-red-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800">
                  {uploadingImage ? 'ছবি আপলোড হচ্ছে...' : 'ক্লিক করে ছবি আপলোড করুন (বা ড্র্যাগ করুন)'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  একসাথে একাধিক ছবি সিলেক্ট করা যাবে (JPG, PNG, WebP)
                </p>
              </div>
            </div>

            {/* Uploaded Photos Grid */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-28 rounded-xl border border-neutral-200 overflow-hidden shadow-xs group bg-neutral-100"
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                      title="মুছে ফেলুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[9px] text-center font-bold py-0.5 uppercase tracking-wider">
                        মূল ছবি (Main)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Basic Info */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" />
            <span>২. প্রোডাক্টের তথ্য (Basic Details)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                প্রোডাক্টের নাম (Product Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: SAVAGE Heavyweight Drop-Shoulder Oversized Tee"
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-bold text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                ক্যাটাগরি (Category)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="cat_tshirts">T-Shirts & Oversized</option>
                    <option value="cat_hoodies">Hoodies & Fleece</option>
                    <option value="cat_pants">Pants & Cargo</option>
                    <option value="cat_caps">Caps & Headwear</option>
                    <option value="cat_accessories">Accessories</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                কার জন্য (Gender / Target)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
              >
                <option value="Unisex">Unisex (উভয়ের জন্য)</option>
                <option value="Men">Men (ছেলেদের জন্য)</option>
                <option value="Women">Women (মেয়েদের জন্য)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                কাপড় ও কোয়ালিটি (Fabric / GSM)
              </label>
              <input
                type="text"
                placeholder="যেমন: 100% Combed Cotton, 240 GSM"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                প্রোডাক্ট কোড বা SKU
              </label>
              <input
                type="text"
                placeholder="SVG-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-mono uppercase bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                বিবরণ / ডেসক্রিপশন (Description)
              </label>
              <textarea
                rows={3}
                placeholder="প্রোডাক্টের সুবিধা, সাইজ ফিটিং এবং ধোয়ার নিয়ম..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Pricing & Stock */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>৩. দাম ও স্টক পরিমাণ (Price & Stock Quantity)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                রেগুলার দাম (BDT ৳) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">৳</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 text-xs font-mono font-extrabold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                অফার / ডিসকাউন্ট দাম (৳) (ঐচ্ছিক)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">৳</span>
                <input
                  type="number"
                  placeholder="যেমন: 790"
                  value={salePrice || ''}
                  onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                মোট স্টক সংখ্যা (Total Stock) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={totalStock}
                onChange={(e) => setTotalStock(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Available Sizes & Colors (Clean Clickable Buttons) */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" />
            <span>৪. সাইজ ও কালার অপশন (Available Sizes & Colors)</span>
          </h3>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-2">
              পাওয়া যাবে এমন সাইজসমূহ সিলেক্ট করুন:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`min-w-[48px] py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                    }`}
                  >
                    {sz} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-2">
              পাওয়া যাবে এমন কালারসমূহ:
            </label>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              {PRESET_COLORS.map((pc) => {
                const isSelected = colors.some((c) => c.name === pc.name);
                return (
                  <button
                    key={pc.name}
                    type="button"
                    onClick={() => togglePresetColor(pc)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-black bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: pc.hex }}
                    />
                    <span>{pc.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Add */}
            <div className="flex items-center gap-2 max-w-sm pt-1">
              <input
                type="text"
                placeholder="নতুন কালার (যেমন: Maroon)"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl"
              />
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-10 h-8 rounded border border-neutral-300 cursor-pointer"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-3 py-1.5 bg-neutral-800 text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                যুক্ত করুন
              </button>
            </div>
          </div>
        </div>

        {/* Step 5: Visibility Toggle */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase text-neutral-900">
              ওয়েবসাইটে সরাসরি দেখাবে (Active on Store)
            </h4>
            <p className="text-xs text-neutral-500">
              টিক চিহ্ন দেওয়া থাকলে কাস্টমাররা এখনই পণ্যটি কিনতে পারবেন।
            </p>
          </div>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-5 h-5 accent-red-600 rounded cursor-pointer"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-neutral-300 hover:border-black rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            বাতিল (Cancel)
          </button>
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : initialProduct ? 'পণ্য আপডেট করুন (Update)' : 'পণ্য পাবলিশ করুন (Publish)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
