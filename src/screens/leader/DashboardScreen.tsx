/**
 * @file DashboardScreen.tsx
 * @description Read-only dashboard for troop leaders with scout overview and quick navigation.
 *
 * This screen displays:
 * - summary statistics for scouts and scheduled activities
 * - quick action shortcuts for viewing scouts, schedules, progress, and profile data
 * - a recent activity section for troop-related updates
 * - a read-only access notice for troop leaders
 *
 * The dashboard fetches troop-related summary data from Supabase and presents
 * it in a responsive layout for both mobile and desktop screen sizes. It is
 * designed as the main landing page for troop leaders after login.
 *
 * This screen is intended to give troop leaders visibility into scout and
 * troop information without edit permissions. Future updates may limit the
 * displayed scout data to only the currently signed-in leader’s assigned troop.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/DashboardStyles';

const ACCENT_COLOR = '#16a34a'; // Green accent for Leaders

type LeaderDashboardScreenProps = {
  onNavigate?: (routeName: string) => void;
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  cardStyle?: object;
};

const StatCard = ({ title, value, icon, color, cardStyle }: StatCardProps) => (
  <View style={[styles.statCard, { borderLeftColor: color }, cardStyle]}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

type QuickActionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  cardStyle?: object;
};

const QuickAction = ({ title, icon, color, onPress, cardStyle }: QuickActionProps) => (
  <TouchableOpacity style={[styles.quickAction, cardStyle]} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

export const LeaderDashboardScreen = ({ onNavigate }: LeaderDashboardScreenProps) => {
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [scoutCount, setScoutCount] = useState<number | string>('--');

  const contentPadding = isDesktop ? 32 : 20;
  const gap = 12;
  const mobileCardWidth = (width - contentPadding * 2 - gap) / 2;
  const desktopCardMaxWidth = 260;
  const desktopStatCardMaxWidth = 400;
  const statCardStyle = isDesktop
    ? { flex: 1, minWidth: 0, maxWidth: desktopStatCardMaxWidth, marginHorizontal: gap / 2 }
    : { width: mobileCardWidth };
  const quickActionCardStyle = isDesktop
    ? { flex: 1, minWidth: 0, maxWidth: desktopCardMaxWidth, marginHorizontal: gap / 2 }
    : { width: mobileCardWidth };

  const fetchStats = useCallback(async () => {
    try {
      // TODO: Filter scouts by troop once troop association is set up
      const { count } = await supabase
        .from('scout')
        .select('*', { count: 'exact', head: true });
      setScoutCount(count ?? 0);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#166534', '#16a34a']}
        style={[styles.header, isDesktop && styles.headerDesktop]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContent, isDesktop && styles.headerContentDesktop]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={[styles.userName, isDesktop && styles.userNameDesktop]}>
              {user?.user_metadata?.first_name || 'Leader'}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Troop Leader</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={isDesktop && styles.contentContainerDesktop}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentInner, { paddingHorizontal: contentPadding }, isDesktop && styles.contentInnerDesktop]}>
          {/* View-only notice */}
          <View style={styles.viewOnlyBanner}>
            <Ionicons name="eye-outline" size={18} color="#166534" />
            <Text style={styles.viewOnlyText}>View-only access - Contact camp staff for changes</Text>
          </View>

          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Overview</Text>
          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            <StatCard title="My Scouts" value={scoutCount} icon="people" color={ACCENT_COLOR} cardStyle={statCardStyle} />
            <StatCard title="Scheduled Activities" value="--" icon="calendar" color="#2563eb" cardStyle={statCardStyle} />
          </View>

          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Quick Actions</Text>
          <View style={[styles.quickActionsGrid, isDesktop && styles.quickActionsGridDesktop]}>
            <QuickAction title="View Scouts" icon="people" color={ACCENT_COLOR} onPress={() => onNavigate?.('Scouts')} cardStyle={quickActionCardStyle} />
            <QuickAction title="View Schedule" icon="calendar" color="#2563eb" onPress={() => onNavigate?.('Schedule')} cardStyle={quickActionCardStyle} />
            <QuickAction title="View Progress" icon="ribbon" color="#d97706" onPress={() => onNavigate?.('Progress')} cardStyle={quickActionCardStyle} />
            <QuickAction title="Profile" icon="person" color="#6b7280" onPress={() => onNavigate?.('Profile')} cardStyle={quickActionCardStyle} />
          </View>

          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Recent Activity</Text>
          <View style={[styles.activityCard, isDesktop && styles.activityCardDesktop]}>
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Scout progress updates will appear here</Text>
            </View>
          </View>
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
