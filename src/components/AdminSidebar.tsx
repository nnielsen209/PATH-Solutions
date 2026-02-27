/**
 * AdminSidebar.tsx - Left Navigation Sidebar for Admin
 *
 * Used on tablet and desktop so admins can switch between screens without
 * a bottom tab bar. Shows a list of links with icons; the active screen
 * is highlighted. We put the brand/logo at the top and a small label at the bottom.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavItem = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

type AdminSidebarProps = {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', iconFocused: 'grid' },
  { name: 'Users', label: 'Users', icon: 'people-outline', iconFocused: 'people' },
  { name: 'Programs', label: 'Programs', icon: 'ribbon-outline', iconFocused: 'ribbon' },
  { name: 'Schedule', label: 'Schedule', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'Reports', label: 'Reports', icon: 'bar-chart-outline', iconFocused: 'bar-chart' },
  { name: 'Settings', label: 'Settings', icon: 'settings-outline', iconFocused: 'settings' },
];

/**
 * AdminSidebar Component
 *
 * Renders the left sidebar for admin on large screens. Highlights the current
 * route and calls onNavigate when the user taps a different item.
 */
export const AdminSidebar = ({ currentRoute, onNavigate }: AdminSidebarProps) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left']}>
      {/* Logo/Brand */}
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
                color={isActive ? '#2563eb' : '#6b7280'}
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
        <Text style={styles.footerText}>Admin Panel</Text>
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
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
  },
  navLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginLeft: 12,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
