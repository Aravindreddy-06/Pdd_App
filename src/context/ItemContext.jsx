import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ALL_ITEMS } from '../data/items';

const ItemContext = createContext();

// Safely persist items — on quota error, strip heavy Base64 images and retry once
const safeSave = (items) => {
  try {
    localStorage.setItem('resource_share_items', JSON.stringify(items));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn('localStorage quota exceeded — stripping image data and retrying.');
      try {
        const stripped = items.map(item => ({
          ...item,
          // Keep only first compressed image to stay under quota
          images: item.images ? item.images.slice(0, 1) : item.images,
        }));
        localStorage.setItem('resource_share_items', JSON.stringify(stripped));
      } catch (e2) {
        console.error('localStorage still full after stripping images — skipping save.', e2);
      }
    } else {
      console.error('Unexpected localStorage error:', e);
    }
  }
};

export function ItemProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('resource_share_items');
    let parsedSaved = [];
    try {
      if (saved) {
        parsedSaved = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing local items", e);
    }
    
    // Combine ALL_ITEMS with any locally saved items that aren't in ALL_ITEMS
    if (parsedSaved && parsedSaved.length > 0) {
      const allItemIds = new Set(ALL_ITEMS.map(i => i.id));
      const newLocalItems = parsedSaved.filter(i => !allItemIds.has(i.id));
      return [...newLocalItems, ...ALL_ITEMS];
    }
    
    return ALL_ITEMS;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to prevent UI flashing
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addItem = useCallback((newItem) => {
    const guestItem = { ...newItem, id: newItem.id || Date.now() };
    setItems(prev => {
      const newItems = [guestItem, ...prev];
      safeSave(newItems);
      return newItems;
    });
    return guestItem;
  }, []);

  const removeItem = (id) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      safeSave(newItems);
      return newItems;
    });
  };

  const getItemsByCategory = (category) => {
    if (!category || category === 'All') return items;
    return items.filter(item => item.category === category);
  };

  return (
    <ItemContext.Provider value={{ items, loading, addItem, removeItem, getItemsByCategory, refreshItems: () => {} }}>
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
