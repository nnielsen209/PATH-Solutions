/**
 * @file CampersScreen.tsx
 * @description Read-only troop member screen for scout leaders.
 *
 * This screen displays:
 * - campers and leaders fetched from Supabase
 * - troop members grouped by troop
 * - summary counts for leaders and campers
 * - a read-only view of troop participant information
 *
 * Camper and leader data are loaded from separate Supabase tables and then
 * combined into grouped troop structures for display. Each troop section
 * shows its leaders and campers in a structured layout with basic contact
 * or role information.
 *
 * This screen is intended for troop leaders who need visibility into troop
 * membership without edit permissions. It supports responsive layouts for
 * both mobile and desktop devices. Future updates may restrict results to
 * only the currently signed-in leader’s assigned troop.
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

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;
const CAMPER_ACCENT = '#d97706'; // Orange accent for campers
const LEADER_ACCENT = '#16a34a'; // Green accent for leaders

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
      <View style={styles.viewOnlyBadge}>
        <Ionicons name="eye-outline" size={14} color="#6b7280" />
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
 * LeaderCampersScreen Component
 *
 * Shows campers and leaders grouped by troop. Read-only view.
 * TODO: Filter by leader's assigned troop once database association is set up.
 */
export const LeaderCampersScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [troopGroups, setTroopGroups] = useState<TroopGroup[]>([]);
  const [camperCount, setCamperCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch all campers and leaders from Supabase and group by troop */
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // TODO: Once troop association is set up, filter by the leader's troop

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Campers & Leaders</Text>
          <Text style={styles.subtitle}>View troop members (view-only)</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LEADER_ACCENT} />
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
          {/* View-only notice */}
          <View style={styles.viewOnlyBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#166534" />
            <Text style={styles.viewOnlyText}>You have view-only access to troop information</Text>
          </View>

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
                    Contact camp staff to add campers to your troop
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
    backgroundColor: LEADER_ACCENT,
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
  viewOnlyText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
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
  viewOnlyBadge: {
    padding: 6,
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
