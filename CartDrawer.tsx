import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    appliedCoupon,
    setAppliedCoupon
  } = useCart();
  const { validateCoupon, siteSettings } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const res = await validateCoupon(couponCode, subtotal);
    setCouponLoading(false);
    if (res.valid) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: res.discount });
      setCouponMsg({ text: res.message || 'Coupon applied!', isError: false });
    } else {
      setCouponMsg({ text: res.message || 'Invalid coupon.', isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg(null);
  };

  const handleGoToCheckout = () => {
    closeCart();
    onNavigate('/checkout');
  };

  const finalTotal = Math.max(0, subtotal - (appliedCoupon?.discount || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wide">
                Your Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Looks like you haven't added anything to your cart yet. Explore our streetwear drops or customize your own merch!
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={() => {
                      closeCart();
                      onNavigate('/shop');
                    }}
                    className="w-full py-2.5 px-4 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    Browse Collection
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      onNavigate('/customizer');
                    }}
                    className="w-full py-2.5 px-4 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    Open Mockup Studio
                  </button>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="py-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-neutral-200 bg-neutral-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-neutral-400 hover:text-red-600 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                        <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                        <span>·</span>
                        <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>
                      </div>
                      {item.isCustomMockup && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Custom Printed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-neutral-900 min-w-[20px] text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs font-bold text-neutral-900 font-mono tabular-nums">
                        ৳{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-200 bg-neutral-50/70 space-y-4">
              {/* Coupon Box */}
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono uppercase bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-black disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:underline text-[11px] font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponMsg && (
                <p className={`text-[11px] ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900 font-mono tabular-nums">৳{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-৳{appliedCoupon.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-neutral-500 text-[11px]">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums text-base">৳{finalTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleGoToCheckout}
                className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('/cart');
                  }}
                  className="text-xs text-neutral-500 hover:text-black underline"
                >
                  View full cart details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
