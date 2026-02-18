/**
 * DashboardScreen.tsx - Admin Dashboard Home
 *
 * First screen admins see after logging in. Shows a greeting, a few stat cards
 * (total users, counselors, active sessions), and quick action buttons for
 * common tasks. Also has a recent activity section (placeholder for now).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { MOCK_ADMIN_STATS, MOCK_ADMIN_ACTIVITY } from '../../data/mockDashboardData';

const DESKTOP_BREAKPOINT = 768;

/**
 * StatCard - Small card showing a number and label with an icon.
 * Used for the overview stats (e.g. Total Users, Counselors).
 */
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

/**
 * QuickAction - Tappable card that runs an action (e.g. Add User, New Session).
 * Shows an icon and label; onPress is called when the user taps.
 */
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

/**
 * DashboardScreen Component
 *
 * Renders the admin dashboard: gradient header with greeting and logout,
 * then scrollable content with stats, quick actions, and recent activity.
 * Layout adjusts for desktop (wider padding, different card widths).
 */
export const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const contentPadding = isDesktop ? 32 : 20;
  const gap = 12;
  const mobileCardWidth = (width - contentPadding * 2 - gap) / 2;
  const desktopCardMaxWidth = 260;
  // 3 stat cards: on desktop they share the row (larger max); on mobile 3rd spans full width
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
      {/* Header */}
      <LinearGradient
        colors={['#1e3a5f', '#2d5a7b']}
        style={[styles.header, isDesktop && styles.headerDesktop]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContent, isDesktop && styles.headerContentDesktop]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={[styles.userName, isDesktop && styles.userNameDesktop]}>
              {user?.user_metadata?.first_name || 'Admin'}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Admin</Text>
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
              value={MOCK_ADMIN_STATS.totalUsers}
              icon="people"
              color="#2563eb"
              cardStyle={statCardStyle}
            />
            <StatCard
              title="Counselors"
              value={MOCK_ADMIN_STATS.counselors}
              icon="school"
              color="#059669"
              cardStyle={statCardStyle}
            />
            <StatCard
              title="Active Sessions"
              value={MOCK_ADMIN_STATS.activeSessions}
              icon="calendar"
              color="#d97706"
              cardStyle={statCardStyleThird}
            />
          </View>

          {/* Quick Actions Section */}
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Quick Actions</Text>
          <View style={[styles.quickActionsGrid, isDesktop && styles.quickActionsGridDesktop]}>
            <QuickAction
              title="Add User"
              icon="person-add"
              color="#2563eb"
              onPress={() => {}}
              cardStyle={quickActionCardStyle}
            />
            <QuickAction
              title="New Session"
              icon="add-circle"
              color="#059669"
              onPress={() => {}}
              cardStyle={quickActionCardStyle}
            />
            <QuickAction
              title="View Reports"
              icon="bar-chart"
              color="#d97706"
              onPress={() => {}}
              cardStyle={quickActionCardStyle}
            />
            <QuickAction
              title="Settings"
              icon="settings"
              color="#6b7280"
              onPress={() => {}}
              cardStyle={quickActionCardStyle}
            />
          </View>

          {/* Recent Activity Section */}
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Recent Activity</Text>
          <View style={[styles.activityCard, isDesktop && styles.activityCardDesktop]}>
            {MOCK_ADMIN_ACTIVITY.map((item, index) => (
              <View
                key={item.id}
                style={[styles.activityRow, index === MOCK_ADMIN_ACTIVITY.length - 1 && styles.activityRowLast]}
              >
                <View style={[styles.activityIconWrap, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={item.color} />
                </View>
                <View style={styles.activityTextWrap}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  userNameDesktop: {
    fontSize: 26,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingTop: 8,
  },
  contentContainerDesktop: {
    alignItems: 'center',
  },
  contentInnerDesktop: {
    maxWidth: 1200,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  // Desktop: larger section titles, constrained content width
  headerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  headerContentDesktop: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitleDesktop: {
    fontSize: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsGridDesktop: {
    flexWrap: 'nowrap',
    marginHorizontal: -6,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {},
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionsGridDesktop: {
    flexWrap: 'nowrap',
    marginHorizontal: -6,
  },
  quickAction: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Activity Card
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityCardDesktop: {
    maxWidth: 1200,
    width: '100%',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTextWrap: { flex: 1, minWidth: 0 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  activitySubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  activityTime: { fontSize: 12, color: '#9ca3af', marginLeft: 8 },
  activityRowLast: { borderBottomWidth: 0 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});
