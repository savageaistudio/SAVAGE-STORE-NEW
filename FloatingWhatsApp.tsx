import React, { useState } from 'react';
import { X, Send, Sparkles, MessageCircle, PhoneCall, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// Official High-Fidelity WhatsApp Emblem SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.83 7.34C8.64 7.34 8.33 7.41 8.08 7.68C7.83 7.95 7.12 8.62 7.12 9.97C7.12 11.33 8.11 12.63 8.24 12.82C8.38 13.01 10.18 15.79 12.94 16.98C13.6 17.26 14.11 17.43 14.51 17.56C15.17 17.77 15.77 17.74 16.25 17.67C16.78 17.59 17.89 17 18.12 16.35C18.35 15.7 18.35 15.15 18.28 15.03C18.21 14.92 18.03 14.85 17.75 14.71C17.47 14.57 16.1 13.9 15.84 13.81C15.59 13.71 15.4 13.67 15.22 13.94C15.03 14.22 14.51 14.85 14.35 15.03C14.19 15.22 14.03 15.24 13.75 15.1C13.47 14.96 12.57 14.67 11.51 13.72C10.68 12.98 10.12 12.07 9.96 11.79C9.79 11.52 9.94 11.37 10.08 11.23C10.21 11.1 10.37 10.89 10.51 10.73C10.65 10.56 10.7 10.45 10.79 10.26C10.88 10.08 10.84 9.92 10.77 9.78C10.7 9.64 10.15 8.28 9.91 7.73C9.69 7.18 9.46 7.26 9.29 7.25C9.13 7.24 8.94 7.24 8.83 7.34Z" />
  </svg>
);

export const FloatingWhatsApp: React.FC = () => {
  const { siteSettings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const phone = siteSettings.whatsapp || '01779903110';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('880') ? cleanPhone : `880${cleanPhone.replace(/^0+/, '')}`;

  const handleSend = (customText?: string) => {
    const textToSend = customText || message || 'Hello SAVAGE STORE! I would like to know about your streetwear collection & Cash on Delivery.';
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(textToSend)}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Chat Helper Modal */}
      {isOpen && (
        <div className="mb-4 w-84 max-w-[calc(100vw-2rem)] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 text-white animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-md">
                  <WhatsAppIcon className="w-6 h-6 fill-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-neutral-950 rounded-full animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  SAVAGE Official WhatsApp
                </h4>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  সরাসরি অনলাইন ২৪/৭
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3.5 space-y-2.5">
            <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed">
              👋 স্বাগতম SAVAGE STORE এ! ড্রপ-শোল্ডার টি-শার্ট, হুডি বা কাস্টমাইজড অর্ডারের জন্য আমাদের সাথে এখনই সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleSend('হ্যালো, আমি ক্যাশ অন ডেলিভারিতে একটি অর্ডার করতে চাই।')}
                className="w-full text-left p-2.5 rounded-xl bg-neutral-900 hover:bg-[#25D366]/20 border border-neutral-800 hover:border-[#25D366]/40 text-xs text-neutral-200 transition-all flex items-center justify-between group"
              >
                <span>📦 ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই</span>
                <span className="text-[10px] text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity">পাঠান →</span>
              </button>

              <button
                type="button"
                onClick={() => handleSend('ড্রপ শোল্ডার টি-শার্টের সাইজ, জিএসএম ও ফেব্রিক ডিটেইলস জানতে চাই।')}
                className="w-full text-left p-2.5 rounded-xl bg-neutral-900 hover:bg-[#25D366]/20 border border-neutral-800 hover:border-[#25D366]/40 text-xs text-neutral-200 transition-all flex items-center justify-between group"
              >
                <span>📏 সাইজ এবং কোয়ালিটি নিয়ে জানতে চাই</span>
                <span className="text-[10px] text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity">পাঠান →</span>
              </button>

              <button
                type="button"
                onClick={() => handleSend('আমার অর্ডারের বর্তমান ডেলিভারি স্ট্যাটাস জানতে চাই।')}
                className="w-full text-left p-2.5 rounded-xl bg-neutral-900 hover:bg-[#25D366]/20 border border-neutral-800 hover:border-[#25D366]/40 text-xs text-neutral-200 transition-all flex items-center justify-between group"
              >
                <span>🚚 অর্ডার ট্র্যাকিং ও আপডেট জানতে চাই</span>
                <span className="text-[10px] text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity">পাঠান →</span>
              </button>
            </div>
          </div>

          {/* Direct Input & 1-Click WhatsApp Button */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="আপনার বার্তা লিখুন..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3.5 py-2.5 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#25D366]"
              />
              <button
                onClick={() => handleSend()}
                className="p-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white rounded-xl transition-all shrink-0 shadow-md"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => handleSend()}
              className="w-full py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] hover:text-[#32e374] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>সরাসরি হোয়াটসঅ্যাপ খুলুন (01779903110)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button with Sonar Radar Wave Animation & Gradient */}
      <div className="relative group">
        {/* Animated Sonar Ping Waves */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
        <span className="absolute -inset-2 rounded-full bg-[#25D366] opacity-20 animate-pulse pointer-events-none" />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-[#25D366] via-[#20ba5a] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0f7a6e] text-white rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_35px_rgba(37,211,102,0.6)] active:scale-95 transition-all duration-300 cursor-pointer border border-white/20"
          title="WhatsApp Order & Support (01779903110)"
          aria-label="WhatsApp Support"
        >
          {/* Official WhatsApp Icon with Soft Glow */}
          <div className="relative">
            <WhatsAppIcon className="w-6 h-6 fill-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-xs" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-100 font-bold leading-none">
              Live Chat
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-white leading-tight">
              WhatsApp Support
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
