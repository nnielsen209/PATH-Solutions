/**
 * ProgressScreen.tsx - Leader Progress View
 *
 * View-only screen for leaders to see scout progress on merit badges.
 * Leaders can view but cannot modify progress records.
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
