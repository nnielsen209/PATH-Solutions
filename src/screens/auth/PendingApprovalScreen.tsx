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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/PendingApprovalStyles';

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

