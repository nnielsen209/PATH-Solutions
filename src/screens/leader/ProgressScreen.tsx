/**
 * @file ProgressScreen.tsx
 * @description View-only progress screen for troop leaders to monitor scout merit badge progress.
 *
 * This screen provides:
 * - a read-only overview of scout progress toward merit badge completion
 * - a visual placeholder for future progress tracking data
 * - a clear indication that leaders cannot modify progress records
 *
 * Leaders use this screen to stay informed about their troop’s advancement,
 * while counselors are responsible for updating and approving progress.
 *
 * The layout is responsive across mobile and desktop devices and follows
 * the same design patterns as other leader-facing screens in the application.
 *
 * Future enhancements may include:
 * - displaying real-time progress data per scout
 * - filtering by badge or scout
 * - visual progress indicators (e.g., percentages or completion bars)
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/ProgressStyles';

const ACCENT_COLOR = '#16a34a'; // Green accent for Leaders

export const LeaderProgressScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Progress</Text>
          <Text style={styles.subtitle}>View scout progress on merit badges (read-only)</Text>
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
        {/* View-only notice */}
        <View style={styles.viewOnlyBanner}>
          <Ionicons name="eye-outline" size={18} color="#166534" />
          <Text style={styles.viewOnlyText}>View-only access - Counselors manage progress</Text>
        </View>

        <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                <Ionicons name="ribbon" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Scout Progress
                </Text>
                <Text style={styles.cardDescription}>
                  Merit badge progress for your troop
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.emptyState}>
              <Ionicons name="ribbon-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Progress tracking coming soon</Text>
              <Text style={styles.emptyStateSubtext}>
                Scout progress on merit badges will appear here
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
