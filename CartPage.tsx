import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  Check,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { EmptyState } from '../components/common/EmptyState';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    appliedCoupon,
    setAppliedCoupon,
    clearCart
  } = useCart();
  const { validateCoupon, siteSettings } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApply = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await validateCoupon(couponInput, subtotal);
    setCouponLoading(false);
    if (res.valid) {
      setAppliedCoupon({ code: couponInput.toUpperCase(), discount: res.discount });
    } else {
      setCouponError(res.message || 'Invalid coupon');
    }
  };

  const discount = appliedCoupon?.discount || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 max-w-xl mx-auto">
          <EmptyState
            title="Your Shopping Bag is Empty"
            description="Explore our latest streetwear drops, hoodies, and accessories or design your own customized logo apparel."
            actionText="Browse Streetwear"
            onAction={() => onNavigate('/shop')}
            secondaryActionText="Open Mockup Lab"
            onSecondaryAction={() => onNavigate('/customizer')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Shopping Bag
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {cart.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-neutral-500 hover:text-red-600 underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items Table (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100 overflow-hidden shadow-xs">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 truncate">{item.name}</h3>
                    <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                      <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                      <span>·</span>
                      <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>
                    </div>
                    {item.isCustomMockup && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Custom Merch
                      </span>
                    )}
                    <div className="text-xs font-bold text-neutral-900 font-mono mt-1 sm:hidden">
                      ৳{item.price * item.quantity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-neutral-900 font-mono min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:block text-sm font-bold text-neutral-900 font-mono tabular-nums min-w-[70px] text-right">
                    ৳{item.price * item.quantity}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
            <button
              onClick={() => onNavigate('/shop')}
              className="hover:text-black underline font-semibold"
            >
              ← Continue Shopping
            </button>
            <span>Standard exchanges supported across Bangladesh</span>
          </div>
        </div>

        {/* Order Summary Box (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Order Summary
            </h3>

            {/* Coupon Application */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">
                Have a Coupon?
              </label>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono uppercase bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    onClick={handleApply}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Check className="w-4 h-4" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput('');
                    }}
                    className="text-red-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs text-neutral-600 pt-4 border-t border-neutral-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900 font-mono tabular-nums">৳{subtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">-৳{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping / Delivery</span>
                <span className="text-neutral-500 text-[11px]">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-3 border-t border-neutral-200">
                <span>Estimated Total</span>
                <span className="font-mono tabular-nums text-lg">৳{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-neutral-400 space-y-1">
              <p>✔ Cash on Delivery Available</p>
              <p>✔ 100% Secure Checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
