/**
 * ScheduleGridCell.tsx - Single cell in the schedule grid
 */

import React from 'react';
import { View, Text } from 'react-native';
import { GridActivity } from '../../hooks/useScheduleGridData';
import { ActivityCard } from './ActivityCard';
import {
  styles,
  CELL_WIDTH_MOBILE,
  CELL_WIDTH_DESKTOP,
} from '../../styles/ScheduleGridStyles';

type ScheduleGridCellProps = {
  activities: GridActivity[];
  isDesktop: boolean;
  canEdit: boolean;
  deletingId: string | null;
  onDelete?: (activityId: string) => void;
};

export const ScheduleGridCell = ({
  activities,
  isDesktop,
  canEdit,
  deletingId,
  onDelete,
}: ScheduleGridCellProps) => {
  const cellWidth = isDesktop ? CELL_WIDTH_DESKTOP : CELL_WIDTH_MOBILE;

  return (
    <View style={[styles.gridCell, { width: cellWidth }, isDesktop && styles.gridCellDesktop]}>
      {activities.length === 0 ? (
        <View style={styles.emptyCell}>
          <Text style={styles.emptyCellText}>-</Text>
        </View>
      ) : (
        activities.map((activity) => (
          <ActivityCard
            key={activity.activity_id}
            activity={activity}
            canEdit={canEdit}
            deleting={deletingId === activity.activity_id}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
};
