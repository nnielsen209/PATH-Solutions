/**
 * AttendanceModal.tsx - Modal for viewing/editing activity attendance
 *
 * Displays a grid of campers enrolled in an activity with checkboxes for
 * each weekday (Mon-Fri). Counselors can edit; other roles are view-only.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { CamperAttendance, UserRole } from '../types';
import { styles } from '../styles/ActivityModalStyles';

type AttendanceModalProps = {
  visible: boolean;
  onClose: () => void;
  activityId: string;
  activityName: string;
};

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const AttendanceModal = ({
  visible,
  onClose,
  activityId,
  activityName,
}: AttendanceModalProps) => {
  const { userRole } = useAuth();
  const [attendance, setAttendance] = useState<CamperAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only counselors can edit attendance
  const canEdit = userRole === 'COUNSELOR';

  useEffect(() => {
    if (visible && activityId) {
      fetchAttendance();
    }
  }, [visible, activityId]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all scouts from the scout table
      const { data: allScouts, error: scoutError } = await supabase
        .from('scout')
        .select('scout_id, scout_first_name, scout_last_name');

      if (scoutError) throw scoutError;

      if (!allScouts || allScouts.length === 0) {
        setAttendance([]);
        setLoading(false);
        return;
      }

      // Get existing attendance records for this activity
      const { data: attendanceData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('activity_id', activityId);

      if (attError) throw attError;

      // Create a map of existing attendance by scout_id
      const attendanceMap = new Map(
        (attendanceData || []).map((a: any) => [a.scout_id, a])
      );

      // Build the full attendance list, creating default records for those without
      const fullAttendance: CamperAttendance[] = allScouts.map((scout: any) => {
        const existing = attendanceMap.get(scout.scout_id);

        return {
          activity_id: activityId,
          scout_id: scout.scout_id,
          scout_fname: scout.scout_first_name || 'Unknown',
          scout_lname: scout.scout_last_name || '',
          monday: existing?.monday ?? false,
          tuesday: existing?.tuesday ?? false,
          wednesday: existing?.wednesday ?? false,
          thursday: existing?.thursday ?? false,
          friday: existing?.friday ?? false,
          last_uptd_date: existing?.last_uptd_date || new Date().toISOString(),
        };
      });

      // Sort by last name, then first name
      fullAttendance.sort((a, b) => {
        const lastCompare = a.scout_lname.localeCompare(b.scout_lname);
        if (lastCompare !== 0) return lastCompare;
        return a.scout_fname.localeCompare(b.scout_fname);
      });

      setAttendance(fullAttendance);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (
    scoutId: string,
    day: typeof WEEKDAYS[number]
  ) => {
    if (!canEdit) return;

    // Find the record and toggle locally first for responsiveness
    const recordIndex = attendance.findIndex((a) => a.scout_id === scoutId);
    if (recordIndex === -1) return;

    const oldRecord = attendance[recordIndex];
    const newValue = !oldRecord[day];

    // Optimistic update
    const updatedAttendance = [...attendance];
    updatedAttendance[recordIndex] = {
      ...oldRecord,
      [day]: newValue,
    };
    setAttendance(updatedAttendance);

    // Upsert to database
    try {
      const { error: upsertError } = await supabase
        .from('attendance')
        .upsert(
          {
            activity_id: activityId,
            scout_id: scoutId,
            [day]: newValue,
          },
          {
            onConflict: 'activity_id,scout_id',
          }
        );

      if (upsertError) {
        // Revert on error
        setAttendance(attendance);
        throw upsertError;
      }
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      const message = 'Failed to save attendance. Please try again.';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const getTallyCount = (record: CamperAttendance): number => {
    return WEEKDAYS.filter((day) => record[day]).length;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { maxWidth: 600 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Attendance</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                {activityName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#d97706" />
                <Text style={{ marginTop: 12, color: '#6b7280' }}>
                  Loading attendance...
                </Text>
              </View>
            ) : attendance.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="people-outline" size={48} color="#d1d5db" />
                <Text style={{ marginTop: 12, color: '#6b7280', textAlign: 'center' }}>
                  No campers enrolled in this activity
                </Text>
              </View>
            ) : (
              <>
                {/* Table Header */}
                <View style={tableStyles.headerRow}>
                  <View style={tableStyles.nameColumn}>
                    <Text style={tableStyles.headerText}>Camper</Text>
                  </View>
                  {WEEKDAY_LABELS.map((label, idx) => (
                    <View key={idx} style={tableStyles.dayColumn}>
                      <Text style={tableStyles.headerText}>{label}</Text>
                    </View>
                  ))}
                  <View style={tableStyles.tallyColumn}>
                    <Text style={tableStyles.headerText}>Total</Text>
                  </View>
                </View>

                {/* Table Body */}
                {attendance.map((record, rowIndex) => (
                  <View
                    key={record.scout_id}
                    style={[
                      tableStyles.dataRow,
                      rowIndex % 2 === 1 && tableStyles.dataRowAlt,
                    ]}
                  >
                    <View style={tableStyles.nameColumn}>
                      <Text style={tableStyles.nameText} numberOfLines={1}>
                        {record.scout_lname}, {record.scout_fname}
                      </Text>
                    </View>
                    {WEEKDAYS.map((day, dayIdx) => (
                      <TouchableOpacity
                        key={day}
                        style={tableStyles.dayColumn}
                        onPress={() => toggleAttendance(record.scout_id, day)}
                        disabled={!canEdit}
                        activeOpacity={canEdit ? 0.6 : 1}
                      >
                        <View
                          style={[
                            tableStyles.checkbox,
                            record[day] && tableStyles.checkboxChecked,
                            !canEdit && tableStyles.checkboxReadOnly,
                          ]}
                        >
                          {record[day] && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={canEdit ? '#fff' : '#059669'}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                    <View style={tableStyles.tallyColumn}>
                      <Text style={tableStyles.tallyText}>
                        {getTallyCount(record)}/5
                      </Text>
                    </View>
                  </View>
                ))}

                {/* View-only notice for non-counselors */}
                {!canEdit && (
                  <View style={tableStyles.viewOnlyNotice}>
                    <Ionicons name="eye-outline" size={16} color="#6b7280" />
                    <Text style={tableStyles.viewOnlyText}>
                      View only - counselors can edit attendance
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Table-specific styles
const tableStyles = {
  headerRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 4,
  },
  dataRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dataRowAlt: {
    backgroundColor: '#f9fafb',
  },
  nameColumn: {
    flex: 1,
    minWidth: 120,
    paddingRight: 8,
  },
  dayColumn: {
    width: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tallyColumn: {
    width: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
  },
  nameText: {
    fontSize: 14,
    color: '#1f2937',
  },
  tallyText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxReadOnly: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  viewOnlyNotice: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 16,
    paddingVertical: 8,
    gap: 6,
  },
  viewOnlyText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic' as const,
  },
};
