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
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { styles } from '../styles/ActivityModalStyles';

type Period = {
  period_id: string;
  period_nmbr: number;
  period_time: string;
};

type MeritBadge = {
  badge_id: string;
  badge_name: string;
  dpmt_name: string | null;
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
  const [badgeId, setBadgeId] = useState<string | null>(null);

  const [periods, setPeriods] = useState<Period[]>([]);
  const [badges, setBadges] = useState<MeritBadge[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPeriods();
      fetchBadges();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setActivityName('');
    setPeriodId(null);
    setDuration(null);
    setBadgeId(null);
    setError(null);
    setShowPeriodPicker(false);
    setShowDurationPicker(false);
    setShowBadgePicker(false);
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

  const fetchBadges = async () => {
    setLoadingBadges(true);
    try {
      const { data, error } = await supabase
        .from('merit_badge')
        .select(`
          badge_id,
          badge_name,
          camp_dpmt:dpmt_id (dpmt_name)
        `)
        .order('badge_name');

      if (error) throw error;

      const formatted: MeritBadge[] = (data || []).map((item: any) => {
        const dept = Array.isArray(item.camp_dpmt) ? item.camp_dpmt[0] : item.camp_dpmt;
        return {
          badge_id: item.badge_id,
          badge_name: item.badge_name,
          dpmt_name: dept?.dpmt_name || null,
        };
      });

      setBadges(formatted);
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
      // Insert the activity and get its ID
      const { data: activityData, error: insertError } = await supabase
        .from('activity')
        .insert({
          activity_name: activityName.trim(),
          period_id: periodId,
          activity_duration: duration,
        })
        .select('activity_id')
        .single();

      if (insertError) throw insertError;

      // If a badge was selected, link it via activity_badge junction table
      if (badgeId && activityData?.activity_id) {
        const { error: linkError } = await supabase
          .from('activity_badge')
          .insert({
            activity_id: activityData.activity_id,
            badge_id: badgeId,
          });

        if (linkError) {
          console.error('Error linking badge:', linkError);
          // Don't throw - activity was created, just badge link failed
        }
      }

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

  const getBadgeLabel = () => {
    if (!badgeId) return 'Select merit badge (optional)';
    const badge = badges.find(b => b.badge_id === badgeId);
    return badge ? badge.badge_name : 'Select merit badge (optional)';
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
                  {duration ? `${duration} period${duration > 1 ? 's' : ''}` : 'Select duration'}
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

            {/* Merit Badge */}
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
                    {/* Option to clear selection */}
                    <TouchableOpacity
                      style={[styles.pickerOption, !badgeId && styles.pickerOptionSelected]}
                      onPress={() => {
                        setBadgeId(null);
                        setShowBadgePicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, !badgeId && styles.pickerOptionTextSelected]}>
                        None (Unassigned)
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
                          {badge.dpmt_name && ` (${badge.dpmt_name})`}
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