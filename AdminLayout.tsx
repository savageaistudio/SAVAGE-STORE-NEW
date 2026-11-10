import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Truck,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  KeyRound,
  Delete,
  Bot,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { OFFICIAL_LOGO_PATH } from '../../lib/firebase';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  children
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { siteSettings } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Master Protection PIN state
  const effectivePin = siteSettings.adminPin || '202622';
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('savage_admin_pin_unlocked') === 'true' ||
      localStorage.getItem('savage_admin_pin_unlocked') === 'true'
    );
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleDigitPress = (digit: string) => {
    if (pinInput.length >= 6) return;
    const next = pinInput + digit;
    setPinInput(next);
    setPinError(false);

    if (next.length === 6) {
      if (next === effectivePin) {
        sessionStorage.setItem('savage_admin_pin_unlocked', 'true');
        setIsUnlocked(true);
        setPinInput('');
      } else {
        setPinError(true);
        setTimeout(() => {
          setPinInput('');
          setPinError(false);
        }, 1200);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinError(false);
  };

  const handleLockConsole = () => {
    sessionStorage.removeItem('savage_admin_pin_unlocked');
    setIsUnlocked(false);
    setPinInput('');
  };

  // Security Access Denied Screen for unauthorized users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-900/40 text-red-500 flex items-center justify-center mx-auto border border-red-800/50">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-white">
            Access Denied
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            You do not have permission to access the SAVAGE STORE administrative console. This portal is restricted to authorized store managers.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={onNavigateHome}
              className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Back to Storefront
            </button>
            <button
              onClick={logout}
              className="w-full py-2.5 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold rounded-xl"
            >
              Sign in with another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Master Protection PIN Lock Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="relative mx-auto w-16 h-16">
            <img
              src={OFFICIAL_LOGO_PATH}
              alt="SAVAGE Logo"
              className="w-16 h-16 rounded-full border-2 border-red-600 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-neutral-900">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/60 border border-red-800/60 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">
              <KeyRound className="w-3 h-3" />
              PIN Protected Console
            </div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
              Admin Security Lock
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your 6-digit Master Protection PIN to access store operations.
            </p>
          </div>

          {/* 6-Dot PIN Visual Indicator */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pinInput.length;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    pinError
                      ? 'bg-red-500 scale-110'
                      : isFilled
                      ? 'bg-red-500 scale-125 shadow-md shadow-red-500/50'
                      : 'border-2 border-neutral-700 bg-neutral-800'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-xs text-red-400 font-bold animate-pulse">
              Incorrect Security PIN. Please try again.
            </p>
          )}

          {/* Interactive Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDigitPress(d)}
                className="h-12 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-base font-bold text-white transition-all border border-neutral-700/50 shadow-xs"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="h-12 rounded-2xl bg-neutral-800/50 hover:bg-neutral-700/50 text-xs font-semibold text-neutral-400 active:scale-95 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              className="h-12 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-base font-bold text-white transition-all border border-neutral-700/50 shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDeleteDigit}
              className="h-12 rounded-2xl bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Unlock Preset Button */}
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('savage_admin_pin_unlocked', 'true');
              localStorage.setItem('savage_admin_pin_unlocked', 'true');
              setIsUnlocked(true);
            }}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span>১-ক্লিকে আনলক করুন (Quick Unlock - {effectivePin})</span>
          </button>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onNavigateHome}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai-copilot', label: 'Gemini AI Copilot & Studio', icon: <Sparkles className="w-4 h-4 text-red-500" /> },
    { id: 'products', label: 'Products Catalog', icon: <Package className="w-4 h-4" /> },
    { id: 'products/new', label: '+ Add New Product', icon: <PlusCircle className="w-4 h-4 text-emerald-400" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons & Discounts', icon: <Tag className="w-4 h-4" /> },
    { id: 'delivery', label: 'Delivery Zones', icon: <Truck className="w-4 h-4" /> },
    { id: 'banners', label: 'Homepage Banners', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews Moderation', icon: <Star className="w-4 h-4" /> },
    { id: 'settings', label: 'Store Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: string) => {
    onSelectTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row">
      {/* Mobile Admin Topbar */}
      <div className="lg:hidden bg-neutral-900 text-white px-4 py-3 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <img src={OFFICIAL_LOGO_PATH} alt="SAVAGE" className="w-7 h-7 rounded-full border border-red-600" />
          <span className="font-extrabold uppercase tracking-tight text-sm">SAVAGE ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-neutral-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-neutral-950 text-neutral-300 flex flex-col justify-between p-5 border-r border-neutral-800 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Admin Brand */}
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <img
              src={OFFICIAL_LOGO_PATH}
              alt="SAVAGE Logo"
              className="w-10 h-10 rounded-full border-2 border-red-600 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white uppercase tracking-tight">SAVAGE</span>
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate max-w-[130px] font-mono">
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id || (item.id === 'products' && currentTab.startsWith('products'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-neutral-800 space-y-2">
          <button
            onClick={handleLockConsole}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-neutral-900 transition-colors"
            title="Lock administrative console with master PIN"
          >
            <span className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Lock Console
            </span>
            <span className="text-[10px] bg-amber-950/70 border border-amber-800/60 px-1.5 py-0.5 rounded text-amber-300 font-mono">
              PIN
            </span>
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer Store
            </span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
