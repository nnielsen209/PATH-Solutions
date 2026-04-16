/**
 * @file UsersScreen.tsx
 * @description Developer-only user management screen with role switching and testing controls.
 *
 * This screen displays:
 * - all registered users fetched from Supabase
 * - users grouped by assigned application role
 * - role-based summary counts for quick inspection
 * - a modal interface for changing user roles during testing
 *
 * User records are loaded from the `users` table and organized into
 * role sections such as pending, developer, admin, area director,
 * and counselor. Developers can tap any user to open a role picker
 * modal and update that user's role directly in the database.
 *
 * This screen is intended for development and QA workflows, making it
 * easier to test permissions, dashboards, and user-specific experiences
 * across multiple roles. The layout is responsive for both mobile and
 * desktop screen sizes.
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
import { UserRole } from '../../types';
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
    role: 'PENDING',
    label: 'Pending Approval',
    description: 'New users awaiting role assignment',
    icon: 'time',
    color: '#f59e0b',
  },
  {
    role: 'DEV',
    label: 'Developers',
    description: 'Developers with full access and role switching',
    icon: 'code-slash',
    color: '#7c3aed',
  },
  {
    role: 'ADMIN',
    label: 'Admins',
    description: 'Camp administrators with full access',
    icon: 'shield-checkmark',
    color: '#dc2626',
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
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  /** Fetch all users from Supabase */
  const fetchData = useCallback(async () => {
    try {
      setError(null);

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

  /** Group users by role */
  const usersByRole = ROLE_SECTIONS.reduce((acc, config) => {
    acc[config.role] = users.filter((u) => u.user_role === config.role);
    return acc;
  }, {} as Record<UserRole, DbUser[]>);

  const pendingCount = usersByRole['PENDING']?.length || 0;

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
            {pendingCount > 0
              ? `${pendingCount} user${pendingCount > 1 ? 's' : ''} pending approval - tap to assign role`
              : 'Tap any user to change their role for testing'}
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
            {ROLE_SECTIONS.map((config) => (
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
    </SafeAreaView>
  );
};
