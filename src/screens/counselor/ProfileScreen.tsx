/**
 * ProfileScreen.tsx - Counselor profile placeholder
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { MOCK_PROFILE_PREFERENCES } from '../../data/mockScreensData';

const DESKTOP_BREAKPOINT = 768;
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
            <View style={styles.preferenceList}>
              {MOCK_PROFILE_PREFERENCES.map((pref) => (
                <View key={pref.id} style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>{pref.label}</Text>
                  <Text style={styles.preferenceValue}>{pref.value}</Text>
                </View>
              ))}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerDesktop: { paddingHorizontal: 32, paddingVertical: 20 },
  headerInner: {},
  headerInnerDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  titleDesktop: { fontSize: 26 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  scrollContentDesktop: { maxWidth: 1200, width: '100%', alignSelf: 'center' },
  mainCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  mainCardDesktop: { marginBottom: 0 },
  cardHeader: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cardTitleDesktop: { fontSize: 19 },
  cardDescription: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardContent: { minHeight: 200, padding: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  emptyStateText: { fontSize: 16, fontWeight: '500', color: '#6b7280', marginTop: 16 },
  emptyStateSubtext: { fontSize: 13, color: '#9ca3af', marginTop: 6, textAlign: 'center' },
  preferenceList: {},
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  preferenceLabel: { fontSize: 14, color: '#6b7280' },
  preferenceValue: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  signOutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#dc2626' },
  signOutHint: { fontSize: 13, color: '#6b7280', marginTop: 4, marginLeft: 36 },
});
