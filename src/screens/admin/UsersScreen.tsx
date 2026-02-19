/**
 * UsersScreen.tsx - User Management (Admin & Area Director)
 *
 * Fetches real user data from Supabase and displays users grouped by role.
 * Also fetches scouts from the scout table.
 * Admin sees all sections; Area Director sees Counselors and Scouts.
 * Admin and Area Director can add scouts only.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { UserRole, TABLET_BREAKPOINT } from '../../types';
import { useAuth } from '../../context/AuthContext';
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
    role: 'admin',
    label: 'Admins',
    description: 'Camp administrators with full access',
    icon: 'shield-checkmark',
    color: '#7c3aed',
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
 * UserCard - Displays a single user (read-only)
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
 * ScoutsSection - Shows scouts from the scout table with Add button
 */
type ScoutsSectionProps = {
  scouts: DbScout[];
  isDesktop: boolean;
  canAdd: boolean;
  onAddScout: () => void;
};

const ScoutsSection = ({ scouts, isDesktop, canAdd, onAddScout }: ScoutsSectionProps) => {
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
            <Text style={styles.sectionDescription}>Scout participants</Text>
          </View>
          <View style={styles.sectionMeta}>
            <View style={[styles.countBadge, { backgroundColor: '#d9770620' }]}>
              <Text style={[styles.countText, { color: '#d97706' }]}>{scouts.length}</Text>
            </View>
            {canAdd && (
              <TouchableOpacity
                style={[styles.addButton, { borderColor: '#d97706' }]}
                onPress={onAddScout}
              >
                <Ionicons name="person-add" size={18} color="#d97706" />
                <Text style={[styles.addButtonText, { color: '#d97706' }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {scouts.length === 0 ? (
          <View style={styles.emptyRole}>
            <Ionicons name="person" size={40} color="#d1d5db" />
            <Text style={styles.emptyRoleText}>No scouts yet</Text>
            <Text style={styles.emptyRoleSubtext}>
              {canAdd ? 'Click "Add" to add a scout' : 'Scouts will appear here'}
            </Text>
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
 * UsersScreen Component
 *
 * Renders the Users page with real data from Supabase.
 * Admin sees all role sections + scouts; Area Director sees Counselors + Scouts.
 */
export const UsersScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [users, setUsers] = useState<DbUser[]>([]);
  const [scouts, setScouts] = useState<DbScout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddScoutModal, setShowAddScoutModal] = useState(false);

  /** Fetch all users and scouts from Supabase */
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch users and scouts in parallel
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

  /** Filter sections based on user role */
  const visibleSections = useMemo(() => {
    if (userRole === 'areadirector') {
      // Area Directors see Counselors only (scouts handled separately)
      return ROLE_SECTIONS.filter((s) => s.role === 'counselor');
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

  // Admin and Area Director can add scouts
  const canAddScout = userRole === 'admin' || userRole === 'areadirector';

  const handleAddScoutSuccess = () => {
    setShowAddScoutModal(false);
    fetchData(); // Refresh the data
  };

  const subtitle =
    userRole === 'areadirector'
      ? 'View counselors and manage scouts'
      : 'Manage users and scouts';

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
            />
          ))}

          {/* Scouts Section - Always visible for admin and area director */}
          <ScoutsSection
            scouts={scouts}
            isDesktop={isDesktop}
            canAdd={canAddScout}
            onAddScout={() => setShowAddScoutModal(true)}
          />

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

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
    backgroundColor: '#2563eb',
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
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
});
