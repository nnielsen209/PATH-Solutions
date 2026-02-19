/**
 * UsersScreen.tsx - Dev User Management with Role Switching
 *
 * Dev-only screen that fetches real user data from Supabase and allows
 * developers to change user roles for testing different personas.
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
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole, TABLET_BREAKPOINT } from '../../types';
import { supabase } from '../../services/supabase';
import { AddScoutModal } from '../../components';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;

/** Database user record from Supabase */
interface DbUser {
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_role: UserRole;
  crtn_date: string;
}

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

/** Config for each role section */
type RoleSectionConfig = {
  role: UserRole;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

// User roles (excludes scout since scouts are in separate table)
const ROLE_SECTIONS: RoleSectionConfig[] = [
  {
    role: 'dev',
    label: 'Developers',
    description: 'Developers with full access and role switching',
    icon: 'code-slash',
    color: '#7c3aed',
  },
  {
    role: 'admin',
    label: 'Admins',
    description: 'Camp administrators with full access',
    icon: 'shield-checkmark',
    color: '#dc2626',
  },
  {
    role: 'areadirector',
    label: 'Area Directors',
    description: 'Area directors overseeing camp operations',
    icon: 'business',
    color: '#2563eb',
  },
  {
    role: 'counselor',
    label: 'Counselors',
    description: 'Camp staff who teach merit badge classes',
    icon: 'people',
    color: '#059669',
  },
];

/** Get config for a specific role */
const getRoleConfig = (role: UserRole): RoleSectionConfig => {
  return ROLE_SECTIONS.find((s) => s.role === role) || ROLE_SECTIONS[0];
};

/**
 * UserCard - Displays a single user with tap-to-change-role functionality
 */
type UserCardProps = {
  user: DbUser;
  onChangeRole: (user: DbUser) => void;
  isDesktop: boolean;
};

const UserCard = ({ user, onChangeRole, isDesktop }: UserCardProps) => {
  const config = getRoleConfig(user.user_role);

  return (
    <TouchableOpacity
      style={[styles.userCard, isDesktop && styles.userCardDesktop]}
      onPress={() => onChangeRole(user)}
      activeOpacity={0.7}
    >
      <View style={[styles.userAvatar, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.userInitials, { color: config.color }]}>
          {user.user_first_name[0]}{user.user_last_name[0]}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.user_first_name} {user.user_last_name}
        </Text>
        <Text style={styles.userEmail}>{user.user_email}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.roleBadgeText, { color: config.color }]}>
          {config.label.slice(0, -1)}
        </Text>
      </View>
      <Ionicons name="swap-horizontal" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};

/**
 * RolePickerModal - Modal for selecting a new role for a user
 */
type RolePickerModalProps = {
  visible: boolean;
  user: DbUser | null;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
  isLoading: boolean;
};

const RolePickerModal = ({ visible, user, onClose, onSelectRole, isLoading }: RolePickerModalProps) => {
  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Role</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Select a new role for {user.user_first_name} {user.user_last_name}
          </Text>

          {isLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.modalLoadingText}>Updating role...</Text>
            </View>
          ) : (
            <View style={styles.roleOptions}>
              {ROLE_SECTIONS.map((config) => {
                const isCurrentRole = user.user_role === config.role;
                return (
                  <TouchableOpacity
                    key={config.role}
                    style={[
                      styles.roleOption,
                      isCurrentRole && styles.roleOptionCurrent,
                    ]}
                    onPress={() => !isCurrentRole && onSelectRole(config.role)}
                    disabled={isCurrentRole}
                  >
                    <View style={[styles.roleOptionIcon, { backgroundColor: config.color + '20' }]}>
                      <Ionicons name={config.icon} size={24} color={config.color} />
                    </View>
                    <View style={styles.roleOptionText}>
                      <Text style={[
                        styles.roleOptionLabel,
                        isCurrentRole && styles.roleOptionLabelCurrent,
                      ]}>
                        {config.label}
                      </Text>
                      <Text style={styles.roleOptionDesc}>{config.description}</Text>
                    </View>
                    {isCurrentRole && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

/**
 * RoleSection - Displays users grouped by role
 */
type RoleSectionComponentProps = {
  config: RoleSectionConfig;
  users: DbUser[];
  isDesktop: boolean;
  onChangeRole: (user: DbUser) => void;
};

const RoleSection = ({ config, users, isDesktop, onChangeRole }: RoleSectionComponentProps) => {
  const { label, description, icon, color } = config;

  return (
    <View style={[styles.sectionCard, isDesktop && styles.sectionCardDesktop]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIconWrap, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View style={styles.sectionTitleBlock}>
            <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
              {label}
            </Text>
            <Text style={styles.sectionDescription}>{description}</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.countText, { color }]}>{users.length}</Text>
          </View>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {users.length === 0 ? (
          <View style={styles.emptyRole}>
            <Ionicons name={icon} size={40} color="#d1d5db" />
            <Text style={styles.emptyRoleText}>No {label.toLowerCase()} yet</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {users.map((user) => (
              <UserCard
                key={user.user_id}
                user={user}
                onChangeRole={onChangeRole}
                isDesktop={isDesktop}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * ScoutCard - Displays a single scout
 */
type ScoutCardProps = {
  scout: DbScout;
  isDesktop: boolean;
};

const ScoutCard = ({ scout, isDesktop }: ScoutCardProps) => {
  const troopInfo = scout.troop
    ? `Troop ${scout.troop.troop_nmbr} - ${scout.troop.troop_city}, ${scout.troop.troop_state}`
    : 'No troop assigned';

  return (
    <View style={[styles.userCard, isDesktop && styles.userCardDesktop]}>
      <View style={[styles.userAvatar, { backgroundColor: '#d9770620' }]}>
        <Text style={[styles.userInitials, { color: '#d97706' }]}>
          {scout.scout_first_name[0]}{scout.scout_last_name[0]}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {scout.scout_first_name} {scout.scout_last_name}
        </Text>
        <Text style={styles.userEmail}>{troopInfo}</Text>
      </View>
    </View>
  );
};

/**
 * ScoutsSection - Shows scouts from the scout table with Add button
 */
type ScoutsSectionProps = {
  scouts: DbScout[];
  isDesktop: boolean;
  onAddScout: () => void;
};

const ScoutsSection = ({ scouts, isDesktop, onAddScout }: ScoutsSectionProps) => {
  return (
    <View style={[styles.sectionCard, isDesktop && styles.sectionCardDesktop]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionIconWrap, { backgroundColor: '#d9770620' }]}>
            <Ionicons name="person" size={24} color="#d97706" />
          </View>
          <View style={styles.sectionTitleBlock}>
            <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
              Scouts
            </Text>
            <Text style={styles.sectionDescription}>Scouts from scout table</Text>
          </View>
          <View style={styles.scoutsMeta}>
            <View style={[styles.countBadge, { backgroundColor: '#d9770620' }]}>
              <Text style={[styles.countText, { color: '#d97706' }]}>{scouts.length}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { borderColor: '#d97706' }]}
              onPress={onAddScout}
            >
              <Ionicons name="person-add" size={18} color="#d97706" />
              <Text style={[styles.addButtonText, { color: '#d97706' }]}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {scouts.length === 0 ? (
          <View style={styles.emptyRole}>
            <Ionicons name="person" size={40} color="#d1d5db" />
            <Text style={styles.emptyRoleText}>No scouts yet</Text>
            <Text style={styles.emptyRoleSubtext}>Click "Add" to add a scout</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {scouts.map((scout) => (
              <ScoutCard
                key={scout.scout_id}
                scout={scout}
                isDesktop={isDesktop}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * DevUsersScreen Component
 *
 * Dev-only screen for managing users and switching their roles.
 * Also allows adding scouts.
 */
export const DevUsersScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [users, setUsers] = useState<DbUser[]>([]);
  const [scouts, setScouts] = useState<DbScout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);

  /** Fetch all users and scouts from Supabase */
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const [usersResult, scoutsResult] = await Promise.all([
        supabase
          .from('users')
          .select('user_id, user_email, user_first_name, user_last_name, user_role, crtn_date')
          .order('user_first_name', { ascending: true }),
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
          `)
          .order('scout_first_name', { ascending: true }),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (scoutsResult.error) throw scoutsResult.error;

      setUsers(usersResult.data || []);
      setScouts(scoutsResult.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
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

  /** Group users by role */
  const usersByRole = ROLE_SECTIONS.reduce((acc, config) => {
    acc[config.role] = users.filter((u) => u.user_role === config.role);
    return acc;
  }, {} as Record<UserRole, DbUser[]>);

  /** Open role picker modal */
  const handleChangeRole = (user: DbUser) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  /** Update user role in database */
  const handleSelectRole = async (newRole: UserRole) => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_role: newRole })
        .eq('user_id', selectedUser.user_id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === selectedUser.user_id ? { ...u, user_role: newRole } : u
        )
      );

      setModalVisible(false);
      setSelectedUser(null);

      // Show success message
      if (Platform.OS === 'web') {
        alert(`Role updated to ${getRoleConfig(newRole).label}`);
      } else {
        Alert.alert('Success', `Role updated to ${getRoleConfig(newRole).label}`);
      }
    } catch (err) {
      console.error('Error updating role:', err);
      if (Platform.OS === 'web') {
        alert('Failed to update role. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to update role. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    if (!isUpdating) {
      setModalVisible(false);
      setSelectedUser(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Users</Text>
            <View style={styles.devBadge}>
              <Ionicons name="code-slash" size={12} color="#7c3aed" />
              <Text style={styles.devBadgeText}>Dev Mode</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Tap any user to change their role for testing
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading users...</Text>
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
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            {ROLE_SECTIONS.slice(0, 4).map((config) => (
              <View key={config.role} style={styles.statItem}>
                <Text style={[styles.statValue, { color: config.color }]}>
                  {usersByRole[config.role]?.length || 0}
                </Text>
                <Text style={styles.statLabel}>{config.label}</Text>
              </View>
            ))}
          </View>

          {ROLE_SECTIONS.map((config) => (
            <RoleSection
              key={config.role}
              config={config}
              users={usersByRole[config.role] || []}
              isDesktop={isDesktop}
              onChangeRole={handleChangeRole}
            />
          ))}

          {/* Scouts Section - from scout table */}
          <ScoutsSection
            scouts={scouts}
            isDesktop={isDesktop}
            onAddScout={() => setShowAddScoutModal(true)}
          />

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <RolePickerModal
        visible={modalVisible}
        user={selectedUser}
        onClose={closeModal}
        onSelectRole={handleSelectRole}
        isLoading={isUpdating}
      />

      <AddScoutModal
        visible={showAddScoutModal}
        onClose={() => setShowAddScoutModal(false)}
        onSuccess={handleAddScoutSuccess}
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
    backgroundColor: '#7c3aed20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  devBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionCardDesktop: {
    marginBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionTitleDesktop: {
    fontSize: 19,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
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
  scoutsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  sectionContent: {
    padding: 16,
  },
  emptyRole: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyRoleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyRoleSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  usersList: {
    gap: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  userCardDesktop: {
    padding: 14,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  modalLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  roleOptions: {
    gap: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  roleOptionCurrent: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  roleOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleOptionText: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  roleOptionLabelCurrent: {
    color: '#9ca3af',
  },
  roleOptionDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
});
