import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { INITIAL_ITEMS } from '../data/items';

const ItemContext = createContext();

export function ItemProvider({ children }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase items fetch error:', error.message);
      } else if (data && data.length > 0) {
        const formatted = data.map(item => ({
          ...item,
          id: item.id.toString(),
          img: item.img || item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
          images: Array.isArray(item.images) ? item.images : [item.img || item.image].filter(Boolean),
          rating: item.rating || 5.0,
          distance: item.distance || '0.3 km',
        }));
        setItems(formatted);
      }
    } catch (e) {
      console.error('Fetch items exception:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <ItemContext.Provider value={{
      items,
      filteredItems,
      loading,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      refreshItems: fetchItems
    }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  return useContext(ItemContext);
}
