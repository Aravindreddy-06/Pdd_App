import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext();

export function UserProvider({ children }) {
  // `user` now mirrors the Supabase auth user (or null when logged out),
  // instead of a hardcoded fake profile.
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Load whatever session Supabase already has persisted (via AsyncStorage,
    // configured in supabaseClient.js) so the user stays logged in across
    // app restarts.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Keep this in sync any time login/logout/token refresh happens
    // anywhere in the app (including from AuthScreen).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    loadPersistedData();

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const loadPersistedData = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('@lendkart_cart');
      const savedWishlist = await AsyncStorage.getItem('@lendkart_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error('Failed to load persisted cart/wishlist', e);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Cart/wishlist are per-device caches, not tied to login — if you'd
    // rather clear them on logout (matching the web app's behavior on
    // sign-up), uncomment below:
    // await clearCart();
    // setWishlist([]);
    // await AsyncStorage.removeItem('@lendkart_wishlist');
  };

  const addToCart = async (item) => {
    const exists = cart.some((c) => c.id === item.id);
    if (exists) return;
    const updated = [...cart, { ...item, days: 1 }];
    setCart(updated);
    await AsyncStorage.setItem('@lendkart_cart', JSON.stringify(updated));
  };

  const removeFromCart = async (itemId) => {
    const updated = cart.filter((c) => c.id !== itemId);
    setCart(updated);
    await AsyncStorage.setItem('@lendkart_cart', JSON.stringify(updated));
  };

  const updateCartDays = async (itemId, days) => {
    const updated = cart.map((c) => (c.id === itemId ? { ...c, days: Math.max(1, days) } : c));
    setCart(updated);
    await AsyncStorage.setItem('@lendkart_cart', JSON.stringify(updated));
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('@lendkart_cart');
  };

  const toggleWishlist = async (item) => {
    const exists = wishlist.some((w) => w.id === item.id);
    let updated;
    if (exists) {
      updated = wishlist.filter((w) => w.id !== item.id);
    } else {
      updated = [...wishlist, item];
    }
    setWishlist(updated);
    await AsyncStorage.setItem('@lendkart_wishlist', JSON.stringify(updated));
  };

  const loginAsGuest = () => {
    setSession({
      user: {
        id: 'guest-123456',
        email: 'guest@lendkart.com',
        user_metadata: { full_name: 'Guest User' }
      }
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        authLoading,
        isLoggedIn: !!session,
        signOut,
        loginAsGuest,
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartDays,
        clearCart,
        toggleWishlist,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
