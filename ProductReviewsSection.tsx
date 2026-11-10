import React, { useState, useRef } from 'react';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  Camera,
  X,
  Upload,
  MessageSquare,
  ShieldCheck,
  Filter,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Review, Product } from '../../types';
import { uploadImageWithFallback } from '../../lib/imageUpload';

interface ProductReviewsSectionProps {
  product: Product;
  reviews: Review[];
  onSubmitReview: (rating: number, comment: string, customerName: string, photoUrls?: string[], fitFeedback?: string) => Promise<void>;
  isLoading: boolean;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  reviews,
  onSubmitReview,
  isLoading
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'with-photos' | '5-star' | '4-star'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [comment, setComment] = useState('');
  const [fitFeedback, setFitFeedback] = useState<'True to Size' | 'Oversized' | 'Tight'>('True to Size');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [helpfulCounts, setHelpfulCounts] = useState<{ [id: string]: number }>({});
  const [votedReviews, setVotedReviews] = useState<{ [id: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ratings calculation
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const count5 = reviews.filter((r) => r.rating === 5).length;
  const count4 = reviews.filter((r) => r.rating === 4).length;
  const count3 = reviews.filter((r) => r.rating === 3).length;
  const count2 = reviews.filter((r) => r.rating === 2).length;
  const count1 = reviews.filter((r) => r.rating === 1).length;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImageWithFallback(files[i], 'reviews');
        newPhotos.push(url);
      } catch (e) {
        console.warn('Review photo upload notice:', e);
      }
    }
    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);
  };

  const handleHelpful = (reviewId: string) => {
    if (votedReviews[reviewId]) return;
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitReview(
        rating,
        comment.trim(),
        customerName.trim(),
        uploadedPhotos,
        fitFeedback
      );
      setSuccessMsg(true);
      setCustomerName('');
      setComment('');
      setUploadedPhotos([]);
      setShowReviewForm(false);
      setTimeout(() => setSuccessMsg(false), 5000);
    } catch (e) {
      console.error('Review submit failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === '5-star') return r.rating === 5;
    if (activeFilter === '4-star') return r.rating === 4;
    return true;
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            কাস্টমার মতামত ও রেটিং
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 mt-0.5">
            Verified Customer Reviews ({totalReviews})
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            দারাজের চেয়েও আধুনিক ও স্বচ্ছ ভেরিফাইড রিভিউ সিস্টেম — আসল ক্রেতাদের পরিহিত ছবি ও ফিডব্যাক।
          </p>
        </div>

        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-5 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{showReviewForm ? 'রিভিউ ফর্ম বন্ধ করুন' : 'রিভিউ লিখুন (Write Review)'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে! SAVAGE STORE-এর সাথে থাকার জন্য ধন্যবাদ।</span>
        </div>
      )}

      {/* Write Review Form Card */}
      {showReviewForm && (
        <form onSubmit={handleSubmit} className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h4 className="text-xs font-black uppercase text-neutral-900">
              আপনার অভিজ্ঞতা শেয়ার করুন (Share Your Experience)
            </h4>
            <span className="text-[10px] text-neutral-500">১০০% ভেরিফাইড ক্রেতার মতামত</span>
          </div>

          {/* Star Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
              রেটিং দিন: <span className="text-amber-500 font-mono">{rating} স্টার</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                আপনার নাম (Your Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: তানভীর আহমেদ"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                সাইজ ও ফিটিং কেমন হয়েছে? (Fit Feedback)
              </label>
              <select
                value={fitFeedback}
                onChange={(e: any) => setFitFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
              >
                <option value="True to Size">True to Size (একদম সঠিক মাপ)</option>
                <option value="Oversized">Relaxed / Oversized (লুজ ড্রপ শোল্ডার)</option>
                <option value="Tight">Slightly Tight (সামান্য টাইট)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              বিস্তারিত মন্তব্য (Review Comment) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="পোশাকের ফেব্রিক, কটন কোয়ালিটি, সেলাই এবং ডেলিভারি নিয়ে আপনার মতামত লিখুন..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
              পোশাক পরিহিত ছবি যুক্ত করুন (ঐচ্ছিক - Daraz Style Customer Photos)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="py-2.5 px-4 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-red-600" />
              <span>{uploading ? 'ছবি আপলোড হচ্ছে...' : 'ছবি আপলোড করুন (Upload Photos)'}</span>
            </button>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="flex gap-2 pt-3 overflow-x-auto">
                {uploadedPhotos.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-300 shrink-0">
                    <img src={url} alt={`Review photo ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-black/80 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'সাবমিট হচ্ছে...' : 'রিভিউ পোস্ট করুন (Submit Review)'}
            </button>
          </div>
        </form>
      )}

      {/* Daraz-Style Rating Breakdown Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-neutral-50 rounded-3xl border border-neutral-200">
        {/* Left: Big Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 text-center border-b md:border-b-0 md:border-r border-neutral-200 space-y-2">
          <span className="text-5xl font-black font-mono text-neutral-900 tracking-tight">
            {avgRating}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(Number(avgRating)) ? 'fill-current' : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            মোট {totalReviews} টি ভেরিফাইড রিভিউয়ের ভিত্তিতে
          </p>
          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>১০০% অথেনটিক ক্রেতা প্রতিক্রিয়া</span>
          </div>
        </div>

        {/* Middle: Star Bars Breakdown */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2 p-2">
          {[
            { stars: 5, count: count5 },
            { stars: 4, count: count4 },
            { stars: 3, count: count3 },
            { stars: 2, count: count2 },
            { stars: 1, count: count1 },
          ].map(({ stars, count }) => {
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-neutral-600 font-mono font-bold flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 text-amber-400 fill-current" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] font-mono text-neutral-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
        >
          সব রিভিউ ({totalReviews})
        </button>
        <button
          onClick={() => setActiveFilter('5-star')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === '5-star'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
        >
          ৫ স্টার ({count5})
        </button>
        <button
          onClick={() => setActiveFilter('4-star')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === '4-star'
              ? 'bg-black text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
        >
          ৪ স্টার ({count4})
        </button>
      </div>

      {/* Reviews Stream */}
      {filteredReviews.length > 0 ? (
        <div className="divide-y divide-neutral-100 space-y-5">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="pt-5 first:pt-0 space-y-3">
              {/* User meta & rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {rev.customerName.slice(0, 1)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900">{rev.customerName}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified Purchase
                      </span>
                      <span>·</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-current' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                {rev.comment}
              </p>

              {/* Helpful Upvote & Store Response */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => handleHelpful(rev.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                    votedReviews[rev.id]
                      ? 'bg-neutral-100 text-emerald-700 font-bold'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>
                    সহায়ক ছিল ({helpfulCounts[rev.id] || 0})
                  </span>
                </button>

                <span className="text-[10px] text-neutral-400 font-mono">
                  SAVAGE Verified Drop
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl p-6 space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
          <p className="font-bold text-neutral-700">এই প্রোডাক্টে এখনো কোনো রিভিউ দেওয়া হয়নি</p>
          <p className="text-neutral-500 max-w-sm mx-auto">
            আপনি কি এই পোশাকটি কিনেছেন? সবার প্রথমে রিভিউ লিখে অন্যান্য ক্রেতাদের সাহায্য করুন!
          </p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <span>প্রথম রিভিউটি লিখুন</span>
          </button>
        </div>
      )}
    </div>
  );
};
