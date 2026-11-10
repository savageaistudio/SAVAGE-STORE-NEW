import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const {
    currentUser,
    userProfile,
    isAdmin,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout
  } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Orders history
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setOrdersLoading(true);
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', currentUser.uid)
      );
      getDocs(q)
        .then((snap) => {
          const fetched: Order[] = [];
          snap.forEach((d) => fetched.push({ id: d.id, ...d.data() } as Order));
          setOrders(fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        })
        .catch((e) => console.warn('Customer orders fetch notice:', e))
        .finally(() => setOrdersLoading(false));
    }
  }, [currentUser]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAuthLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await registerWithEmail(email, password, name, phone);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || 'Google sign in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // If not authenticated, render Login / Register screen
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-900">
              {isRegisterMode ? 'Create Customer Account' : 'Customer Sign In'}
            </h1>
            <p className="text-xs text-neutral-500">
              {isRegisterMode
                ? 'Join SAVAGE STORE to track orders and save your wishlist.'
                : 'Sign in to review past orders and save delivery addresses.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakil Hossain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
              Or continue with
            </span>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={authLoading}
            className="w-full py-3 border border-neutral-300 hover:border-black rounded-xl text-xs font-bold text-neutral-800 flex items-center justify-center gap-2 transition-colors bg-white shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
              }}
              className="text-xs text-neutral-600 hover:text-black font-semibold underline"
            >
              {isRegisterMode
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Profile View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Profile Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white font-bold flex items-center justify-center text-xl uppercase">
            {(userProfile?.displayName || currentUser.email || 'U').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-neutral-900">
                {userProfile?.displayName || 'Customer'}
              </h1>
              {isAdmin && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
          <button
            onClick={logout}
            className="flex-1 sm:flex-initial px-4 py-2.5 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Orders History Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-neutral-900">
            Order History
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Review past purchases, delivery status, and invoice receipts
          </p>
        </div>

        {ordersLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading your orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-neutral-900">{ord.orderNumber}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-neutral-900 text-white'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Placed on {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} items
                  </p>
                  <p className="text-xs text-neutral-700 font-medium truncate max-w-md">
                    {ord.items.map((i) => `${i.name} (${i.size})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Due</span>
                    <span className="text-base font-extrabold font-mono text-neutral-900">
                      ৳{ord.totalAmount}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('/track-order')}
                    className="px-4 py-2 border border-neutral-200 hover:border-black rounded-xl text-xs font-bold text-neutral-900 transition-colors"
                  >
                    Track Parcel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto stroke-1" />
            <h3 className="text-sm font-bold text-neutral-900">No Orders Yet</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              You haven't placed any orders yet. Discover our latest streetwear drops!
            </p>
            <button
              onClick={() => onNavigate('/shop')}
              className="mt-2 px-5 py-2 bg-black text-white text-xs font-bold rounded-xl"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
