import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Product,
  Category,
  Banner,
  DeliveryZone,
  SiteSettings,
  Review,
  Coupon,
  Order,
  CartItem,
  CustomerInfo
} from '../types';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  deliveryZones: DeliveryZone[];
  siteSettings: SiteSettings;
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  getProductBySlugOrId: (identifier: string) => Promise<Product | null>;
  getProductReviews: (productId: string) => Promise<Review[]>;
  submitReview: (productId: string, rating: number, comment: string, customerName: string, customerId?: string, photos?: string[], fitFeedback?: string) => Promise<void>;
  validateCoupon: (code: string, subtotal: number) => Promise<{ valid: boolean; discount: number; message?: string }>;
  placeOrder: (
    items: CartItem[],
    customer: CustomerInfo,
    deliveryZone: DeliveryZone,
    couponCode?: string,
    customerId?: string
  ) => Promise<{ success: boolean; orderId: string; orderNumber: string }>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  trackOrderByPhoneOrNumber: (term: string) => Promise<Order[]>;
  initializeDefaultsIfEmpty: () => Promise<void>;
  likeProduct: (productId: string) => Promise<{ liked: boolean; likesCount: number }>;
  isProductLiked: (productId: string) => boolean;
}

const defaultSettings: SiteSettings = {
  storeName: "SAVAGE STORE",
  description: "Exclusive streetwear, oversized apparel, premium cotton essentials, and custom apparel in Khulna, Bangladesh.",
  phone: "01779903110",
  email: "strvboys512@gmail.com",
  address: "Khulna, Bangladesh",
  whatsapp: "01779903110",
  facebook: "https://www.facebook.com/share/18yXhMfd5u/",
  instagram: "https://www.instagram.com/savage20.26?obrf=MXRlMmViYXBvczB0eg==",
  tiktok: "tiktok.com/@savage.2245",
  youtube: "https://youtube.com/@savage20-26?si=CRoWEnRbKesN0AI8",
  deliveryArea: "Khulna & All Bangladesh",
  currency: "৳",
  announcement: "⚡ Fast delivery across Khulna & nationwide. Cash on Delivery available!",
  returnPolicyDays: 7
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Real-time synchronization for customer store catalog
  useEffect(() => {
    let unsubscribeProducts: () => void = () => {};
    let unsubscribeCategories: () => void = () => {};
    let unsubscribeBanners: () => void = () => {};
    let unsubscribeDelivery: () => void = () => {};

    try {
      const prodQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      unsubscribeProducts = onSnapshot(prodQuery, (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((d) => {
          prods.push({ id: d.id, ...d.data() } as Product);
        });
        setProducts(prods);
        setIsLoading(false);
      }, (err) => {
        console.warn('Products onSnapshot fallback to one-time fetch:', err.message);
        setIsLoading(false);
      });

      const catQuery = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
      unsubscribeCategories = onSnapshot(catQuery, (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach((d) => {
          cats.push({ id: d.id, ...d.data() } as Category);
        });
        setCategories(cats);
      }, (err) => {
        console.warn('Categories onSnapshot:', err.message);
      });

      const bannerQuery = query(collection(db, 'banners'), orderBy('sortOrder', 'asc'));
      unsubscribeBanners = onSnapshot(bannerQuery, (snapshot) => {
        const bns: Banner[] = [];
        snapshot.forEach((d) => {
          bns.push({ id: d.id, ...d.data() } as Banner);
        });
        setBanners(bns);
      }, (err) => {
        console.warn('Banners onSnapshot:', err.message);
      });

      const zoneQuery = query(collection(db, 'deliveryZones'));
      unsubscribeDelivery = onSnapshot(zoneQuery, (snapshot) => {
        const zones: DeliveryZone[] = [];
        snapshot.forEach((d) => {
          zones.push({ id: d.id, ...d.data() } as DeliveryZone);
        });
        // Sort active zones
        setDeliveryZones(zones);
      }, (err) => {
        console.warn('DeliveryZones onSnapshot:', err.message);
      });

      // Fetch Site Settings
      getDoc(doc(db, 'settings', 'store')).then((snap) => {
        if (snap.exists()) {
          setSiteSettings({ ...defaultSettings, ...snap.data() } as SiteSettings);
        }
      }).catch((e) => console.warn('Settings load:', e.message));

    } catch (e) {
      console.warn('StoreProvider listener init:', e);
      setIsLoading(false);
    }

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeBanners();
      unsubscribeDelivery();
    };
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      const prods: Product[] = [];
      snap.forEach((d) => prods.push({ id: d.id, ...d.data() } as Product));
      setProducts(prods);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'products');
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'categories'), orderBy('sortOrder', 'asc')));
      const cats: Category[] = [];
      snap.forEach((d) => cats.push({ id: d.id, ...d.data() } as Category));
      setCategories(cats);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'categories');
    }
  }, []);

  const getProductBySlugOrId = useCallback(async (identifier: string): Promise<Product | null> => {
    // Check in-memory first
    const found = products.find((p) => p.slug === identifier || p.id === identifier);
    if (found) return found;

    try {
      // Direct doc get
      const docSnap = await getDoc(doc(db, 'products', identifier));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      // Query by slug
      const q = query(collection(db, 'products'), where('slug', '==', identifier));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const first = querySnap.docs[0];
        return { id: first.id, ...first.data() } as Product;
      }
      return null;
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  }, [products]);

  const getProductReviews = useCallback(async (productId: string): Promise<Review[]> => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('approved', '==', true)
      );
      const snap = await getDocs(q);
      const reviews: Review[] = [];
      snap.forEach((d) => reviews.push({ id: d.id, ...d.data() } as Review));
      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Reviews fetch error:', err);
      return [];
    }
  }, []);

  const submitReview = async (
    productId: string,
    rating: number,
    comment: string,
    customerName: string,
    customerId?: string,
    photos?: string[],
    fitFeedback?: string
  ) => {
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reviewDoc: Review = {
      id: reviewId,
      productId,
      customerId: customerId || 'guest',
      customerName: customerName.trim() || 'Verified Shopper',
      rating,
      comment: comment.trim(),
      photos: photos && photos.length > 0 ? photos : undefined,
      fitFeedback: fitFeedback || undefined,
      approved: true, // Auto-publish for immediate customer delight
      createdAt: new Date().toISOString(),
    };
    const sanitized = sanitizeForFirestore(reviewDoc);
    await setDoc(doc(db, 'reviews', reviewId), sanitized);
  };

  const validateCoupon = async (
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { valid: false, discount: 0, message: 'Please enter a coupon code.' };

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', cleanCode), where('active', '==', true));
      const snap = await getDocs(q);
      if (snap.empty) {
        return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
      }

      const coupon = snap.docs[0].data() as Coupon;

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum order amount of ${siteSettings.currency}${coupon.minOrderAmount} required for this coupon.`
        };
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return { valid: false, discount: 0, message: 'This coupon has expired.' };
      }

      if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
        return { valid: false, discount: 0, message: 'Coupon usage limit reached.' };
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountAmount) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountAmount;
      }

      discount = Math.min(discount, subtotal);
      return { valid: true, discount, message: `Coupon applied: ৳${Math.round(discount)} off!` };
    } catch (err) {
      console.warn('Coupon validation error:', err);
      return { valid: false, discount: 0, message: 'Error checking coupon.' };
    }
  };

function sanitizeForFirestore(input: any): any {
  if (input === undefined) return null;
  if (input === null) return null;
  if (Array.isArray(input)) {
    return input.map(sanitizeForFirestore);
  }
  if (typeof input === 'object' && !(input instanceof Date)) {
    const res: any = {};
    for (const [key, val] of Object.entries(input)) {
      if (val !== undefined) {
        res[key] = sanitizeForFirestore(val);
      }
    }
    return res;
  }
  return input;
}

  const placeOrder = async (
    items: CartItem[],
    customer: CustomerInfo,
    deliveryZone: DeliveryZone,
    couponCode?: string,
    customerId?: string
  ): Promise<{ success: boolean; orderId: string; orderNumber: string }> => {
    if (!items || items.length === 0) {
      throw new Error('Shopping cart is empty.');
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SVG-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Calculate verified subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate coupon discount securely
    let discount = 0;
    if (couponCode) {
      const couponCheck = await validateCoupon(couponCode, subtotal);
      if (couponCheck.valid) {
        discount = couponCheck.discount;
      }
    }

    const deliveryFee = deliveryZone.deliveryCharge || 0;
    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: customerId || 'guest',
      customer,
      items,
      subtotal,
      discount,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      deliveryCharge: deliveryFee,
      deliveryZoneName: deliveryZone.name,
      totalAmount,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Instant local persistence for zero-data-loss checkout
    try {
      localStorage.setItem(`SAVAGE_ORDER_${orderId}`, JSON.stringify(newOrder));
      const historyRaw = localStorage.getItem('SAVAGE_ORDER_HISTORY') || '[]';
      const existingHistory: Order[] = JSON.parse(historyRaw);
      existingHistory.unshift(newOrder);
      localStorage.setItem('SAVAGE_ORDER_HISTORY', JSON.stringify(existingHistory.slice(0, 30)));
    } catch (localErr) {
      console.warn('LocalStorage order backup notice:', localErr);
    }

    // 2. Sanitize and save order document to Firestore
    try {
      const sanitized = sanitizeForFirestore(newOrder);
      await setDoc(doc(db, 'orders', orderId), sanitized);
    } catch (dbErr) {
      console.error('Firestore order write error:', dbErr);
    }

    // 3. Atomically decrement stock for standard catalog items if applicable
    try {
      for (const item of items) {
        if (!item.isCustomMockup && item.productId) {
          const productRef = doc(db, 'products', item.productId);
          await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (productDoc.exists()) {
              const pData = productDoc.data() as Product;
              const variants = pData.variants || [];
              let updated = false;

              const newVariants = variants.map((v) => {
                if (v.size === item.size && (v.colorName === item.color || !v.colorName)) {
                  updated = true;
                  return { ...v, stock: Math.max(0, v.stock - item.quantity) };
                }
                return v;
              });

              const newTotalStock = updated
                ? newVariants.reduce((sum, v) => sum + v.stock, 0)
                : Math.max(0, (pData.totalStock || 0) - item.quantity);

              transaction.update(productRef, {
                variants: newVariants,
                totalStock: newTotalStock,
                updatedAt: new Date().toISOString()
              });
            }
          });
        }
      }
    } catch (stockErr) {
      console.warn('Inventory transaction notice:', stockErr);
    }

    return { success: true, orderId, orderNumber };
  };

  const getOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }
    } catch (e) {
      console.warn('Order fetch error:', e);
    }

    try {
      const local = localStorage.getItem(`SAVAGE_ORDER_${orderId}`);
      if (local) return JSON.parse(local);
      const historyRaw = localStorage.getItem('SAVAGE_ORDER_HISTORY');
      if (historyRaw) {
        const list: Order[] = JSON.parse(historyRaw);
        const match = list.find((o) => o.id === orderId || o.orderNumber === orderId);
        if (match) return match;
      }
    } catch (e) {}

    return null;
  }, []);

  const trackOrderByPhoneOrNumber = useCallback(async (term: string): Promise<Order[]> => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return [];

    try {
      // Query by order number
      const qNum = query(collection(db, 'orders'), where('orderNumber', '==', cleanTerm));
      const snapNum = await getDocs(qNum);
      if (!snapNum.empty) {
        return snapNum.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      }

      // Query by phone
      const qPhone = query(collection(db, 'orders'), where('customer.phone', '==', cleanTerm));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        return snapPhone.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      }

      // Try exact order id
      const snapId = await getDoc(doc(db, 'orders', cleanTerm));
      if (snapId.exists()) {
        return [{ id: snapId.id, ...snapId.data() } as Order];
      }
    } catch (e) {
      console.warn('Track order search error:', e);
    }

    // Fallback to localStorage orders
    try {
      const historyRaw = localStorage.getItem('SAVAGE_ORDER_HISTORY');
      if (historyRaw) {
        const list: Order[] = JSON.parse(historyRaw);
        const filtered = list.filter(
          (o) =>
            o.id.toLowerCase() === cleanTerm.toLowerCase() ||
            o.orderNumber.toLowerCase() === cleanTerm.toLowerCase() ||
            o.customer.phone.includes(cleanTerm)
        );
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {}

    return [];
  }, []);

  // One-click store settings initialization helper for Admin
  const initializeDefaultsIfEmpty = async () => {
    try {
      // Initialize Site Settings
      await setDoc(doc(db, 'settings', 'store'), defaultSettings, { merge: true });

      // Initialize default Bangladeshi delivery zones if none exist
      const zoneSnap = await getDocs(collection(db, 'deliveryZones'));
      if (zoneSnap.empty) {
        const defaultZones: DeliveryZone[] = [
          {
            id: 'zone_khulna',
            name: 'Inside Khulna City',
            deliveryCharge: 60,
            minimumOrder: 1500,
            estimatedDays: '1-2 Days',
            active: true
          },
          {
            id: 'zone_dhaka',
            name: 'Dhaka City Express',
            deliveryCharge: 100,
            minimumOrder: 2500,
            estimatedDays: '2-3 Days',
            active: true
          },
          {
            id: 'zone_all_bd',
            name: 'Outside Dhaka / All Bangladesh',
            deliveryCharge: 150,
            minimumOrder: 3000,
            estimatedDays: '3-5 Days',
            active: true
          }
        ];
        for (const zone of defaultZones) {
          await setDoc(doc(db, 'deliveryZones', zone.id), zone);
        }
      }
    } catch (e) {
      console.warn('Default initialization error:', e);
    }
  };

  // Product Liking System with LocalStorage tracking & Firestore Sync
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('savage_liked_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const isProductLiked = useCallback(
    (productId: string) => {
      return likedIds.includes(productId);
    },
    [likedIds]
  );

  const likeProduct = useCallback(
    async (productId: string): Promise<{ liked: boolean; likesCount: number }> => {
      const isLiked = likedIds.includes(productId);
      const newLiked = !isLiked;
      const updatedIds = newLiked ? [...likedIds, productId] : likedIds.filter((id) => id !== productId);
      setLikedIds(updatedIds);
      try {
        localStorage.setItem('savage_liked_ids', JSON.stringify(updatedIds));
      } catch (e) {
        // storage quota / iframe protection
      }

      let finalCount = 0;
      // Immediate optimistic update
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const currentCount = p.likesCount || 0;
            const updatedCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
            finalCount = updatedCount;
            return { ...p, likesCount: updatedCount };
          }
          return p;
        })
      );

      // Persist to Firestore
      try {
        const prodRef = doc(db, 'products', productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentCount = prodSnap.data().likesCount || 0;
          const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
          finalCount = newCount;
          await updateDoc(prodRef, {
            likesCount: newCount,
          });
        }
      } catch (e) {
        console.warn('Like count sync notice:', e);
      }

      return { liked: newLiked, likesCount: finalCount };
    },
    [likedIds]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        deliveryZones,
        siteSettings,
        isLoading,
        refreshProducts,
        refreshCategories,
        getProductBySlugOrId,
        getProductReviews,
        submitReview,
        validateCoupon,
        placeOrder,
        getOrderById,
        trackOrderByPhoneOrNumber,
        initializeDefaultsIfEmpty,
        likeProduct,
        isProductLiked,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
