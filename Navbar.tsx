import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { openCart, totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories, siteSettings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setCategoriesDropdownOpen(false);
  };

  return (
    <>
      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo Zone */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <img
                src={OFFICIAL_LOGO_PATH}
                alt="SAVAGE STORE Official Logo"
                className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-neutral-900 group-hover:text-black leading-none uppercase">
                  SAVAGE<span className="text-red-600">.</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-400 mt-0.5">
                  Apparel & Merch
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Zone 2) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-neutral-700">
            <button
              onClick={() => handleNav('/')}
              className={`hover:text-black transition-colors ${
                currentPath === '/' ? 'text-black border-b-2 border-black pb-0.5' : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('/shop')}
              className={`hover:text-black transition-colors ${
                currentPath === '/shop' ? 'text-black border-b-2 border-black pb-0.5' : ''
              }`}
            >
              Shop All
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1 hover:text-black transition-colors py-2"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {categoriesDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleNav(`/category/${cat.slug}`)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-neutral-400">
                      No categories yet
                    </div>
                  )}
                  <div className="border-t border-neutral-100 my-1" />
                  <button
                    onClick={() => handleNav('/shop')}
                    className="w-full text-left px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    View All Categories →
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Mockup Studio Lab Link */}
            <button
              onClick={() => handleNav('/customizer')}
              className={`hover:text-red-600 transition-colors flex items-center gap-1.5 ${
                currentPath === '/customizer' ? 'text-red-600 font-bold border-b-2 border-red-600 pb-0.5' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Mockup Lab</span>
            </button>

            <button
              onClick={() => handleNav('/track-order')}
              className={`hover:text-black transition-colors ${
                currentPath === '/track-order' ? 'text-black border-b-2 border-black pb-0.5' : ''
              }`}
            >
              Track Order
            </button>
          </nav>

          {/* Action Zone (Zone 3) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
              title="Search store"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => handleNav('/wishlist')}
              className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger */}
            <button
              onClick={openCart}
              className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-1"
                title="Account"
              >
                <UserIcon className="w-5 h-5" />
                {isAdmin && (
                  <span className="w-2 h-2 bg-red-600 rounded-full" title="Admin access" />
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 text-xs font-semibold animate-in fade-in"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-neutral-500 font-normal">Signed in as</p>
                        <p className="font-bold text-neutral-900 truncate">{currentUser.displayName || currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => handleNav('/account')}
                        className="w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                      >
                        My Orders & Profile
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-bold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-neutral-100 my-1" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNav('/account')}
                        className="w-full text-left px-4 py-2 text-neutral-900 hover:bg-neutral-50 font-bold"
                      >
                        Customer Sign In / Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => handleNav('/')}
              className="w-full text-left py-2 text-sm font-semibold text-neutral-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/shop')}
              className="w-full text-left py-2 text-sm font-semibold text-neutral-800"
            >
              Shop All Products
            </button>
            <button
              onClick={() => handleNav('/customizer')}
              className="w-full text-left py-2 text-sm font-bold text-red-600 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Custom Mockup Studio
            </button>
            <button
              onClick={() => handleNav('/track-order')}
              className="w-full text-left py-2 text-sm font-semibold text-neutral-800"
            >
              Track My Order
            </button>
            <button
              onClick={() => handleNav('/wishlist')}
              className="w-full text-left py-2 text-sm font-semibold text-neutral-800 flex items-center justify-between"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            <div className="border-t border-neutral-100 pt-2">
              <button
                onClick={() => handleNav(currentUser ? '/account' : '/account')}
                className="w-full text-left py-2 text-sm font-semibold text-neutral-900 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-neutral-500" />
                <span>{currentUser ? 'My Account & Orders' : 'Sign In / Register'}</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full text-left py-2 text-sm font-bold text-red-600 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
