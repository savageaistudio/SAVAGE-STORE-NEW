import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle,
  Share2,
  Ruler
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen || !product) return null;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { siteSettings } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || product.thumbnail || `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const displayPrice =
    product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const allImages = [
    product.thumbnail,
    ...(product.images || [])
  ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

  if (allImages.length === 0) {
    allImages.push(`${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`);
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: selectedImage,
      price: displayPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: product.totalStock || 10,
      sku: product.sku
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const handleWhatsAppOrder = () => {
    const rawPhone = (siteSettings.whatsapp || '01779903110').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('880') ? rawPhone : `880${rawPhone.replace(/^0+/, '')}`;
    const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
    const text = `Hello SAVAGE STORE! 👋\nI would like to order this item directly via Cash on Delivery:\n\n• Product: ${product.name}\n• Size: ${selectedSize}\n• Color: ${selectedColor}\n• Quantity: ${quantity}\n• Price: ৳${displayPrice * quantity}\n• Link: ${productUrl}\n\nPlease let me know how to proceed. Thank you!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-black hover:text-white text-neutral-700 transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Images Gallery */}
        <div className="md:w-1/2 p-6 bg-neutral-50 flex flex-col justify-between">
          <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-neutral-200 shadow-inner">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-black scale-105 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Fast Buy */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  {product.categoryName || 'Streetwear Fashion'}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">SKU: {product.sku || 'SVG-01'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 uppercase tracking-tight mt-1">
                {product.name}
              </h2>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-neutral-900 font-mono">
                ৳{displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-base text-neutral-400 line-through font-mono">
                  ৳{product.price}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 font-bold rounded-md ${
                product.totalStock === 0 && (!product.variants || product.variants.every((v) => v.stock <= 0))
                  ? 'bg-neutral-200 text-neutral-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                {product.totalStock === 0 && (!product.variants || product.variants.every((v) => v.stock <= 0))
                  ? 'স্টক শেষ (Sold Out)'
                  : 'ইন-স্টক (In Stock)'}
              </span>
            </div>

            {/* Fabric specs badge */}
            {product.fabric && (
              <p className="text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg font-medium inline-block">
                ফেব্রিক: <span className="font-bold text-neutral-900">{product.fabric}</span>
              </p>
            )}

            {/* Sizes Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-800 uppercase">
                    সাইজ নির্বাচন করুন: <span className="text-red-600 font-mono">{selectedSize}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[11px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 underline"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>সাইজ চার্ট</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-10 h-10 px-3 rounded-xl text-xs font-bold transition-all border ${
                        selectedSize === s
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Quick Size Chart Helper */}
                {showSizeGuide && (
                  <div className="mt-2.5 p-3 bg-neutral-100 rounded-xl text-[11px] text-neutral-700 space-y-1 animate-in fade-in">
                    <p className="font-bold text-neutral-900">📏 রেগুলার / ড্রপ শোল্ডার সাইজ চার্ট (ইঞ্চি):</p>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] pt-1">
                      <div className="bg-white p-1 rounded">M: ৪২/২৮</div>
                      <div className="bg-white p-1 rounded">L: ৪৪/২৯</div>
                      <div className="bg-white p-1 rounded">XL: ৪৬/৩০</div>
                      <div className="bg-white p-1 rounded">XXL: ৪৮/৩১</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Colors Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase mb-2">
                  কালার: <span className="text-neutral-600 font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                        selectedColor === c.name
                          ? 'border-black bg-neutral-900 text-white'
                          : 'border-neutral-300 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-neutral-400"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-bold text-neutral-800 uppercase">পরিমাণ:</label>
              <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-neutral-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-bold font-mono text-xs text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.totalStock || 10, q + 1))}
                  className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-6">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.totalStock === 0 && (!product.variants || product.variants.every((v) => v.stock <= 0))}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black hover:bg-neutral-800 text-white disabled:bg-neutral-300'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ব্যাগে যোগ করা হয়েছে!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>ব্যাগে যোগ করুন (Add to Bag)</span>
                </>
              )}
            </button>

            {/* 1-Click WhatsApp Quick Order */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন (WhatsApp Order)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate(`/product/${product.slug || product.id}`);
              }}
              className="w-full py-2 text-center text-xs text-neutral-500 hover:text-black font-semibold underline"
            >
              সম্পূর্ণ বিবরণ দেখুন (Full Product Details) →
            </button>

            {/* Trust Points */}
            <div className="pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-500">
              <div>
                <span className="font-bold text-neutral-800 block">৳০ অগ্রিম</span>
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div>
                <span className="font-bold text-neutral-800 block">২৪-৪৮ ঘণ্টা</span>
                <span>খুলনা এক্সপ্রেস</span>
              </div>
              <div>
                <span className="font-bold text-neutral-800 block">৭ দিন এক্সচেঞ্জ</span>
                <span>সহজ রিটার্ন</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
