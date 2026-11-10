import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, PRIMARY_ADMIN_UID, PRIMARY_ADMIN_EMAIL, AUTHORIZED_ADMIN_EMAILS } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Evaluate Administrator status
        const isDesignatedAdmin =
          user.uid === PRIMARY_ADMIN_UID ||
          (user.email && AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === user.email?.toLowerCase()));

        let profileRole: 'admin' | 'customer' = isDesignatedAdmin ? 'admin' : 'customer';

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: data.displayName || user.displayName || '',
              phone: data.phone || '',
              address: data.address || '',
              role: isDesignatedAdmin ? 'admin' : (data.role || 'customer'),
              createdAt: data.createdAt || new Date().toISOString(),
            });
            if (data.role === 'admin') {
              profileRole = 'admin';
            }
          } else {
            // First time profile creation
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              role: profileRole,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Profile read fallback:', err);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            role: profileRole,
            createdAt: new Date().toISOString(),
          });
        }

        setIsAdmin(profileRole === 'admin');
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        phone: phone || '',
        role: (res.user.uid === PRIMARY_ADMIN_UID || AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase())) ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
