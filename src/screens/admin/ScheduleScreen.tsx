/**
 * ScheduleScreen.tsx - Admin Schedule Management
 *
 * Manage camp sessions and activity schedules.
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
import { AddActivityModal, ScheduleGrid } from '../../components';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

type ViewMode = 'list' | 'grid';

const ACCENT_COLOR = '#d97706';

type Period = {
  period_id: string;
  period_nmbr: number;
  period_time: string;
};

type Activity = {
  activity_id: string;
  activity_name: string;
  period_id: string;
  activity_duration: number;
  period: Period | null;
};

export const ScheduleScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  //allow a few roles to edit
  const canEdit =
    userRole === 'DEV' ||
    userRole === 'ADMIN' 

  const [showModal, setShowModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
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
          period_id,
          activity_duration,
          period(period_id, period_nmbr, period_time)
        `
        )
        .order('activity_name', { ascending: true });

      if (error) throw error;

      const formatted: Activity[] = (data || []).map((item: any) => {
        const p = Array.isArray(item.period) ? item.period[0] : item.period;
        return {
          ...item,
          period: p ? { period_id: p.period_id, period_nmbr: p.period_nmbr, period_time: p.period_time } : null,
        };
      });

      // Sort by period number
      formatted.sort((a, b) => {
        const aPeriod = a.period?.period_nmbr ?? 999;
        const bPeriod = b.period?.period_nmbr ?? 999;
        return aPeriod - bPeriod;
      });

      setActivities(formatted);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (activityId: string) => {
    setDeleting(activityId);
    try {
      const { error } = await supabase
        .from('activity')
        .delete()
        .eq('activity_id', activityId);
      if (error) throw error;
      fetchActivities();
    } catch (err) {
      console.error('Error deleting activity:', err);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleNewSession = () => {
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    fetchActivities();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (duration: number) => {
    return duration === 1 ? '1 period' : `${duration} periods`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Schedule</Text>
          <Text style={styles.subtitle}>Manage camp sessions and activity schedules</Text>
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
                  Activities
                </Text>
                <Text style={styles.cardDescription}>
                  Schedule merit badge classes and activities
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

                {canEdit && (
                  <TouchableOpacity
                    style={[styles.addButton, { borderColor: ACCENT_COLOR }]}
                    onPress={handleNewSession}
                  >
                    <Ionicons name="add-circle" size={18} color={ACCENT_COLOR} />
                    <Text style={[styles.addButtonText, { color: ACCENT_COLOR }]}>
                      New activity
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            {viewMode === 'grid' ? (
              <ScheduleGrid
                canEdit={canEdit}
                deletingId={deleting}
                onDelete={handleDelete}
              />
            ) : loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
              </View>
            ) : activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No activities yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  {canEdit
                    ? 'Create an activity to schedule merit badge classes'
                    : 'Check back later — activities will appear here once created'}
                </Text>
              </View>
            ) : (
              <View style={styles.activitiesList}>
                {activities.map((activity) => (
                  <View key={activity.activity_id} style={styles.activityItem}>
                    <View style={styles.activityTime}>
                      <Text style={styles.activityPeriodText}>
                        Period {activity.period?.period_nmbr ?? '?'}
                      </Text>
                      <Text style={styles.activityTimeText}>
                        {activity.period ? formatTime(activity.period.period_time) : '--:--'}
                      </Text>
                      <Text style={styles.activityDuration}>
                        {formatDuration(activity.activity_duration)}
                      </Text>
                    </View>

                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.activity_name}</Text>
                    </View>

                    {canEdit && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(activity.activity_id)}
                        disabled={deleting === activity.activity_id}
                      >
                        {deleting === activity.activity_id ? (
                          <ActivityIndicator size="small" color="#dc2626" />
                        ) : (
                          <Ionicons name="trash-outline" size={18} color="#dc2626" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {canEdit && (
        <AddActivityModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </SafeAreaView>
  );
};