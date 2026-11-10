import React, { useState } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  Phone,
  Calendar
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';

interface OrderTrackingPageProps {
  onNavigate: (path: string) => void;
}

const STATUS_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered'
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onNavigate }) => {
  const { trackOrderByPhoneOrNumber } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const found = await trackOrderByPhoneOrNumber(searchTerm);
      setResults(found);
    } catch (e) {
      console.warn('Track search err:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black mx-auto mb-2">
          <Truck className="w-6 h-6 stroke-[1.5]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Real-Time Dispatch</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Track Your SAVAGE Order
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          Enter your Order ID (e.g. SVG-XXXX) or the Bangladesh phone number provided during checkout.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="pt-4 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Order Number or Phone (017...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:outline-none focus:border-black shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Results View */}
      {searched && (
        <div className="space-y-6">
          {results && results.length > 0 ? (
            results.map((order) => {
              const currentStep = getStepIndex(order.orderStatus);
              const isCancelled = order.orderStatus === 'Cancelled';
              const isReturned = order.orderStatus === 'Returned';

              return (
                <div
                  key={order.id}
                  className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Reference</span>
                      <h3 className="text-xl font-extrabold font-mono text-neutral-900">{order.orderNumber}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-neutral-900 text-white'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        ৳{order.totalAmount} (COD)
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {!isCancelled && !isReturned ? (
                    <div className="py-4">
                      <div className="grid grid-cols-6 gap-2 relative">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={step} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${
                                  isDone
                                    ? 'bg-black text-white'
                                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                                } ${isCurrent ? 'ring-4 ring-black/10 scale-110' : ''}`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-tight ${
                                  isDone ? 'text-neutral-900' : 'text-neutral-400'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold">
                      This order is marked as {order.orderStatus}. Please contact customer care at 01779903110 for assistance.
                    </div>
                  )}

                  {/* Details strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl text-xs text-neutral-600">
                    <div>
                      <strong className="text-neutral-900 block mb-1">Destination Address</strong>
                      <p className="font-semibold text-neutral-800">{order.customer.name}</p>
                      <p>{order.customer.address}, {order.customer.district}</p>
                      <p className="text-neutral-400 font-mono mt-0.5">{order.customer.phone}</p>
                    </div>
                    <div>
                      <strong className="text-neutral-900 block mb-1">Dispatch Meta</strong>
                      <p>Zone: <strong className="text-neutral-800">{order.deliveryZoneName}</strong></p>
                      <p>Date Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p>Items Count: {order.items.reduce((s, i) => s + i.quantity, 0)} units</p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <strong className="text-xs font-bold uppercase text-neutral-700 block">Package Contents</strong>
                    <div className="divide-y divide-neutral-100">
                      {order.items.map((item, i) => (
                        <div key={i} className="py-2 flex items-center justify-between text-xs">
                          <span className="text-neutral-800 font-medium">
                            {item.name} ({item.size}/{item.color}) × {item.quantity}
                          </span>
                          <span className="font-mono font-bold text-neutral-900">
                            ৳{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl p-10 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900">No Orders Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No orders match "{searchTerm}". Please double-check your order number or phone number, or contact us via WhatsApp: 01779903110.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
