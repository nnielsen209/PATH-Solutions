/**
 * CampersScreen.tsx - Dev Camper & Leader Management
 *
 * Dev-only screen that fetches campers and leaders from Supabase.
 * Developers can add campers and leaders, grouped by troop.
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
import { supabase } from '../../services/supabase';
import { AddScoutModal, AddLeaderModal } from '../../components';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;
const CAMPER_ACCENT = '#d97706'; // Orange accent for campers
const LEADER_ACCENT = '#16a34a'; // Green accent for leaders
const DEV_COLOR = '#7c3aed'; // Purple for dev

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

/** Leader record from Supabase */
interface DbLeader {
  scout_leader_id: string;
  scout_leader_first_name: string;
  scout_leader_last_name: string;
  troop_id: string;
  troop_leader_phone_nmbr: string | null;
  troop_leader_email: string | null;
  troop?: {
    troop_nmbr: number;
    troop_city: string;
    troop_state: string;
  };
}

/** Grouped troop data */
interface TroopGroup {
  troop_id: string;
  troop_nmbr: number;
  troop_city: string;
  troop_state: string;
  leaders: DbLeader[];
  campers: DbScout[];
}

/**
 * PersonCard - Displays a single leader or camper
 */
type PersonCardProps = {
  name: string;
  initials: string;
  subtitle: string;
  isLeader: boolean;
  isDesktop: boolean;
};

const PersonCard = ({ name, initials, subtitle, isLeader, isDesktop }: PersonCardProps) => {
  const accent = isLeader ? LEADER_ACCENT : CAMPER_ACCENT;

  return (
    <View style={[styles.personCard, isDesktop && styles.personCardDesktop]}>
      <View style={[styles.personAvatar, { backgroundColor: accent + '20' }]}>
        <Text style={[styles.personInitials, { color: accent }]}>{initials}</Text>
      </View>
      <View style={styles.personInfo}>
        <View style={styles.personNameRow}>
          <Text style={styles.personName}>{name}</Text>
          {isLeader && (
            <View style={styles.leaderBadge}>
              <Ionicons name="shield" size={12} color={LEADER_ACCENT} />
              <Text style={styles.leaderBadgeText}>Leader</Text>
            </View>
          )}
        </View>
        <Text style={styles.personSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

/**
 * TroopSection - Displays a troop with its leaders and campers
 */
type TroopSectionProps = {
  troopGroup: TroopGroup;
  isDesktop: boolean;
};

const TroopSection = ({ troopGroup, isDesktop }: TroopSectionProps) => {
  const totalMembers = troopGroup.leaders.length + troopGroup.campers.length;

  return (
    <View style={styles.troopSection}>
      {/* Troop Header */}
      <View style={styles.troopHeader}>
        <View style={styles.troopIconWrap}>
          <Ionicons name="flag" size={20} color={CAMPER_ACCENT} />
        </View>
        <View style={styles.troopTitleBlock}>
          <Text style={styles.troopTitle}>Troop {troopGroup.troop_nmbr}</Text>
          <Text style={styles.troopLocation}>
            {troopGroup.troop_city}, {troopGroup.troop_state}
          </Text>
        </View>
        <View style={styles.troopCountBadge}>
          <Text style={styles.troopCountText}>{totalMembers}</Text>
        </View>
      </View>

      {/* Leaders */}
      {troopGroup.leaders.length > 0 && (
        <View style={styles.personsList}>
          {troopGroup.leaders.map((leader) => (
            <PersonCard
              key={leader.scout_leader_id}
              name={`${leader.scout_leader_first_name} ${leader.scout_leader_last_name}`}
              initials={`${leader.scout_leader_first_name[0]}${leader.scout_leader_last_name[0]}`}
              subtitle={leader.troop_leader_email || leader.troop_leader_phone_nmbr || 'No contact info'}
              isLeader={true}
              isDesktop={isDesktop}
            />
          ))}
        </View>
      )}

      {/* Campers */}
      {troopGroup.campers.length > 0 && (
        <View style={styles.personsList}>
          {troopGroup.campers.map((camper) => (
            <PersonCard
              key={camper.scout_id}
              name={`${camper.scout_first_name} ${camper.scout_last_name}`}
              initials={`${camper.scout_first_name[0]}${camper.scout_last_name[0]}`}
              subtitle="Camper"
              isLeader={false}
              isDesktop={isDesktop}
            />
          ))}
        </View>
      )}

      {/* Empty state for troop with no members */}
      {totalMembers === 0 && (
        <View style={styles.emptyTroop}>
          <Text style={styles.emptyTroopText}>No members in this troop</Text>
        </View>
      )}
    </View>
  );
};

/**
 * DevCampersScreen Component
 *
 * Dev screen for managing campers and leaders, grouped by troop.
 */
export const DevCampersScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [troopGroups, setTroopGroups] = useState<TroopGroup[]>([]);
  const [camperCount, setCamperCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);

  /** Fetch all campers and leaders from Supabase and group by troop */
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch campers and leaders in parallel
      const [campersResult, leadersResult] = await Promise.all([
        supabase
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
          `),
        supabase
          .from('scout_leader')
          .select(`
            scout_leader_id,
            scout_leader_first_name,
            scout_leader_last_name,
            troop_id,
            troop_leader_phone_nmbr,
            troop_leader_email,
            troop:troop_id (
              troop_nmbr,
              troop_city,
              troop_state
            )
          `),
      ]);

      if (campersResult.error) throw campersResult.error;
      if (leadersResult.error) throw leadersResult.error;

      const campers: DbScout[] = campersResult.data || [];
      const leaders: DbLeader[] = leadersResult.data || [];

      setCamperCount(campers.length);
      setLeaderCount(leaders.length);

      // Group by troop
      const troopMap = new Map<string, TroopGroup>();

      // Add campers to groups
      for (const camper of campers) {
        if (!camper.troop_id || !camper.troop) continue;

        if (!troopMap.has(camper.troop_id)) {
          troopMap.set(camper.troop_id, {
            troop_id: camper.troop_id,
            troop_nmbr: camper.troop.troop_nmbr,
            troop_city: camper.troop.troop_city,
            troop_state: camper.troop.troop_state,
            leaders: [],
            campers: [],
          });
        }
        troopMap.get(camper.troop_id)!.campers.push(camper);
      }

      // Add leaders to groups
      for (const leader of leaders) {
        if (!leader.troop_id || !leader.troop) continue;

        if (!troopMap.has(leader.troop_id)) {
          troopMap.set(leader.troop_id, {
            troop_id: leader.troop_id,
            troop_nmbr: leader.troop.troop_nmbr,
            troop_city: leader.troop.troop_city,
            troop_state: leader.troop.troop_state,
            leaders: [],
            campers: [],
          });
        }
        troopMap.get(leader.troop_id)!.leaders.push(leader);
      }

      // Sort groups by troop number, then sort members within each group
      const sorted = Array.from(troopMap.values())
        .sort((a, b) => a.troop_nmbr - b.troop_nmbr)
        .map((group) => ({
          ...group,
          leaders: group.leaders.sort((a, b) =>
            a.scout_leader_last_name.localeCompare(b.scout_leader_last_name)
          ),
          campers: group.campers.sort((a, b) =>
            a.scout_last_name.localeCompare(b.scout_last_name)
          ),
        }));

      setTroopGroups(sorted);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load campers and leaders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddScoutSuccess = () => {
    setShowAddScoutModal(false);
    fetchData();
  };

  const handleAddLeaderSuccess = () => {
    setShowAddLeaderModal(false);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <View style={styles.headerRow}>
            <View>
              <View style={styles.headerTitleRow}>
                <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Campers & Leaders</Text>
                <View style={styles.devBadge}>
                  <Ionicons name="code-slash" size={12} color={DEV_COLOR} />
                  <Text style={styles.devBadgeText}>Dev Mode</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Manage all camp participants</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: LEADER_ACCENT }]}
                onPress={() => setShowAddLeaderModal(true)}
              >
                <Ionicons name="shield" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add Leader</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: CAMPER_ACCENT }]}
                onPress={() => setShowAddScoutModal(true)}
              >
                <Ionicons name="person-add" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add Camper</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DEV_COLOR} />
          <Text style={styles.loadingText}>Loading campers & leaders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
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
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, { flex: 1 }]}>
              <View style={[styles.statsIconWrap, { backgroundColor: LEADER_ACCENT + '20' }]}>
                <Ionicons name="shield" size={24} color={LEADER_ACCENT} />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsValue, { color: LEADER_ACCENT }]}>{leaderCount}</Text>
                <Text style={styles.statsLabel}>Leaders</Text>
              </View>
            </View>
            <View style={[styles.statsCard, { flex: 1 }]}>
              <View style={[styles.statsIconWrap, { backgroundColor: CAMPER_ACCENT + '20' }]}>
                <Ionicons name="people" size={24} color={CAMPER_ACCENT} />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsValue, { color: CAMPER_ACCENT }]}>{camperCount}</Text>
                <Text style={styles.statsLabel}>Campers</Text>
              </View>
            </View>
          </View>

          {/* Troop Sections */}
          <View style={[styles.listCard, isDesktop && styles.listCardDesktop]}>
            <View style={styles.listHeader}>
              <View style={styles.listTitleRow}>
                <View style={styles.listIconWrap}>
                  <Ionicons name="flag" size={24} color={CAMPER_ACCENT} />
                </View>
                <View style={styles.listTitleBlock}>
                  <Text style={[styles.listTitle, isDesktop && styles.listTitleDesktop]}>
                    Troops
                  </Text>
                  <Text style={styles.listDescription}>Grouped by troop number</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{troopGroups.length}</Text>
                </View>
              </View>
            </View>
            <View style={styles.listContent}>
              {troopGroups.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No troops yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add campers or leaders to get started
                  </Text>
                </View>
              ) : (
                <View style={styles.troopsList}>
                  {troopGroups.map((group) => (
                    <TroopSection
                      key={group.troop_id}
                      troopGroup={group}
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
        visible={showAddScoutModal}
        onClose={() => setShowAddScoutModal(false)}
        onSuccess={handleAddScoutSuccess}
      />

      <AddLeaderModal
        visible={showAddLeaderModal}
        onClose={() => setShowAddLeaderModal(false)}
        onSuccess={handleAddLeaderSuccess}
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
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  titleDesktop: {
    fontSize: 26,
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DEV_COLOR + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  devBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: DEV_COLOR,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: DEV_COLOR,
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsInfo: {},
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 13,
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
    backgroundColor: CAMPER_ACCENT + '20',
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
    backgroundColor: CAMPER_ACCENT + '20',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: CAMPER_ACCENT,
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
  troopsList: {
    gap: 16,
  },
  troopSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  troopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  troopIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: CAMPER_ACCENT + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  troopTitleBlock: {
    flex: 1,
  },
  troopTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  troopLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  troopCountBadge: {
    minWidth: 28,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  troopCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  personsList: {
    padding: 8,
    gap: 6,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  personCardDesktop: {
    padding: 12,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInitials: {
    fontSize: 14,
    fontWeight: '600',
  },
  personInfo: {
    flex: 1,
  },
  personNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  leaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LEADER_ACCENT + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  leaderBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: LEADER_ACCENT,
  },
  personSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyTroop: {
    padding: 16,
    alignItems: 'center',
  },
  emptyTroopText: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
