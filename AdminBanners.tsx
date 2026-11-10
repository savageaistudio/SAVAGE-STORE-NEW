import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  AlertCircle,
  Check,
  Sparkles,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { uploadImageWithFallback } from '../../lib/imageUpload';
import { Banner } from '../../types';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState(OFFICIAL_LOGO_PATH);
  const [buttonText, setButtonText] = useState('Explore Drop');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'banners'));
      const list: Banner[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Banner));
      setBanners(list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    } catch (e: any) {
      console.warn('Banners load err:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImage(b.image);
    setButtonText(b.buttonText || 'Explore Drop');
    setButtonLink(b.buttonLink || '/shop');
    setSortOrder(b.sortOrder || 1);
    setActive(b.active);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage(OFFICIAL_LOGO_PATH);
    setButtonText('Explore Drop');
    setButtonLink('/shop');
    setSortOrder(banners.length + 1);
    setActive(true);
    setErrorMsg('');
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const downloadUrl = await uploadImageWithFallback(file, 'banners');
      setImage(downloadUrl);
      setSuccessMsg('ছবি সফলভাবে আপলোড হয়েছে! (Image uploaded successfully!)');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Banner upload err:', err);
      setErrorMsg(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      setErrorMsg('ব্যানারের শিরোনাম এবং ছবি আবশ্যক। (Title & Image are required)');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const id = editingBanner?.id || `bnr_${Date.now()}`;
      const payload: Banner = {
        id,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        image: image.trim(),
        buttonText: buttonText.trim() || 'Explore Drop',
        buttonLink: buttonLink.trim() || '/shop',
        sortOrder: Number(sortOrder) || 1,
        active
      };

      await setDoc(doc(db, 'banners', id), payload);
      await fetchBanners();
      resetForm();
      setSuccessMsg('ব্যানার সফলভাবে সংরক্ষিত হয়েছে! (Banner saved successfully!)');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error('Banner save error:', err);
      setErrorMsg(err.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ব্যানারটি ডিলিট করতে চান? (Delete this banner?)')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      await fetchBanners();
      setSuccessMsg('ব্যানার ডিলিট করা হয়েছে।');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      console.error('Delete banner error:', e);
      setErrorMsg(e.message || 'Failed to delete banner.');
    }
  };

  // Helper to load 3 high-fashion editorial streetwear banners
  const handleLoadFashionBanners = async () => {
    setSaving(true);
    try {
      const presets: Banner[] = [
        {
          id: `bnr_fashion_1`,
          title: 'URBAN NOIR // DROP 01',
          subtitle: 'Heavyweight 240+ GSM Combed Cotton • Drop-Shoulder Oversized Silhouettes',
          image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1920&q=80',
          buttonText: 'Shop The Drop',
          buttonLink: '/shop',
          sortOrder: 1,
          active: true
        },
        {
          id: `bnr_fashion_2`,
          title: 'OVERSIZED HOODIES & FLEECE',
          subtitle: '380 GSM Heavy French Terry • Double Layered Hoods • Minimalist Streetwear',
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=80',
          buttonText: 'Explore Hoodies',
          buttonLink: '/category/hoodies',
          sortOrder: 2,
          active: true
        },
        {
          id: `bnr_fashion_3`,
          title: 'VINTAGE MINERAL WASH TEES',
          subtitle: 'Individually Hand-Dye Treated • Boxy Relaxed Cut • Pre-Shrunk Comfort',
          image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=80',
          buttonText: 'Shop T-Shirts',
          buttonLink: '/category/t-shirts',
          sortOrder: 3,
          active: true
        }
      ];

      for (const p of presets) {
        await setDoc(doc(db, 'banners', p.id), p);
      }
      await fetchBanners();
      setSuccessMsg('৩টি হাই-কোয়ালিটি ফ্যাশন ব্যানার সফলভাবে লোড হয়েছে! (3 Fashion banners loaded!)');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to load fashion banners.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to remove any old outdated logo banners
  const handleRemoveOldLogoBanners = async () => {
    if (!confirm('আপনি কি লোগো বা পুরনো ব্যানারগুলো ডাটাবেজ থেকে মুছে ফেলতে চান?')) return;
    setSaving(true);
    try {
      for (const b of banners) {
        if (b.image === OFFICIAL_LOGO_PATH || b.image.includes('06ca4e8991799574c6283311e3e5990e')) {
          await deleteDoc(doc(db, 'banners', b.id));
        }
      }
      await fetchBanners();
      setSuccessMsg('পুরনো লোগো ব্যানার সফলভাবে মুছে ফেলা হয়েছে! (Old banners cleaned)');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to delete old banners.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">ওয়েবসাইট ব্যানার</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Homepage Banners & Sliders
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            ওয়েবসাইটের হোমপেজের ব্যানার ছবি সহজে আপলোড ও পরিবর্তন করুন। কোনো জটিল লিংক লাগবে না।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLoadFashionBanners}
            disabled={saving}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Load 3 high-definition fashion streetwear lookbook banners"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>৩টি ফ্যাশন ব্যানার লোড করুন</span>
          </button>

          <button
            onClick={handleRemoveOldLogoBanners}
            disabled={saving}
            className="px-3.5 py-2 border border-red-200 hover:border-red-600 bg-red-50/60 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Remove outdated logo banners"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>পুরনো ব্যানার মুছুন</span>
          </button>

          <button
            onClick={fetchBanners}
            className="px-3 py-2 border border-neutral-300 hover:border-black rounded-xl text-xs font-semibold bg-white text-neutral-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (Simple & Clear) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>{editingBanner ? 'ব্যানার এডিট করুন (Edit)' : 'নতুন ব্যানার যোগ করুন (Add)'}</span>
              </h3>
              {editingBanner && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-neutral-500 hover:text-black underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Zone - NO URL INPUT */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase mb-2">
                  ব্যানার ছবি (Banner Image) <span className="text-red-500">*</span>
                </label>

                {/* Big Live Image Preview */}
                <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-neutral-100 border-2 border-dashed border-neutral-300 hover:border-black transition-colors mb-3 group">
                  <img
                    src={image}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ছবি অপ্টিমাইজ ও আপলোড হচ্ছে...</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl shadow-lg hover:bg-neutral-100"
                    >
                      ছবি পরিবর্তন করুন
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBannerImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Clean Upload Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'ছবি আপলোড হচ্ছে...' : 'ডিভাইস থেকে ছবি আপলোড করুন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImage(OFFICIAL_LOGO_PATH)}
                    className="py-2 px-3 border border-neutral-300 hover:border-black rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-white transition-colors"
                    title="রিসপ্লেস অফিসিয়াল লোগো"
                  >
                    ডিফল্ট লোগো
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  * কম্পিউটার বা ফোন থেকে যেকোনো ছবি (JPG, PNG, WebP) সিলেক্ট করুন। সাইজ অটোমেটিক ফিট হয়ে যাবে।
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                  ব্যানারের হেডলাইন / শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: EID SPECIAL STREETWEAR DROP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-bold text-neutral-900"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                  সাব-হেডলাইন বা বিস্তারিত (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Heavyweight 240 GSM organic tees crafted in Khulna"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-neutral-800"
                />
              </div>

              {/* Button Label and Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                    বাটন টেক্সট
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase mb-1">
                    বাটন ক্লিক করলে কোথায় যাবে
                  </label>
                  <select
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
                  >
                    <option value="/shop">সব প্রোডাক্ট (/shop)</option>
                    <option value="/customizer">মকআপ স্টুডিও (/customizer)</option>
                    <option value="/track-order">অর্ডার ট্র্যাকিং (/track-order)</option>
                    <option value="/category/hoodies">হুডি ক্যাটাগরি (/category/hoodies)</option>
                    <option value="/category/t-shirts">টি-শার্ট ক্যাটাগরি (/category/t-shirts)</option>
                  </select>
                </div>
              </div>

              {/* Display Order and Active Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-700">ক্রমিক নম্বর:</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-16 px-2.5 py-1 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-lg text-center"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <span>ওয়েবসাইটে দেখাবে</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {editingBanner && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    বাতিল (Cancel)
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : editingBanner ? 'ব্যানার আপডেট করুন' : 'ব্যানার সেভ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Banners List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              বর্তমান ব্যানার তালিকা ({banners.length})
            </h3>
            <span className="text-xs text-neutral-500">হোমপেজে স্লাইডার আকারে দেখাবে</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-16 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-2xl">
                ব্যানার লোড হচ্ছে...
              </div>
            ) : banners.length > 0 ? (
              banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Banner Visual Card */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-24 h-16 sm:w-32 sm:h-20 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {b.active ? 'সক্রিয় (Active)' : 'বন্ধ (Inactive)'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">সিরিয়াল: {b.sortOrder}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-neutral-900 truncate">{b.title}</h4>
                      {b.subtitle && <p className="text-xs text-neutral-500 truncate mt-0.5">{b.subtitle}</p>}
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-1">
                        <span>বাটন: "{b.buttonText}"</span>
                        <span>·</span>
                        <span>লিংক: {b.buttonLink}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleEdit(b)}
                      className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-lg text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex items-center gap-1 transition-colors"
                      title="ব্যানার এডিট করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="ব্যানার ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-xs text-neutral-500 bg-white border border-neutral-200 rounded-3xl p-8 space-y-3">
                <ImageIcon className="w-12 h-12 mx-auto text-neutral-300 stroke-1" />
                <h4 className="text-sm font-bold text-neutral-800">কোনো ব্যানার এখনো যোগ করা হয়নি</h4>
                <p className="max-w-md mx-auto text-neutral-500">
                  হোমপেজের মূল আকর্ষণ বাড়াতে একটি প্রমোশনাল ব্যানার যোগ করুন অথবা নিচের বাটনে ক্লিক করে প্রি-সেট ব্যানার যুক্ত করুন।
                </p>
                <button
                  onClick={handleLoadFashionBanners}
                  disabled={saving}
                  className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>৩টি ফ্যাশন ব্যানার লোড করুন (Load Fashion Streetwear Banners)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
