import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Link2,
  Heart,
  Download,
  Check,
  Save,
  X
} from 'lucide-react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface AdminProductsProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProductInStore: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onAddProduct,
  onEditProduct,
  onViewProductInStore,
}) => {
  const { products, refreshProducts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'likes' | 'stock-low'>('latest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Inline Quick Edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);
  const [inlineSalePrice, setInlineSalePrice] = useState<number | undefined>(undefined);
  const [inlineStock, setInlineStock] = useState<number>(0);
  const [savingInline, setSavingInline] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopyLink = (p: Product) => {
    const url = `${window.location.origin}/product/${p.slug || p.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Link copied: /product/${p.slug || p.id}`);
    }
  };

  const handleStartInlineEdit = (p: Product) => {
    setInlineEditingId(p.id);
    setInlinePrice(p.price);
    setInlineSalePrice(p.salePrice);
    setInlineStock(p.totalStock);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const handleSaveInlineEdit = async (productId: string) => {
    setSavingInline(true);
    try {
      await updateDoc(doc(db, 'products', productId), {
        price: Number(inlinePrice),
        salePrice: inlineSalePrice ? Number(inlineSalePrice) : null,
        totalStock: Number(inlineStock),
        updatedAt: new Date().toISOString()
      });
      await refreshProducts();
      setInlineEditingId(null);
      showToast('Price and stock updated directly in catalog!');
    } catch (e: any) {
      console.error('Inline edit error:', e);
      showToast('Failed to update product values.');
    } finally {
      setSavingInline(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        active: !product.active,
        updatedAt: new Date().toISOString()
      });
      refreshProducts();
      showToast(`Product ${product.active ? 'disabled' : 'activated'} in store`);
    } catch (e) {
      console.error('Error toggling product active status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      setDeleteConfirmId(null);
      refreshProducts();
      showToast('Product deleted from inventory');
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast('No products available to export.');
      return;
    }

    const headers = ['ID', 'Product Name', 'SKU', 'Category', 'Price BDT', 'Sale Price BDT', 'Total Stock', 'Likes Count', 'Status', 'Slug'];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.categoryName || ''}"`,
      p.price,
      p.salePrice || '',
      p.totalStock,
      p.likesCount || 0,
      p.active ? 'Active' : 'Inactive',
      `"${p.slug}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `savage_store_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Products catalog exported to CSV successfully!');
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      if (sortBy === 'stock-low') {
        return a.totalStock - b.totalStock;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">Inventory</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Product Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Total {products.length} products in catalog · Inline price/stock editor & sharing links enabled
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 border border-neutral-300 hover:border-black rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-800 flex items-center gap-1.5 transition-colors shadow-xs"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddProduct}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>

        {/* Sort & Quick Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <span className="text-xs text-neutral-400 font-semibold">Sort by:</span>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sortBy === 'latest' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Latest Drops
          </button>
          <button
            onClick={() => setSortBy('likes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              sortBy === 'likes' ? 'bg-red-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Heart className="w-3 h-3 fill-current" />
            <span>Most Liked</span>
          </button>
          <button
            onClick={() => setSortBy('stock-low')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              sortBy === 'stock-low' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Low Stock First
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price (BDT)</th>
                  <th className="p-3.5">Stock Count</th>
                  <th className="p-3.5">Likes</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => {
                  const isInlineEditing = inlineEditingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.images?.[0] || `${import.meta.env.BASE_URL}assets/aistudio/06ca4e8991799574c6283311e3e5990e_0dac84fe.jpg`}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 block truncate max-w-xs">{p.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono block">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3.5 font-mono text-neutral-500">{p.sku || '—'}</td>

                      {/* Category */}
                      <td className="p-3.5 text-neutral-700 font-medium">{p.categoryName || 'Apparel'}</td>

                      {/* Price / Inline Edit */}
                      <td className="p-3.5 font-mono">
                        {isInlineEditing ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-neutral-400 font-bold">৳</span>
                              <input
                                type="number"
                                value={inlinePrice}
                                onChange={(e) => setInlinePrice(Number(e.target.value))}
                                className="w-20 px-2 py-1 text-xs border border-neutral-300 rounded font-bold bg-white"
                                title="Regular price"
                              />
                            </div>
                            <input
                              type="number"
                              placeholder="Sale (opt)"
                              value={inlineSalePrice || ''}
                              onChange={(e) => setInlineSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                              className="w-24 px-2 py-0.5 text-[10px] border border-neutral-200 rounded text-neutral-600 bg-white"
                              title="Discount sale price"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-neutral-900 block">
                              ৳{p.salePrice || p.price}
                            </span>
                            {p.salePrice && p.salePrice < p.price && (
                              <span className="text-[10px] text-neutral-400 line-through block font-normal">
                                ৳{p.price}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock / Inline Edit */}
                      <td className="p-3.5">
                        {isInlineEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={inlineStock}
                            onChange={(e) => setInlineStock(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border border-neutral-300 rounded font-mono font-bold bg-white"
                          />
                        ) : (
                          <span
                            className={`font-mono font-bold ${
                              p.totalStock <= 0
                                ? 'text-red-600'
                                : p.totalStock <= 5
                                ? 'text-amber-600'
                                : 'text-neutral-900'
                            }`}
                          >
                            {p.totalStock} units
                          </span>
                        )}
                      </td>

                      {/* Likes System Counter */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span className="font-mono">{p.likesCount || 0}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            p.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {p.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        {isInlineEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveInlineEdit(p.id)}
                              disabled={savingInline}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Save inline changes"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelInlineEdit}
                              className="p-1.5 border border-neutral-300 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy Deep Link */}
                            <button
                              onClick={() => handleCopyLink(p)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Copy product link to clipboard"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>

                            {/* View in Storefront */}
                            <button
                              onClick={() => onViewProductInStore(p)}
                              className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
                              title="View on store"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Inline Quick Edit Toggle */}
                            <button
                              onClick={() => handleStartInlineEdit(p)}
                              className="px-2 py-1 text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors"
                              title="Quick edit price and stock"
                            >
                              Quick Edit
                            </button>

                            {/* Full Edit */}
                            <button
                              onClick={() => onEditProduct(p)}
                              className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Full edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-neutral-300 mx-auto stroke-1" />
            <h3 className="text-sm font-bold text-neutral-900">No Products Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Your catalog is currently empty. Click "Add New Product" to configure your first clothing drop.
            </p>
            <button
              onClick={onAddProduct}
              className="mt-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
            >
              Add First Product
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 uppercase">Confirm Product Deletion</h3>
            <p className="text-xs text-neutral-500">
              Are you sure you want to permanently delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-neutral-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
