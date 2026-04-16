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
import { styles } from '../../styles/RegisterStyles';

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

