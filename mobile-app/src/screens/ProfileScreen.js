import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS } from '../theme/colors';

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Profile</Text>
      </View>

      <View style={styles.body}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name || 'Abhi Reddy'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'abhireddyk2005@gmail.com'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.primary} />
              <Text style={styles.userLoc}>{user?.location || 'Oakwood Apartments, Blk B'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {[
            { icon: 'shield-checkmark-outline', title: 'Identity & Address Verified' },
            { icon: 'wallet-outline', title: 'Security Deposits & Refunds' },
            { icon: 'notifications-outline', title: 'App Notifications' },
            { icon: 'help-circle-outline', title: 'Help & Neighbor Support' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuRow}>
              <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
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
  body: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.background,
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userLoc: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  menuTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
