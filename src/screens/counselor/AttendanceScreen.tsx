/**
 * AttendanceScreen.tsx - Counselor attendance placeholder
 */

import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/AttendanceStyles';

const ACCENT_COLOR = '#059669';

export const AttendanceScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Attendance</Text>
          <Text style={styles.subtitle}>Mark and view attendance for your activities</Text>
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
                <Ionicons name="people" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>Take attendance</Text>
                <Text style={styles.cardDescription}>Record who attended your classes</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No attendance to record</Text>
              <Text style={styles.emptyStateSubtext}>Select an activity to mark attendance</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

