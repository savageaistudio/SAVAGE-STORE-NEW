import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Send,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OFFICIAL_LOGO_PATH } from '../lib/firebase';

interface StaticPageProps {
  pageType: 'about' | 'contact' | 'privacy' | 'terms' | 'shipping' | 'return' | 'size-guide' | 'faq';
  onNavigate: (path: string) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ pageType, onNavigate }) => {
  const { siteSettings } = useStore();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setContactName('');
    setContactPhone('');
    setContactMsg('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* 1. About Us */}
      {pageType === 'about' && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <img
              src={OFFICIAL_LOGO_PATH}
              alt="SAVAGE STORE"
              className="w-20 h-20 rounded-full mx-auto border-2 border-red-600 shadow-md object-cover"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">The Atelier</span>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
              About SAVAGE STORE
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Founded in Khulna, Bangladesh, SAVAGE STORE was born to redefine streetwear aesthetics through superior fabric weights, uncompromising stitchwork, and bold graphic expressions.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6 text-sm text-neutral-600 leading-relaxed">
            <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wide">
              Our Craft & Identity
            </h3>
            <p>
              In a market crowded with generic fast-fashion and lightweight polyester blends, SAVAGE STORE prioritizes heavy organic cotton (220-250 GSM), drop-shoulder tailoring, and long-lasting screen/DTF print techniques. Every garment is carefully inspected in our Khulna atelier before dispatch.
            </p>
            <p>
              Whether you are shopping our signature drops or utilizing our Custom Mockup Lab to print custom merchandise for your own crew, we guarantee 100% genuine craftsmanship and prompt Cash on Delivery fulfillment.
            </p>
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-neutral-50 rounded-2xl">
                <span className="text-lg font-extrabold text-neutral-900 font-mono block">240+ GSM</span>
                <span className="text-xs text-neutral-500">Heavyweight Cotton</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl">
                <span className="text-lg font-extrabold text-neutral-900 font-mono block">Khulna, BD</span>
                <span className="text-xs text-neutral-500">Origin & Dispatch</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl">
                <span className="text-lg font-extrabold text-neutral-900 font-mono block">100% COD</span>
                <span className="text-xs text-neutral-500">Verified Doorstep Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Contact Us */}
      {pageType === 'contact' && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
              Contact SAVAGE STORE
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Have questions regarding sizing, custom apparel orders, or delivery tracking? Reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Direct Info */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Direct Communication
              </h3>
              <div className="space-y-4 text-xs text-neutral-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block font-bold">Atelier Address</strong>
                    <span>{siteSettings.address || 'Khulna, Bangladesh'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block font-bold">Call & WhatsApp Hotline</strong>
                    <a href={`tel:${siteSettings.phone}`} className="font-mono hover:text-black">
                      {siteSettings.phone}
                    </a>
                    <p className="text-[11px] text-neutral-400">Available 10 AM – 10 PM daily</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block font-bold">Official Email</strong>
                    <a href={`mailto:${siteSettings.email}`} className="hover:text-black">
                      {siteSettings.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <a
                  href="https://wa.me/8801779903110"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>

            {/* Message Form */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Send a Message
              </h3>
              {sentSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                  <p>Message sent successfully!</p>
                  <p className="text-[11px] text-emerald-600">Our customer team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rafiqul Islam"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us what you need help with..."
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Shipping Policy */}
      {pageType === 'shipping' && (
        <div className="space-y-6 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 pb-4 border-b border-neutral-200">
            Delivery & Shipping Policy
          </h1>
          <h3 className="font-bold text-neutral-900 uppercase">1. Delivery Zones & Estimated Timelines</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Inside Khulna City:</strong> 1-2 business days (Standard fee: ৳60).</li>
            <li><strong>Dhaka City Express:</strong> 2-3 business days (Standard fee: ৳100).</li>
            <li><strong>Outside Dhaka / All Bangladesh (64 Districts):</strong> 3-5 business days (Standard fee: ৳150).</li>
          </ul>

          <h3 className="font-bold text-neutral-900 uppercase pt-2">2. Cash on Delivery (COD)</h3>
          <p>
            All orders are fulfilled via Cash on Delivery (COD) by default. Customers may inspect the exterior of the parcel with the delivery rider present before making the payment.
          </p>

          <h3 className="font-bold text-neutral-900 uppercase pt-2">3. Order Verification</h3>
          <p>
            To prevent spam or invalid phone numbers, our dispatch team may make a quick phone call or send a WhatsApp confirmation message prior to dispatching your parcel.
          </p>
        </div>
      )}

      {/* 4. Return & Exchange Policy */}
      {pageType === 'return' && (
        <div className="space-y-6 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 pb-4 border-b border-neutral-200">
            Return & Exchange Policy
          </h1>
          <h3 className="font-bold text-neutral-900 uppercase">7-Day Replacement Guarantee</h3>
          <p>
            At SAVAGE STORE, we want you to wear our garments with absolute confidence. If you encounter sizing issues or manufacturing defects, we offer a hassle-free 7-day exchange window from the date of delivery.
          </p>

          <h3 className="font-bold text-neutral-900 uppercase pt-2">Eligibility Conditions</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Item must be unworn, unwashed, and in its original polybag with all tags intact.</li>
            <li>Exchange requests must be submitted within 7 calendar days of package receipt.</li>
            <li>In case of a size exchange, return courier charges may apply depending on delivery region.</li>
          </ul>

          <h3 className="font-bold text-neutral-900 uppercase pt-2">How to Request an Exchange</h3>
          <p>
            Contact our WhatsApp hotline at <strong className="text-black font-mono">01779903110</strong> with your Order Number and desired replacement size. Our team will arrange pickup or re-dispatch.
          </p>
        </div>
      )}

      {/* 5. Size Guide */}
      {pageType === 'size-guide' && (
        <div className="space-y-6 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 pb-4 border-b border-neutral-200">
            Size Chart & Fit Guide
          </h1>
          <p className="text-xs text-neutral-500">
            All measurements are provided in inches. For an oversized / relaxed fit, we recommend selecting your true size.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
              <thead className="bg-neutral-100 font-bold uppercase tracking-wider text-neutral-700">
                <tr>
                  <th className="p-3 border-b border-neutral-200">Size</th>
                  <th className="p-3 border-b border-neutral-200">Chest (Inches)</th>
                  <th className="p-3 border-b border-neutral-200">Length (Inches)</th>
                  <th className="p-3 border-b border-neutral-200">Sleeve (Inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                <tr><td className="p-3 font-bold font-sans">S (Small)</td><td className="p-3">38"</td><td className="p-3">27"</td><td className="p-3">8.0"</td></tr>
                <tr><td className="p-3 font-bold font-sans">M (Medium)</td><td className="p-3">40"</td><td className="p-3">28"</td><td className="p-3">8.5"</td></tr>
                <tr><td className="p-3 font-bold font-sans">L (Large)</td><td className="p-3">42"</td><td className="p-3">29"</td><td className="p-3">9.0"</td></tr>
                <tr><td className="p-3 font-bold font-sans">XL (Extra Large)</td><td className="p-3">44"</td><td className="p-3">30"</td><td className="p-3">9.5"</td></tr>
                <tr><td className="p-3 font-bold font-sans">XXL (Double XL)</td><td className="p-3">46"</td><td className="p-3">31"</td><td className="p-3">10.0"</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. FAQ */}
      {pageType === 'faq' && (
        <div className="space-y-6 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 pb-4 border-b border-neutral-200">
            Frequently Asked Questions
          </h1>

          <div className="space-y-4 text-xs sm:text-sm text-neutral-600">
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1">
              <strong className="text-neutral-900 font-bold block">Q: Can I pay through Cash on Delivery?</strong>
              <p>Yes, 100% of our orders can be paid in cash directly to the courier rider upon delivery across Bangladesh.</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1">
              <strong className="text-neutral-900 font-bold block">Q: How do I track my parcel?</strong>
              <p>Navigate to our Track Order page and enter either your Order Number (e.g. SVG-XXXX) or the phone number provided at checkout.</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1">
              <strong className="text-neutral-900 font-bold block">Q: How do custom mockup orders work?</strong>
              <p>Using our Mockup Lab, you can upload your logo or graphics, position them on hoodies or tees, and order directly. Our production team will print your piece using premium wash-fast DTF printing.</p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1">
              <strong className="text-neutral-900 font-bold block">Q: How do I exchange sizes?</strong>
              <p>Simply message us on WhatsApp (01779903110) within 7 days of delivery with your order ID.</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Privacy & Terms */}
      {(pageType === 'privacy' || pageType === 'terms') && (
        <div className="space-y-6 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900 pb-4 border-b border-neutral-200">
            {pageType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
          </h1>
          <p>
            SAVAGE STORE values your privacy. We only collect the necessary shipping details (full name, phone number, and delivery address) required to fulfill your orders through our courier partners in Bangladesh. We never sell or distribute customer data.
          </p>
          <p>
            All authenticated user passwords are encrypted securely via Google Firebase Authentication. No plaintext credentials are ever stored or accessible to employees.
          </p>
        </div>
      )}
    </div>
  );
};
