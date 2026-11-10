import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Package,
  Printer,
  ArrowRight,
  Truck,
  Phone,
  MapPin
} from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderConfirmationPageProps {
  orderId: string;
  orderNumber: string;
  onNavigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  orderNumber,
  onNavigate,
}) => {
  const { getOrderById, siteSettings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then((res) => setOrder(res))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId, getOrderById]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 stroke-[2.2]" />
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-700">Order Confirmed</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Thank you for choosing SAVAGE!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Your order has been recorded in our dispatch system. We will pack and deliver your parcel promptly.
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Order Number</span>
            <div className="text-xl font-extrabold font-mono text-neutral-900 mt-0.5">
              {orderNumber || order?.orderNumber || orderId}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={() => onNavigate('/track-order')}
              className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 transition-colors"
            >
              <Truck className="w-4 h-4" />
              Track Status
            </button>
          </div>
        </div>

        {order && (
          <div className="space-y-6 text-xs text-neutral-600">
            {/* Delivery & Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <div>
                <strong className="text-neutral-900 uppercase font-bold block mb-1">Shipping Details</strong>
                <p className="font-semibold text-neutral-800">{order.customer.name}</p>
                <p className="text-neutral-500 font-mono">{order.customer.phone}</p>
                <p className="text-neutral-600 mt-1">{order.customer.address}</p>
                <p className="text-neutral-500">
                  {order.customer.upazila ? `${order.customer.upazila}, ` : ''}
                  {order.customer.district}, {order.customer.division}
                </p>
              </div>

              <div>
                <strong className="text-neutral-900 uppercase font-bold block mb-1">Payment & Dispatch</strong>
                <p>Payment Method: <strong className="text-neutral-900">{order.paymentMethod}</strong></p>
                <p>Payment Status: <strong className="text-neutral-900">{order.paymentStatus}</strong></p>
                <p>Shipping Zone: <strong className="text-neutral-900">{order.deliveryZoneName}</strong></p>
                <p className="text-neutral-500 mt-1">
                  Placed on: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Line items list */}
            <div>
              <strong className="text-neutral-900 uppercase font-bold block mb-3">Items Purchased</strong>
              <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden bg-white">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-50 border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-neutral-500">
                        Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono text-neutral-900">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="space-y-1.5 pt-3 border-t border-neutral-200">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold font-mono text-neutral-900">৳{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-৳{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold font-mono text-neutral-900">৳{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Due on Delivery</span>
                <span className="font-mono tabular-nums text-base">৳{order.totalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => onNavigate('/')}
          className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Return to Homepage
        </button>
        <button
          onClick={() => onNavigate('/shop')}
          className="w-full sm:w-auto px-6 py-3 border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-xl transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
