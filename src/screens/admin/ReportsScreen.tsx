/**
 * ReportsScreen.tsx - Admin Reports & Analytics
 *
 * View and generate reports (attendance, progress, etc.). Ready for future:
 * - Report types list, date filters, export
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_REPORTS } from '../../data/mockScreensData';

const DESKTOP_BREAKPOINT = 768;
const ACCENT_COLOR = '#7c3aed';

export const ReportsScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const handleGenerateReport = () => {
    // TODO: Open report type picker or export flow
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Reports</Text>
          <Text style={styles.subtitle}>
            View analytics and generate reports
          </Text>
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
        <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                <Ionicons name="bar-chart" size={24} color={ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Reports & analytics
                </Text>
                <Text style={styles.cardDescription}>
                  Attendance, badge progress, and camp overview
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: ACCENT_COLOR }]}
                  onPress={handleGenerateReport}
                >
                  <Ionicons name="document-text" size={18} color={ACCENT_COLOR} />
                  <Text style={[styles.addButtonText, { color: ACCENT_COLOR }]}>
                    Generate report
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.reportList}>
              {MOCK_REPORTS.map((report) => (
                <View key={report.id} style={styles.reportRow}>
                  <View style={[styles.reportIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                    <Ionicons name="document-text" size={20} color={ACCENT_COLOR} />
                  </View>
                  <View style={styles.reportRowText}>
                    <Text style={styles.reportRowTitle}>{report.title}</Text>
                    <Text style={styles.reportRowSubtitle}>{report.subtitle}</Text>
                    <Text style={styles.reportRowTime}>{report.generatedAt}</Text>
                  </View>
                </View>
              ))}
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
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  addButtonText: { fontSize: 13, fontWeight: '600' },
  cardContent: { minHeight: 200, padding: 16 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },
  reportList: {},
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportRowText: { flex: 1, minWidth: 0 },
  reportRowTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  reportRowSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  reportRowTime: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
