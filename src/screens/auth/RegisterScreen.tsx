/**
 * @file RegisterScreen.tsx
 * @description User registration screen for creating new accounts in the Camp Geiger system.
 *
 * This screen allows new users to:
 * - enter personal information (first name, last name, email)
 * - create and confirm a password
 * - validate form inputs before submission
 * - submit registration data to Supabase authentication
 *
 * Upon successful registration:
 * - user metadata (name fields) is stored in Supabase Auth
 * - a database trigger creates a corresponding user record
 * - the account is assigned a "PENDING" role until approved by an administrator
 *
 * The UI includes error handling, loading states, and navigation back to the login screen.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { supabase } from '../../services/supabase';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

/**
 * RegisterScreen Component
 *
 * Renders the registration form (name, email, password, confirm password, role).
 * Submits to Supabase and then navigates to login on success.
 */
export const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle the registration form submission
   * Validates all fields, then creates the user account
   */
  const handleRegister = async () => {
    // ========== Validation ==========

    // Check that all required fields are filled
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      return;
    }

    // Make sure passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Enforce minimum password length (Supabase requires at least 6)
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // ========== Create Account ==========

    setIsLoading(true);
    setError(null);

    try {
      // Call Supabase Auth to create the user account
      // The metadata (first_name, last_name) is stored in auth.users
      // and will be used by our database trigger to create the profile
      // New users are automatically assigned PENDING role until approved
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      // Handle any errors from Supabase
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      // Make sure we got a user back
      if (!authData.user) {
        setError('Failed to create user');
        setIsLoading(false);
        return;
      }

      // Success! The database trigger automatically creates the users record.
      // The auth state listener in AuthContext will detect the new session
      // and navigate the user to the appropriate dashboard.
    } catch (err) {
      // Catch any unexpected errors
      setError('An unexpected error occurred');
    }

    setIsLoading(false);
  };

  return (
    <LinearGradient
      colors={['#1e3a5f', '#2d5a7b', '#3a7ca5']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={40} color="#ffffff" />
            </View>
            <Text style={styles.title}>Join Camp Geiger</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Name Fields - Side by Side */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.inputNoIcon]}
                    placeholder="Last"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password (min 6 chars)"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Pending Approval Notice */}
            <View style={styles.pendingNotice}>
              <Ionicons name="time-outline" size={20} color="#1e3a5f" style={styles.pendingIcon} />
              <Text style={styles.pendingText}>
                After registration, your account will be reviewed by an administrator who will assign your role.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
                </View>
              )}
            </TouchableOpacity>

            {/* Link to Login Screen */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  inputNoIcon: {
    paddingLeft: 4,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f4fc',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  pendingIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    color: '#1e3a5f',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  linkButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkTextBold: {
    color: '#1e3a5f',
    fontWeight: '700',
  },
});
