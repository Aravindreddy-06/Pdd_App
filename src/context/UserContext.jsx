import { useState, useEffect, useRef, useCallback } from 'react';
import { UserContext } from './UserContextInstance';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_USER = {
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'I love DIY projects and gardening. Always happy to share tools and help out my neighbors!',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=84cc16&color=fff',
  rating: 0,
  borrowed: 0,
  shared: 0,
  wishlist: []
};

export function UserProvider({ children }) {
  // 1. Initialize user from localStorage immediately (for guest support and faster load)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rs_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading persisted user:", e);
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Load persisted wishlist & cart from localStorage as backup
      const savedWishlist = (() => {
        try { return JSON.parse(localStorage.getItem('rs_wishlist') || '[]'); } catch { return []; }
      })();
      const savedCart = (() => {
        try { return JSON.parse(localStorage.getItem('rs_cart') || '[]'); } catch { return []; }
      })();

      // Fetch wishlist & cart from Supabase
      let finalWishlist = savedWishlist;
      let finalCart = savedCart;
      try {
        const [wishlistRes, cartRes] = await Promise.all([
          supabase.from('wishlist').select('items(*)').eq('user_id', userId),
          supabase.from('cart').select('items(*)').eq('user_id', userId)
        ]);
        
        if (!wishlistRes.error && wishlistRes.data) {
          finalWishlist = wishlistRes.data.map(w => w.items).filter(Boolean);
          localStorage.setItem('rs_wishlist', JSON.stringify(finalWishlist));
        }
        if (cartRes.error) {
          console.error("Cart fetch error:", cartRes.error);
        } else if (cartRes.data) {
          finalCart = cartRes.data.map(c => ({
            ...c.items,
            days: c.days || 1
          })).filter(item => item.id);
          localStorage.setItem('rs_cart', JSON.stringify(finalCart));
        }
      } catch (e) {
        console.error("Error fetching Supabase data:", e);
      }

      // Load persisted profile edits from localStorage
      const savedProfile = (() => {
        try { return JSON.parse(localStorage.getItem('rs_profile') || '{}'); } catch { return {}; }
      })();

      const userName = savedProfile.name || data?.full_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'Neighbor';
      
      const mappedUser = {
        ...data,
        ...savedProfile, // Overlay any locally saved profile edits (priority)
        id: userId,
        email: authUser?.email,
        name: userName,
        avatar: savedProfile.avatar || data?.avatar_url || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=84cc16&color=fff`,
        wishlist: finalWishlist,
        cart: finalCart,
      };
      setUser(mappedUser);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
        localStorage.setItem('rs_last_login', Date.now().toString());
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error("Auth session check failed:", err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchProfile(session.user.id);
        if (event === 'SIGNED_IN') {
          localStorage.setItem('rs_last_login', Date.now().toString());
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const updateUser = useCallback(async (newData) => {
    console.log("UserContext - Updating User Data:", newData);
    
    // 1. Update local state immediately for responsiveness
    setUser(prev => {
      const updated = { ...prev, ...newData };
      
      // 2. Persist to localStorage for recovery and persistence
      try {
        const toSave = { 
          name: updated.name, 
          bio: updated.bio, 
          location: updated.location, 
          address: updated.address,
          avatar: updated.avatar, 
          phone: updated.phone,
          coordinates: updated.coordinates,
          locationSource: updated.locationSource
        };
        localStorage.setItem('rs_profile', JSON.stringify(toSave));
      } catch (e) {
        console.error("Failed to persist profile to localStorage:", e);
      }
      
      return updated;
    });

    // 3. Persist to Supabase if the user is authenticated
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user?.id) {
        const toUpdate = {};
        if (newData.name) toUpdate.full_name = newData.name;
        if (newData.avatar) toUpdate.avatar_url = newData.avatar;
        if (newData.bio) toUpdate.bio = newData.bio;
        if (newData.location) toUpdate.location = newData.location;
        
        if (Object.keys(toUpdate).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(toUpdate)
            .eq('id', session.user.id);
          
          if (error) console.error("Failed to update Supabase profile:", error);
        }
      }
    } catch (err) {
      console.error("Supabase sync error:", err);
    }
  }, []);

  const toggleWishlist = useCallback(async (item) => {
    let isLiked = false;
    setUser(prev => {
      const currentWishlist = prev?.wishlist || [];
      isLiked = currentWishlist.some(w => w.id === item.id);
      const newWishlist = isLiked
        ? currentWishlist.filter(w => w.id !== item.id)
        : [...currentWishlist, item];
      localStorage.setItem('rs_wishlist', JSON.stringify(newWishlist));
      return { ...prev, wishlist: newWishlist };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (isLiked) {
          await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('item_id', item.id);
        } else {
          await supabase.from('wishlist').insert([{ user_id: session.user.id, item_id: item.id }]);
        }
      }
    } catch (err) {
      console.error('Wishlist sync error:', err);
    }
  }, []);

  const addToCart = useCallback(async (item, days = 1) => {
    setUser(prev => {
      const currentCart = prev?.cart || [];
      if (currentCart.some(c => c.id === item.id)) return prev;
      const newCart = [...currentCart, { ...item, days }];
      localStorage.setItem('rs_cart', JSON.stringify(newCart));
      return { ...prev, cart: newCart };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('cart').insert([{ user_id: session.user.id, item_id: item.id, days }]);
      }
    } catch (err) {
      console.error('Cart sync error:', err);
    }
  }, []);

  const updateCartItem = useCallback(async (itemId, updates) => {
    setUser(prev => {
      const newCart = (prev?.cart || []).map(c => c.id === itemId ? { ...c, ...updates } : c);
      localStorage.setItem('rs_cart', JSON.stringify(newCart));
      return { ...prev, cart: newCart };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && updates.days) {
        await supabase.from('cart').update({ days: updates.days }).eq('user_id', session.user.id).eq('item_id', itemId);
      }
    } catch (err) {
      console.error('Update cart item error:', err);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    setUser(prev => {
      const newCart = (prev?.cart || []).filter(c => c.id !== itemId);
      localStorage.setItem('rs_cart', JSON.stringify(newCart));
      return { ...prev, cart: newCart };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('cart').delete().eq('user_id', session.user.id).eq('item_id', itemId);
      }
    } catch (err) {
      console.error('Remove from cart error:', err);
    }
  }, []);

  const watchIdRef = useRef(null);
  const lastGeocodedAccuracy = useRef(9999);

  // Helper for reverse geocoding
  const updateLocationFromPosition = useCallback(async (position, source = 'auto') => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log(`Geocoding coordinates (${source}): ${lat}, ${lng}`);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      const [googleRes, nomRes] = await Promise.allSettled([
        apiKey 
          ? fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=sublocality|locality|neighborhood`)
          : Promise.reject('no key'),
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      ]);

      let googleLocation = null;
      if (googleRes.status === 'fulfilled') {
        const data = await googleRes.value.json();
        if (data.status === 'OK' && data.results.length > 0) {
          for (const result of data.results) {
            const comps = result.address_components;
            const findType = (t) => comps.find(c => c.types.includes(t));
            const sublocality = findType('sublocality_level_1') || findType('sublocality') || findType('neighborhood') || findType('administrative_area_level_3');
            const locality = findType('locality') || findType('administrative_area_level_2');
            if (sublocality) {
              const parts = [sublocality.long_name];
              if (locality) parts.push(locality.long_name);
              googleLocation = parts.join(', ');
              break;
            }
          }
          if (!googleLocation) {
            googleLocation = data.results[0].formatted_address.split(',').slice(0, 3).join(', ');
          }
        }
      }

      let nomLocation = null;
      if (nomRes.status === 'fulfilled') {
        const nomData = await nomRes.value.json();
        if (nomData && nomData.address) {
          const a = nomData.address;
          const sub = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.hamlet || a.village || a.town || a.city;
          const city = a.city || a.town || a.municipality || a.county;
          if (sub && city && sub !== city) {
            nomLocation = `${sub}, ${city}`;
          } else {
            nomLocation = sub || city;
          }
        }
      }

      const finalLocation = googleLocation || nomLocation || 'Current Location';
      console.log('Final location chosen:', finalLocation);
      const result = { 
        location: finalLocation, 
        address: finalLocation, 
        coordinates: { lat, lng },
        locationSource: source
      };
      await updateUser(result);
      return result;

    } catch (e) {
      console.error('Geocoding error:', e);
      const result = { location: 'Current Location', address: 'Current Location', coordinates: { lat, lng }, locationSource: source };
      await updateUser(result);
      return result;
    }
  }, [updateUser]);

  const requestLocation = useCallback((source = 'auto') => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(false);

      let hasResolved = false;
      let bestPosition = null;

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { accuracy } = position.coords;
          console.log(`GPS update received. Accuracy: ${accuracy}m`);
          
          if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }

          // If we get a very accurate position (< 100m) or after some time, resolve
          if (accuracy < 100 && !hasResolved) {
            hasResolved = true;
            navigator.geolocation.clearWatch(watchId);
            await updateLocationFromPosition(position, source);
            resolve(true);
          }
        },
        (error) => {
          console.error("Location request error:", error);
          if (!hasResolved) {
            hasResolved = true;
            navigator.geolocation.clearWatch(watchId);
            resolve(false);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );

      // Timeout fallback to best available position (only if reasonably accurate)
      setTimeout(async () => {
        if (!hasResolved) {
          hasResolved = true;
          navigator.geolocation.clearWatch(watchId);
          if (bestPosition && bestPosition.coords.accuracy < 5000) {
            await updateLocationFromPosition(bestPosition, source);
            resolve(true);
          } else {
            console.log("No accurate position found during timeout.");
            resolve(false);
          }
        }
      }, 8000);
    });
  }, [updateLocationFromPosition]);

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    // Clear existing watch if any
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { accuracy } = position.coords;
        
        // This is where we check the current state (source)
        const currentSource = (() => {
          try {
            const saved = JSON.parse(localStorage.getItem('rs_profile') || '{}');
            return saved.locationSource;
          } catch { return 'auto'; }
        })();

        // Prevent overwriting manual location
        if (currentSource === 'manual') return;

        if (accuracy < 100 && accuracy < (lastGeocodedAccuracy.current - 10)) {
          lastGeocodedAccuracy.current = accuracy;
          await updateLocationFromPosition(position, 'auto');
        }
      },
      (error) => console.error("Watch location error:", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, [updateLocationFromPosition]);

  const stopWatchingLocation = useCallback(() => {
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Proactively detect location on app load
  useEffect(() => {
    const initLocation = async () => {
      console.log("App load: Starting automatic location detection...");
      
      try {
        // Even if we have a saved location, we try to get a fresh one for accuracy
        // We set a shorter timeout here to not block the app splash too long
        await requestLocation('auto');
      } catch (err) {
        console.error("Initial location detection failed:", err);
      } finally {
        // Keep watching for better accuracy in the background
        startWatchingLocation();
        setLoading(false);
      }
    };
    
    initLocation();
    
    return () => stopWatchingLocation();
  }, [requestLocation, startWatchingLocation, stopWatchingLocation]);

  return (
    <UserContext.Provider value={{ 
      user, 
      loading,
      updateUser, 
      toggleWishlist,
      addToCart,
      updateCartItem,
      removeFromCart,
      requestLocation, 
      startWatchingLocation, 
      stopWatchingLocation,
      signOut: async () => {
        localStorage.removeItem('rs_last_login');
        localStorage.removeItem('rs_profile');
        setUser(null);
        await supabase.auth.signOut();
      }
    }}>
      {children}
    </UserContext.Provider>
  );
}
