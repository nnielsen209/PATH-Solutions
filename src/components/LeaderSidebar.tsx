/**
 * LeaderSidebar.tsx - Left Navigation Sidebar for Leader
 *
 * Used on tablet and desktop so troop leaders can switch between their screens
 * (Dashboard, Scouts, Schedule, Progress, Profile) without the bottom
 * tab bar. Green accent color to distinguish from other roles.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT_COLOR = '#16a34a'; // Green accent for Leaders

type NavItem = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

type LeaderSidebarProps = {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', iconFocused: 'grid' },
  { name: 'Scouts', label: 'My Scouts', icon: 'people-outline', iconFocused: 'people' },
  { name: 'Schedule', label: 'Schedule', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'Progress', label: 'Progress', icon: 'ribbon-outline', iconFocused: 'ribbon' },
  { name: 'Profile', label: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

/**
 * LeaderSidebar Component
 *
 * Renders the left sidebar for troop leaders on large screens. Highlights the
 * current route and calls onNavigate when the user taps a different item.
 */
export const LeaderSidebar = ({ currentRoute, onNavigate }: LeaderSidebarProps) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
      <View style={styles.brand}>
        <View style={styles.logoContainer}>
          <Ionicons name="compass" size={32} color="#fff" />
        </View>
        <Text style={styles.brandText}>PATHSOLUTIONS</Text>
      </View>
      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.name)}
            >
              <Ionicons
                name={isActive ? item.iconFocused : item.icon}
                size={22}
                color={isActive ? ACCENT_COLOR : '#6b7280'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.footer}>
        <View style={styles.divider} />
        <View style={styles.footerBadge}>
          <Ionicons name="eye-outline" size={14} color="#166534" />
          <Text style={styles.footerBadgeText}>View Only</Text>
        </View>
        <Text style={styles.footerText}>Troop Leader</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    paddingVertical: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginLeft: 12 },
  nav: { flex: 1, paddingHorizontal: 12 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: { backgroundColor: '#dcfce7' },
  navLabel: { fontSize: 15, color: '#6b7280', marginLeft: 12, fontWeight: '500' },
  navLabelActive: { color: ACCENT_COLOR, fontWeight: '600' },
  footer: { paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 16 },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  footerBadgeText: { fontSize: 11, color: '#166534', fontWeight: '600' },
  footerText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});
