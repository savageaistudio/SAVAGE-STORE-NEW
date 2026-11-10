import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Link2, Check } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { likeProduct, isProductLiked } = useStore();
  const [copied, setCopied] = useState(false);

  const isLiked = isProductLiked(product.id) || isInWishlist(product.id);
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const primaryImage = product.thumbnail || product.images?.[0] || `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 'L';
    const defaultColor = product.colors?.[0]?.name || 'Standard';

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: primaryImage,
      price: displayPrice,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
      maxStock: product.totalStock || 10,
      sku: product.sku
    });
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    await likeProduct(product.id);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.slug || product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group cursor-pointer bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between relative"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/5 bg-neutral-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {/* Stock warning if low stock */}
        {product.totalStock <= 5 && product.totalStock > 0 && (
          <span className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Only {product.totalStock} left
          </span>
        )}

        {/* Action icons stack on top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {/* Like / Heart Button with real-time like count */}
          <button
            onClick={handleToggleLike}
            className={`p-2 rounded-full backdrop-blur-md transition-all flex items-center gap-1 ${
              isLiked
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-neutral-700 hover:text-black shadow-xs'
            }`}
            title={isLiked ? 'Liked!' : 'Like this drop'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            {(product.likesCount || 0) > 0 && (
              <span className="text-[10px] font-bold font-mono pr-0.5">
                {product.likesCount}
              </span>
            )}
          </button>

          {/* Copy Product Link Button */}
          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white/80 hover:bg-white text-neutral-700 hover:text-black shadow-xs'
            }`}
            title={copied ? 'Link copied!' : 'Copy product link'}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Actions overlay */}
        <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="py-2 px-2.5 bg-white/95 hover:bg-white text-black text-xs font-bold rounded-xl backdrop-blur-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">ভিউ</span>
            </button>
          )}
          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2 bg-black/95 hover:bg-black text-white text-xs font-bold rounded-xl backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ব্যাগে নিন</span>
          </button>
        </div>
      </div>

      {/* Metadata & Pricing */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 uppercase font-semibold tracking-wider">
            <span>{product.categoryName || 'Streetwear'}</span>
            {product.fabric && (
              <>
                <span>·</span>
                <span className="truncate">{product.fabric}</span>
              </>
            )}
          </div>

          <h3 className="text-sm font-bold text-neutral-900 mt-1 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-neutral-900 font-mono tabular-nums">
              ৳{displayPrice}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through font-mono">
                ৳{product.price}
              </span>
            )}
          </div>

          {/* Available Sizes preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono font-semibold">
              <span>{product.sizes.slice(0, 3).join('/')}</span>
              {product.sizes.length > 3 && <span>+</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
