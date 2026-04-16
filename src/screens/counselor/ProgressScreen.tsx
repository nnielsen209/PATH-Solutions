/**
 * @file ProgressScreen.tsx
 * @description Screen for counselors to review and sign off on scout badge progress.
 *
 * This screen displays:
 * - a list of scouts and their associated merit badges
 * - progress metrics (completed vs total requirements)
 * - completion percentages for each badge
 * - indicators for fully completed badges
 *
 * Data is fetched from Supabase by joining scout_badge, merit_badge,
 * and requirement-related tables. Additional queries calculate the
 * number of completed and total requirements per badge.
 *
 * The screen includes loading and error states, and supports responsive
 * layout for both mobile and desktop devices. Intended to be expanded
 * with functionality for approving or updating requirement progress.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';
import { supabase } from '../../services/supabase';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;
const ACCENT_COLOR = '#d97706';

/** Scout badge progress record */
interface ScoutProgress {
  scout_badge_id: string;
  scout_id: string;
  badge_id: string;
  completed: boolean;
  scout: {
    scout_first_name: string;
    scout_last_name: string;
  };
  merit_badge: {
    badge_name: string;
  };
  completedCount: number;
  totalCount: number;
}

export const ProgressScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [progress, setProgress] = useState<ScoutProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch scout badge progress from Supabase */
  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch scout_badge entries with scout and badge info
      const { data: scoutBadges, error: badgesError } = await supabase
        .from('scout_badge')
        .select(`
          scout_badge_id,
          scout_id,
          badge_id,
          completed,
          scout:scout_id (
            scout_first_name,
            scout_last_name
          ),
          merit_badge:badge_id (
            badge_name
          )
        `)
        .order('crtn_date', { ascending: false });

      if (badgesError) throw badgesError;

      // For each scout_badge, count completed requirements
      const progressWithCounts: ScoutProgress[] = [];

      for (const sb of scoutBadges || []) {
        // Count total requirements for this badge
        const { count: totalCount } = await supabase
          .from('merit_badge_rqmt')
          .select('rqmt_id', { count: 'exact', head: true })
          .eq('badge_id', sb.badge_id);

        // Count completed requirements for this scout_badge
        const { count: completedCount } = await supabase
          .from('scout_badge_rqmt')
          .select('scout_badge_rqmt_id', { count: 'exact', head: true })
          .eq('scout_badge_id', sb.scout_badge_id)
          .eq('completed', true);

        // Handle potential array return from joins
        const scout = Array.isArray(sb.scout) ? sb.scout[0] : sb.scout;
        const merit_badge = Array.isArray(sb.merit_badge) ? sb.merit_badge[0] : sb.merit_badge;

        if (scout && merit_badge) {
          progressWithCounts.push({
            scout_badge_id: sb.scout_badge_id,
            scout_id: sb.scout_id,
            badge_id: sb.badge_id,
            completed: sb.completed,
            scout,
            merit_badge,
            completedCount: completedCount ?? 0,
            totalCount: totalCount ?? 0,
          });
        }
      }

      setProgress(progressWithCounts);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const progressCount = progress.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Progress</Text>
          <Text style={styles.subtitle}>Review and sign off on badge progress</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProgress}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: contentPadding }, isDesktop && styles.scrollContentDesktop]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                  <Ionicons name="ribbon" size={24} color={ACCENT_COLOR} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>Progress to review</Text>
                  <Text style={styles.cardDescription}>Sign off on completed requirements</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: ACCENT_COLOR + '20' }]}>
                  <Text style={[styles.countText, { color: ACCENT_COLOR }]}>{progressCount}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardContent}>
              {progressCount === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="ribbon-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No progress to review</Text>
                  <Text style={styles.emptyStateSubtext}>Progress submissions will appear here</Text>
                </View>
              ) : (
                <View style={styles.progressList}>
                  {progress.map((item) => {
                    const percentComplete = item.totalCount > 0
                      ? Math.round((item.completedCount / item.totalCount) * 100)
                      : 0;

                    return (
                      <View key={item.scout_badge_id} style={styles.progressItem}>
                        <View style={styles.progressInfo}>
                          <View style={styles.scoutAvatar}>
                            <Text style={styles.scoutInitials}>
                              {item.scout.scout_first_name[0]}{item.scout.scout_last_name[0]}
                            </Text>
                          </View>
                          <View style={styles.progressDetails}>
                            <Text style={styles.scoutName}>
                              {item.scout.scout_first_name} {item.scout.scout_last_name}
                            </Text>
                            <Text style={styles.badgeName}>{item.merit_badge.badge_name}</Text>
                          </View>
                        </View>
                        <View style={styles.progressStats}>
                          <Text style={styles.progressPercent}>{percentComplete}%</Text>
                          <Text style={styles.progressCount}>
                            {item.completedCount}/{item.totalCount}
                          </Text>
                          {item.completed && (
                            <View style={styles.completedBadge}>
                              <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerDesktop: { paddingHorizontal: 32, paddingVertical: 20 },
  headerInner: {},
  headerInnerDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  titleDesktop: { fontSize: 26 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#dc2626', marginTop: 12, textAlign: 'center' },
  retryButton: { marginTop: 16, backgroundColor: ACCENT_COLOR, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  scrollContentDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  mainCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  mainCardDesktop: { marginBottom: 0 },
  cardHeader: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cardTitleDesktop: { fontSize: 19 },
  cardDescription: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  countBadge: { minWidth: 32, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  countText: { fontSize: 15, fontWeight: '600' },
  cardContent: { minHeight: 200, padding: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyStateText: { fontSize: 16, fontWeight: '500', color: '#6b7280', marginTop: 16 },
  emptyStateSubtext: { fontSize: 13, color: '#9ca3af', marginTop: 6, textAlign: 'center' },
  progressList: { gap: 8 },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
  },
  progressInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  scoutAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoutInitials: { fontSize: 14, fontWeight: '600', color: ACCENT_COLOR },
  progressDetails: { flex: 1 },
  scoutName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  badgeName: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  progressStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPercent: { fontSize: 16, fontWeight: '700', color: ACCENT_COLOR },
  progressCount: { fontSize: 12, color: '#9ca3af' },
  completedBadge: { marginLeft: 4 },
});
