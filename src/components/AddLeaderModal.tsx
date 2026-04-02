/**
 * AddLeaderModal.tsx - Modal for Adding New Leaders
 *
 * Shared modal component for Admin, Dev, and Area Director to add new troop leaders.
 * Creates a leader record in the Supabase scout_leader table.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { styles } from '../styles/ScoutModalStyles';

const LEADER_ACCENT = '#16a34a'; // Green accent for leaders

/** Troop record from database */
interface Troop {
  troop_id: string;
  troop_nmbr: number;
  troop_city: string;
  troop_state: string;
  troop_type: string;
}

type AddLeaderModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const AddLeaderModal = ({ visible, onClose, onSuccess }: AddLeaderModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTroopId, setSelectedTroopId] = useState<string | null>(null);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTroops, setIsLoadingTroops] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTroopPicker, setShowTroopPicker] = useState(false);

  // Fetch troops when modal opens
  useEffect(() => {
    if (visible) {
      fetchTroops();
    }
  }, [visible]);

  const fetchTroops = async () => {
    setIsLoadingTroops(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('troop')
        .select('troop_id, troop_nmbr, troop_city, troop_state, troop_type')
        .order('troop_nmbr', { ascending: true });

      if (fetchError) throw fetchError;
      setTroops(data || []);
    } catch (err) {
      console.error('Error fetching troops:', err);
    } finally {
      setIsLoadingTroops(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setSelectedTroopId(null);
    setError(null);
    setShowTroopPicker(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter first and last name');
      return;
    }

    if (!selectedTroopId) {
      setError('Please select a troop');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('scout_leader')
        .insert({
          scout_leader_first_name: firstName.trim(),
          scout_leader_last_name: lastName.trim(),
          troop_id: selectedTroopId,
          troop_leader_phone_nmbr: phone.trim() || null,
          troop_leader_email: email.trim() || null,
        });

      if (insertError) throw insertError;

      // Success
      resetForm();
      onSuccess();
      showAlert('Success', `Leader "${firstName} ${lastName}" has been added`);
    } catch (err: any) {
      console.error('Error adding leader:', err);
      setError(err.message || 'Failed to add leader');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTroop = troops.find((t) => t.troop_id === selectedTroopId);

  const formatTroopName = (troop: Troop) => {
    const typeLabel = troop.troop_type === 'BTROOP' ? 'Boy' : troop.troop_type === 'GTROOP' ? 'Girl' : 'Mixed';
    return `Troop ${troop.troop_nmbr} (${typeLabel}) - ${troop.troop_city}, ${troop.troop_state}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.headerIcon, { backgroundColor: LEADER_ACCENT + '20' }]}>
                  <Ionicons name="shield" size={24} color={LEADER_ACCENT} />
                </View>
                <Text style={styles.title}>Add New Leader</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeBtn}
                  disabled={isLoading}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Add a troop leader to manage scouts
              </Text>

              {/* Error */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#dc2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="First name"
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Last name"
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone number"
                      placeholderTextColor="#9ca3af"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Troop Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Troop</Text>
                  {isLoadingTroops ? (
                    <View style={styles.loadingTroops}>
                      <ActivityIndicator size="small" color={LEADER_ACCENT} />
                      <Text style={styles.loadingTroopsText}>Loading troops...</Text>
                    </View>
                  ) : troops.length === 0 ? (
                    <View style={styles.noTroops}>
                      <Ionicons name="alert-circle-outline" size={20} color="#9ca3af" />
                      <Text style={styles.noTroopsText}>No troops available. Add a troop first.</Text>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.troopSelector}
                        onPress={() => setShowTroopPicker(!showTroopPicker)}
                        disabled={isLoading}
                      >
                        <Text style={selectedTroop ? styles.troopSelectorText : styles.troopSelectorPlaceholder}>
                          {selectedTroop ? formatTroopName(selectedTroop) : 'Select a troop'}
                        </Text>
                        <Ionicons
                          name={showTroopPicker ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>

                      {showTroopPicker && (
                        <View style={styles.troopList}>
                          {troops.map((troop) => (
                            <TouchableOpacity
                              key={troop.troop_id}
                              style={[
                                styles.troopOption,
                                selectedTroopId === troop.troop_id && styles.troopOptionSelected,
                              ]}
                              onPress={() => {
                                setSelectedTroopId(troop.troop_id);
                                setShowTroopPicker(false);
                              }}
                            >
                              <Text style={[
                                styles.troopOptionText,
                                selectedTroopId === troop.troop_id && styles.troopOptionTextSelected,
                              ]}>
                                {formatTroopName(troop)}
                              </Text>
                              {selectedTroopId === troop.troop_id && (
                                <Ionicons name="checkmark" size={18} color={LEADER_ACCENT} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: LEADER_ACCENT },
                    (isLoading || troops.length === 0) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading || troops.length === 0}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={styles.submitBtnText}>Add Leader</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
