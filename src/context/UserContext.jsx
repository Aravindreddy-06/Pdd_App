import { useState, useEffect, useRef, useCallback } from 'react';
import { UserContext } from './UserContextInstance';
import { supabase } from '../lib/supabaseClient';
import { User, Sparkles, Type } from 'lucide-react';

export function UserProvider({ children }) {
  // 1. Initialize user from localStorage immediately (for faster load)
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
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [tempFullName, setTempFullName] = useState('');
  const [tempUsername, setTempUsername] = useState('');

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

      // Load or initialize member join year
      let joinYear = localStorage.getItem('rs_join_date');
      if (!joinYear) {
        joinYear = data?.created_at ? new Date(data.created_at).getFullYear().toString() : new Date().getFullYear().toString();
        localStorage.setItem('rs_join_date', joinYear);
      }

      const userName = savedProfile.name || data?.full_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Neighbor';
      const userHandle = savedProfile.username || data?.username || authUser?.user_metadata?.username || '';
      
      const mappedUser = {
        ...data,
        ...savedProfile, // Overlay any locally saved profile edits (priority)
        id: userId,
        email: authUser?.email,
        name: userName,
        username: userHandle,
        avatar: savedProfile.avatar || data?.avatar_url || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=84cc16&color=fff`,
        memberSince: joinYear,
        wishlist: finalWishlist,
        cart: finalCart,
      };

      setUser(mappedUser);

      // Prompt Username & Name modal if new user has not completed username setup
      const hasCompletedSetup = savedProfile.is_setup_complete || data?.username || userHandle;
      if (!hasCompletedSetup && authUser) {
        setTempFullName(userName);
        setTempUsername(userName.toLowerCase().replace(/\s+/g, '_'));
        setShowUsernameModal(true);
      }
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
    
    // 1. Update local state immediately for responsiveness across application
    setUser(prev => {
      const updated = { ...prev, ...newData };
      
      // 2. Persist to localStorage for recovery and persistence
      try {
        const toSave = { 
          name: updated.name,
          username: updated.username,
          is_setup_complete: true,
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
        if (newData.username) toUpdate.username = newData.username;
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

  const handleSaveUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!tempUsername.trim() || !tempFullName.trim()) return;

    const formattedUsername = tempUsername.trim().startsWith('@') 
      ? tempUsername.trim() 
      : `@${tempUsername.trim()}`;

    const formattedName = tempFullName.trim();
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=84cc16&color=fff`;

    await updateUser({ 
      name: formattedName,
      username: formattedUsername,
      avatar: newAvatar,
      is_setup_complete: true
    });

    setShowUsernameModal(false);
  };

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

  const updateLocationFromPosition = useCallback(async (position, source = 'auto') => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    try {
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (nomData && nomData.address) {
          const a = nomData.address;
          const sub = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.hamlet || a.village || a.town || a.city;
          const city = a.city || a.town || a.municipality || a.county;
          const loc = (sub && city && sub !== city) ? `${sub}, ${city}` : (sub || city || 'Current Location');
          const result = { location: loc, address: loc, coordinates: { lat, lng }, locationSource: source };
          await updateUser(result);
          return result;
        }
      }
      const fallback = { location: 'Current Location', address: 'Current Location', coordinates: { lat, lng }, locationSource: source };
      await updateUser(fallback);
      return fallback;
    } catch (e) {
      const fallback = { location: 'Current Location', address: 'Current Location', coordinates: { lat, lng }, locationSource: source };
      await updateUser(fallback);
      return fallback;
    }
  }, [updateUser]);

  const requestLocation = useCallback((source = 'auto') => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(false);
      let hasResolved = false;
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          if (position.coords.accuracy < 100 && !hasResolved) {
            hasResolved = true;
            navigator.geolocation.clearWatch(watchId);
            await updateLocationFromPosition(position, source);
            resolve(true);
          }
        },
        () => {
          if (!hasResolved) {
            hasResolved = true;
            navigator.geolocation.clearWatch(watchId);
            resolve(false);
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          navigator.geolocation.clearWatch(watchId);
          resolve(false);
        }
      }, 5000);
    });
  }, [updateLocationFromPosition]);

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const currentSource = (() => {
          try { return JSON.parse(localStorage.getItem('rs_profile') || '{}').locationSource; } catch { return 'auto'; }
        })();
        if (currentSource === 'manual') return;
        if (position.coords.accuracy < 100 && position.coords.accuracy < (lastGeocodedAccuracy.current - 10)) {
          lastGeocodedAccuracy.current = position.coords.accuracy;
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

  useEffect(() => {
    const initLocation = async () => {
      try {
        await requestLocation('auto');
      } catch (err) {
        console.error("Initial location error:", err);
      } finally {
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
        localStorage.removeItem('rs_wishlist');
        localStorage.removeItem('rs_cart');
        localStorage.removeItem('resource_share_items');
        setUser(null);
        await supabase.auth.signOut();
      }
    }}>
      {children}

      {/* Username & Display Name Setup Modal for New Users */}
      {showUsernameModal && (
        <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0 }}>
          <div className="modal-card animate-in" style={{ maxWidth: '440px', width: '90%', padding: '36px', borderRadius: '24px', background: '#141814', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#fff', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Sparkles size={30} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Welcome to Lendkart!</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.5, marginBottom: '24px' }}>
              Set your display name and unique username to complete your profile setup.
            </p>

            <form onSubmit={handleSaveUsernameSubmit}>
              {/* Full Name / Display Name */}
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#d1d5db', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Type size={18} style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} />
                  <input
                    type="text"
                    value={tempFullName}
                    onChange={(e) => setTempFullName(e.target.value)}
                    placeholder="e.g. Aravind Reddy"
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Username */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#d1d5db', marginBottom: '6px', display: 'block' }}>Unique Username</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} />
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="@username"
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!tempUsername.trim() || !tempFullName.trim()}
                style={{ width: '100%', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '15px', background: '#22c55e', color: '#000', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                Save Profile & Continue →
              </button>
            </form>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}
