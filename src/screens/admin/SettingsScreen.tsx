/**
 * SettingsScreen.tsx - Admin Settings
 *
 * Camp and app settings. Includes change password and sign out.
 * Ready for future: camp name, contact info, notifications, theme.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

const DESKTOP_BREAKPOINT = 768;
const ACCENT_COLOR = '#6b7280';
const MIN_PASSWORD_LENGTH = 6;

export const SettingsScreen = () => {
  const { width } = useWindowDimensions();
  const { logout, updatePassword } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDesktop: { paddingHorizontal: 32, paddingVertical: 20 },
  headerInner: {},
  headerInnerDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  titleDesktop: { fontSize: 26 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  scrollContentDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainCardDesktop: { marginBottom: 0 },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cardTitleDesktop: { fontSize: 19 },
  cardDescription: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardContent: { minHeight: 200, padding: 16 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },
  passwordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordForm: {
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
  successText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  passwordButtonDisabled: {
    opacity: 0.7,
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signOutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  signOutHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 36,
  },
});
