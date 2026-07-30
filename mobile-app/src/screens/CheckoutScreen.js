import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { supabase } from '../api/supabaseClient';
import { COLORS } from '../theme/colors';

export default function CheckoutScreen({ route, navigation }) {
  const { cart, clearCart, user } = useUser();
  const { item, items, grandTotal } = route.params || {};

  const checkoutItems = items || (item ? [item] : cart);

  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [borrowNote, setBorrowNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmRequest = async () => {
    if (checkoutItems.length === 0) return;
    
    setSubmitting(true);
    try {
      // Record borrow requests in Supabase
      const requests = checkoutItems.map(i => ({
        item_id: i.id,
        borrower_name: user?.name || 'Abhi Reddy',
        borrower_email: user?.email || 'abhireddyk2005@gmail.com',
        owner_name: i.owner || 'Verified Lender',
        item_title: i.title,
        status: 'Pending Approval',
        delivery_method: deliveryMethod,
        note: borrowNote,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('requests').insert(requests);
      if (error) {
        console.warn('Supabase request insert warning:', error.message);
      }

      await clearCart();
      Alert.alert(
        'Request Submitted! 🎉',
        'Your rental borrow request has been sent to the item owner. You can track status under Orders.',
        [{ text: 'View Orders', onPress: () => navigation.navigate('Orders') }]
      );
    } catch (e) {
      console.error('Checkout error:', e);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Borrow Request</Text>
        </View>

        {/* Borrowing Summary */}
        <Text style={styles.sectionTitle}>Requested Items ({checkoutItems.length})</Text>
        {checkoutItems.map((ci, idx) => (
          <View key={idx} style={styles.itemSummaryRow}>
            <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
            <Text style={styles.itemTitle} numberOfLines={1}>{ci.title}</Text>
            <Text style={styles.itemPrice}>{ci.price}</Text>
          </View>
        ))}

        {/* Delivery / Pickup Method */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodCard, deliveryMethod === 'pickup' && styles.methodCardActive]}
            onPress={() => setDeliveryMethod('pickup')}
          >
            <Ionicons name="walk" size={22} color={deliveryMethod === 'pickup' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.methodText, deliveryMethod === 'pickup' && styles.methodTextActive]}>Self Pickup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, deliveryMethod === 'dropoff' && styles.methodCardActive]}
            onPress={() => setDeliveryMethod('dropoff')}
          >
            <Ionicons name="bicycle" size={22} color={deliveryMethod === 'dropoff' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.methodText, deliveryMethod === 'dropoff' && styles.methodTextActive]}>Neighbor Drop-off</Text>
          </TouchableOpacity>
        </View>

        {/* Optional Note to Lender */}
        <Text style={styles.sectionTitle}>Note to Owner (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="e.g., Hi, I need this tool for a weekend home project..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          value={borrowNote}
          onChangeText={setBorrowNote}
        />

        {/* Terms Box */}
        <View style={styles.termsBox}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <Text style={styles.termsText}>
            Security deposit is refundable upon returning the item in its original condition.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleConfirmRequest}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Send Borrow Request'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  itemTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  itemPrice: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 6,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.inputBg,
  },
  methodText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  methodTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  noteInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    textAlignVertical: 'top',
    height: 80,
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2205',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  termsText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  submitBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
});
