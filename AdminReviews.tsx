import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Review } from '../../types';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      const list: Review[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Review));
      setReviews(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.warn('Reviews load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (rev: Review) => {
    try {
      await updateDoc(doc(db, 'reviews', rev.id), {
        approved: !rev.approved
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === rev.id ? { ...r, approved: !rev.approved } : r))
      );
    } catch (e) {
      console.error('Toggle approve error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this customer review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Delete review error:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">Moderation</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Customer Reviews
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Total {reviews.length} authentic product feedback submissions
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-neutral-900">{rev.customerName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-neutral-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    Product ID: {rev.productId}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleApprove(rev)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                      rev.approved
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {rev.approved ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{rev.approved ? 'Approved' : 'Hidden'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-400 space-y-2">
            <Star className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
            <p>No customer reviews submitted yet. When shoppers leave feedback on products, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
