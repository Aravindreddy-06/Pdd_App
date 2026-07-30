import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabaseClient';
import { COLORS } from '../theme/colors';

export default function OrdersScreen() {
  const [requests, setRequests] = useState([
    {
      id: 'req_1',
      item_title: 'Bosch Professional Cordless Drill Kit',
      owner_name: 'David R.',
      status: 'Approved',
      created_at: new Date().toISOString(),
      delivery_method: 'pickup'
    },
    {
      id: 'req_2',
      item_title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
      owner_name: 'Sarah L.',
      status: 'Pending Approval',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      delivery_method: 'dropoff'
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setRequests(data);
      }
    } catch (e) {
      console.warn('Fetch orders exception:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Borrow Orders ({requests.length})</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isApproved = item.status === 'Approved';
            return (
              <View style={styles.orderCard}>
                <View style={styles.topRow}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.item_title}</Text>
                  <View style={[styles.statusBadge, isApproved ? styles.statusApproved : styles.statusPending]}>
                    <Text style={[styles.statusText, isApproved ? styles.statusTextApproved : styles.statusTextPending]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>Lender: {item.owner_name}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="walk-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>Delivery: {item.delivery_method === 'dropoff' ? 'Neighbor Drop-off' : 'Self Pickup'}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusApproved: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextApproved: {
    color: COLORS.success,
  },
  statusTextPending: {
    color: COLORS.warning,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
