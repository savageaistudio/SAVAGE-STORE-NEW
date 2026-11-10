import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlist, wishlistCount } = useWishlist();
  const { products } = useStore();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="pb-6 border-b border-neutral-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Your Saved Wishlist
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          {wishlistCount} items saved for future drops and orders
        </p>
      </div>

      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 max-w-xl mx-auto">
          <EmptyState
            title="Your Wishlist is Empty"
            description="Keep track of your favorite streetwear tees, hoodies, and accessories by clicking the heart icon on any product."
            actionText="Discover Collection"
            onAction={() => onNavigate('/shop')}
            icon={<Heart className="w-8 h-8 stroke-1 text-red-500" />}
          />
        </div>
      )}
    </div>
  );
};
