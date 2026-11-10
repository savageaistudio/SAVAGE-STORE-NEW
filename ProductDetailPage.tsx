import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Check,
  AlertCircle,
  Ruler,
  Share2,
  ArrowLeft,
  Link2,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';
import { AIVirtualTryOnModal } from '../components/common/AIVirtualTryOnModal';
import { ProductReviewsSection } from '../components/reviews/ProductReviewsSection';

interface ProductDetailPageProps {
  product: Product;
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigate,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const { products, getProductReviews, submitReview, likeProduct, isProductLiked } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || product.thumbnail || `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);
  const [showTryOnModal, setShowTryOnModal] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const isLiked = isProductLiked(product.id) || isInWishlist(product.id);
  const currentLikes = product.likesCount || 0;

  const handleLike = async () => {
    toggleWishlist(product.id);
    await likeProduct(product.id);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/product/${product.slug || product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out ${product.name} at SAVAGE STORE: ${productUrl}`
  )}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

  // Review Form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Synchronize when product changes
  useEffect(() => {
    setSelectedImage(product.images?.[0] || product.thumbnail || `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`);
    if (product.sizes?.length) setSelectedSize(product.sizes[0]);
    if (product.colors?.length) setSelectedColor(product.colors[0].name);
    setQuantity(1);

    // Fetch real reviews
    setReviewsLoading(true);
    getProductReviews(product.id)
      .then((res) => setReviews(res))
      .finally(() => setReviewsLoading(false));
  }, [product, getProductReviews]);

  // Determine variant stock based on selected size + color
  const matchedVariant = product.variants?.find(
    (v) =>
      (!selectedSize || v.size?.toLowerCase() === selectedSize?.toLowerCase()) &&
      (!selectedColor || !v.colorName || v.colorName?.toLowerCase() === selectedColor?.toLowerCase())
  ) || product.variants?.find((v) => !selectedSize || v.size?.toLowerCase() === selectedSize?.toLowerCase());

  const availableStock = matchedVariant?.stock ?? (product.totalStock && product.totalStock > 0 ? product.totalStock : 50);

  const isOutOfStock = product.totalStock === 0 && (!product.variants || product.variants.every((v) => v.stock <= 0));

  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const handleAddToCart = (directCheckout = false) => {
    if (isOutOfStock) return;

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: selectedImage,
      price: displayPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: availableStock,
      sku: matchedVariant?.sku || product.sku
    });

    if (directCheckout) {
      onNavigate('/checkout');
    } else {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await submitReview(
        product.id,
        newRating,
        newComment,
        reviewerName || currentUser?.displayName || 'Customer',
        currentUser?.uid
      );
      setReviewSuccess(true);
      setNewComment('');
      // Refresh reviews
      const updated = await getProductReviews(product.id);
      setReviews(updated);
    } catch (err) {
      console.warn('Review submit warning:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.active && p.categoryId === product.categoryId)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/shop')}
          className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isInWishlist(product.id) ? 'text-red-600 fill-current' : ''
                }`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-black ring-2 ring-black/20'
                      : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <span>{product.brand || 'SAVAGE'}</span>
              <span>·</span>
              <span>{product.categoryName || 'Apparel'}</span>
              {product.sku && (
                <>
                  <span>·</span>
                  <span className="font-mono">SKU: {product.sku}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 uppercase tracking-tight">
              {product.name}
            </h1>

            {/* Price & Real-Time Liking Row */}
            <div className="flex items-center justify-between gap-4 mt-3 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                  ৳{displayPrice}
                </span>
                {hasDiscount && (
                  <span className="text-base text-neutral-400 line-through font-mono">
                    ৳{product.price}
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    Out of Stock
                  </span>
                ) : availableStock <= 5 ? (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    Only {availableStock} left
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    In Stock
                  </span>
                )}
              </div>

              {/* Liking Pill with Heart Counter */}
              <button
                type="button"
                onClick={handleLike}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all shadow-xs ${
                  isLiked
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                }`}
                title={isLiked ? 'You like this product' : 'Like this drop'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-600' : 'text-neutral-500'}`} />
                <span className="font-mono">{currentLikes}</span>
                <span className="hidden sm:inline">Likes</span>
              </button>
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Select Size: <strong className="text-black">{selectedSize}</strong>
                </label>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1 underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Chart
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(sz);
                      setQuantity(1);
                    }}
                    className={`min-w-[48px] py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === sz
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-neutral-200 hover:border-black bg-white text-neutral-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Color: <strong className="text-black">{selectedColor}</strong>
                </label>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(c.name);
                      setQuantity(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedColor === c.name
                        ? 'border-black bg-neutral-900 text-white'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock check */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-200 font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-neutral-900 font-mono min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock || isOutOfStock}
                  className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-200 font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                {availableStock > 0 ? `${availableStock} units available` : 'Currently unavailable'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isOutOfStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedToast
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black hover:bg-neutral-800 text-white active:scale-[0.99]'
              }`}
            >
              {addedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Shopping Bag!
                </>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Shopping Bag
                </>
              )}
            </button>

            {/* AI Virtual Try-On Fitting Room Button */}
            <button
              type="button"
              onClick={() => setShowTryOnModal(true)}
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 hover:from-black hover:to-neutral-900 border border-red-500/60 hover:border-red-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-500/20 active:scale-[0.99] group"
            >
              <Sparkles className="w-4 h-4 text-red-500 group-hover:rotate-12 transition-transform" />
              <span>✨ AI ভার্চুয়াল ট্রাই-অন (নিজের ছবিতে ট্রাই করুন)</span>
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 shadow-sm"
            >
              Buy It Now (Cash on Delivery)
            </button>
          </div>

          {/* Product Linking & Share Bar */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-neutral-700" />
                <span>Share & Product Link</span>
              </span>
              {copiedLink && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px] lowercase">
                  <Check className="w-3 h-3" /> Link copied!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-neutral-600" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Product Link'}</span>
              </button>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                title="Share on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
                title="Share on Facebook"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Fabric & Delivery Accordion */}
          <div className="border-t border-neutral-200 pt-6 space-y-4 text-xs text-neutral-600">
            {product.fabric && (
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Fabric & Quality</strong>
                  <span>{product.fabric}</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block">Fast Delivery Across Bangladesh</strong>
                <span>খুলনা সিটিতে ১-২ দিন (৳৬০) · সারাদেশের ৬৪ জেলায় ক্যাশ অন ডেলিভারি (৳১২০)</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block">7-Day Return & Exchange</strong>
                <span>Hassle-free size replacement if it doesn't fit your aesthetic.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs Tabs */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wide">
          Product Details & Specifications
        </h3>
        <div className="prose prose-sm max-w-none text-neutral-600 leading-relaxed whitespace-pre-line">
          {product.description || 'No detailed description specified.'}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-400 uppercase">Tags:</span>
            {product.tags.map((tag) => (
              <span key={tag} className="text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section (Advanced Daraz+ Style) */}
      <ProductReviewsSection
        product={product}
        reviews={reviews}
        isLoading={reviewsLoading}
        onSubmitReview={async (newRating, commentText, authorName, photoUrls, fitFeedback) => {
          await submitReview(
            product.id,
            newRating,
            commentText,
            authorName || currentUser?.displayName || 'Customer',
            currentUser?.uid,
            photoUrls,
            fitFeedback
          );
          const updated = await getProductReviews(product.id);
          setReviews(updated);
        }}
      />

      {/* AI Virtual Try-On Modal */}
      <AIVirtualTryOnModal
        product={product}
        isOpen={showTryOnModal}
        onClose={() => setShowTryOnModal(false)}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowSizeModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                SAVAGE STORE Size Chart (Inches)
              </h3>
              <button onClick={() => setShowSizeModal(false)} className="text-neutral-400 hover:text-black">
                ✕
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 font-bold text-neutral-700">
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Chest</th>
                    <th className="p-2.5">Length</th>
                    <th className="p-2.5">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  <tr><td className="p-2.5 font-bold font-sans">S</td><td className="p-2.5">38"</td><td className="p-2.5">27"</td><td className="p-2.5">8.0"</td></tr>
                  <tr><td className="p-2.5 font-bold font-sans">M</td><td className="p-2.5">40"</td><td className="p-2.5">28"</td><td className="p-2.5">8.5"</td></tr>
                  <tr><td className="p-2.5 font-bold font-sans">L</td><td className="p-2.5">42"</td><td className="p-2.5">29"</td><td className="p-2.5">9.0"</td></tr>
                  <tr><td className="p-2.5 font-bold font-sans">XL</td><td className="p-2.5">44"</td><td className="p-2.5">30"</td><td className="p-2.5">9.5"</td></tr>
                  <tr><td className="p-2.5 font-bold font-sans">XXL</td><td className="p-2.5">46"</td><td className="p-2.5">31"</td><td className="p-2.5">10.0"</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-neutral-500">
              * Measurements may vary slightly by +/- 0.5 inches due to manual craftsmanship.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
