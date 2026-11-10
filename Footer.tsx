import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { siteSettings } = useStore();

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-500 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fast Bangladesh Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Express delivery in Khulna & nationwide across 64 districts.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cash on Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Pay comfortably at your doorstep upon inspecting your package.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-500 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Easy 7-Day Exchange</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Hassle-free size replacement and dedicated customer care.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-neutral-800">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={OFFICIAL_LOGO_PATH}
                alt="SAVAGE STORE"
                className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
              />
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-white uppercase">
                  SAVAGE<span className="text-red-500">.</span>
                </h3>
                <p className="text-[10px] tracking-widest text-neutral-400 uppercase font-semibold">
                  Streetwear & Custom Apparel
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {siteSettings.description ||
                'SAVAGE STORE is an independent Bangladeshi fashion label curating premium heavy-cotton tees, oversized drops, and custom-printed streetwear merchandise.'}
            </p>

            {/* Contact Details */}
            <div className="space-y-2 text-xs text-neutral-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{siteSettings.address || 'Khulna, Bangladesh'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`tel:${siteSettings.phone}`} className="hover:text-white transition-colors font-mono">
                  {siteSettings.phone} (Call / WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`mailto:${siteSettings.email}`} className="hover:text-white transition-colors">
                  {siteSettings.email}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-3">
              {siteSettings.facebook && (
                <a
                  href={siteSettings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-red-600 flex items-center justify-center text-neutral-300 hover:text-white transition-colors border border-neutral-800"
                  title="Facebook Page"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {siteSettings.instagram && (
                <a
                  href={siteSettings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-red-600 flex items-center justify-center text-neutral-300 hover:text-white transition-colors border border-neutral-800"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings.youtube && (
                <a
                  href={siteSettings.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-red-600 flex items-center justify-center text-neutral-300 hover:text-white transition-colors border border-neutral-800"
                  title="YouTube Channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {siteSettings.tiktok && (
                <a
                  href={`https://${siteSettings.tiktok}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-red-600 flex items-center justify-center text-neutral-300 hover:text-white transition-colors border border-neutral-800 text-[11px] font-bold"
                  title="TikTok"
                >
                  TT
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore Shop</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors">
                  All Collections
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/customizer')} className="hover:text-red-400 transition-colors flex items-center gap-1 font-semibold text-neutral-200">
                  <Sparkles className="w-3 h-3 text-red-500" />
                  Custom Mockup Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/track-order')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/wishlist')} className="hover:text-white transition-colors">
                  Saved Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/size-guide')} className="hover:text-white transition-colors">
                  Size Chart & Fit Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shipping-policy')} className="hover:text-white transition-colors">
                  Delivery & Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/return-policy')} className="hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">About & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About SAVAGE
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} <strong className="text-neutral-400">SAVAGE STORE</strong>. All rights reserved. Khulna, Bangladesh.
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Currency: <strong>BDT (৳)</strong></span>
            <span>·</span>
            <span>Timezone: <strong>Asia/Dhaka</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
