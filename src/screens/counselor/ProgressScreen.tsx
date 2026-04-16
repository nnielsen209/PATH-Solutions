/**
 * ProgressScreen.tsx - Counselor progress review
 *
 * Shows scout badge progress that needs counselor review/sign-off.
 * Fetches data from scout_badge_rqmt joined with related tables.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/ProgressStyles';
import { supabase } from '../../services/supabase';

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
