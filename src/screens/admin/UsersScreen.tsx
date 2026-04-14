/**
 * UsersScreen.tsx - User Management (Admin & Area Director)
 *
 * Fetches real user data from Supabase and displays users grouped by role.
 * Admin sees all sections; Area Director sees Counselors only.
 * Scouts/Campers are managed in the separate Campers screen.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/UsersStyles';

/** Database user record from Supabase */
interface DbUser {
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_role: UserRole;
  crtn_date: string;
}

/** Config for each role section: label, description, icon, and accent color. */
type RoleSectionConfig = {
  role: UserRole;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const ROLE_SECTIONS: RoleSectionConfig[] = [
  {
    role: 'PENDING',
    label: 'Pending Approval',
    description: 'New users awaiting role assignment',
    icon: 'time',
    color: '#f59e0b',
  },
  {
    role: 'ADMIN',
    label: 'Admins',
    description: 'Camp administrators with full access',
    icon: 'shield-checkmark',
    color: '#7c3aed',
  },
  {
    role: 'AREA_DIRECTOR',
    label: 'Area Directors',
    description: 'Area directors overseeing camp operations',
    icon: 'business',
    color: '#2563eb',
  },
  {
    role: 'COUNSELOR',
    label: 'Counselors',
    description: 'Camp staff who teach merit badge classes',
    icon: 'people',
    color: '#059669',
  },
];

/** Role hierarchy - lower index = higher privilege */
const ROLE_HIERARCHY: UserRole[] = ['DEV', 'ADMIN', 'AREA_DIRECTOR', 'COUNSELOR'];

/** Get roles that a user can assign based on their own role */
const getAssignableRoles = (currentUserRole: UserRole | null): RoleSectionConfig[] => {
  if (!currentUserRole) return [];

  const currentRoleIndex = ROLE_HIERARCHY.indexOf(currentUserRole);
  if (currentRoleIndex === -1) return []; // Role not in hierarchy (e.g., PENDING, SCOUT)

  // User can assign roles at their level or below (excluding PENDING and DEV for non-DEV users)
  const assignableRoleNames = ROLE_HIERARCHY.slice(
    currentUserRole === 'DEV' ? 1 : currentRoleIndex, // DEV can assign from ADMIN down, others from their level
  );

  return ROLE_SECTIONS.filter(
    (s) => s.role !== 'PENDING' && assignableRoleNames.includes(s.role)
  );
};

/** Check if user can approve pending accounts */
const canApproveUsers = (role: UserRole | null): boolean => {
  return role !== null && ROLE_HIERARCHY.includes(role);
};

/** Get config for a specific role */
const getRoleConfig = (role: UserRole): RoleSectionConfig => {
  return ROLE_SECTIONS.find((s) => s.role === role) || ROLE_SECTIONS[0];
};

/**
 * UserCard - Displays a single user with optional action button
 */
type UserCardProps = {
  user: DbUser;
  isDesktop: boolean;
  showApproveButton?: boolean;
  onApprove?: (user: DbUser) => void;
};

const UserCard = ({ user, isDesktop, showApproveButton, onApprove }: UserCardProps) => {
  const config = getRoleConfig(user.user_role);

  return (
    <View style={[styles.userCard, isDesktop && styles.userCardDesktop]}>
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
      {showApproveButton && onApprove && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#059669', borderColor: '#059669' }]}
          onPress={() => onApprove(user)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Approve</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


/**
 * RoleSection - One card per role showing users in that role
 */
type RoleSectionProps = {
  config: RoleSectionConfig;
  users: DbUser[];
  isDesktop: boolean;
  canApprove?: boolean;
  onApprove?: (user: DbUser) => void;
};

const RoleSection = ({ config, users, isDesktop, canApprove, onApprove }: RoleSectionProps) => {
  const { label, description, icon, color, role } = config;
  const isPending = role === 'PENDING';

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
            <Text style={styles.emptyRoleText}>
              {isPending ? 'No pending users' : `No ${label.toLowerCase()} yet`}
            </Text>
            <Text style={styles.emptyRoleSubtext}>
              {isPending
                ? 'New registrations will appear here'
                : 'Users with this role will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {users.map((user) => (
              <UserCard
                key={user.user_id}
                user={user}
                isDesktop={isDesktop}
                showApproveButton={isPending && canApprove}
                onApprove={onApprove}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};


/**
 * UsersScreen Component
 *
 * Renders the Users page with real data from Supabase.
 * Admin sees all role sections + scouts; Area Director sees Counselors + Scouts.
 * DEV users can approve pending users by assigning them a role.
 */
export const UsersScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;
  const canApprove = canApproveUsers(userRole);
  const assignableRoles = getAssignableRoles(userRole);

  const [users, setUsers] = useState<DbUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for role assignment
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /** Fetch all users from Supabase */
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('user_id, user_email, user_first_name, user_last_name, user_role, crtn_date')
        .order('user_first_name', { ascending: true });

      if (fetchError) throw fetchError;
      setUsers(data || []);
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

  /** Open the role assignment modal */
  const handleApproveUser = (user: DbUser) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  /** Assign a role to the selected user */
  const handleAssignRole = async (newRole: UserRole) => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_role: newRole })
        .eq('user_id', selectedUser.user_id);

      if (updateError) throw updateError;

      // Refresh the user list
      await fetchData();
      setIsModalVisible(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      Alert.alert('Error', 'Failed to update user role. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /** Filter sections based on user role */
  const visibleSections = useMemo(() => {
    if (userRole === 'AREA_DIRECTOR') {
      // Area Directors see Pending + Counselors (can approve counselors)
      return ROLE_SECTIONS.filter((s) => s.role === 'PENDING' || s.role === 'COUNSELOR');
    }
    if (userRole === 'COUNSELOR') {
      // Counselors see Pending + Counselors (can only approve as counselor)
      return ROLE_SECTIONS.filter((s) => s.role === 'PENDING' || s.role === 'COUNSELOR');
    }
    // Admins see all sections
    return ROLE_SECTIONS;
  }, [userRole]);

  /** Group users by role */
  const usersByRole = useMemo(() => {
    return ROLE_SECTIONS.reduce((acc, config) => {
      acc[config.role] = users.filter((u) => u.user_role === config.role);
      return acc;
    }, {} as Record<UserRole, DbUser[]>);
  }, [users]);

  const pendingCount = usersByRole['PENDING']?.length || 0;
  const subtitle =
    userRole === 'AREA_DIRECTOR'
      ? 'View counselors'
      : pendingCount > 0
      ? `${pendingCount} user${pendingCount > 1 ? 's' : ''} pending approval`
      : 'Manage all users';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Users</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
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
          {visibleSections.map((config) => (
            <RoleSection
              key={config.role}
              config={config}
              users={usersByRole[config.role] || []}
              isDesktop={isDesktop}
              canApprove={canApprove}
              onApprove={handleApproveUser}
            />
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Role Assignment Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Role</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsModalVisible(false)}
                disabled={isUpdating}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <Text style={styles.modalSubtitle}>
                Select a role for {selectedUser.user_first_name} {selectedUser.user_last_name}
              </Text>
            )}

            {isUpdating ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.modalLoadingText}>Updating role...</Text>
              </View>
            ) : (
              <View style={styles.roleOptions}>
                {assignableRoles.map((roleConfig) => (
                  <TouchableOpacity
                    key={roleConfig.role}
                    style={styles.roleOption}
                    onPress={() => handleAssignRole(roleConfig.role)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.roleOptionIcon,
                        { backgroundColor: roleConfig.color + '20' },
                      ]}
                    >
                      <Ionicons
                        name={roleConfig.icon}
                        size={22}
                        color={roleConfig.color}
                      />
                    </View>
                    <View style={styles.roleOptionText}>
                      <Text style={styles.roleOptionLabel}>{roleConfig.label}</Text>
                      <Text style={styles.roleOptionDesc}>{roleConfig.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
