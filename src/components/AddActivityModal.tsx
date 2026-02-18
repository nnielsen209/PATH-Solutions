/**
 * AddActivityModal.tsx - Modal for Adding New Activities
 *
 * Popup modal for creating new activities in the schedule.
 * Includes fields for name, start time, duration, and optional badge.
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

type MeritBadge = {
  badge_id: string;
  badge_name: string;
};

type AddActivityModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const DURATION_OPTIONS = [
  { label: '30 minutes', value: '00:30:00' },
  { label: '1 hour', value: '01:00:00' },
  { label: '1.5 hours', value: '01:30:00' },
  { label: '2 hours', value: '02:00:00' },
  { label: '2.5 hours', value: '02:30:00' },
  { label: '3 hours', value: '03:00:00' },
];

const generateDateOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const value = date.toISOString().split('T')[0];
    const label = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    options.push({ label, value });
  }
  return options;
};

const DATE_OPTIONS = generateDateOptions();

const TIME_OPTIONS = [
  { label: '7:00 AM', value: '07:00:00' },
  { label: '7:30 AM', value: '07:30:00' },
  { label: '8:00 AM', value: '08:00:00' },
  { label: '8:30 AM', value: '08:30:00' },
  { label: '9:00 AM', value: '09:00:00' },
  { label: '9:30 AM', value: '09:30:00' },
  { label: '10:00 AM', value: '10:00:00' },
  { label: '10:30 AM', value: '10:30:00' },
  { label: '11:00 AM', value: '11:00:00' },
  { label: '11:30 AM', value: '11:30:00' },
  { label: '12:00 PM', value: '12:00:00' },
  { label: '12:30 PM', value: '12:30:00' },
  { label: '1:00 PM', value: '13:00:00' },
  { label: '1:30 PM', value: '13:30:00' },
  { label: '2:00 PM', value: '14:00:00' },
  { label: '2:30 PM', value: '14:30:00' },
  { label: '3:00 PM', value: '15:00:00' },
  { label: '3:30 PM', value: '15:30:00' },
  { label: '4:00 PM', value: '16:00:00' },
  { label: '4:30 PM', value: '16:30:00' },
  { label: '5:00 PM', value: '17:00:00' },
];

export const AddActivityModal = ({ visible, onClose, onSuccess }: AddActivityModalProps) => {
  const [activityName, setActivityName] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [badgeId, setBadgeId] = useState<string | null>(null);

  const [badges, setBadges] = useState<MeritBadge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchBadges();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setActivityName('');
    setActivityDate('');
    setStartTime('');
    setDuration('');
    setBadgeId(null);
    setError(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowDurationPicker(false);
    setShowBadgePicker(false);
  };

  const fetchBadges = async () => {
    setLoadingBadges(true);
    try {
      const { data, error } = await supabase
        .from('merit_badge')
        .select('badge_id, badge_name')
        .order('badge_name');

      if (error) throw error;
      setBadges(data || []);
    } catch (err) {
      console.error('Error fetching badges:', err);
    } finally {
      setLoadingBadges(false);
    }
  };

  const handleSubmit = async () => {
    if (!activityName.trim()) {
      setError('Please enter an activity name');
      return;
    }
    if (!activityDate) {
      setError('Please select a date');
      return;
    }
    if (!startTime) {
      setError('Please select a start time');
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
          activity_date: activityDate,
          activity_start_time: startTime,
          activity_duration: duration,
          badge_id: badgeId || null,
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

  const getDateLabel = () => {
    const option = DATE_OPTIONS.find(d => d.value === activityDate);
    return option ? option.label : 'Select date';
  };

  const getTimeLabel = () => {
    const option = TIME_OPTIONS.find(t => t.value === startTime);
    return option ? option.label : 'Select time';
  };

  const getDurationLabel = () => {
    const option = DURATION_OPTIONS.find(d => d.value === duration);
    return option ? option.label : 'Select duration';
  };

  const getBadgeLabel = () => {
    if (!badgeId) return 'None (optional)';
    const badge = badges.find(b => b.badge_id === badgeId);
    return badge ? badge.badge_name : 'Select badge';
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

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDatePicker(!showDatePicker)}
                disabled={submitting}
              >
                <Text style={[styles.dropdownText, !activityDate && styles.dropdownPlaceholder]}>
                  {getDateLabel()}
                </Text>
                <Ionicons name={showDatePicker ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
              </TouchableOpacity>
              {showDatePicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {DATE_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.pickerOption, activityDate === option.value && styles.pickerOptionSelected]}
                        onPress={() => {
                          setActivityDate(option.value);
                          setShowDatePicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, activityDate === option.value && styles.pickerOptionTextSelected]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Start Time */}
            <View style={styles.field}>
              <Text style={styles.label}>Start Time *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowTimePicker(!showTimePicker)}
                disabled={submitting}
              >
                <Text style={[styles.dropdownText, !startTime && styles.dropdownPlaceholder]}>
                  {getTimeLabel()}
                </Text>
                <Ionicons name={showTimePicker ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
              </TouchableOpacity>
              {showTimePicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {TIME_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.pickerOption, startTime === option.value && styles.pickerOptionSelected]}
                        onPress={() => {
                          setStartTime(option.value);
                          setShowTimePicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, startTime === option.value && styles.pickerOptionTextSelected]}>
                          {option.label}
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

            {/* Badge */}
            <View style={styles.field}>
              <Text style={styles.label}>Merit Badge</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowBadgePicker(!showBadgePicker)}
                disabled={submitting || loadingBadges}
              >
                {loadingBadges ? (
                  <ActivityIndicator size="small" color="#6b7280" />
                ) : (
                  <>
                    <Text style={[styles.dropdownText, !badgeId && styles.dropdownPlaceholder]}>
                      {getBadgeLabel()}
                    </Text>
                    <Ionicons name={showBadgePicker ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
                  </>
                )}
              </TouchableOpacity>
              {showBadgePicker && !loadingBadges && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    <TouchableOpacity
                      style={[styles.pickerOption, !badgeId && styles.pickerOptionSelected]}
                      onPress={() => {
                        setBadgeId(null);
                        setShowBadgePicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, !badgeId && styles.pickerOptionTextSelected]}>
                        None (optional)
                      </Text>
                    </TouchableOpacity>
                    {badges.map((badge) => (
                      <TouchableOpacity
                        key={badge.badge_id}
                        style={[styles.pickerOption, badgeId === badge.badge_id && styles.pickerOptionSelected]}
                        onPress={() => {
                          setBadgeId(badge.badge_id);
                          setShowBadgePicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, badgeId === badge.badge_id && styles.pickerOptionTextSelected]}>
                          {badge.badge_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
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
