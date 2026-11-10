import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  PlusCircle,
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Order, Product } from '../../types';

interface AdminDashboardProps {
  onSelectTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTab }) => {
  const { products, categories, siteSettings, initializeDefaultsIfEmpty } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [initSuccess, setInitSuccess] = useState(false);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        const ords: Order[] = [];
        snap.forEach((d) => ords.push({ id: d.id, ...d.data() } as Order));
        setOrders(ords);
      } catch (err) {
        console.warn('Orders fetch error:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // Compute real metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter((p) => p.active).length;
  const lowStockCount = products.filter((p) => p.totalStock <= 5 && p.totalStock > 0).length;

  const handleInitDefaults = async () => {
    await initializeDefaultsIfEmpty();
    setInitSuccess(true);
    setTimeout(() => setInitSuccess(false), 3000);
  };

  const isDatabaseEmpty = products.length === 0 && orders.length === 0;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">Overview</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Store Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleInitDefaults}
            className="px-4 py-2 border border-neutral-300 hover:border-black rounded-xl text-xs font-semibold text-neutral-700 bg-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>{initSuccess ? 'Settings Synced!' : 'Initialize Store Defaults'}</span>
          </button>
          <button
            onClick={() => onSelectTab('products/new')}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {totalOrdersCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Real customer orders</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
            {pendingOrdersCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Awaiting confirmation</span>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Products</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {activeProductsCount} <span className="text-xs font-normal text-neutral-400">/ {totalProductsCount}</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Catalog inventory</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            ৳{totalRevenue}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Calculated from actual orders</span>
        </div>
      </div>

      {/* Database Empty Guidance Section */}
      {isDatabaseEmpty && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Clean Database</span>
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-neutral-900 mt-1">
              Store Setup Checklist
            </h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              As required, your database starts completely clean with zero fake products, fake reviews, or dummy data. Follow these steps to prepare your store:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onSelectTab('categories')}
              className="p-5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl text-left transition-colors group"
            >
              <div className="text-xs font-bold uppercase text-neutral-400 mb-1">Step 1</div>
              <h4 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                Create Categories
              </h4>
              <p className="text-xs text-neutral-500 mt-1">Add T-Shirts, Hoodies, Panjabi, Caps, or Mugs.</p>
            </button>

            <button
              onClick={() => onSelectTab('products/new')}
              className="p-5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl text-left transition-colors group"
            >
              <div className="text-xs font-bold uppercase text-neutral-400 mb-1">Step 2</div>
              <h4 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                Add Real Products
              </h4>
              <p className="text-xs text-neutral-500 mt-1">Upload images, sizes, colors, and variant stock.</p>
            </button>

            <button
              onClick={() => onSelectTab('delivery')}
              className="p-5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl text-left transition-colors group"
            >
              <div className="text-xs font-bold uppercase text-neutral-400 mb-1">Step 3</div>
              <h4 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                Configure Delivery
              </h4>
              <p className="text-xs text-neutral-500 mt-1">Set Khulna, Dhaka, and Nationwide shipping rates.</p>
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Real orders placed through customer checkout</p>
          </div>
          <button
            onClick={() => onSelectTab('orders')}
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-neutral-900">{ord.orderNumber}</td>
                    <td className="p-3 font-semibold text-neutral-800">{ord.customer.name}</td>
                    <td className="p-3 font-mono text-neutral-500">{ord.customer.phone}</td>
                    <td className="p-3 font-mono font-bold text-neutral-900">৳{ord.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-900 text-white'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-neutral-400">
            No real orders recorded yet. When customers check out, their orders will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
};
