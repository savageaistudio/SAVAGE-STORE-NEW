import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { OFFICIAL_LOGO_PATH } from '../lib/firebase';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
        <img
          src={OFFICIAL_LOGO_PATH}
          alt="SAVAGE STORE"
          className="w-20 h-20 rounded-full mx-auto border-2 border-red-600 shadow-sm object-cover"
        />

        <div className="space-y-2">
          <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 font-mono tracking-tight block">
            404
          </span>
          <h1 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
            Page Not Found
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The streetwear drop or page you're searching for might have moved or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="flex-1 py-3 border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Browse Shop
          </button>
        </div>
      </div>
    </div>
  );
};
