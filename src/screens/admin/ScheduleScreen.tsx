/**
 * ScheduleScreen.tsx - Admin Schedule Management
 *
 * Manage camp sessions and activity schedules. Ready for future:
 * - Sessions list, add/edit session
 * - Activities per session, time slots
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_SESSIONS } from '../../data/mockScreensData';

const DESKTOP_BREAKPOINT = 768;
const ACCENT_COLOR = '#d97706';

export const ScheduleScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const sessionCount = MOCK_SESSIONS.length;

  const handleNewSession = () => {
    // TODO: Navigate to new-session flow or open modal
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Schedule</Text>
          <Text style={styles.subtitle}>
            Manage camp sessions and activity schedules
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: contentPadding },
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                <Ionicons name="calendar" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Sessions & activities
                </Text>
                <Text style={styles.cardDescription}>
                  Create sessions and schedule merit badge classes
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <View style={[styles.countBadge, { backgroundColor: ACCENT_COLOR + '20' }]}>
                  <Text style={[styles.countText, { color: ACCENT_COLOR }]}>
                    {sessionCount}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: ACCENT_COLOR }]}
                  onPress={handleNewSession}
                >
                  <Ionicons name="add-circle" size={18} color={ACCENT_COLOR} />
                  <Text style={[styles.addButtonText, { color: ACCENT_COLOR }]}>
                    New session
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            {sessionCount === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No sessions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create a camp session to add activities and let counselors and participants view the schedule
                </Text>
              </View>
            ) : (
              <View style={styles.sessionList}>
                {MOCK_SESSIONS.map((session) => (
                  <View key={session.id} style={styles.sessionRow}>
                    <View style={[styles.sessionIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                      <Ionicons name="calendar" size={20} color={ACCENT_COLOR} />
                    </View>
                    <View style={styles.sessionRowText}>
                      <Text style={styles.sessionRowName}>{session.name}</Text>
                      <Text style={styles.sessionRowMeta}>{session.dateRange} · {session.year} · {session.activityCount} activities</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDesktop: { paddingHorizontal: 32, paddingVertical: 20 },
  headerInner: {},
  headerInnerDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  titleDesktop: { fontSize: 26 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  scrollContentDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainCardDesktop: { marginBottom: 0 },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cardTitleDesktop: { fontSize: 19 },
  cardDescription: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: { fontSize: 15, fontWeight: '600' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  addButtonText: { fontSize: 13, fontWeight: '600' },
  cardContent: { minHeight: 200, padding: 16 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },
  sessionList: {},
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sessionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionRowText: { flex: 1, minWidth: 0 },
  sessionRowName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  sessionRowMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
