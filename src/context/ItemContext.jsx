import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ALL_ITEMS } from '../data/items';

const ItemContext = createContext();

// Safely persist items locally as backup
const safeSave = (items) => {
  try {
    localStorage.setItem('resource_share_items', JSON.stringify(items));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      try {
        const stripped = items.map(item => ({
          ...item,
          images: item.images ? item.images.slice(0, 1) : item.images,
        }));
        localStorage.setItem('resource_share_items', JSON.stringify(stripped));
      } catch (e2) {
        console.error('localStorage still full after stripping images', e2);
      }
    }
  }
};

export function ItemProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('resource_share_items');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading local items:", e);
    }
    return ALL_ITEMS;
  });

  const [loading, setLoading] = useState(true);

  // Fetch all published items globally from Supabase so items published by ANY user are visible to EVERY user
  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Supabase items fetch warning:", error.message);
      } else if (data && data.length > 0) {
        // Format Supabase items to match frontend schema
        const formattedSupabaseItems = data.map(item => ({
          ...item,
          id: item.id.toString(),
          img: item.img || item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=400&q=80',
          images: Array.isArray(item.images) ? item.images : [item.img || item.image].filter(Boolean),
          rating: item.rating || 5.0,
          distance: item.distance || '0.1 km',
          owner: item.owner || 'Verified Neighbor'
        }));

        // Merge Supabase global items with default items (avoiding duplicates)
        setItems(prev => {
          const defaultItems = ALL_ITEMS.filter(ai => !formattedSupabaseItems.some(si => si.id === ai.id || si.title === ai.title));
          const combined = [...formattedSupabaseItems, ...defaultItems];
          safeSave(combined);
          return combined;
        });
      }
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    // Subscribe to real-time changes on Supabase items table so published items appear live for all users
    const subscription = supabase
      .channel('public:items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchItems]);

  const addItem = useCallback(async (newItem) => {
    const itemId = newItem.id ? newItem.id.toString() : Date.now().toString();
    const guestItem = { 
      ...newItem, 
      id: itemId,
      created_at: new Date().toISOString()
    };

    // Update local state & localStorage immediately for instant UI feedback
    setItems(prev => {
      const newItems = [guestItem, ...prev.filter(i => i.id !== itemId)];
      safeSave(newItems);
      return newItems;
    });

    // Save item globally into Supabase table so all users can see it
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const toInsert = {
        title: newItem.title,
        price: newItem.price,
        img: newItem.img,
        images: newItem.images || [newItem.img],
        category: newItem.category || 'General',
        rating: 5.0,
        distance: newItem.distance || '0.1 km',
        owner: newItem.owner || 'Verified Neighbor',
        description: newItem.description || '',
        features: newItem.features || [],
        user_id: session?.user?.id || null
      };

      const { error } = await supabase.from('items').insert([toInsert]);
      if (error) console.error("Error inserting item into Supabase:", error);
    } catch (err) {
      console.error("Publish item Supabase error:", err);
    }

    return guestItem;
  }, []);

  const updateItem = useCallback((id, updatedFields) => {
    setItems(prev => {
      const newItems = prev.map(item => item.id.toString() === id.toString() ? { ...item, ...updatedFields } : item);
      safeSave(newItems);
      return newItems;
    });
  }, []);

  const removeItem = (id) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id.toString() !== id.toString());
      safeSave(newItems);
      return newItems;
    });
  };

  const getItemsByCategory = (category) => {
    if (!category || category === 'All') return items;
    return items.filter(item => item.category === category);
  };

  return (
    <ItemContext.Provider value={{ items, loading, addItem, updateItem, removeItem, getItemsByCategory, refreshItems: fetchItems }}>
      {children}
    </ItemContext.Provider>
  );
}

export const useItems = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
};
