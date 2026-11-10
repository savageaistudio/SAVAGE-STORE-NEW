import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Coupon } from '../../types';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountAmount, setDiscountAmount] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(500);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | undefined>(100);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      const list: Coupon[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Coupon));
      setCoupons(list);
    } catch (err) {
      console.warn('Coupons load err:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountAmount(c.discountAmount);
    setMinOrderAmount(c.minOrderAmount);
    setMaxDiscount(c.maxDiscount);
    setExpiryDate(c.expiryDate || '');
    setUsageLimit(c.usageLimit);
    setActive(c.active);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountAmount(10);
    setMinOrderAmount(1000);
    setMaxDiscount(500);
    setExpiryDate('');
    setUsageLimit(100);
    setActive(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const id = editingCoupon?.id || `cpn_${Date.now()}`;
      const payload: Coupon = {
        id,
        code: code.trim().toUpperCase(),
        discountType,
        discountAmount: Number(discountAmount),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        expiryDate: expiryDate || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        usedCount: editingCoupon?.usedCount || 0,
        active
      };

      await setDoc(doc(db, 'coupons', id), payload);
      await fetchCoupons();
      resetForm();
    } catch (err: any) {
      console.error('Coupon save error:', err);
      setErrorMsg(err.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      await fetchCoupons();
    } catch (e) {
      console.error('Coupon delete err:', e);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Promotions</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Coupon & Discount Codes
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Create percentage discounts (e.g. SAVAGE10) or fixed amount vouchers for checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
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
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVAGE10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(৳)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Min Order (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Max Cap (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={maxDiscount || ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={usageLimit || ''}
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span>Active & Usable</span>
              </label>

              <div className="flex gap-2 pt-2">
                {editingCoupon && (
                  <button
                    type="button"
                    onClick={resetForm}
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
                  {saving ? 'Saving...' : editingCoupon ? 'Update' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-12 text-center text-xs text-neutral-400">Loading coupons...</div>
            ) : coupons.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Min Order</th>
                    <th className="p-3.5">Used</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {coupons.map((cpn) => (
                    <tr key={cpn.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-neutral-900">{cpn.code}</td>
                      <td className="p-3.5 font-mono font-semibold text-neutral-800">
                        {cpn.discountType === 'percentage' ? `${cpn.discountAmount}%` : `৳${cpn.discountAmount}`}
                      </td>
                      <td className="p-3.5 font-mono text-neutral-500">৳{cpn.minOrderAmount}</td>
                      <td className="p-3.5 font-mono text-neutral-500">{cpn.usedCount || 0}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cpn.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {cpn.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cpn)}
                            className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cpn.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100"
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
                <Tag className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
                <p>No coupons created yet. Add your first promotional code using the form on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
