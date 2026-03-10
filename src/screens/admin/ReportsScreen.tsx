/**
 * ReportsScreen.tsx - Admin Reports & Analytics
 *
 * View and generate reports (attendance, progress, etc.).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;
const ACCENT_COLOR = '#7c3aed';

const reportOptions = [
  {
    id: 'attendance',
    title: 'Attendance Report',
    description: 'View attendance summaries and participation totals.',
    icon: 'people' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'progress',
    title: 'Progress Report',
    description: 'Track scout merit badge progress and completion.',
    icon: 'ribbon' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'schedule',
    title: 'Schedule Report',
    description: 'Review scheduled activities by date and badge.',
    icon: 'calendar' as keyof typeof Ionicons.glyphMap,
  },
];

/** make report screen look more finished for demo when buttons are pressed
 * pop up window saying coming soon appears 
 * can implement funcitonlaity when we actually have reports 
 */

export const ReportsScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const handleGenerateReport = (reportType: string) => {
    Alert.alert('Generate Report', `${reportType} report generation coming soon.`);
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
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.reportList}>
              {reportOptions.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportLeft}>
                    <View
                      style={[
                        styles.reportIconWrap,
                        { backgroundColor: ACCENT_COLOR + '15' },
                      ]}
                    >
                      <Ionicons name={report.icon} size={20} color={ACCENT_COLOR} />
                    </View>

                    <View style={styles.reportTextBlock}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportDescription}>
                        {report.description}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.generateButton, { borderColor: ACCENT_COLOR }]}
                    onPress={() => handleGenerateReport(report.title)}
                  >
                    <Ionicons name="document-text-outline" size={16} color={ACCENT_COLOR} />
                    <Text style={[styles.generateButtonText, { color: ACCENT_COLOR }]}>
                      Generate
                    </Text>
                  </TouchableOpacity>
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
  cardContent: { padding: 16 },

  reportList: {
    gap: 12,
  },
  reportCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  reportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTextBlock: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  reportDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
