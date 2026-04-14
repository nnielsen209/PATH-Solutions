/**
 * PendingApprovalScreen.tsx - Waiting for Approval Page
 *
 * Shown to users who have registered but haven't been approved yet.
 * Displays a friendly message and allows them to sign out.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

/**
 * PendingApprovalScreen Component
 *
 * Displays a waiting message for users with PENDING role.
 * Provides a sign out button so they can log in later to check status.
 */
export const PendingApprovalScreen = () => {
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <LinearGradient
      colors={['#1e3a5f', '#2d5a7b', '#3a7ca5']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={48} color="#1e3a5f" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Account Pending Approval</Text>

          {/* Message */}
          <Text style={styles.message}>
            Thank you for registering! Your account is currently awaiting approval from an administrator.
          </Text>

          <Text style={styles.submessage}>
            Once approved, you'll be able to access the app with your assigned role. This usually happens within 24-48 hours.
          </Text>

          {/* Email info */}
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={16} color="#6b7280" />
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Help text */}
          <Text style={styles.helpText}>
            You can sign out and check back later, or contact an administrator if you need immediate access.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f4fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  submessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  emailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
