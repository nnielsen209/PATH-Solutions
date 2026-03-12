/**
 * CampersScreen.tsx - Camper Management (Admin & Area Director)
 *
 * Fetches scout data from Supabase and displays all campers.
 * Admin and Area Director can add new campers.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { AddScoutModal } from '../../components';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;
const ACCENT_COLOR = '#d97706'; // Orange accent for campers

/** Scout record from Supabase */
interface DbScout {
  scout_id: string;
  scout_first_name: string;
  scout_last_name: string;
  troop_id: string;
  troop?: {
    troop_nmbr: number;
    troop_city: string;
    troop_state: string;
  };
}

/**
 * CamperCard - Displays a single camper
 */
type CamperCardProps = {
  camper: DbScout;
  isDesktop: boolean;
};

const CamperCard = ({ camper, isDesktop }: CamperCardProps) => {
  const troopInfo = camper.troop
    ? `Troop ${camper.troop.troop_nmbr} - ${camper.troop.troop_city}, ${camper.troop.troop_state}`
    : 'No troop assigned';

  return (
    <View style={[styles.camperCard, isDesktop && styles.camperCardDesktop]}>
      <View style={styles.camperAvatar}>
        <Text style={styles.camperInitials}>
          {camper.scout_first_name[0]}{camper.scout_last_name[0]}
        </Text>
      </View>
      <View style={styles.camperInfo}>
        <Text style={styles.camperName}>
          {camper.scout_first_name} {camper.scout_last_name}
        </Text>
        <Text style={styles.camperTroop}>{troopInfo}</Text>
      </View>
    </View>
  );
};

/**
 * CampersScreen Component
 *
 * Displays all campers with ability to add new ones.
 * Admin and Area Director have add capability.
 */
export const CampersScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [campers, setCampers] = useState<DbScout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  /** Fetch all campers from Supabase */
  const fetchCampers = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('scout')
        .select(`
          scout_id,
          scout_first_name,
          scout_last_name,
          troop_id,
          troop:troop_id (
            troop_nmbr,
            troop_city,
            troop_state
          )
        `)
        .order('scout_first_name', { ascending: true });

      if (fetchError) throw fetchError;
      setCampers(data || []);
    } catch (err) {
      console.error('Error fetching campers:', err);
      setError('Failed to load campers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampers();
  }, [fetchCampers]);

  // Admin and Area Director can add campers
  const canAdd = userRole === 'ADMIN' || userRole === 'AREA_DIRECTOR';

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchCampers();
  };

  const subtitle =
    userRole === 'AREA_DIRECTOR'
      ? 'View and manage campers'
      : 'Manage all camp participants';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Campers</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {canAdd && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="person-add" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add Camper</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={styles.loadingText}>Loading campers...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCampers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: contentPadding },
            isDesktop && styles.scrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsIconWrap}>
              <Ionicons name="people" size={28} color={ACCENT_COLOR} />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statsValue}>{campers.length}</Text>
              <Text style={styles.statsLabel}>Total Campers</Text>
            </View>
          </View>

          {/* Campers List */}
          <View style={[styles.listCard, isDesktop && styles.listCardDesktop]}>
            <View style={styles.listHeader}>
              <View style={styles.listTitleRow}>
                <View style={styles.listIconWrap}>
                  <Ionicons name="person" size={24} color={ACCENT_COLOR} />
                </View>
                <View style={styles.listTitleBlock}>
                  <Text style={[styles.listTitle, isDesktop && styles.listTitleDesktop]}>
                    All Campers
                  </Text>
                  <Text style={styles.listDescription}>Camp participants</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{campers.length}</Text>
                </View>
              </View>
            </View>
            <View style={styles.listContent}>
              {campers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="person-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No campers yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {canAdd ? 'Click "Add Camper" to add a camper' : 'Campers will appear here'}
                  </Text>
                </View>
              ) : (
                <View style={styles.campersList}>
                  {campers.map((camper) => (
                    <CamperCard
                      key={camper.scout_id}
                      camper={camper}
                      isDesktop={isDesktop}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <AddScoutModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: ACCENT_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsInfo: {},
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
  },
  statsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listCardDesktop: {
    marginBottom: 0,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: ACCENT_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTitleBlock: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  listTitleDesktop: {
    fontSize: 19,
  },
  listDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 8,
    backgroundColor: ACCENT_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: ACCENT_COLOR,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    marginTop: 4,
    textAlign: 'center',
  },
  campersList: {
    gap: 8,
  },
  camperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  camperCardDesktop: {
    padding: 14,
  },
  camperAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camperInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT_COLOR,
  },
  camperInfo: {
    flex: 1,
  },
  camperName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  camperTroop: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});
