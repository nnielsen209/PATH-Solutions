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
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDesktop: { paddingHorizontal: 32, paddingVertical: 20 },
  headerInner: {},
  headerInnerDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  titleDesktop: { fontSize: 26 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  scrollContentDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  viewOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  viewOnlyText: { fontSize: 13, color: '#166534', fontWeight: '500' },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainCardDesktop: { marginBottom: 0 },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cardTitleDesktop: { fontSize: 19 },
  cardDescription: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardContent: { minHeight: 200, padding: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: { fontSize: 13, color: '#9ca3af', marginTop: 6, textAlign: 'center' },
});
