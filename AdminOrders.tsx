import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  RotateCcw,
  AlertCircle,
  MessageSquare,
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { Order, OrderStatus, PaymentStatus } from '../../types';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned'
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [courierSlipOrder, setCourierSlipOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const ords: Order[] = [];
      snap.forEach((d) => ords.push({ id: d.id, ...d.data() } as Order));
      setOrders(ords);
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setInternalNote(ord.internalNote || '');
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        orderStatus: newStatus,
        internalNote,
        updatedAt: new Date().toISOString()
      });
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus, internalNote });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, orderStatus: newStatus, internalNote } : o))
      );
    } catch (e) {
      console.error('Update status err:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async (newPayment: PaymentStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        paymentStatus: newPayment,
        updatedAt: new Date().toISOString()
      });
      setSelectedOrder({ ...selectedOrder, paymentStatus: newPayment });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, paymentStatus: newPayment } : o))
      );
    } catch (e) {
      console.error('Update payment err:', e);
    } finally {
      setUpdating(false);
    }
  };

  // 1-Click WhatsApp Customer Message Generator
  const getWhatsAppLink = (order: Order) => {
    const rawPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('880') ? rawPhone : `880${rawPhone.replace(/^0+/, '')}`;
    const trackingUrl = `${window.location.origin}/track-order`;
    const message = `Hello ${order.customer.name}! 👋\n\nThis is SAVAGE STORE (Khulna, BD).\nYour Order #${order.orderNumber} (Amount: ৳${order.totalAmount}) is currently: ${order.orderStatus.toUpperCase()}.\n\nItems: ${order.items.map(i => `${i.quantity}x ${i.name} (${i.size})`).join(', ')}\nDelivery to: ${order.customer.address}, ${order.customer.district}.\n\nTrack your order anytime: ${trackingUrl}\nHotline / WhatsApp: 01779903110\nThank you for choosing SAVAGE STORE! 🔥`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Address', 'District', 'Subtotal BDT', 'Delivery Fee', 'Total Amount BDT', 'Order Status', 'Payment Status', 'Payment Method'];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customer.name.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${o.customer.district || o.deliveryZoneName}"`,
      o.subtotal,
      o.deliveryCharge,
      o.totalAmount,
      `"${o.orderStatus}"`,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `savage_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">Fulfillment</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            Order Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {orders.length} total orders recorded in Firestore · 1-click WhatsApp & courier slips enabled
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-neutral-300 hover:border-black rounded-xl text-xs font-semibold bg-white text-neutral-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'all' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All ({orders.length})
          </button>
          {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => {
            const count = orders.filter((o) => o.orderStatus === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === st ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400">Loading orders from Firestore...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone / Contact</th>
                  <th className="p-3.5">City / Zone</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-neutral-900">{ord.orderNumber}</td>
                    <td className="p-3.5 font-semibold text-neutral-900">{ord.customer.name}</td>
                    <td className="p-3.5 font-mono text-neutral-700">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.customer.phone}</span>
                        <a
                          href={getWhatsAppLink(ord)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Send WhatsApp Order Update"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-600 truncate max-w-[140px]">
                      {ord.customer.district || ord.deliveryZoneName}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-neutral-900">৳{ord.totalAmount}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-neutral-900 text-white'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCourierSlipOrder(ord)}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 flex items-center gap-1 transition-colors"
                          title="Print Courier Parcel Slip (Pathao / Steadfast format)"
                        >
                          <FileText className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Slip</span>
                        </button>
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-neutral-300 stroke-1" />
            <p>No orders match the selected filters or search query.</p>
          </div>
        )}
      </div>

      {/* Courier Shipping Dispatch Slip Modal */}
      {courierSlipOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/60 print:p-0 print:bg-white">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-neutral-200 print:shadow-none print:border-none print:max-w-none">
            {/* Slip Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <img
                  src={OFFICIAL_LOGO_PATH}
                  alt="SAVAGE"
                  className="w-10 h-10 rounded-full border border-red-600 object-cover"
                />
                <div>
                  <h3 className="font-extrabold uppercase tracking-tight text-base text-black">
                    SAVAGE STORE PARCEL DISPATCH
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Khulna, BD · Tel: 01779903110 · www.savagestore.com
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCourierSlipOrder(null)}
                className="print:hidden p-1.5 text-neutral-400 hover:text-black rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Courier Tracking & Barcode Strip */}
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Tracking Reference</span>
                <span className="font-mono font-extrabold text-sm text-black">{courierSlipOrder.orderNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">COD Collection Amount</span>
                <span className="font-mono font-extrabold text-base text-red-600">৳{courierSlipOrder.totalAmount}</span>
              </div>
            </div>

            {/* Mock barcode visual for physical parcel */}
            <div className="py-2 text-center">
              <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px)] rounded opacity-80" />
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 mt-1 block">
                *{courierSlipOrder.orderNumber}*
              </span>
            </div>

            {/* Consignee / Delivery Address */}
            <div className="grid grid-cols-2 gap-4 text-xs border-y border-neutral-200 py-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                  Recipient (Customer)
                </span>
                <p className="font-bold text-black">{courierSlipOrder.customer.name}</p>
                <p className="font-mono font-semibold text-neutral-800 mt-0.5">{courierSlipOrder.customer.phone}</p>
                <p className="text-neutral-600 mt-1 leading-snug">{courierSlipOrder.customer.address}</p>
                <p className="font-semibold text-neutral-700 mt-0.5">
                  {courierSlipOrder.customer.district}, {courierSlipOrder.customer.division}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                  Delivery Details
                </span>
                <p>Zone: <strong className="text-black">{courierSlipOrder.deliveryZoneName}</strong></p>
                <p>Payment: <strong className="text-black">{courierSlipOrder.paymentMethod}</strong></p>
                <p>Status: <strong className="text-black">{courierSlipOrder.orderStatus}</strong></p>
                {courierSlipOrder.customer.notes && (
                  <p className="text-neutral-600 italic mt-1 text-[11px]">"{courierSlipOrder.customer.notes}"</p>
                )}
              </div>
            </div>

            {/* Package Contents Checklist */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                Package Contents ({courierSlipOrder.items.length} items)
              </span>
              <ul className="divide-y divide-neutral-100 text-neutral-700 font-mono text-[11px]">
                {courierSlipOrder.items.map((item, idx) => (
                  <li key={idx} className="py-1 flex justify-between">
                    <span>
                      {item.quantity}x {item.name} ({item.size}{item.color ? `, ${item.color}` : ''})
                    </span>
                    <span className="font-bold">৳{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions for Printing */}
            <div className="flex gap-2 pt-2 print:hidden">
              <a
                href={getWhatsAppLink(courierSlipOrder)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Customer</span>
              </a>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dispatch Docket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Information</span>
                <h3 className="text-xl font-extrabold font-mono text-neutral-900">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppLink(selectedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Notify via WhatsApp</span>
                </a>
                <button
                  onClick={() => setCourierSlipOrder(selectedOrder)}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Courier Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-black rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl text-xs text-neutral-600">
              <div>
                <strong className="text-neutral-900 uppercase font-bold block mb-1">Customer Info</strong>
                <p className="font-semibold text-neutral-800">{selectedOrder.customer.name}</p>
                <p className="font-mono text-neutral-500">{selectedOrder.customer.phone}</p>
                {selectedOrder.customer.email && <p>{selectedOrder.customer.email}</p>}
                <p className="mt-1 text-neutral-700">{selectedOrder.customer.address}</p>
                <p>{selectedOrder.customer.district}, {selectedOrder.customer.division}</p>
                {selectedOrder.customer.notes && (
                  <p className="text-neutral-500 italic mt-1">Note: "{selectedOrder.customer.notes}"</p>
                )}
              </div>

              <div>
                <strong className="text-neutral-900 uppercase font-bold block mb-1">Dispatch Details</strong>
                <p>Zone: <strong className="text-neutral-900">{selectedOrder.deliveryZoneName}</strong></p>
                <p>Method: <strong className="text-neutral-900">{selectedOrder.paymentMethod}</strong></p>
                <p>Payment: <strong className="text-neutral-900">{selectedOrder.paymentStatus}</strong></p>
                <p className="text-neutral-400 mt-1">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <strong className="text-xs font-bold uppercase text-neutral-700 block mb-2">Order Items</strong>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h5>
                      <p className="text-[11px] text-neutral-500">
                        Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Modification Controls */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
              <strong className="text-xs font-bold uppercase text-neutral-900 block">
                Update Order Status
              </strong>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    disabled={updating || selectedOrder.orderStatus === st}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedOrder.orderStatus === st
                        ? 'bg-black text-white font-bold'
                        : 'bg-white border border-neutral-300 hover:border-black text-neutral-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Payment Status:</span>
                <div className="flex gap-2">
                  {(['Pending', 'Paid', 'Refunded'] as PaymentStatus[]).map((ps) => (
                    <button
                      key={ps}
                      onClick={() => handleUpdatePayment(ps)}
                      disabled={updating || selectedOrder.paymentStatus === ps}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        selectedOrder.paymentStatus === ps
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-neutral-300 text-neutral-700'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Internal Administrative Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Courier tracking code: STEADFAST-98213"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.orderStatus)}
                  disabled={updating}
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
