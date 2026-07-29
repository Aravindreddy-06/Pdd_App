import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const NotificationContext = createContext();

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'request',
    icon: '🤝',
    title: 'New Borrow Request',
    text: 'Sarah J. wants to borrow your Wireless Mouse.',
    time: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    unread: true,
    link: '/requests'
  },
  {
    id: '2',
    type: 'accepted',
    icon: '✅',
    title: 'Request Accepted',
    text: 'Mike T. accepted your request for the Power Drill.',
    time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    unread: true,
    link: '/requests'
  },
  {
    id: '3',
    type: 'returned',
    icon: '📦',
    title: 'Item Returned',
    text: 'Dan C. returned your Over-Ear Headphones.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: false,
    link: '/my-items'
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('rs_notifications');
      return saved ? JSON.parse(saved).map(n => ({ ...n, time: new Date(n.time) })) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('time', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(n => ({ ...n, time: new Date(n.time) }));
        setNotifications(mapped);
        localStorage.setItem('rs_notifications', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const save = async (updated) => {
    setNotifications(updated);
    localStorage.setItem('rs_notifications', JSON.stringify(updated));
  };

  const addNotification = useCallback(async (notif) => {
    const newNotif = {
      id: Date.now().toString(),
      time: new Date(),
      unread: true,
      ...notif,
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('rs_notifications', JSON.stringify(updated));
      return updated;
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('notifications').insert([{
          ...newNotif,
          user_id: session.user.id,
          time: newNotif.time.toISOString()
        }]);
      }
    } catch (err) {
      console.error('Error adding notification to Supabase:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, unread: false } : n);
      localStorage.setItem('rs_notifications', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('notifications').update({ unread: false }).eq('id', id);
    } catch (err) {
      console.error('Error marking notification as read in Supabase:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      localStorage.setItem('rs_notifications', JSON.stringify(updated));
      return updated;
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('notifications').update({ unread: false }).eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error('Error marking all notifications as read in Supabase:', err);
    }
  }, []);

  const dismiss = useCallback(async (id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('rs_notifications', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (err) {
      console.error('Error dismissing notification in Supabase:', err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    localStorage.removeItem('rs_notifications');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('notifications').delete().eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error('Error clearing notifications in Supabase:', err);
    }
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllRead,
      dismiss,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

// Helper to format time ago
export function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
