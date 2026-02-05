/**
 * RegisterScreen.tsx - User Registration Page
 *
 * This screen allows new users to create an account.
 * Users provide their personal info and select their role in the system.
 *
 * Features:
 * - Name, email, password fields
 * - Password confirmation with validation
 * - Role selection (Admin, Counselor, Scout Leader, Scout)
 * - Validation and error handling
 *
 * Note: The actual user record in the database is created by a Supabase
 * trigger (handle_new_user) that fires after the auth account is created.
 * This keeps the auth and profile data in sync automatically.
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { supabase } from '../../services/supabase';

// ============================================================================
// Type Definitions
// ============================================================================

// Props passed by React Navigation
type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

// The different user roles available in our system
type UserRole = 'admin' | 'counselor' | 'scout_leader' | 'scout';

// Structure for each role option displayed to the user
interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Role options for the selection UI
 * Each role has a user-friendly label and description
 */
const roleOptions: RoleOption[] = [
  { value: 'admin', label: 'Admin', description: 'Camp administrator with full access' },
  { value: 'counselor', label: 'Counselor', description: 'Camp staff member' },
  { value: 'scout_leader', label: 'Scout Leader', description: 'Adult troop leader' },
  { value: 'scout', label: 'Scout', description: 'Youth member' },
];

// ============================================================================
// Component
// ============================================================================

export const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  // Form state - all the fields the user needs to fill out
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

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
    if (!email || !password || !firstName || !lastName || !selectedRole) {
      setError('Please fill in all fields and select a role');
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
      // The metadata (first_name, last_name, role) is stored in auth.users
      // and will be used by our database trigger to create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: selectedRole,
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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ScrollView allows the form to scroll on smaller screens */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Camp Geiger</Text>
          <Text style={styles.subtitle}>Create Account</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Name Fields - Side by Side */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="#9ca3af"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"  // Capitalize first letter of each word
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
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

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
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

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
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

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleContainer}>
              {/* Map through role options to create selectable cards */}
              {roleOptions.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    // Apply selected styles when this role is chosen
                    selectedRole === role.value && styles.roleOptionSelected,
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.roleLabel,
                      selectedRole === role.value && styles.roleLabelSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                  <Text
                    style={[
                      styles.roleDescription,
                      selectedRole === role.value && styles.roleDescriptionSelected,
                    ]}
                  >
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
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
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  // ScrollView content - allows centering with scroll
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  // Header section
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  // Form card with shadow
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Error message styling
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  // Row layout for side-by-side fields
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  // Input field container
  inputContainer: {
    marginBottom: 16,
  },
  // Makes input take half the width (for name fields)
  halfWidth: {
    flex: 1,
  },
  // Input label
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  // Text input styling
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  // Container for role options
  roleContainer: {
    gap: 8,
  },
  // Individual role option card
  roleOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  // Selected state for role option
  roleOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  // Role label text
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  roleLabelSelected: {
    color: '#2563eb',
  },
  // Role description text
  roleDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  roleDescriptionSelected: {
    color: '#3b82f6',
  },
  // Primary button
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Link button for navigation
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkTextBold: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
