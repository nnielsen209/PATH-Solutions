/**
 * @file ScheduleScreen.tsx
 * @description View-only schedule screen for troop leaders to browse camp activities.
 *
 * This screen provides:
 * - a read-only view of all scheduled camp activities
 * - support for both grid and list display modes
 * - formatted activity details including date, time, duration, and associated merit badge
 *
 * Data is fetched from Supabase and displayed in chronological order.
 * Leaders cannot create, edit, or delete activities—this is strictly for viewing purposes.
 *
 * The interface includes:
 * - a toggle between grid and list views
 * - a total activity count indicator
 * - responsive layout for mobile and desktop devices
 *
 * Helper functions are used to format:
 * - time (12-hour AM/PM format)
 * - duration (hours/minutes)
 * - dates (readable short format)
 *
 * Future enhancements may include:
 * - filtering activities by date or badge
 * - limiting results to the leader’s assigned troop
 * - calendar-style visualization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/ScheduleStyles';
import { supabase } from '../../services/supabase';
import { ScheduleGrid } from '../../components';

type ViewMode = 'list' | 'grid';

const ACCENT_COLOR = '#16a34a'; // Green accent for Leaders

type Activity = {
  activity_id: string;
  activity_name: string;
  activity_date: string;
  activity_start_time: string;
  activity_duration: string;
  badge_id: string | null;
  merit_badge: { badge_name: string } | null;
};

export const LeaderScheduleScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity')
        .select(
          `
          activity_id,
          activity_name,
          activity_date,
          activity_start_time,
          activity_duration,
          badge_id,
          merit_badge(badge_name)
        `
        )
        .order('activity_date', { ascending: true })
        .order('activity_start_time', { ascending: true });

      if (error) throw error;

      const formatted: Activity[] = (data || []).map((item: any) => {
        const mb =
          Array.isArray(item.merit_badge) ? item.merit_badge[0] : item.merit_badge;

        return {
          ...item,
          merit_badge: mb ? { badge_name: mb.badge_name } : null,
        };
      });

      setActivities(formatted);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration: string) => {
    const [hours, minutes] = duration.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h}.${m === 30 ? '5' : m} hr`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Schedule</Text>
          <Text style={styles.subtitle}>View camp activity schedules (read-only)</Text>
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
        {/* View-only notice */}
        <View style={styles.viewOnlyBanner}>
          <Ionicons name="eye-outline" size={18} color="#166534" />
          <Text style={styles.viewOnlyText}>View-only access - Contact camp staff for schedule changes</Text>
        </View>

        <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                <Ionicons name="calendar" size={24} color={ACCENT_COLOR} />
              </View>

              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Activities
                </Text>
                <Text style={styles.cardDescription}>
                  Scheduled merit badge classes and activities
                </Text>
              </View>

              <View style={styles.cardMeta}>
                {/* View toggle */}
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('list')}
                  >
                    <Ionicons name="list" size={18} color={viewMode === 'list' ? ACCENT_COLOR : '#9ca3af'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
                    onPress={() => setViewMode('grid')}
                  >
                    <Ionicons name="grid" size={18} color={viewMode === 'grid' ? ACCENT_COLOR : '#9ca3af'} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.countBadge, { backgroundColor: ACCENT_COLOR + '20' }]}>
                  <Text style={[styles.countText, { color: ACCENT_COLOR }]}>
                    {activities.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            {viewMode === 'grid' ? (
              <ScheduleGrid
                canEdit={false}
                deletingId={null}
              />
            ) : loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
              </View>
            ) : activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No activities scheduled</Text>
                <Text style={styles.emptyStateSubtext}>
                  Check back later - activities will appear here once scheduled
                </Text>
              </View>
            ) : (
              <View style={styles.activitiesList}>
                {activities.map((activity) => (
                  <View key={activity.activity_id} style={styles.activityItem}>
                    <View style={styles.activityTime}>
                      <Text style={styles.activityDateText}>
                        {formatDate(activity.activity_date)}
                      </Text>
                      <Text style={styles.activityTimeText}>
                        {formatTime(activity.activity_start_time)}
                      </Text>
                      <Text style={styles.activityDuration}>
                        {formatDuration(activity.activity_duration)}
                      </Text>
                    </View>

                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.activity_name}</Text>

                      {activity.merit_badge?.badge_name ? (
                        <View style={styles.badgeTag}>
                          <Ionicons name="ribbon" size={12} color={ACCENT_COLOR} />
                          <Text style={styles.badgeTagText}>
                            {activity.merit_badge.badge_name}
                          </Text>
                        </View>
                      ) : null}
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
