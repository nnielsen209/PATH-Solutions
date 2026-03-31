/**
 * ScheduleGrid.tsx - Main schedule grid component
 *
 * Displays activities in a timeline/grid format with:
 * - Rows = camp areas/departments
 * - Columns = time periods
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';
import { useScheduleGridData, GridActivity } from '../../hooks/useScheduleGridData';
import { getDepartmentColor } from '../../constants/departmentColors';
import { ScheduleGridCell } from './ScheduleGridCell';
import { ActivityCard } from './ActivityCard';
import {
  styles,
  CELL_WIDTH_MOBILE,
  CELL_WIDTH_DESKTOP,
  PERIOD_LABEL_WIDTH_MOBILE,
  PERIOD_LABEL_WIDTH_DESKTOP,
} from '../../styles/ScheduleGridStyles';

type ScheduleGridProps = {
  canEdit: boolean;
  deletingId: string | null;
  onDelete?: (activityId: string) => void;
  onRefresh?: () => void;
};

export const ScheduleGrid = ({
  canEdit,
  deletingId,
  onDelete,
}: ScheduleGridProps) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= TABLET_BREAKPOINT;
  const { data, loading, error } = useScheduleGridData();

  // Refs for synchronized horizontal scrolling
  const headerScrollRef = useRef<ScrollView>(null);
  const rowScrollRefs = useRef<(ScrollView | null)[]>([]);

  const cellWidth = isDesktop ? CELL_WIDTH_DESKTOP : CELL_WIDTH_MOBILE;
  const periodLabelWidth = isDesktop ? PERIOD_LABEL_WIDTH_DESKTOP : PERIOD_LABEL_WIDTH_MOBILE;

  // Synchronize horizontal scroll across header and all rows
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    headerScrollRef.current?.scrollTo({ x: offsetX, animated: false });
    rowScrollRefs.current.forEach((ref) => {
      ref?.scrollTo({ x: offsetX, animated: false });
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>{error || 'Failed to load data'}</Text>
      </View>
    );
  }

  const { periods, departments, grid, unassignedByPeriod } = data;

  if (periods.length === 0 || departments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>No schedule data available</Text>
        <Text style={styles.emptySubtext}>
          Periods and departments need to be configured first
        </Text>
      </View>
    );
  }

  // Collect all unassigned activities
  const allUnassigned: GridActivity[] = [];
  unassignedByPeriod.forEach((activities) => {
    allUnassigned.push(...activities);
  });

  return (
    <View style={styles.gridContainer}>
      {/* Header row with period names (swapped: periods are now columns) */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.headerDeptSpacer,
            { width: periodLabelWidth + 20 },
            isDesktop && styles.headerDeptSpacerDesktop,
          ]}
        />
        <ScrollView
          ref={headerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={styles.headerScrollContent}
        >
          {periods.map((period) => (
            <View
              key={period.period_id}
              style={[
                styles.headerCell,
                { width: cellWidth, backgroundColor: '#f3f4f6' },
                isDesktop && styles.headerCellDesktop,
              ]}
            >
              <Text style={[styles.headerCellText, { color: '#1f2937' }]}>
                P{period.period_nmbr}
              </Text>
              <Text style={styles.headerTimeText}>{formatTime(period.period_time)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Department rows (swapped: departments are now rows) */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {departments.map((dept, index) => {
          const deptGrid = grid.get(dept.dpmt_id);
          const color = getDepartmentColor(dept.dpmt_name);

          return (
            <View key={dept.dpmt_id} style={styles.departmentRow}>
              {/* Department label (sticky left) */}
              <View
                style={[
                  styles.departmentLabel,
                  { width: periodLabelWidth + 20, backgroundColor: color + '15', borderLeftColor: color },
                  isDesktop && styles.departmentLabelDesktop,
                ]}
              >
                <Text style={[styles.departmentName, { color }]} numberOfLines={2}>
                  {dept.dpmt_name}
                </Text>
              </View>

              {/* Scrollable cells for each period */}
              <ScrollView
                ref={(ref) => { rowScrollRefs.current[index] = ref; }}
                horizontal
                showsHorizontalScrollIndicator={index === departments.length - 1}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.cellsScrollContent}
              >
                {periods.map((period) => {
                  const activities = deptGrid?.get(period.period_id) || [];
                  return (
                    <ScheduleGridCell
                      key={period.period_id}
                      activities={activities}
                      isDesktop={isDesktop}
                      canEdit={canEdit}
                      deletingId={deletingId}
                      onDelete={onDelete}
                    />
                  );
                })}
              </ScrollView>
            </View>
          );
        })}

        {/* Unassigned activities section */}
        {allUnassigned.length > 0 && (
          <View style={styles.unassignedSection}>
            <Text style={styles.unassignedTitle}>
              Unassigned Activities ({allUnassigned.length})
            </Text>
            <View style={styles.unassignedList}>
              {allUnassigned.map((activity) => (
                <ActivityCard
                  key={activity.activity_id}
                  activity={activity}
                  canEdit={canEdit}
                  deleting={deletingId === activity.activity_id}
                  onDelete={onDelete}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
