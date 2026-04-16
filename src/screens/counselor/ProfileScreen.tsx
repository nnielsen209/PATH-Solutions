/**
 * ProfileScreen.tsx - Counselor profile placeholder
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/ProfileStyles';

const ACCENT_COLOR = '#6b7280';

export const ProfileScreen = () => {
  const { width } = useWindowDimensions();
  const { logout } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Profile</Text>
          <Text style={styles.subtitle}>Your account and preferences</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: contentPadding }, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                <Ionicons name="person" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>Profile</Text>
                <Text style={styles.cardDescription}>View and edit your profile</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Profile settings coming soon</Text>
              <Text style={styles.emptyStateSubtext}>Update your name, email, and preferences here</Text>
            </View>
          </View>
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
