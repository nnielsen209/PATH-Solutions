/**
 * DashboardScreen.tsx - Area Director Dashboard Home
 *
 * Main landing page for area directors: overview and quick access.
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

const DESKTOP_BREAKPOINT = 768;

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

export const AreaDirectorDashboardScreen = () => {
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

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
              {user?.user_metadata?.first_name || 'Area Director'}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Area Director</Text>
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
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Overview</Text>
          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            <StatCard title="Total Users" value="--" icon="people" color="#2563eb" cardStyle={statCardStyle} />
            <StatCard title="Counselors" value="--" icon="school" color="#059669" cardStyle={statCardStyle} />
            <StatCard title="Active Sessions" value="--" icon="calendar" color="#d97706" cardStyle={statCardStyleThird} />
          </View>

          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Quick Actions</Text>
          <View style={[styles.quickActionsGrid, isDesktop && styles.quickActionsGridDesktop]}>
            <QuickAction title="Users" icon="people" color="#2563eb" onPress={() => {}} cardStyle={quickActionCardStyle} />
            <QuickAction title="Schedule" icon="calendar" color="#059669" onPress={() => {}} cardStyle={quickActionCardStyle} />
            <QuickAction title="Reports" icon="bar-chart" color="#d97706" onPress={() => {}} cardStyle={quickActionCardStyle} />
            <QuickAction title="Settings" icon="settings" color="#6b7280" onPress={() => {}} cardStyle={quickActionCardStyle} />
          </View>

          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Recent Activity</Text>
          <View style={[styles.activityCard, isDesktop && styles.activityCardDesktop]}>
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Activity will appear here</Text>
            </View>
          </View>
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { paddingHorizontal: 20, paddingVertical: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerDesktop: { paddingHorizontal: 32, paddingVertical: 28 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerContentDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  userNameDesktop: { fontSize: 26 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12 },
  content: { flex: 1 },
  contentInner: { paddingTop: 8 },
  contentContainerDesktop: { alignItems: 'center' },
  contentInnerDesktop: { maxWidth: 1200, width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginTop: 24, marginBottom: 12 },
  sectionTitleDesktop: { fontSize: 20, marginTop: 28, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statsGridDesktop: { flexWrap: 'nowrap', marginHorizontal: -6 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  statIconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statContent: {},
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statTitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickActionsGridDesktop: { flexWrap: 'nowrap', marginHorizontal: -6 },
  quickAction: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  quickActionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  activityCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  activityCardDesktop: { maxWidth: 1200, width: '100%' },
  emptyState: { alignItems: 'center', paddingVertical: 16 },
  emptyStateText: { fontSize: 16, fontWeight: '500', color: '#6b7280', marginTop: 12 },
  emptyStateSubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
