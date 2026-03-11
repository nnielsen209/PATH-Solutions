/**
 * AddActivityModal.tsx - Modal for Adding New Activities
 *
 * Popup modal for creating new activities in the schedule.
 * Includes fields for name, start time, duration, and optional program.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

type Period = {
  period_id: string;
  period_nmbr: number;
  period_time: string;
};

type AddActivityModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const DURATION_OPTIONS = [
  { label: '1 period', value: 1 },
  { label: '2 periods', value: 2 },
  { label: '3 periods', value: 3 },
];

export const AddActivityModal = ({ visible, onClose, onSuccess }: AddActivityModalProps) => {
  const [activityName, setActivityName] = useState('');
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const [periods, setPeriods] = useState<Period[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPeriods();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setActivityName('');
    setPeriodId(null);
    setDuration(null);
    setError(null);
    setShowPeriodPicker(false);
    setShowDurationPicker(false);
  };

  const fetchPeriods = async () => {
    setLoadingPeriods(true);
    try {
      const { data, error } = await supabase
        .from('period')
        .select('period_id, period_nmbr, period_time')
        .order('period_nmbr');

      if (error) throw error;
      setPeriods(data || []);
    } catch (err) {
      console.error('Error fetching periods:', err);
    } finally {
      setLoadingPeriods(false);
    }
  };

  const handleSubmit = async () => {
    if (!activityName.trim()) {
      setError('Please enter an activity name');
      return;
    }
    if (!periodId) {
      setError('Please select a period');
      return;
    }
    if (!duration) {
      setError('Please select a duration');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('activity')
        .insert({
          activity_name: activityName.trim(),
          period_id: periodId,
          activity_duration: duration,
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create activity');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPeriodLabel = () => {
    if (!periodId) return 'Select period';
    const period = periods.find(p => p.period_id === periodId);
    return period ? `Period ${period.period_nmbr} (${formatTime(period.period_time)})` : 'Select period';
  };

  const getDurationLabel = () => {
    const option = DURATION_OPTIONS.find(d => d.value === duration);
    return option ? option.label : 'Select duration';
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Activity</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Activity Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Activity Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter activity name"
                placeholderTextColor="#9ca3af"
                value={activityName}
                onChangeText={setActivityName}
                editable={!submitting}
              />
            </View>

            {/* Period */}
            <View style={styles.field}>
              <Text style={styles.label}>Period *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowPeriodPicker(!showPeriodPicker)}
                disabled={submitting || loadingPeriods}
              >
                {loadingPeriods ? (
                  <ActivityIndicator size="small" color="#6b7280" />
                ) : (
                  <>
                    <Text style={[styles.dropdownText, !periodId && styles.dropdownPlaceholder]}>
                      {getPeriodLabel()}
                    </Text>
                    <Ionicons name={showPeriodPicker ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
                  </>
                )}
              </TouchableOpacity>
              {showPeriodPicker && !loadingPeriods && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {periods.map((period) => (
                      <TouchableOpacity
                        key={period.period_id}
                        style={[styles.pickerOption, periodId === period.period_id && styles.pickerOptionSelected]}
                        onPress={() => {
                          setPeriodId(period.period_id);
                          setShowPeriodPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, periodId === period.period_id && styles.pickerOptionTextSelected]}>
                          Period {period.period_nmbr} ({formatTime(period.period_time)})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Duration */}
            <View style={styles.field}>
              <Text style={styles.label}>Duration *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDurationPicker(!showDurationPicker)}
                disabled={submitting}
              >
                <Text style={[styles.dropdownText, !duration && styles.dropdownPlaceholder]}>
                  {getDurationLabel()}
                </Text>
                <Ionicons name={showDurationPicker ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
              </TouchableOpacity>
              {showDurationPicker && (
                <View style={styles.pickerContainer}>
                  {DURATION_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.pickerOption, duration === option.value && styles.pickerOptionSelected]}
                      onPress={() => {
                        setDuration(option.value);
                        setShowDurationPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, duration === option.value && styles.pickerOptionTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Activity</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
  },
  dropdown: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1f2937',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 180,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 180,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#d97706',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#fbbf24',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
