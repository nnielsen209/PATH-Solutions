/**
 * @file CampersScreen.tsx
 * @description Camper and leader management screen displaying all camp participants grouped by troop.
 *
 * This screen allows administrators and area directors to:
 * - view campers and leaders organized by troop
 * - see troop-level summaries including member counts
 * - add new campers and leaders via modal forms
 *
 * Data is fetched from Supabase and grouped dynamically by troop,
 * with sorting applied to troops and members for consistent display.
 * The layout adapts responsively for mobile and desktop screen sizes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';
import { styles } from '../../styles/CampersStyles';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { AddScoutModal, AddLeaderModal } from '../../components';

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
 * PersonCard - Displays a single leader or camper with edit/delete actions
 */
type PersonCardProps = {
  name: string;
  initials: string;
  subtitle: string;
  isLeader: boolean;
  isDesktop: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const PersonCard = ({ name, initials, subtitle, isLeader, isDesktop, canEdit, onEdit, onDelete }: PersonCardProps) => {
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
      {canEdit && (
        <View style={styles.personActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/**
 * TroopSection - Displays a troop with its leaders and campers
 */
type TroopSectionProps = {
  troopGroup: TroopGroup;
  isDesktop: boolean;
  canEdit: boolean;
  onEditLeader: (leader: DbLeader) => void;
  onDeleteLeader: (leader: DbLeader) => void;
  onEditCamper: (camper: DbScout) => void;
  onDeleteCamper: (camper: DbScout) => void;
};

const TroopSection = ({
  troopGroup,
  isDesktop,
  canEdit,
  onEditLeader,
  onDeleteLeader,
  onEditCamper,
  onDeleteCamper,
}: TroopSectionProps) => {
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
              canEdit={canEdit}
              onEdit={() => onEditLeader(leader)}
              onDelete={() => onDeleteLeader(leader)}
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
              canEdit={canEdit}
              onEdit={() => onEditCamper(camper)}
              onDelete={() => onDeleteCamper(camper)}
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
 * CampersScreen Component
 *
 * Displays all campers and leaders grouped by troop.
 * Admin and Area Director have add capability.
 */
export const CampersScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [troopGroups, setTroopGroups] = useState<TroopGroup[]>([]);
  const [camperCount, setCamperCount] = useState(0);
  const [leaderCount, setLeaderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [scoutToEdit, setScoutToEdit] = useState<DbScout | null>(null);
  const [leaderToEdit, setLeaderToEdit] = useState<DbLeader | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'scout' | 'leader';
    item: DbScout | DbLeader;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // DEV, Admin, and Area Director can add campers/leaders
  const canAdd = userRole === 'DEV' || userRole === 'ADMIN' || userRole === 'AREA_DIRECTOR';

  const handleAddScoutSuccess = () => {
    setShowAddScoutModal(false);
    setScoutToEdit(null);
    fetchData();
  };

  const handleAddLeaderSuccess = () => {
    setShowAddLeaderModal(false);
    setLeaderToEdit(null);
    fetchData();
  };

  const handleEditScout = (scout: DbScout) => {
    setScoutToEdit(scout);
    setShowAddScoutModal(true);
  };

  const handleEditLeader = (leader: DbLeader) => {
    setLeaderToEdit(leader);
    setShowAddLeaderModal(true);
  };

  const handleDeleteScout = (scout: DbScout) => {
    setDeleteConfirm({
      type: 'scout',
      item: scout,
      name: `${scout.scout_first_name} ${scout.scout_last_name}`,
    });
  };

  const handleDeleteLeader = (leader: DbLeader) => {
    setDeleteConfirm({
      type: 'leader',
      item: leader,
      name: `${leader.scout_leader_first_name} ${leader.scout_leader_last_name}`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'scout') {
        const scout = deleteConfirm.item as DbScout;
        const { error: deleteError } = await supabase
          .from('scout')
          .delete()
          .eq('scout_id', scout.scout_id);
        if (deleteError) throw deleteError;
      } else {
        const leader = deleteConfirm.item as DbLeader;
        const { error: deleteError } = await supabase
          .from('scout_leader')
          .delete()
          .eq('scout_leader_id', leader.scout_leader_id);
        if (deleteError) throw deleteError;
      }

      const alertTitle = 'Success';
      const alertMessage = `${deleteConfirm.name} has been removed`;
      if (Platform.OS === 'web') {
        alert(`${alertTitle}: ${alertMessage}`);
      } else {
        Alert.alert(alertTitle, alertMessage);
      }

      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting:', err);
      const alertTitle = 'Error';
      const alertMessage = err.message || 'Failed to delete';
      if (Platform.OS === 'web') {
        alert(`${alertTitle}: ${alertMessage}`);
      } else {
        Alert.alert(alertTitle, alertMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseScoutModal = () => {
    setShowAddScoutModal(false);
    setScoutToEdit(null);
  };

  const handleCloseLeaderModal = () => {
    setShowAddLeaderModal(false);
    setLeaderToEdit(null);
  };

  const subtitle =
    userRole === 'AREA_DIRECTOR'
      ? 'View and manage campers & leaders'
      : 'Manage all camp participants';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Campers & Leaders</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {canAdd && (
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
            )}
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CAMPER_ACCENT} />
          <Text style={styles.loadingText}>Loading campers & leaders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: CAMPER_ACCENT }]} onPress={fetchData}>
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
                    {canAdd ? 'Add campers or leaders to get started' : 'Troops will appear here'}
                  </Text>
                </View>
              ) : (
                <View style={styles.troopsList}>
                  {troopGroups.map((group) => (
                    <TroopSection
                      key={group.troop_id}
                      troopGroup={group}
                      isDesktop={isDesktop}
                      canEdit={canAdd}
                      onEditLeader={handleEditLeader}
                      onDeleteLeader={handleDeleteLeader}
                      onEditCamper={handleEditScout}
                      onDeleteCamper={handleDeleteScout}
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
        onClose={handleCloseScoutModal}
        onSuccess={handleAddScoutSuccess}
        scoutToEdit={scoutToEdit}
      />

      <AddLeaderModal
        visible={showAddLeaderModal}
        onClose={handleCloseLeaderModal}
        onSuccess={handleAddLeaderSuccess}
        leaderToEdit={leaderToEdit}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setDeleteConfirm(null)}
      >
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <View style={styles.deleteIconWrap}>
              <Ionicons name="warning" size={32} color="#dc2626" />
            </View>
            <Text style={styles.deleteTitle}>Remove {deleteConfirm?.type === 'leader' ? 'Leader' : 'Camper'}?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to remove {deleteConfirm?.name}? This action cannot be undone.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmBtn, isDeleting && styles.deleteConfirmBtnDisabled]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text style={styles.deleteConfirmText}>Remove</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


