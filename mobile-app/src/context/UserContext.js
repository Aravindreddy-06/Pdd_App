import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: 'user_1',
    name: 'Abhi Reddy',
    email: 'abhireddyk2005@gmail.com',
    location: 'Oakwood Apartments, Blk B',
  });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadPersistedData();
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

  const addToCart = async (item) => {
    const exists = cart.some(c => c.id === item.id);
    if (exists) return;
    const updated = [...cart, { ...item, days: 1 }];
    setCart(updated);
    await AsyncStorage.setItem('@lendkart_cart', JSON.stringify(updated));
  };

  const removeFromCart = async (itemId) => {
    const updated = cart.filter(c => c.id !== itemId);
    setCart(updated);
    await AsyncStorage.setItem('@lendkart_cart', JSON.stringify(updated));
  };

  const updateCartDays = async (itemId, days) => {
    const updated = cart.map(c => c.id === itemId ? { ...c, days: Math.max(1, days) } : c);
    setCart(updated);
    await AsyncStorage.setItem('@lendkart_cart', JSON.stringify(updated));
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('@lendkart_cart');
  };

  const toggleWishlist = async (item) => {
    const exists = wishlist.some(w => w.id === item.id);
    let updated;
    if (exists) {
      updated = wishlist.filter(w => w.id !== item.id);
    } else {
      updated = [...wishlist, item];
    }
    setWishlist(updated);
    await AsyncStorage.setItem('@lendkart_wishlist', JSON.stringify(updated));
  };

  return (
    <UserContext.Provider value={{
      user,
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateCartDays,
      clearCart,
      toggleWishlist,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
