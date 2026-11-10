import React, { useState } from 'react';
import { Truck, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { DeliveryZone } from '../../types';

export const AdminDelivery: React.FC = () => {
  const { deliveryZones } = useStore();
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  const [name, setName] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(60);
  const [minimumOrder, setMinimumOrder] = useState<number | undefined>(1500);
  const [estimatedDays, setEstimatedDays] = useState('1-2 Days');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setName(zone.name);
    setDeliveryCharge(zone.deliveryCharge);
    setMinimumOrder(zone.minimumOrder);
    setEstimatedDays(zone.estimatedDays);
    setActive(zone.active);
  };

  const resetForm = () => {
    setEditingZone(null);
    setName('');
    setDeliveryCharge(60);
    setMinimumOrder(1500);
    setEstimatedDays('1-2 Days');
    setActive(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const id = editingZone?.id || `zone_${Date.now()}`;
      const payload: DeliveryZone = {
        id,
        name: name.trim(),
        deliveryCharge: Number(deliveryCharge),
        minimumOrder: minimumOrder ? Number(minimumOrder) : undefined,
        estimatedDays: estimatedDays.trim() || '2-3 Days',
        active
      };

      await setDoc(doc(db, 'deliveryZones', id), payload);
      resetForm();
    } catch (err: any) {
      console.error('Zone save error:', err);
      setErrorMsg(err.message || 'Failed to save delivery zone.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this delivery zone?')) return;
    try {
      await deleteDoc(doc(db, 'deliveryZones', id));
    } catch (e) {
      console.error('Delete zone error:', e);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Logistics</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Delivery & Shipping Zones
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure courier fees and transit estimates for Khulna, Dhaka, and nationwide dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {editingZone ? 'Edit Delivery Zone' : 'Add New Shipping Zone'}
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
                  Zone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inside Khulna City"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Courier Charge (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Free Threshold (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 2000"
                    value={minimumOrder || ''}
                    onChange={(e) => setMinimumOrder(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Estimated Transit Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1-2 Days / 24-48 Hours"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <span>Active Zone</span>
              </label>

              <div className="flex gap-2 pt-2">
                {editingZone && (
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
                  {saving ? 'Saving...' : editingZone ? 'Update' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Zones List */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {deliveryZones.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                  <tr>
                    <th className="p-3.5">Zone Name</th>
                    <th className="p-3.5">Charge</th>
                    <th className="p-3.5">Estimated Time</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {deliveryZones.map((z) => (
                    <tr key={z.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3.5 font-bold text-neutral-900">{z.name}</td>
                      <td className="p-3.5 font-mono font-bold text-neutral-900">৳{z.deliveryCharge}</td>
                      <td className="p-3.5 text-neutral-600">{z.estimatedDays}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            z.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {z.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(z)}
                            className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(z.id)}
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
                <Truck className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
                <p>No delivery zones configured yet. Add your first zone using the form on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
