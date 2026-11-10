import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WISHLIST_STORAGE_KEY = 'savage_store_wishlist_v1';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;

    const syncWithFirebase = async () => {
      try {
        const ref = doc(db, 'wishlists', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const remoteList = snap.data().productIds || [];
          // Merge local and remote
          const merged = Array.from(new Set([...wishlist, ...remoteList]));
          setWishlist(merged);
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(merged));
        } else if (wishlist.length > 0) {
          await setDoc(ref, { productIds: wishlist, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.warn('Wishlist sync warning:', err);
      }
    };

    syncWithFirebase();
  }, [currentUser]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Wishlist local save:', e);
    }
  }, [wishlist]);

  const toggleWishlist = async (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      if (currentUser) {
        setDoc(
          doc(db, 'wishlists', currentUser.uid),
          { productIds: next, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch((e) => console.warn('Wishlist update err:', e));
      }
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
