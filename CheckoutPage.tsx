import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { CustomerInfo, DeliveryZone } from '../types';
import { ALL_64_DISTRICTS, getDeliveryFeeForDistrict } from '../lib/bangladeshDistricts';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderCompleted: (orderId: string, orderNumber: string) => void;
}

const BD_DIVISIONS = [
  'Khulna',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Sylhet',
  'Barishal',
  'Rangpur',
  'Mymensingh'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderCompleted }) => {
  const { cart, subtotal, appliedCoupon, clearCart } = useCart();
  const { deliveryZones, placeOrder, siteSettings } = useStore();
  const { currentUser, userProfile } = useAuth();

  // Form State
  const [name, setName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [division, setDivision] = useState('Khulna');
  const [district, setDistrict] = useState('Khulna');
  const [upazila, setUpazila] = useState('');
  const [notes, setNotes] = useState('');

  // Selected Delivery Zone
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);

  // Fallback default zones if Firestore zones are not yet configured by admin
  const activeZones: DeliveryZone[] = deliveryZones.length > 0
    ? deliveryZones.filter((z) => z.active)
    : [
        {
          id: 'zone_khulna',
          name: 'Inside Khulna City',
          deliveryCharge: 60,
          minimumOrder: 1500,
          estimatedDays: '1-2 Days',
          active: true
        },
        {
          id: 'zone_dhaka',
          name: 'Dhaka City Express',
          deliveryCharge: 100,
          minimumOrder: 2500,
          estimatedDays: '2-3 Days',
          active: true
        },
        {
          id: 'zone_outside',
          name: 'Outside Dhaka / Nationwide',
          deliveryCharge: 150,
          minimumOrder: 3000,
          estimatedDays: '3-4 Days',
          active: true
        }
      ];

  useEffect(() => {
    if (!selectedZone && activeZones.length > 0) {
      setSelectedZone(activeZones[0]);
    }
  }, [activeZones, selectedZone]);

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment'>('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-redirect if empty
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No items to checkout</h2>
        <p className="text-xs text-neutral-500 mb-6">Your shopping bag is empty. Please select products first.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isKhulnaDistrict = district.toLowerCase().includes('khulna');
  const deliveryFee = isKhulnaDistrict ? 60 : 120;
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Normalize BD Phone: support 01..., +8801..., 8801...
    let cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.startsWith('880')) {
      cleanPhone = cleanPhone.slice(2);
    }
    if (!cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = `0${cleanPhone}`;
    }

    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01779903110)।');
      return;
    }

    if (!name.trim() || !address.trim()) {
      setErrorMsg('আপনার পূর্ণ নাম এবং ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    const isKhulnaDistrict = district.toLowerCase().includes('khulna');
    const autoDeliveryFee = isKhulnaDistrict ? 60 : 120;
    const effectiveZone: DeliveryZone = selectedZone ? {
      ...selectedZone,
      deliveryCharge: autoDeliveryFee
    } : {
      id: isKhulnaDistrict ? 'zone_khulna' : 'zone_nationwide',
      name: isKhulnaDistrict ? 'Khulna Express (৳৬০)' : `${district} Nationwide (৳১২০)`,
      deliveryCharge: autoDeliveryFee,
      estimatedDays: isKhulnaDistrict ? '1-2 Days' : '3-5 Days',
      active: true,
    };

    setIsSubmitting(true);

    try {
      const customerInfo: CustomerInfo = {
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        address: address.trim(),
        division,
        district,
        upazila: upazila.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const result = await placeOrder(
        cart,
        customerInfo,
        effectiveZone,
        appliedCoupon?.code,
        currentUser?.uid
      );

      clearCart();
      onOrderCompleted(result.orderId, result.orderNumber);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-neutral-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Cash on Delivery across Bangladesh · No prepayment required
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Customer & Address Form (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact Info */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">1</span>
                <span>Customer Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Iqbal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Phone Number (BD Mobile) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Our delivery rider will call this number prior to delivery.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Email Address <span className="text-neutral-400 font-normal">(Optional for order receipts)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>Delivery Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => {
                      setDivision(e.target.value);
                      if (e.target.value === 'Khulna') {
                        setDistrict('Khulna');
                      } else if (e.target.value === 'Dhaka') {
                        setDistrict('Dhaka');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
                  >
                    {BD_DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    District / জেলা (৬৪ জেলা) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={district}
                    onChange={(e) => {
                      const selDist = e.target.value;
                      setDistrict(selDist);
                      const matched = ALL_64_DISTRICTS.find((d) => d.name === selDist);
                      if (matched) {
                        setDivision(matched.division);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
                  >
                    <optgroup label="Khulna Division (Express Dispatch 24-48h)">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Khulna').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName}) - {d.deliveryDays}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Dhaka Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Dhaka').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Chattogram Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Chattogram').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Rajshahi Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Rajshahi').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Sylhet Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Sylhet').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Barishal Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Barishal').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Rangpur Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Rangpur').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Mymensingh Division">
                      {ALL_64_DISTRICTS.filter((d) => d.division === 'Mymensingh').map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.banglaName})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Area / Thana</label>
                  <input
                    type="text"
                    placeholder="e.g. Khalishpur / Sonadanga"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Full Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House number, road number, landmark or apartment details..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Delivery Notes <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please deliver after 3 PM or leave with security"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* 3. Delivery Zone Selection */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">3</span>
                <span>Select Shipping Zone</span>
              </h3>

              <div className="space-y-2.5">
                {activeZones.map((zone) => (
                  <label
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedZone?.id === zone.id
                        ? 'border-black bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedZone?.id === zone.id ? 'border-white' : 'border-neutral-400'
                        }`}
                      >
                        {selectedZone?.id === zone.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{zone.name}</div>
                        <div className={`text-[11px] ${selectedZone?.id === zone.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Estimated delivery: {zone.estimatedDays}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold font-mono">
                      ৳{zone.deliveryCharge}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Payment Method Selection */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">4</span>
                <span>Payment Method</span>
              </h3>

              <div className="space-y-2">
                <label
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-black bg-black text-white shadow-xs'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs font-bold">Cash on Delivery (COD)</div>
                      <div className={`text-[11px] ${paymentMethod === 'Cash on Delivery' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Pay with cash upon package receipt at your doorstep
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                    Recommended
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Order Review ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="py-2.5 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-neutral-500">
                        {item.size} / {item.color} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs text-neutral-600 pt-4 border-t border-neutral-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900 font-mono">৳{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-mono">-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping ({selectedZone?.name || 'Standard'})</span>
                  <span className="font-semibold text-neutral-900 font-mono">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-xl">৳{grandTotal}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <span>Confirm Order (৳{grandTotal} COD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-neutral-400 space-y-1">
                <p>✔ No payment needed now. Pay in cash to the rider.</p>
                <p>✔ Instant SMS / WhatsApp order verification</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
