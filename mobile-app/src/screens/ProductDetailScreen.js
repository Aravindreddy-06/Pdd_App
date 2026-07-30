import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS } from '../theme/colors';

export default function ProductDetailScreen({ route, navigation }) {
  const { item } = route.params || {};
  const { addToCart } = useUser();

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: COLORS.text, padding: 20 }}>Item not found.</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addToCart(item);
    Alert.alert('Success', `${item.title} added to your cart!`);
  };

  const handleBorrowNow = () => {
    addToCart(item);
    navigation.navigate('Checkout', { item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Preview with Back Button */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.img }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Top Metadata */}
          <View style={styles.metaRow}>
            <Text style={styles.category}>{item.category || 'Rental'}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          {/* Pricing Box */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Daily Rate</Text>
              <Text style={styles.priceVal}>{item.price}</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.priceLabel}>Security Deposit</Text>
              <Text style={styles.depositVal}>{item.deposit || '₹500'}</Text>
            </View>
          </View>

          {/* Owner Info */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{item.owner || 'Verified Lender'}</Text>
              <Text style={styles.ownerLoc}>{item.location || 'Blk B, Oakwood'}</Text>
            </View>
            <View style={styles.distBadge}>
              <Ionicons name="navigate-outline" size={12} color={COLORS.primary} />
              <Text style={styles.distText}>{item.distance || '0.3 km'}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description || 'Quality item available for short term neighbor lending.'}</Text>

          {/* Features */}
          {item.features && item.features.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Highlights & Features</Text>
              {item.features.map((feat, idx) => (
                <View key={idx} style={styles.featRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.featText}>{feat}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.borrowButton} onPress={handleBorrowNow}>
          <Text style={styles.borrowBtnText}>Borrow Now</Text>
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
    paddingBottom: 90,
  },
  imageWrapper: {
    height: 260,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1c2205',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 12, 1, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  priceVal: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.cardBorder,
  },
  depositVal: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 20,
  },
  ownerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  ownerName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  ownerLoc: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featText: {
    color: COLORS.text,
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    padding: 14,
    gap: 12,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    gap: 6,
  },
  cartBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  borrowButton: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  borrowBtnText: {
    color: COLORS.background,
    fontWeight: '800',
    fontSize: 15,
  },
});
