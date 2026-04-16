/**
 * @file UsersScreen.tsx
 * @description
 * Administrative user management screen for viewing and approving user accounts.
 *
 * This screen retrieves user records from Supabase, groups them by role,
 * and displays them in organized sections. Users with sufficient privileges
 * can approve pending accounts by assigning a role.
 *
 * Access behavior:
 * - Admin users can view all supported role sections.
 * - Area Directors can view pending users and counselors only.
 * - Counselors can view pending users and counselors only.
 *
 * Scouts and campers are managed in a separate screen.
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

/**
 * Represents a user record returned from the Supabase `users` table.
 */
interface DbUser {
  /** Unique identifier for the user. */
  user_id: string;

  /** User email address. */
  user_email: string;

  /** User first name. */
  user_first_name: string;

  /** User last name. */
  user_last_name: string;

  /** Current application role assigned to the user. */
  user_role: UserRole;

  /** Record creation date stored in the database. */
  crtn_date: string;
}

/**
 * Defines the UI configuration for a role section.
 */
type RoleSectionConfig = {
  /** Role represented by the section. */
  role: UserRole;

  /** Display label shown in the section header. */
  label: string;

  /** Short description explaining the section purpose. */
  description: string;

  /** Ionicons icon name used in the section header. */
  icon: keyof typeof Ionicons.glyphMap;

  /** Accent color used for badges and icons in the section. */
  color: string;
};

/**
 * Static display configuration for each supported role section.
 */
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

/**
 * Ordered role hierarchy from highest privilege to lowest privilege.
 *
 * Lower index means greater authority.
 */
const ROLE_HIERARCHY: UserRole[] = ['DEV', 'ADMIN', 'AREA_DIRECTOR', 'COUNSELOR'];

/**
 * Returns the list of roles the current user is allowed to assign.
 *
 * Rules:
 * - DEV can assign roles from ADMIN downward.
 * - Other authorized users can assign roles at their own level and below.
 * - PENDING is excluded from assignable roles.
 *
 * @param currentUserRole The role of the currently authenticated user.
 * @returns A filtered list of role section configurations the user may assign.
 */
const getAssignableRoles = (currentUserRole: UserRole | null): RoleSectionConfig[] => {
  if (!currentUserRole) return [];

  const currentRoleIndex = ROLE_HIERARCHY.indexOf(currentUserRole);
  if (currentRoleIndex === -1) return [];

  const assignableRoleNames = ROLE_HIERARCHY.slice(
    currentUserRole === 'DEV' ? 1 : currentRoleIndex,
  );

  return ROLE_SECTIONS.filter(
    (section) => section.role !== 'PENDING' && assignableRoleNames.includes(section.role)
  );
};

/**
 * Determines whether a user role has permission to approve pending users.
 *
 * @param role The authenticated user's role.
 * @returns True if the role is included in the approval hierarchy.
 */
const canApproveUsers = (role: UserRole | null): boolean => {
  return role !== null && ROLE_HIERARCHY.includes(role);
};

/**
 * Returns the display configuration for a given role.
 *
 * If no exact match is found, the first section configuration is returned
 * as a fallback.
 *
 * @param role The role to look up.
 * @returns The matching role section configuration.
 */
const getRoleConfig = (role: UserRole): RoleSectionConfig => {
  return ROLE_SECTIONS.find((section) => section.role === role) || ROLE_SECTIONS[0];
};

/**
 * Props for the {@link UserCard} component.
 */
type UserCardProps = {
  /** User record displayed in the card. */
  user: DbUser;

  /** Indicates whether the layout is in desktop mode. */
  isDesktop: boolean;

  /** Whether the approve button should be shown. */
  showApproveButton?: boolean;

  /** Callback fired when the approve button is pressed. */
  onApprove?: (user: DbUser) => void;
};

/**
 * Displays a single user entry with avatar, name, email, and optional approval action.
 *
 * @param props Component props.
 * @returns Rendered user card component.
 */
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
 * Props for the {@link RoleSection} component.
 */
type RoleSectionProps = {
  /** Section configuration describing the role group. */
  config: RoleSectionConfig;

  /** Users belonging to the section role. */
  users: DbUser[];

  /** Indicates whether the layout is in desktop mode. */
  isDesktop: boolean;

  /** Whether approval actions should be enabled in this section. */
  canApprove?: boolean;

  /** Callback fired when a pending user should be approved. */
  onApprove?: (user: DbUser) => void;
};

/**
 * Renders a full role-based section card containing grouped users.
 *
 * If the section has no users, an empty state message is shown instead.
 *
 * @param props Component props.
 * @returns Rendered role section component.
 */
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
 * Main user management screen.
 *
 * This component:
 * - fetches users from Supabase
 * - groups users by role
 * - filters visible sections based on the authenticated user's role
 * - allows privileged users to approve pending accounts
 *
 * @returns Rendered users management screen.
 */
export const UsersScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();

  /** True when the current screen width meets the desktop breakpoint. */
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  /** Horizontal padding applied to scroll content based on screen size. */
  const contentPadding = isDesktop ? 32 : 20;

  /** Whether the current user can approve pending users. */
  const canApprove = canApproveUsers(userRole);

  /** Roles the current user is allowed to assign. */
  const assignableRoles = getAssignableRoles(userRole);

  /** Full collection of users returned from Supabase. */
  const [users, setUsers] = useState<DbUser[]>([]);

  /** Loading state for the initial and refresh fetch operations. */
  const [isLoading, setIsLoading] = useState(true);

  /** Error message shown when loading fails. */
  const [error, setError] = useState<string | null>(null);

  /** User currently selected for role assignment in the modal. */
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);

  /** Controls visibility of the role assignment modal. */
  const [isModalVisible, setIsModalVisible] = useState(false);

  /** Loading state used while a role update request is in progress. */
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Fetches all users from the Supabase `users` table and sorts them by first name.
   *
   * If the request fails, an error message is shown in the UI.
   *
   * @returns Promise that resolves when the fetch completes.
   */
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

  /**
   * Loads user data when the screen first mounts.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Opens the role assignment modal for a selected pending user.
   *
   * @param user The user selected for approval.
   */
  const handleApproveUser = (user: DbUser) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  /**
   * Updates the selected user's role in Supabase.
   *
   * After a successful update, the user list is refreshed and the modal closes.
   * If the update fails, an alert is shown.
   *
   * @param newRole The role to assign to the selected user.
   * @returns Promise that resolves when the update flow completes.
   */
  const handleAssignRole = async (newRole: UserRole) => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_role: newRole })
        .eq('user_id', selectedUser.user_id);

      if (updateError) throw updateError;

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

  /**
   * Returns the role sections visible to the current user.
   *
   * Visibility rules depend on the authenticated user's role.
   */
  const visibleSections = useMemo(() => {
    if (userRole === 'AREA_DIRECTOR') {
      return ROLE_SECTIONS.filter((section) =>
        section.role === 'PENDING' || section.role === 'COUNSELOR'
      );
    }

    if (userRole === 'COUNSELOR') {
      return ROLE_SECTIONS.filter((section) =>
        section.role === 'PENDING' || section.role === 'COUNSELOR'
      );
    }

    return ROLE_SECTIONS;
  }, [userRole]);

  /**
   * Groups all fetched users by role for display in each section.
   */
  const usersByRole = useMemo(() => {
    return ROLE_SECTIONS.reduce((acc, config) => {
      acc[config.role] = users.filter((user) => user.user_role === config.role);
      return acc;
    }, {} as Record<UserRole, DbUser[]>);
  }, [users]);

  /** Number of pending users waiting for approval. */
  const pendingCount = usersByRole['PENDING']?.length || 0;

  /**
   * Subtitle shown below the screen heading.
   * The subtitle changes depending on the current user's role and pending count.
   */
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
