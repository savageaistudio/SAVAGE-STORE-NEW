import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomizerPage } from './pages/CustomizerPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { StaticPages } from './pages/StaticPages';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminDelivery } from './pages/admin/AdminDelivery';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAICopilot } from './pages/admin/AdminAICopilot';

import { Product } from './types';

const GITHUB_PAGES_BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function getAppPath() {
  const pathname = window.location.pathname || '/';
  const withoutBase = GITHUB_PAGES_BASE && pathname.startsWith(GITHUB_PAGES_BASE)
    ? pathname.slice(GITHUB_PAGES_BASE.length)
    : pathname;
  return withoutBase || '/';
}

function MainRouter() {
  const { isAdmin, currentUser } = useAuth();
  const { products, getProductBySlugOrId } = useStore();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getAppPath();
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | undefined>(undefined);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Admin state
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [editingAdminProduct, setEditingAdminProduct] = useState<Product | null>(null);

  // Sync browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getAppPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const deployedPath = `${GITHUB_PAGES_BASE}${path === '/' ? '/' : path}`;
      window.history.pushState({}, '', deployedPath);
    } catch (e) {
      // In restricted iframe environments
    }
    setCurrentPath(path);

    // Dynamic route parsing
    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '');
      setSelectedCategorySlug(slug);
    } else {
      setSelectedCategorySlug(undefined);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.slug || product.id}`);
  };

  const handleOrderCompleted = (orderId: string, orderNumber: string) => {
    setConfirmedOrderId(orderId);
    setConfirmedOrderNumber(orderNumber);
    navigate(`/order-confirmation/${orderId}`);
  };

  // Check dynamic product route
  useEffect(() => {
    if (currentPath.startsWith('/product/')) {
      const idOrSlug = currentPath.replace('/product/', '');
      if (!selectedProduct || (selectedProduct.slug !== idOrSlug && selectedProduct.id !== idOrSlug)) {
        getProductBySlugOrId(idOrSlug).then((found) => {
          if (found) setSelectedProduct(found);
        });
      }
    }
  }, [currentPath, selectedProduct, getProductBySlugOrId]);

  // Is Admin Portal View
  if (currentPath.startsWith('/admin')) {
    if (currentPath === '/admin/login' || (!currentUser && !isAdmin)) {
      return (
        <AdminLogin
          onLoginSuccess={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    const handleAdminSelectTab = (tab: string) => {
      if (tab === 'products/new' || tab === 'products/form') {
        setEditingAdminProduct(null);
        setAdminTab('products/form');
      } else {
        setAdminTab(tab);
      }
    };

    return (
      <AdminLayout
        currentTab={adminTab === 'products/new' ? 'products/form' : adminTab}
        onSelectTab={handleAdminSelectTab}
        onNavigateHome={() => navigate('/')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onSelectTab={handleAdminSelectTab} />}
        {adminTab === 'ai-copilot' && <AdminAICopilot />}
        {adminTab === 'products' && (
          <AdminProducts
            onAddProduct={() => {
              setEditingAdminProduct(null);
              setAdminTab('products/form');
            }}
            onEditProduct={(p) => {
              setEditingAdminProduct(p);
              setAdminTab('products/form');
            }}
            onViewProductInStore={(p) => handleSelectProduct(p)}
          />
        )}
        {(adminTab === 'products/form' || adminTab === 'products/new') && (
          <AdminProductForm
            initialProduct={editingAdminProduct}
            onSaved={() => setAdminTab('products')}
            onCancel={() => setAdminTab('products')}
          />
        )}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'coupons' && <AdminCoupons />}
        {adminTab === 'delivery' && <AdminDelivery />}
        {adminTab === 'banners' && <AdminBanners />}
        {adminTab === 'reviews' && <AdminReviews />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // Customer Views Rendering
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-black selection:text-white">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage onNavigate={navigate} onSelectProduct={handleSelectProduct} />
        )}

        {(currentPath === '/shop' || currentPath.startsWith('/category/')) && (
          <ShopPage
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
            initialCategorySlug={selectedCategorySlug}
          />
        )}

        {currentPath.startsWith('/product/') && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath === '/customizer' && <CustomizerPage onNavigate={navigate} />}

        {currentPath === '/cart' && <CartPage onNavigate={navigate} />}

        {currentPath === '/checkout' && (
          <CheckoutPage onNavigate={navigate} onOrderCompleted={handleOrderCompleted} />
        )}

        {currentPath.startsWith('/order-confirmation/') && (
          <OrderConfirmationPage
            orderId={confirmedOrderId}
            orderNumber={confirmedOrderNumber}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/track-order' && <OrderTrackingPage onNavigate={navigate} />}

        {currentPath === '/account' && <AccountPage onNavigate={navigate} />}

        {currentPath === '/wishlist' && (
          <WishlistPage onNavigate={navigate} onSelectProduct={handleSelectProduct} />
        )}

        {currentPath === '/about' && <StaticPages pageType="about" onNavigate={navigate} />}
        {currentPath === '/contact' && <StaticPages pageType="contact" onNavigate={navigate} />}
        {currentPath === '/shipping-policy' && (
          <StaticPages pageType="shipping" onNavigate={navigate} />
        )}
        {currentPath === '/return-policy' && (
          <StaticPages pageType="return" onNavigate={navigate} />
        )}
        {currentPath === '/size-guide' && (
          <StaticPages pageType="size-guide" onNavigate={navigate} />
        )}
        {currentPath === '/faq' && <StaticPages pageType="faq" onNavigate={navigate} />}
        {currentPath === '/privacy-policy' && (
          <StaticPages pageType="privacy" onNavigate={navigate} />
        )}
        {currentPath === '/terms' && <StaticPages pageType="terms" onNavigate={navigate} />}

        {/* 404 Fallback */}
        {![
          '/',
          '/shop',
          '/customizer',
          '/cart',
          '/checkout',
          '/track-order',
          '/account',
          '/wishlist',
          '/about',
          '/contact',
          '/shipping-policy',
          '/return-policy',
          '/size-guide',
          '/faq',
          '/privacy-policy',
          '/terms'
        ].includes(currentPath) &&
          !currentPath.startsWith('/category/') &&
          !currentPath.startsWith('/product/') &&
          !currentPath.startsWith('/order-confirmation/') && <NotFoundPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
      <CartDrawer onNavigate={navigate} />
      <FloatingWhatsApp />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigate={navigate}
        onViewAllResults={(query) => {
          navigate(`/shop?search=${encodeURIComponent(query)}`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <MainRouter />
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
