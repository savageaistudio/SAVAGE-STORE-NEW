import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadImageWithFallback } from '../../lib/imageUpload';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const { categories, refreshCategories } = useStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSortOrder(cat.sortOrder || 1);
    setActive(cat.active);
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setSortOrder(categories.length + 1);
    setActive(true);
    setErrorMsg('');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const url = await uploadImageWithFallback(file, 'categories');
      setImage(url);
    } catch (err: any) {
      console.error('Category image upload failed:', err);
      setErrorMsg(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const catId = editingCategory?.id || `cat_${Date.now()}`;
      const payload: Category = {
        id: catId,
        name: name.trim(),
        slug: slug.trim() || `cat-${catId}`,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        sortOrder: Number(sortOrder),
        active,
        createdAt: editingCategory?.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'categories', catId), payload);
      await refreshCategories();
      handleResetForm();
    } catch (err: any) {
      console.error('Category save error:', err);
      setErrorMsg(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      await refreshCategories();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Taxonomy</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Category Management
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Organize streetwear into categories like T-Shirts, Hoodies, Panjabi, Pants, Caps, and Mugs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Streetwear Hoodies"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  required
                  placeholder="streetwear-hoodies"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category banner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Category Cover Image
                </label>
                {image && (
                  <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-300 mb-2">
                    <img src={image} alt="Category Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'ছবি আপলোড হচ্ছে...' : image ? 'কভার ছবি পরিবর্তন করুন' : 'কভার ছবি আপলোড করুন'}</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span>Active Category</span>
              </label>

              <div className="flex gap-2 pt-2">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Categories List (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {categories.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                  <tr>
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Category Name</th>
                    <th className="p-3.5">Slug</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3.5 font-mono text-neutral-500">{c.sortOrder || '—'}</td>
                      <td className="p-3.5 font-bold text-neutral-900">{c.name}</td>
                      <td className="p-3.5 font-mono text-neutral-500">{c.slug}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
                <p>No categories added yet. Create your first category using the form on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
