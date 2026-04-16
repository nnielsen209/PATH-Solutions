/**
 * @file MyActivitiesScreen.tsx
 * @description Screen for counselors to view and manage their assigned activities.
 *
 * This screen displays:
 * - a list of activities assigned to the counselor
 * - basic information about each activity (e.g., name, schedule)
 * - an empty state when no activities are assigned
 *
 * The screen is intended to be expanded with functionality for managing
 * attendance, viewing details, and interacting with assigned sessions.
 * The layout is responsive and adapts for mobile and desktop devices.
 */

import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/MyActivitiesStyles';

const ACCENT_COLOR = '#2563eb';

export const MyActivitiesScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>My Activities</Text>
          <Text style={styles.subtitle}>View and manage your scheduled activities</Text>
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
                <Ionicons name="calendar" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>Activities</Text>
                <Text style={styles.cardDescription}>Your assigned merit badge classes</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No activities assigned</Text>
              <Text style={styles.emptyStateSubtext}>Your scheduled activities will appear here</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

