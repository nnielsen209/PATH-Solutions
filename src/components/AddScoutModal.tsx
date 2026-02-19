/**
 * AddScoutModal.tsx - Modal for Adding New Scouts
 *
 * Shared modal component for Admin, Dev, and Area Director to add new scouts.
 * Creates a scout record in the Supabase scout table.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

/** Troop record from database */
interface Troop {
  troop_id: string;
  troop_nmbr: number;
  troop_city: string;
  troop_state: string;
  troop_type: string;
}

type AddScoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const AddScoutModal = ({ visible, onClose, onSuccess }: AddScoutModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
        .from('scout')
        .insert({
          scout_first_name: firstName.trim(),
          scout_last_name: lastName.trim(),
          troop_id: selectedTroopId,
        });

      if (insertError) throw insertError;

      // Success
      resetForm();
      onSuccess();
      showAlert('Success', `Scout "${firstName} ${lastName}" has been added`);
    } catch (err: any) {
      console.error('Error adding scout:', err);
      setError(err.message || 'Failed to add scout');
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
                <View style={styles.headerIcon}>
                  <Ionicons name="person-add" size={24} color="#d97706" />
                </View>
                <Text style={styles.title}>Add New Scout</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeBtn}
                  disabled={isLoading}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Add a scout participant to a troop
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

                {/* Troop Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Troop</Text>
                  {isLoadingTroops ? (
                    <View style={styles.loadingTroops}>
                      <ActivityIndicator size="small" color="#d97706" />
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
                                <Ionicons name="checkmark" size={18} color="#d97706" />
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
                      <Text style={styles.submitBtnText}>Add Scout</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#d9770620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
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
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  loadingTroops: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  loadingTroopsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  noTroops: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
  },
  noTroopsText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  troopSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  troopSelectorText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  troopSelectorPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9ca3af',
  },
  troopList: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: 200,
  },
  troopOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  troopOptionSelected: {
    backgroundColor: '#fef3c7',
  },
  troopOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  troopOptionTextSelected: {
    color: '#d97706',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#fbbf24',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
