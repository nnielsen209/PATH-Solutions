/**
 * UsersScreen.tsx - User Management (Admin & Area Director)
 *
 * Admin: sees all role sections (Admins, Counselors, Area Directors).
 * Area Director: sees only the Counselors section.
 * Each section has a count and Add button; list area is placeholder until
 * we connect to the users table in Supabase.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole, TABLET_BREAKPOINT } from '../../types';
import { useAuth } from '../../context/AuthContext';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;

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
    role: 'counselor',
    label: 'Counselors',
    description: 'Camp staff who teach merit badge classes',
    icon: 'people',
    color: '#059669',
  },
  {
    role: 'area_director',
    label: 'Area Directors',
    description: 'Area directors overseeing camp operations',
    icon: 'business',
    color: '#2563eb',
  },
];

/**
 * RoleSection - One card per role (Admins, Counselors, Area Directors).
 * Shows icon, title, description, count badge, and optional Add button.
 */
type RoleSectionProps = {
  config: RoleSectionConfig;
  count: number;
  isDesktop: boolean;
  onAddUser?: (role: UserRole) => void;
};

const RoleSection = ({ config, count, isDesktop, onAddUser }: RoleSectionProps) => {
  const { label, description, icon, color, role } = config;
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
          <View style={styles.sectionMeta}>
            <View style={[styles.countBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.countText, { color }]}>{count}</Text>
            </View>
            {onAddUser && (
              <TouchableOpacity
                style={[styles.addButton, { borderColor: color }]}
                onPress={() => onAddUser(role)}
              >
                <Ionicons name="person-add" size={18} color={color} />
                <Text style={[styles.addButtonText, { color }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {count === 0 ? (
          <View style={styles.emptyRole}>
            <Ionicons name={icon} size={40} color="#d1d5db" />
            <Text style={styles.emptyRoleText}>No {label.toLowerCase()} yet</Text>
            <Text style={styles.emptyRoleSubtext}>
              Users with this role will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderList}>
            <Text style={styles.placeholderListText}>User list will load here</Text>
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * UsersScreen Component
 *
 * Renders the Users page. Admin sees all role sections; Area Director sees
 * only Counselors. Header and subtitle reflect the viewer's role.
 */
export const UsersScreen = () => {
  const { width } = useWindowDimensions();
  const { userRole } = useAuth();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const visibleSections = useMemo(() => {
    if (userRole === 'area_director') {
      return ROLE_SECTIONS.filter((s) => s.role === 'counselor');
    }
    return ROLE_SECTIONS;
  }, [userRole]);

  const countsByRole: Record<UserRole, number> = {
    dev: 0,
    admin: 0,
    counselor: 0,
    area_director: 0,
  };

  const handleAddUser = (role: UserRole) => {
    // TODO: Navigate to add-user flow or open modal with role pre-selected
  };

  const subtitle =
    userRole === 'area_director'
      ? 'View and manage counselors'
      : 'Manage users by role';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Users</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: contentPadding }, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {visibleSections.map((config) => (
          <RoleSection
            key={config.role}
            config={config}
            count={countsByRole[config.role]}
            isDesktop={isDesktop}
            onAddUser={userRole === 'admin' ? handleAddUser : undefined}
          />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
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
    minHeight: 100,
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
  placeholderList: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  placeholderListText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
