import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS } from '../theme/colors';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateCartDays, clearCart } = useUser();

  const totalRent = cart.reduce((sum, item) => {
    const dailyPrice = item.price_num || parseInt(item.price.replace(/[^\d]/g, ''), 10) || 10;
    return sum + (dailyPrice * (item.days || 1));
  }, 0);

  const totalDeposit = cart.reduce((sum, item) => {
    const dep = parseInt((item.deposit || '500').replace(/[^\d]/g, ''), 10) || 500;
    return sum + dep;
  }, 0);

  const grandTotal = totalRent + totalDeposit;

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Borrow Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Explore items near you and add them to your cart to request a rental.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.exploreBtnText}>Browse Available Items</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Borrow Cart ({cart.length})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const dailyPrice = item.price_num || parseInt(item.price.replace(/[^\d]/g, ''), 10) || 10;
          return (
            <View style={styles.cartCard}>
              <Image source={{ uri: item.img }} style={styles.itemImage} />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>

                {/* Days Selector */}
                <View style={styles.daysRow}>
                  <Text style={styles.daysLabel}>Duration:</Text>
                  <TouchableOpacity
                    style={styles.dayBtn}
                    onPress={() => updateCartDays(item.id, (item.days || 1) - 1)}
                  >
                    <Ionicons name="remove" size={14} color={COLORS.text} />
                  </TouchableOpacity>

                  <Text style={styles.daysVal}>{item.days || 1} day{(item.days || 1) > 1 ? 's' : ''}</Text>

                  <TouchableOpacity
                    style={styles.dayBtn}
                    onPress={() => updateCartDays(item.id, (item.days || 1) + 1)}
                  >
                    <Ionicons name="add" size={14} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rightActions}>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
                <Text style={styles.itemTotal}>₹{dailyPrice * (item.days || 1)}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Rental Fee:</Text>
          <Text style={styles.summaryVal}>₹{totalRent}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Refundable Security Deposit:</Text>
          <Text style={styles.summaryVal}>₹{totalDeposit}</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 4 }]}>
          <Text style={styles.grandLabel}>Estimated Total:</Text>
          <Text style={styles.grandVal}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout', { items: cart, grandTotal })}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Borrow Request</Text>
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
  clearText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 180,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#1c2205',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemPrice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  dayBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  daysVal: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  rightActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  itemTotal: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  exploreBtnText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  summaryVal: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  grandLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  grandVal: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  checkoutBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
});
