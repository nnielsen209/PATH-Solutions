/**
 * UsersScreen.tsx - Counselor Staff View
 *
 * Fetches counselor users from Supabase for counselors to view.
 * Shows other counselors only.
 * Read-only view.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types';
import { supabase } from '../../services/supabase';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/UsersStyles';

const ACCENT_COLOR = '#d97706'; // Orange accent for counselor

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

const ROLE_SECTIONS: RoleSectionConfig[] = [
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
 * UserCard - Displays a single user
 */
type UserCardProps = {
  user: DbUser;
  isDesktop: boolean;
};

const UserCard = ({ user, isDesktop }: UserCardProps) => {
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
};

const RoleSection = ({ config, users, isDesktop }: RoleSectionProps) => {
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
            <Text style={styles.emptyRoleSubtext}>
              Users with this role will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {users.map((user) => (
              <UserCard
                key={user.user_id}
                user={user}
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
 * CounselorUsersScreen Component
 *
 * Shows staff users for counselors.
 * Read-only view.
 */
export const CounselorUsersScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [users, setUsers] = useState<DbUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch users from Supabase */
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('user_id, user_email, user_first_name, user_last_name, user_role, crtn_date')
        .eq('user_role', 'COUNSELOR')
        .order('user_first_name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** Group users by role */
  const usersByRole = useMemo(() => {
    return ROLE_SECTIONS.reduce((acc, config) => {
      acc[config.role] = users.filter((u) => u.user_role === config.role);
      return acc;
    }, {} as Record<UserRole, DbUser[]>);
  }, [users]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Users</Text>
          <Text style={styles.subtitle}>View other counselors</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
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
          {ROLE_SECTIONS.map((config) => (
            <RoleSection
              key={config.role}
              config={config}
              users={usersByRole[config.role] || []}
              isDesktop={isDesktop}
            />
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
