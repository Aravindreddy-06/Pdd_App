import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '../context/ItemContext';
import ItemCard from '../components/ItemCard';
import { COLORS } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { items, setSelectedCategory } = useItems();

  const trendingItems = items.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.appName}>Lendkart</Text>
            <Text style={styles.subtitle}>Borrow & Lend Tools in your Community</Text>
          </View>
          <TouchableOpacity style={styles.searchIconBtn} onPress={() => navigation.navigate('Categories')}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroBadge}>NEIGHBOR MARKETPLACE</Text>
            <Text style={styles.heroTitle}>Why Buy When You Can Borrow?</Text>
            <Text style={styles.heroSub}>Save money, reduce clutter, borrow high quality tools & gear near you.</Text>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.heroBtnText}>Explore Nearby Gear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Category Icons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
        </View>
        <View style={styles.categoryGrid}>
          {[
            { label: 'Tools', icon: 'build-outline' },
            { label: 'Electronics', icon: 'laptop-outline' },
            { label: 'Photography', icon: 'camera-outline' },
            { label: 'Outdoors', icon: 'compass-outline' },
          ].map(cat => (
            <TouchableOpacity
              key={cat.label}
              style={styles.catBox}
              onPress={() => {
                setSelectedCategory(cat.label);
                navigation.navigate('Categories');
              }}
            >
              <View style={styles.catIconCircle}>
                <Ionicons name={cat.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Listings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Near You</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          {trendingItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onPress={() => navigation.navigate('ProductDetail', { item })}
            />
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justify: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  heroBanner: {
    backgroundColor: '#161c05',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  heroTextCol: {
    gap: 6,
  },
  heroBadge: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  heroSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  heroBtn: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  heroBtnText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  catBox: {
    alignItems: 'center',
    gap: 6,
  },
  catIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justify: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  catLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
});
