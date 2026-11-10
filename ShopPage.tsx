import React, { useState, useMemo } from 'react';
import { Filter, X, ArrowUpDown, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { Product } from '../types';

interface ShopPageProps {
  onSelectProduct: (product: Product) => void;
  onNavigate: (path: string) => void;
  initialCategorySlug?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onSelectProduct,
  onNavigate,
  initialCategorySlug
}) => {
  const { products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'featured'>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.active)
      .filter((p) => {
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.categoryId !== cat.id && p.categoryName !== cat.name) {
            return false;
          }
        }
        if (selectedSize !== 'all' && (!p.sizes || !p.sizes.includes(selectedSize))) {
          return false;
        }
        if (selectedGender !== 'all' && p.gender !== selectedGender) {
          return false;
        }
        const effectivePrice = p.salePrice || p.price;
        if (effectivePrice > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice || a.price;
        const priceB = b.salePrice || b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, categories, selectedCategory, selectedSize, selectedGender, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedGender('all');
    setMaxPrice(5000);
    setSortBy('newest');
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    selectedGender !== 'all' ||
    maxPrice < 5000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Catalog & Collections
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing <strong className="text-black font-mono">{filteredProducts.length}</strong> items in inventory
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 flex items-center gap-1.5 hover:bg-neutral-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {isFiltered && '•'}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-black"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 pr-4 border-r border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Filters</h3>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-black text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Size</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`py-1.5 text-xs font-semibold rounded-md border text-center transition-colors ${
                  selectedSize === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                }`}
              >
                All
              </button>
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 text-xs font-semibold rounded-md border text-center transition-colors ${
                    selectedSize === sz
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['all', 'Men', 'Women', 'Unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`py-1.5 text-xs font-semibold rounded-md border text-center transition-colors ${
                    selectedGender === g
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
              <span className="uppercase">Max Price</span>
              <span className="font-mono text-black">৳{maxPrice}</span>
            </div>
            <input
              type="range"
              min="300"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
              <span>৳300</span>
              <span>৳5000</span>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl p-8">
              <EmptyState
                title="No products found"
                description={
                  isFiltered
                    ? 'No products match the selected filters. Try broadening your criteria or reset the filters.'
                    : 'There are currently no active products in the store catalog. The database will show real items once added by the administrator.'
                }
                actionText={isFiltered ? 'Reset Filters' : 'Design Custom Mockup'}
                onAction={isFiltered ? resetFilters : () => onNavigate('/customizer')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Category</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedCategory === 'all' ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          selectedCategory === c.slug ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Size</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-1.5 text-xs font-semibold rounded-md border text-center ${
                          selectedSize === sz ? 'bg-black text-white border-black' : 'border-neutral-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
