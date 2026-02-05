/**
 * LoginScreen.tsx - User Login Page
 *
 * This is the first screen users see when they open the app (if not logged in).
 * It provides a simple form for email/password authentication.
 *
 * Features:
 * - Email and password input fields
 * - Loading state while authenticating
 * - Error message display
 * - Link to registration page
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../types';

// ============================================================================
// Type Definitions
// ============================================================================

// Props type - navigation is automatically passed by React Navigation
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

// ============================================================================
// Component
// ============================================================================

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  // Get the login function from our auth context
  const { login } = useAuth();

  // Form state - stores what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state - controls loading spinner and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle the login button press
   * Validates input, calls the login function, and handles errors
   */
  const handleLogin = async () => {
    // Basic validation - make sure fields aren't empty
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Start loading and clear any previous errors
    setIsLoading(true);
    setError(null);

    // Attempt to log in using our auth context
    const { error: loginError } = await login(email, password);

    // If there was an error, display it to the user
    if (loginError) {
      setError(loginError.message || 'Failed to sign in');
    }
    // If successful, the AuthContext will automatically update
    // and App.tsx will navigate to the appropriate dashboard

    setIsLoading(false);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    // KeyboardAvoidingView pushes content up when keyboard opens
    // This prevents the keyboard from covering the input fields
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header with app name */}
        <View style={styles.header}>
          <Text style={styles.title}>Camp Geiger</Text>
          <Text style={styles.subtitle}>Achievement Tracking System</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign In</Text>

          {/* Error Message - only shows if there's an error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"    // Don't auto-capitalize email
              autoCorrect={false}       // Don't autocorrect email
              editable={!isLoading}     // Disable while loading
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry           // Hide password characters
              editable={!isLoading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              // Show spinner while loading
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Link to Register Screen */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Main container - fills the screen with gray background
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  // Content wrapper - centers the form vertically
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Header section with title
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  // Form card with shadow
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  // Error message styling - red background with border
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
  // Input field wrapper
  inputContainer: {
    marginBottom: 16,
  },
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
  // Primary button styling
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd', // Lighter blue when disabled
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
