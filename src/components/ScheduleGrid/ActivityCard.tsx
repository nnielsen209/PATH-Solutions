/**
 * ActivityCard.tsx - Individual activity card for grid cells
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GridActivity } from '../../hooks/useScheduleGridData';
import { getDepartmentColor } from '../../constants/departmentColors';
import { styles } from '../../styles/ScheduleGridStyles';

type ActivityCardProps = {
  activity: GridActivity;
  canEdit: boolean;
  deleting: boolean;
  onDelete?: (activityId: string) => void;
};

export const ActivityCard = ({
  activity,
  canEdit,
  deleting,
  onDelete,
}: ActivityCardProps) => {
  const borderColor = getDepartmentColor(activity.department_name);
  const { spanPosition } = activity;

  // For continuation cells (middle/end), show activity name + continued
  if (spanPosition === 'middle' || spanPosition === 'end') {
    return (
      <View
        style={[
          styles.activityCard,
          {
            borderLeftColor: borderColor,
            backgroundColor: borderColor + '15',
          },
        ]}
      >
        <Text style={{ color: borderColor, fontSize: 11, fontWeight: '500' }} numberOfLines={1}>
          {activity.activity_name}
        </Text>
        <Text style={{ color: borderColor, fontSize: 10, fontStyle: 'italic' }}>
          (continued)
        </Text>
      </View>
    );
  }

  // Full card for 'start' or 'single'
  return (
    <View style={[styles.activityCard, { borderLeftColor: borderColor }]}>
      <View style={styles.activityCardContent}>
        <View style={styles.activityTextWrap}>
          <Text style={styles.activityName} numberOfLines={2}>
            {activity.activity_name}
          </Text>
          {activity.badge_name && (
            <Text style={styles.activityBadge} numberOfLines={1}>
              {activity.badge_name}
            </Text>
          )}
          {activity.activity_duration > 1 && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {activity.activity_duration} periods
              </Text>
            </View>
          )}
        </View>

        {canEdit && onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(activity.activity_id)}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="trash-outline" size={14} color="#dc2626" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
