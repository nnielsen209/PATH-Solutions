/**
 * @file SettingsScreen.tsx
 * @description Admin Settings screen for managing application configuration.
 *
 * Provides functionality for:
 * - Viewing placeholder app settings
 * - Changing user password with validation
 * - Signing out of the application
 *
 * Future enhancements may include:
 * - Camp name configuration
 * - Contact information
 * - Notification preferences
 * - Theme customization
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { styles, DESKTOP_BREAKPOINT, ACCENT_COLOR } from '../../styles/SettingsStyles';

/**
 * Minimum number of characters required for a valid password.
 */
const MIN_PASSWORD_LENGTH = 6;

/**
 * SettingsScreen Component
 *
 * Renders the settings UI including:
 * - Static settings placeholder section
 * - Expandable password change form
 * - Sign out functionality
 *
 * Handles user input validation and communicates with AuthContext
 * to update passwords securely.
 *
 * @returns The rendered Settings screen component
 */
export const SettingsScreen = () => {
  const { width } = useWindowDimensions();
  const { logout, updatePassword } = useAuth();

  /**
   * Determines if the layout should use desktop styling.
   */
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  /**
   * Horizontal padding for responsive layout.
   */
  const contentPadding = isDesktop ? 32 : 20;

  /**
   * Controls visibility of the password change form.
   */
  const [passwordExpanded, setPasswordExpanded] = useState(false);

  /**
   * Stores the user's current password input.
   */
  const [currentPassword, setCurrentPassword] = useState('');

  /**
   * Stores the new password input.
   */
  const [newPassword, setNewPassword] = useState('');

  /**
   * Stores confirmation of the new password.
   */
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Holds any validation or API error message.
   */
  const [passwordError, setPasswordError] = useState<string | null>(null);

  /**
   * Indicates whether password update succeeded.
   */
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  /**
   * Tracks loading state during password update request.
   */
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  /**
   * Handles password update logic.
   *
   * Performs validation:
   * - Ensures all fields are filled
   * - Checks minimum length
   * - Confirms passwords match
   * - Ensures new password differs from current
   *
   * Calls updatePassword from AuthContext on success.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setIsPasswordLoading(true);
    const { error } = await updatePassword(currentPassword, newPassword);
    setIsPasswordLoading(false);

    if (error) {
      setPasswordError(error.message || 'Failed to update password.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Settings</Text>
          <Text style={styles.subtitle}>
            Camp and app configuration
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: contentPadding },
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                <Ionicons name="settings" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Camp & app settings
                </Text>
                <Text style={styles.cardDescription}>
                  Configure camp details, defaults, and preferences
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.emptyState}>
              <Ionicons name="settings-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Settings coming soon</Text>
              <Text style={styles.emptyStateSubtext}>
                Camp name, contact info, notifications, and other options will appear here
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.passwordCard, isDesktop && styles.mainCardDesktop]}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setPasswordExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#0ea5e9' + '20' }]}>
                <Ionicons name="key" size={24} color="#0ea5e9" />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Change password
                </Text>
                <Text style={styles.cardDescription}>
                  Enter your current password and choose a new one
                </Text>
              </View>
              <Ionicons
                name={passwordExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#9ca3af"
              />
            </View>
          </TouchableOpacity>

          {passwordExpanded ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.passwordForm}
            >
              <TextInput
                style={styles.input}
                placeholder="Current password"
                placeholderTextColor="#9ca3af"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isPasswordLoading}
              />
              <TextInput
                style={styles.input}
                placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
                placeholderTextColor="#9ca3af"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isPasswordLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isPasswordLoading}
              />

              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              {passwordSuccess ? (
                <Text style={styles.successText}>Password updated successfully.</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.passwordButton, isPasswordLoading && styles.passwordButtonDisabled]}
                onPress={handleChangePassword}
                disabled={isPasswordLoading}
                activeOpacity={0.8}
              >
                {isPasswordLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="key-outline" size={20} color="#fff" />
                    <Text style={styles.passwordButtonText}>Update password</Text>
                  </>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          ) : null}
        </View>

        <View style={[styles.signOutCard, isDesktop && styles.mainCardDesktop]}>
          <TouchableOpacity style={styles.signOutButton} onPress={logout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
          <Text style={styles.signOutHint}>Sign out of this account and return to the login screen.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};