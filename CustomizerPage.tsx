import React from 'react';
import { MockupStudio } from '../components/mockup/MockupStudio';
import { Sparkles, Layers, ShieldCheck, Printer, ArrowLeft } from 'lucide-react';

interface CustomizerPageProps {
  onNavigate: (path: string) => void;
}

export const CustomizerPage: React.FC<CustomizerPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-red-600 font-bold">SAVAGE Custom Lab</span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">Live Mockup Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900 mt-1">
            Product Mockup & Customizer Studio
          </h1>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xs text-neutral-500">Need bulk custom corporate/team orders?</p>
          <a
            href="https://wa.me/8801779903110"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Chat with Production on WhatsApp →
          </a>
        </div>
      </div>

      {/* The Core Mockup Studio Component */}
      <MockupStudio />

      {/* Printing Technology & Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            High-Definition DTF Printing
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Ultra-sharp color vibrancy and wash fastness. No cracking or peeling even after 50+ wash cycles.
          </p>
        </div>

        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            Heavyweight Combed Cotton
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            220-240 GSM organic ring-spun cotton bases tailored for premium comfort and structured streetwear silhouette.
          </p>
        </div>

        <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            No Minimum Order Quantity
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Order single custom pieces or bulk runs for your clothing brand, university event, or creative project.
          </p>
        </div>
      </div>
    </div>
  );
};
