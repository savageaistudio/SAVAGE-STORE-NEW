import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onViewAllResults: (query: string) => void;
  onNavigate?: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
  onNavigate,
}) => {
  const { products } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = searchTerm.trim().toLowerCase();
  const isAdminSearch =
    cleanQuery === '/admin' ||
    cleanQuery === 'admin' ||
    cleanQuery === '/admin/login' ||
    cleanQuery === 'admin login' ||
    cleanQuery === '/login';

  const filteredProducts = searchTerm.trim()
    ? products
        .filter((p) => {
          const q = searchTerm.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.categoryName?.toLowerCase().includes(q) ||
            p.fabric?.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') {
      if (isAdminSearch && onNavigate) {
        onNavigate('/admin/login');
        onClose();
        return;
      }
      if (searchTerm.trim()) {
        onViewAllResults(searchTerm);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Search Input Bar */}
        <div className="relative border-b border-neutral-200 px-4 flex items-center">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search hoodies, tees, caps, SKU, fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-4 pl-3 pr-10 text-sm sm:text-base bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-neutral-400 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          )}
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {/* Secret Administrator Access Card */}
          {isAdminSearch && (
            <div className="mb-4 p-4 bg-neutral-950 text-white rounded-2xl border border-red-600/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>Confidential Gateway</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  AUTHORIZED STAFF ONLY
                </span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-tight text-white">
                  SAVAGE STORE Administrator Portal
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Private management console for catalog inventory, orders, courier parcels, and banners.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('/admin/login');
                  onClose();
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Enter Admin Console Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {searchTerm.trim() ? (
            filteredProducts.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2 py-1 text-xs text-neutral-400 uppercase font-bold tracking-wider">
                  <span>Results ({filteredProducts.length})</span>
                  <button
                    onClick={() => {
                      onViewAllResults(searchTerm);
                      onClose();
                    }}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    See all in shop <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3.5 p-2 rounded-xl hover:bg-neutral-50 transition-colors text-left group"
                  >
                    <img
                      src={prod.thumbnail || prod.images?.[0] || `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`}
                      alt={prod.name}
                      className="w-14 h-14 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-neutral-500 font-medium truncate">
                        {prod.categoryName || 'Apparel'} · SKU: {prod.sku || 'N/A'}
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors truncate">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-neutral-900 font-mono tabular-nums">
                          ৳{prod.salePrice || prod.price}
                        </span>
                        {prod.salePrice && prod.salePrice < prod.price && (
                          <span className="text-[11px] text-neutral-400 line-through font-mono">
                            ৳{prod.price}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {prod.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-neutral-300 mx-auto mb-2 stroke-1" />
                <h4 className="text-sm font-bold text-neutral-800">No products found</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any products matching "{searchTerm}". Try checking your spelling or search for categories like t-shirt, hoodie, or mug.
                </p>
              </div>
            )
          ) : (
            <div className="py-6 px-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['T-Shirt', 'Oversized Hoodie', 'Snapback Cap', 'Ceramic Mug', 'Cotton', 'Black'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
