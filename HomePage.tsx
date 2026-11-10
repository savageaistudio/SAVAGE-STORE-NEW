import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Palette,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Layers,
  Shirt,
  Star
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Product, Banner } from '../types';
import { OFFICIAL_LOGO_PATH } from '../lib/firebase';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

// Curated Editorial Streetwear Slides for SAVAGE STORE
const DEFAULT_FASHION_SLIDES: Banner[] = [
  {
    id: 'slide-1',
    title: 'URBAN NOIR // DROP 01',
    subtitle: 'Heavyweight 240+ GSM Combed Cotton • Drop-Shoulder Oversized Silhouettes',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1920&q=80',
    buttonText: 'Shop The Drop',
    buttonLink: '/shop',
    sortOrder: 1,
    active: true
  },
  {
    id: 'slide-2',
    title: 'OVERSIZED HOODIES & FLEECE',
    subtitle: '380 GSM Heavy French Terry • Double Layered Hoods • Minimalist Streetwear',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=80',
    buttonText: 'Explore Hoodies',
    buttonLink: '/category/hoodies',
    sortOrder: 2,
    active: true
  },
  {
    id: 'slide-3',
    title: 'VINTAGE MINERAL WASH TEES',
    subtitle: 'Individually Hand-Dye Treated • Boxy Relaxed Cut • Pre-Shrunk Comfort',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=80',
    buttonText: 'Shop T-Shirts',
    buttonLink: '/category/t-shirts',
    sortOrder: 3,
    active: true
  }
];

// Curated Fashion Category Lookbook Tiles
const FASHION_CATEGORIES = [
  {
    name: 'Oversized Tees',
    slug: 't-shirts',
    tag: '240 GSM Cotton',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Streetwear Hoodies',
    slug: 'hoodies',
    tag: '380 GSM French Terry',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Acid Wash Drop',
    slug: 'acid-wash',
    tag: 'Vintage Mineral',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cargo & Joggers',
    slug: 'pants',
    tag: 'Relaxed Fit',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Caps & Headwear',
    slug: 'headwear',
    tag: 'Embroidered',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Custom Merch Lab',
    slug: 'customizer',
    tag: '3D Mockup Studio',
    isCustomizer: true,
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&q=80'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { products, categories, banners, siteSettings, isLoading } = useStore();
  const { isAdmin } = useAuth();

  // Active banners or high-fashion editorial defaults
  const activeBanners = banners.filter((b) => b.active);
  const displayBanners = activeBanners.length > 0 ? activeBanners : DEFAULT_FASHION_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'oversized' | 'hoodies' | 'new'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Auto-advance banner slides every 6 seconds
  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  // Filter products by tab
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    if (activeTab === 'oversized') {
      return (
        p.categoryName?.toLowerCase().includes('shirt') ||
        p.name.toLowerCase().includes('oversized') ||
        p.tags?.some((t) => t.toLowerCase().includes('oversized'))
      );
    }
    if (activeTab === 'hoodies') {
      return (
        p.categoryName?.toLowerCase().includes('hoodie') ||
        p.name.toLowerCase().includes('hoodie') ||
        p.subcategory?.toLowerCase().includes('hoodie')
      );
    }
    if (activeTab === 'new') {
      return p.newArrival;
    }
    return true;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HIGH-FASHION HERO BANNER CAROUSEL */}
      <section className="relative w-full bg-black overflow-hidden group">
        <div className="relative min-h-[520px] sm:min-h-[620px] lg:min-h-[720px] flex items-center justify-center">
          {displayBanners.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Dark Vignette Gradient */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] scale-100 transition-transform duration-10000"
                />

                {/* Aesthetic Dark Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                {/* Clean, Futuristic Minimal Overlay - Let the Apparel Visuals Shine */}
                <div className="absolute inset-x-0 bottom-12 z-20">
                  <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                        <Flame className="w-3 h-3 text-red-500 fill-current" />
                        <span>SAVAGE STORE // DROP 2026</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                        {slide.title}
                      </h2>
                    </div>

                    {/* Sleek Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigate(slide.buttonLink || '/shop')}
                        className="px-7 py-3.5 bg-white hover:bg-neutral-100 active:scale-95 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-2xl flex items-center gap-2"
                      >
                        <span>{slide.buttonText || 'Shop Collection'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onNavigate('/customizer')}
                        className="px-6 py-3.5 bg-black/70 hover:bg-black backdrop-blur-md border border-white/30 hover:border-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-xl"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                        <span>Mockup Lab</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel Arrows */}
          {displayBanners.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Progress Dots / Bars */}
              <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center items-center gap-2.5">
                {displayBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      i === currentSlide
                        ? 'w-10 bg-red-600 shadow-md shadow-red-600/50'
                        : 'w-2.5 bg-white/40 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 2. FASHION TRUST PILLARS (Clean Streetwear Standards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-neutral-200 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-neutral-50 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold shrink-0">
              ৳
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-900 tracking-tight">100% Cash On Delivery</h4>
              <p className="text-[11px] text-neutral-500">৳০ অগ্রিম। পার্সেল দেখে পেমেন্ট</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-neutral-50 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-900 tracking-tight">২৪-৪৮ ঘণ্টা ডেলিভারি</h4>
              <p className="text-[11px] text-neutral-500">খুলনা ও ৬৪ জেলায় ফাস্ট এক্সপ্রেস</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-neutral-50 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-900 tracking-tight">২৪০+ GSM প্রিমিয়াম কটন</h4>
              <p className="text-[11px] text-neutral-500">কম্বড অর্গানিক কটন ও কালারফাস্ট</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-neutral-50 transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-900 tracking-tight">৭ দিনের সাইজ এক্সচেঞ্জ</h4>
              <p className="text-[11px] text-neutral-500">সাইজ সমস্যা হলে তাত্ক্ষণিক পরিবর্তন</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY - VISUAL LOOKBOOK TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-600 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Fashion Taxonomy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight">
              Curated Streetwear Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-neutral-900 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FASHION_CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (cat.isCustomizer) {
                  onNavigate('/customizer');
                } else {
                  onNavigate(`/category/${cat.slug}`);
                }
              }}
              className="group cursor-pointer relative aspect-3/4 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 hover:border-black transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-end p-4 text-white"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75] group-hover:scale-110 group-hover:brightness-[0.85] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="relative z-10 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[9px] font-mono font-bold text-neutral-200 uppercase tracking-wider">
                  {cat.tag}
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white leading-snug group-hover:text-red-400 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-neutral-300 font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Drops</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE MOCKUP STUDIO SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white border border-neutral-800 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16">
            <div className="lg:col-span-8 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/80 text-xs font-bold text-red-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Interactive Mockup & Custom Apparel Studio
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Upload Your Logo & See It Placed on T-Shirts and Mugs
              </h3>

              <p className="text-neutral-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                Test your brand identity on realistic 3D streetwear mockups. Change fabric colors, scale, rotate, preview on black/white apparel, and place custom bulk or single piece orders directly with Cash on Delivery.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/customizer')}
                  className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <Palette className="w-4 h-4" />
                  <span>Launch 3D Mockup Studio</span>
                </button>

                <a
                  href={`https://wa.me/8801779903110?text=${encodeURIComponent(
                    'Hello SAVAGE STORE! I want to order custom printed merchandise with my own logo.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Custom Order via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Visual Logo / Product Preview */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => onNavigate('/customizer')}>
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 border-red-600 shadow-2xl bg-neutral-900 flex items-center justify-center p-3 relative group-hover:scale-105 transition-transform">
                  <img
                    src={OFFICIAL_LOGO_PATH}
                    alt="SAVAGE STORE Official Emblem"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-white text-black font-extrabold text-xs rounded-xl shadow-lg">
                      Try on Mockup →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRENDING DROPS WITH TABS & QUICK VIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-600 mb-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Catalog Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight">
              Featured Streetwear Drops
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'all'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              All Drops
            </button>
            <button
              onClick={() => setActiveTab('oversized')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'oversized'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Oversized Tees
            </button>
            <button
              onClick={() => setActiveTab('hoodies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'hoodies'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Hoodies & Fleece
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'new'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Product Cards Grid or Pristine Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 text-center">
            <EmptyState
              title="No products available in this drop category yet"
              description="The database is clean and ready. Add new products, oversized streetwear, and variant inventory from the administrative console."
              actionText="Open Customizer Lab"
              onAction={() => onNavigate('/customizer')}
              secondaryActionText={isAdmin ? 'Add Products in Admin' : undefined}
              onSecondaryAction={isAdmin ? () => onNavigate('/admin/products/new') : undefined}
            />
          </div>
        )}
      </section>

      {/* 6. EDITORIAL LOOKBOOK BRAND STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-neutral-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-500">
                The SAVAGE Ethos // 2026
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                Built For Attitude. Engineered For The Streets.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
                SAVAGE STORE was founded in Khulna with a singular purpose: to bring uncompromised streetwear craftsmanship to Bangladesh. Every piece uses high-density combed cotton yarns, reinforced chain-stitch seams, and breathable comfort cuts designed to outlast fast-fashion trends.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-6 py-3 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  Read Our Brand Story
                </button>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="px-6 py-3 border border-neutral-700 hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Explore All Collections
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">240+</span>
                <h4 className="text-xs font-bold text-neutral-300 uppercase mt-1">Cotton GSM</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">Heavyweight durability</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">64</span>
                <h4 className="text-xs font-bold text-neutral-300 uppercase mt-1">Districts</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">Nationwide COD coverage</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">100%</span>
                <h4 className="text-xs font-bold text-neutral-300 uppercase mt-1">Cash On Delivery</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">Zero advance risk</p>
              </div>
              <div className="p-5 rounded-2xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">7 Days</span>
                <h4 className="text-xs font-bold text-neutral-300 uppercase mt-1">Exchange</h4>
                <p className="text-[10px] text-neutral-500 mt-0.5">Prompt size exchange</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
