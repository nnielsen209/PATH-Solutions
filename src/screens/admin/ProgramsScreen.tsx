/**
 * ProgramsScreen.tsx - Admin Program Management
 *
 * Single page for admins to manage programs. Shows a header, a main card
 * with a count and "Add program" button, and an empty state until we load
 * programs from Supabase.
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
import { TABLET_BREAKPOINT } from '../../types';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;

const PROGRAM_ACCENT_COLOR = '#059669';

/**
 * ProgramsScreen Component
 *
 * Renders the programs management page with a header and one main card.
 * The card shows a count and Add button; content is empty state for now.
 */
export const ProgramsScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;
  const programCount = 0;

  const handleAddProgram = () => {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
            Programs
          </Text>
          <Text style={styles.subtitle}>
            Manage programs and their requirements
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
              <View style={[styles.cardIconWrap, { backgroundColor: PROGRAM_ACCENT_COLOR + '20' }]}>
                <Ionicons name="ribbon" size={24} color={PROGRAM_ACCENT_COLOR} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                  Programs
                </Text>
                <Text style={styles.cardDescription}>
                  Add and edit programs participants can work on at camp
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <View style={[styles.countBadge, { backgroundColor: PROGRAM_ACCENT_COLOR + '20' }]}>
                  <Text style={[styles.countText, { color: PROGRAM_ACCENT_COLOR }]}>
                    {programCount}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: PROGRAM_ACCENT_COLOR }]}
                  onPress={handleAddProgram}
                >
                  <Ionicons name="add-circle" size={18} color={PROGRAM_ACCENT_COLOR} />
                  <Text style={[styles.addButtonText, { color: PROGRAM_ACCENT_COLOR }]}>
                    Add program
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            {programCount === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="ribbon-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No programs yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add programs to let participants and counselors use them in the system
                </Text>
              </View>
            ) : (
              <View style={styles.placeholderList}>
                <Text style={styles.placeholderListText}>Program list will load here</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  headerInner: {},
  headerInnerDesktop: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  titleDesktop: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  scrollContentDesktop: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
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
  mainCardDesktop: {
    marginBottom: 0,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardTitleDesktop: {
    fontSize: 19,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardContent: {
    minHeight: 200,
    padding: 16,
  },
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
  placeholderList: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  placeholderListText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
