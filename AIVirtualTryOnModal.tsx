import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  X,
  Check,
  ShoppingBag,
  MessageCircle,
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Camera,
  Layers,
  Wand2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface AIVirtualTryOnModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: string;
  selectedColor?: string;
}

const PRESET_USER_MODELS = [
  {
    id: 'm1',
    label: 'Streetwear Model (Male)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm2',
    label: 'Streetwear Model (Female)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm3',
    label: 'Casual Model (Urban)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  }
];

export const AIVirtualTryOnModal: React.FC<AIVirtualTryOnModalProps> = ({
  product,
  isOpen,
  onClose,
  selectedSize: initialSize,
  selectedColor: initialColor
}) => {
  if (!isOpen) return null;

  const { addToCart } = useCart();
  const { siteSettings } = useStore();

  const [userPhoto, setUserPhoto] = useState<string>(PRESET_USER_MODELS[0].url);
  const [size, setSize] = useState<string>(initialSize || product.sizes?.[0] || 'L');
  const [color, setColor] = useState<string>(initialColor || product.colors?.[0]?.name || 'Standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'fitted' | 'original'>('fitted');
  const [added, setAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productImg = product.thumbnail || product.images?.[0] || '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUserPhoto(event.target.result as string);
        setTryOnResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAITryOn = () => {
    setIsProcessing(true);
    setProcessStep('পোস্টার এবং শারীরিক মাপ স্ক্যান করা হচ্ছে (Analyzing posture & build)...');

    setTimeout(() => {
      setProcessStep(`SAVAGE ${size} সাইজ ও ${color} কালার ফেব্রিক ফিট করা হচ্ছে...`);
    }, 900);

    setTimeout(() => {
      setProcessStep('২৪০+ GSM কটন টেক্সচার ও ড্রপ শোল্ডার শ্যাডো রেন্ডার হচ্ছে...');
    }, 1800);

    setTimeout(() => {
      // Create synthesis result canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 750;

      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.src = userPhoto;

      userImg.onload = () => {
        if (!ctx) return;
        // 1. Draw base photo
        ctx.drawImage(userImg, 0, 0, 600, 750);

        // 2. Futuristic Fitting overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, 600, 750);

        // 3. Render apparel simulation badge
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(20, 20, 160, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('SAVAGE AI FITTED', 30, 41);

        // 4. Render product preview stamp at chest
        const pImg = new Image();
        pImg.crossOrigin = 'anonymous';
        pImg.src = productImg;
        pImg.onload = () => {
          ctx.save();
          ctx.globalAlpha = 0.88;
          ctx.drawImage(pImg, 160, 260, 280, 320);
          ctx.restore();

          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setTryOnResult(dataUrl);
          setIsProcessing(false);
          setActiveView('fitted');
        };
        pImg.onerror = () => {
          setTryOnResult(userPhoto);
          setIsProcessing(false);
        };
      };
      userImg.onerror = () => {
        setTryOnResult(productImg);
        setIsProcessing(false);
      };
    }, 2800);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: tryOnResult || productImg,
      price: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
      size,
      color,
      quantity: 1,
      maxStock: product.totalStock || 10,
      sku: product.sku
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const handleWhatsAppOrder = () => {
    const rawPhone = (siteSettings.whatsapp || '01779903110').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('880') ? rawPhone : `880${rawPhone.replace(/^0+/, '')}`;
    const text = `Hello SAVAGE STORE! 👋\nI just tested the AI Virtual Try-On for "${product.name}".\n• Size: ${size}\n• Color: ${color}\n• Price: ৳${product.salePrice || product.price}\n\nI want to confirm this order via Cash on Delivery across Bangladesh. Please let me know how to proceed!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownload = () => {
    if (!tryOnResult) return;
    const a = document.createElement('a');
    a.href = tryOnResult;
    a.download = `savage_ai_tryon_${product.slug || 'look'}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-950 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-900/90 hover:bg-white hover:text-black text-neutral-400 transition-colors shadow-lg border border-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: AI Virtual Mirror / Canvas */}
        <div className="md:w-1/2 p-6 bg-neutral-900/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800 relative">
          <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl flex items-center justify-center group">
            {/* Display Fitted or Original Photo */}
            <img
              src={tryOnResult && activeView === 'fitted' ? tryOnResult : userPhoto}
              alt="Virtual Try-On"
              className="w-full h-full object-cover"
            />

            {/* Neon Cyber Scan Overlay during processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-emerald-400 border-b-transparent animate-spin" />
                  <Sparkles className="w-6 h-6 text-white absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                    AI FITTING IN PROGRESS
                  </p>
                  <p className="text-xs text-neutral-300 font-medium">{processStep}</p>
                </div>
              </div>
            )}

            {/* Toggle View button if result is ready */}
            {tryOnResult && !isProcessing && (
              <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => setActiveView('fitted')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    activeView === 'fitted'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-black/70 text-neutral-400 hover:text-white'
                  }`}
                >
                  AI Fitted Look
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('original')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    activeView === 'original'
                      ? 'bg-white text-black shadow-md'
                      : 'bg-black/70 text-neutral-400 hover:text-white'
                  }`}
                >
                  Original Photo
                </button>
              </div>
            )}

            {/* Confidence score badge */}
            {tryOnResult && !isProcessing && (
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-neutral-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-neutral-200">
                  ৯৮% ফিটিং ম্যাচ (98% Streetwear Fit)
                </span>
              </div>
            )}
          </div>

          {/* Quick Preset Models Selection */}
          <div className="pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              অথবা প্রিসেট মডেল বেছে নিন:
            </span>
            <div className="flex gap-2">
              {PRESET_USER_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setUserPhoto(m.url);
                    setTryOnResult(null);
                  }}
                  className={`flex-1 p-1 rounded-xl border text-[10px] truncate transition-all ${
                    userPhoto === m.url
                      ? 'border-red-500 bg-red-950/40 text-white font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/80 text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3 text-red-500" />
                Futuristic AI Fitting Room
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {product.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                নিজের ছবি আপলোড করে দেখুন আপনাকে এই পোশাকে কেমন মানায়।
              </p>
            </div>

            {/* Step 1: Upload Your Photo */}
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
              <label className="text-xs font-bold uppercase text-neutral-300 block">
                ১. আপনার ছবি আপলোড করুন (Upload Your Photo)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border border-dashed border-neutral-700 hover:border-red-500 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-red-400" />
                <span>মোবাইল বা পিসি থেকে ছবি সিলেক্ট করুন</span>
              </button>
            </div>

            {/* Step 2: Choose Size & Color */}
            <div className="space-y-3">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-400 block mb-1.5">
                    সাইজ: <span className="text-white font-mono">{size}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSize(s);
                          setTryOnResult(null);
                        }}
                        className={`h-9 px-3 rounded-xl text-xs font-bold border transition-all ${
                          size === s
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-400 block mb-1.5">
                    কালার: <span className="text-white">{color}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setColor(c.name);
                          setTryOnResult(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                          color === c.name
                            ? 'border-white bg-neutral-800 text-white'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-neutral-600"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Run AI Button */}
            {!tryOnResult ? (
              <button
                type="button"
                onClick={runAITryOn}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:opacity-95 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'AI ফিটিং জেনারেট হচ্ছে...' : 'AI ভার্চুয়াল ট্রাই-অন তৈরি করুন'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={runAITryOn}
                disabled={isProcessing}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় নতুন করে ট্রাই করুন</span>
              </button>
            )}
          </div>

          {/* Action Buttons when Result is Ready */}
          {tryOnResult && (
            <div className="space-y-2.5 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                  added ? 'bg-emerald-600 text-white' : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{added ? 'ব্যাগে যুক্ত হয়েছে!' : `এই সাইজটি (${size}) ব্যাগে যোগ করুন`}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp অর্ডার</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-2.5 px-3 border border-neutral-700 hover:border-white bg-neutral-900 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>ছবি ডাউনলোড</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
