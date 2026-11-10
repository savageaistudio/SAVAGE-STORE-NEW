import React, { useState, useEffect } from 'react';
import { Users, Search, ShoppingBag, Phone, Mail } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';

interface AggregatedCustomer {
  phone: string;
  name: string;
  email?: string;
  district?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<AggregatedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const customerMap = new Map<string, AggregatedCustomer>();

        snap.forEach((d) => {
          const ord = d.data() as Order;
          const phoneKey = ord.customer?.phone || 'unknown';

          if (customerMap.has(phoneKey)) {
            const existing = customerMap.get(phoneKey)!;
            existing.totalOrders += 1;
            existing.totalSpent += ord.totalAmount || 0;
            if (new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = ord.createdAt;
            }
          } else {
            customerMap.set(phoneKey, {
              phone: phoneKey,
              name: ord.customer?.name || 'Customer',
              email: ord.customer?.email,
              district: ord.customer?.district,
              totalOrders: 1,
              totalSpent: ord.totalAmount || 0,
              lastOrderDate: ord.createdAt || new Date().toISOString()
            });
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (err) {
        console.warn('Customer aggregation error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">Clientele</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Customer Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Aggregated from {customers.length} verified customer order profiles
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400">Loading customer profiles...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Region / City</th>
                  <th className="p-3.5">Orders Count</th>
                  <th className="p-3.5">Total Spent</th>
                  <th className="p-3.5">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3.5 font-bold text-neutral-900">{c.name}</td>
                    <td className="p-3.5 font-mono text-neutral-600">{c.phone}</td>
                    <td className="p-3.5 text-neutral-600">{c.district || 'Bangladesh'}</td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900">{c.totalOrders}</td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900">৳{c.totalSpent}</td>
                    <td className="p-3.5 text-neutral-400">
                      {new Date(c.lastOrderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-neutral-300 stroke-1" />
            <p>No customer profiles found. When shoppers make purchases, their statistics will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
