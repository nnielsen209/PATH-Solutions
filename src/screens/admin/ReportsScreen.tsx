/**
 * ReportsScreen.tsx - Admin Reports & Analytics
 *
 * View and generate reports (attendance, progress, etc.).
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/ReportsStyles';

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

