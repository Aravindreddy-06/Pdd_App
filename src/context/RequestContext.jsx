import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const RequestContext = createContext();

export function RequestProvider({ children }) {
  const [communityRequests, setCommunityRequests] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunityRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_requests')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunityRequests(data || []);
    } catch (err) {
      console.error('Error fetching community requests:', err);
    }
  }, []);

  const fetchBorrowRequests = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*, items(title), profiles!requester_id(full_name, avatar_url)')
        .or(`requester_id.eq.${session.user.id},owner_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBorrowRequests(data || []);
    } catch (err) {
      console.error('Error fetching borrow requests:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCommunityRequests(), fetchBorrowRequests()]);
      setLoading(false);
    };
    init();
  }, [fetchCommunityRequests, fetchBorrowRequests]);

  const addCommunityRequest = async (request) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('community_requests')
        .insert([{
          ...request,
          user_id: session.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setCommunityRequests(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding community request:', err);
      throw err;
    }
  };

  const addBorrowRequest = async (request) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('borrow_requests')
        .insert([{
          ...request,
          requester_id: session.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setBorrowRequests(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding borrow request:', err);
      throw err;
    }
  };

  const updateBorrowRequestStatus = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      setBorrowRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    } catch (err) {
      console.error('Error updating borrow request status:', err);
      throw err;
    }
  };

  return (
    <RequestContext.Provider value={{
      communityRequests,
      borrowRequests,
      loading,
      addCommunityRequest,
      addBorrowRequest,
      updateBorrowRequestStatus,
      refresh: () => Promise.all([fetchCommunityRequests(), fetchBorrowRequests()])
    }}>
      {children}
    </RequestContext.Provider>
  );
}

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) throw new Error('useRequests must be used within RequestProvider');
  return context;
};
