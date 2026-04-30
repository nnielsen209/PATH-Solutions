/**
 * AddScoutModal.tsx - Modal for Adding/Editing Scouts
 *
 * Shared modal component for Admin, Dev, and Area Director to add or edit scouts.
 * Creates or updates a scout record in the Supabase scout table.
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

/** Troop record from database */
interface Troop {
  troop_id: string;
  troop_nmbr: number;
  troop_city: string;
  troop_state: string;
  troop_type: string;
}

/** Scout record for editing */
interface ScoutToEdit {
  scout_id: string;
  scout_first_name: string;
  scout_last_name: string;
  troop_id: string;
}

type AddScoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scoutToEdit?: ScoutToEdit | null;
};

export const AddScoutModal = ({ visible, onClose, onSuccess, scoutToEdit }: AddScoutModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedTroopId, setSelectedTroopId] = useState<string | null>(null);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTroops, setIsLoadingTroops] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTroopPicker, setShowTroopPicker] = useState(false);

  const isEditMode = !!scoutToEdit;

  // Fetch troops when modal opens and populate form if editing
  useEffect(() => {
    if (visible) {
      fetchTroops();
      if (scoutToEdit) {
        setFirstName(scoutToEdit.scout_first_name);
        setLastName(scoutToEdit.scout_last_name);
        setSelectedTroopId(scoutToEdit.troop_id);
      }
    }
  }, [visible, scoutToEdit]);

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
      if (isEditMode && scoutToEdit) {
        // Update existing scout
        const { error: updateError } = await supabase
          .from('scout')
          .update({
            scout_first_name: firstName.trim(),
            scout_last_name: lastName.trim(),
            troop_id: selectedTroopId,
          })
          .eq('scout_id', scoutToEdit.scout_id);

        if (updateError) throw updateError;
        showAlert('Success', `Scout "${firstName} ${lastName}" has been updated`);
      } else {
        // Insert new scout
        const { error: insertError } = await supabase
          .from('scout')
          .insert({
            scout_first_name: firstName.trim(),
            scout_last_name: lastName.trim(),
            troop_id: selectedTroopId,
          });

        if (insertError) throw insertError;
        showAlert('Success', `Scout "${firstName} ${lastName}" has been added`);
      }

      // Success
      resetForm();
      onSuccess();
    } catch (err: any) {
      console.error('Error saving scout:', err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} scout`);
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
                  <Ionicons name={isEditMode ? 'create' : 'person-add'} size={24} color="#d97706" />
                </View>
                <Text style={styles.title}>{isEditMode ? 'Edit Scout' : 'Add New Scout'}</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeBtn}
                  disabled={isLoading}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                {isEditMode ? 'Update scout information' : 'Add a scout participant to a troop'}
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
                      <Ionicons name={isEditMode ? 'checkmark' : 'add'} size={20} color="#fff" />
                      <Text style={styles.submitBtnText}>{isEditMode ? 'Save Changes' : 'Add Scout'}</Text>
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