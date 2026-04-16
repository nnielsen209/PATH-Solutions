/**
 * @file DashboardScreen.tsx
 * @description Developer dashboard providing full administrative access and system overview.
 *
 * This screen displays:
 * - key system metrics (total users, counselors, activities)
 * - quick action shortcuts for core management features
 * - a placeholder for recent system activity
 *
 * Data is fetched from Supabase using parallel queries to retrieve
 * aggregate counts efficiently. The interface mirrors admin functionality
 * but uses a distinct visual style (purple theme) to indicate developer mode.
 *
 * This dashboard serves as the primary entry point for developers, enabling
 * testing, monitoring, and full access to application features. The layout
 * is responsive and adapts for both mobile and desktop environments.
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

type DevDashboardScreenProps = {
  onNavigate?: (routeName: string) => void;
};

export const DevDashboardScreen = ({ onNavigate }: DevDashboardScreenProps) => {
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [counselorCount, setCounselorCount] = useState<number | null>(null);
  const [activityCount, setActivityCount] = useState<number | null>(null);

  /** Fetch dashboard stats from Supabase */
  const fetchStats = useCallback(async () => {
    try {
      // Fetch all stats in parallel
      const [usersResult, counselorsResult, activitiesResult] = await Promise.all([
        supabase.from('users').select('user_id', { count: 'exact', head: true }),
        supabase.from('users').select('user_id', { count: 'exact', head: true }).eq('user_role', 'COUNSELOR'),
        supabase.from('activity').select('activity_id', { count: 'exact', head: true }),
      ]);

      if (!usersResult.error) setTotalUsers(usersResult.count ?? 0);
      if (!counselorsResult.error) setCounselorCount(counselorsResult.count ?? 0);
      if (!activitiesResult.error) setActivityCount(activitiesResult.count ?? 0);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const contentPadding = isDesktop ? 32 : 20;
  const gap = 12;
  const mobileCardWidth = (width - contentPadding * 2 - gap) / 2;
  const desktopCardMaxWidth = 260;
  const desktopStatCardMaxWidth = 400;
  const statCardStyle = isDesktop
    ? { flex: 1, minWidth: 0, maxWidth: desktopStatCardMaxWidth, marginHorizontal: gap / 2 }
    : { width: mobileCardWidth };
  const statCardStyleThird = isDesktop
    ? { flex: 1, minWidth: 0, maxWidth: desktopStatCardMaxWidth, marginHorizontal: gap / 2 }
    : { width: width - contentPadding * 2 };
  const quickActionCardStyle = isDesktop
    ? { flex: 1, minWidth: 0, maxWidth: desktopCardMaxWidth, marginHorizontal: gap / 2 }
    : { width: mobileCardWidth };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Purple gradient for dev */}
      <LinearGradient
        colors={['#5b21b6', '#7c3aed']}
        style={[styles.header, isDesktop && styles.headerDesktop]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContent, isDesktop && styles.headerContentDesktop]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={[styles.userName, isDesktop && styles.userNameDesktop]}>
              {user?.user_metadata?.first_name || 'Developer'}
            </Text>
            <View style={styles.roleBadge}>
              <Ionicons name="code-slash" size={10} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.roleBadgeText}>Developer</Text>
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
          {/* Stats Section */}
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Overview</Text>
          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            <StatCard
              title="Total Users"
              value={totalUsers ?? '--'}
              icon="people"
              color="#7c3aed"
              cardStyle={statCardStyle}
            />
            <StatCard
              title="Counselors"
              value={counselorCount ?? '--'}
              icon="school"
              color="#059669"
              cardStyle={statCardStyle}
            />
            <StatCard
              title="Activities"
              value={activityCount ?? '--'}
              icon="calendar"
              color="#d97706"
              cardStyle={statCardStyleThird}
            />
          </View>

          {/* Quick Actions Section */}
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Quick Actions</Text>
          <View style={[styles.quickActionsGrid, isDesktop && styles.quickActionsGridDesktop]}>
            <QuickAction
              title="Users"
              icon="person-add"
              color="#7c3aed"
              onPress={() => onNavigate?.('Users')}
              cardStyle={quickActionCardStyle}
            />
            <QuickAction
              title="Sessions"
              icon="add-circle"
              color="#059669"
              onPress={() => onNavigate?.('Schedule')}
              cardStyle={quickActionCardStyle}
            />
            <QuickAction
              title="View Reports"
              icon="bar-chart"
              color="#d97706"
              onPress={() => onNavigate?.('Reports')}
              cardStyle={quickActionCardStyle}
            />
            <QuickAction
              title="Settings"
              icon="settings"
              color="#6b7280"
              onPress={() => onNavigate?.('Settings')}
              cardStyle={quickActionCardStyle}
            />
          </View>

          {/* Recent Activity Section */}
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Recent Activity</Text>
          <View style={[styles.activityCard, isDesktop && styles.activityCardDesktop]}>
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>
                Activity will appear here as users interact with the system
              </Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};