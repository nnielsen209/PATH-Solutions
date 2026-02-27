/**
 * types/index.ts - TypeScript Type Definitions
 *
 * Central place for all shared types (users, roles, badges, navigation, etc.).
 * Keeping them here gives us autocomplete and type checking across the app;
 * these should stay in sync with the Supabase database schema.
 */

/**
 * Layout Constants
 */
export const TABLET_BREAKPOINT = 768;

/**
 * UserRole - The five roles in the app. Used for login routing and permissions.
 * - dev: Developer with all admin permissions plus dev-specific features (persona switching)
 * - admin: Camp administrator with full access
 * - counselor: Camp staff member
 * - areadirector: Area director overseeing operations
 * - scout: Scout/participant
 */
export type UserRole = 'dev' | 'admin' | 'counselor' | 'areadirector' | 'scout';

/**
 * Check if a role has admin-level access (dev or admin).
 * Use this instead of `role === 'admin'` to support permission inheritance.
 */
export const hasAdminAccess = (role: UserRole | null): boolean => {
  return role === 'admin' || role === 'dev';
};

/**
 * Base User type - common fields for all users
 * This matches the 'users' table in our database
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userRole: UserRole;
  avatarUrl?: string;    // Optional profile picture
  createdAt: string;
  updatedAt: string;
}

/**
 * Counselor - Camp staff member who teaches merit badge classes
 */
export interface Counselor extends User {
  userRole: 'counselor';
  specializations: string[]; // Merit badge areas they can teach
  yearsExperience: number;
}

/**
 * Admin - Camp administrator with full system access
 */
export interface Admin extends User {
  userRole: 'admin';
  permissions: AdminPermission[];
}

/**
 * AreaDirector - Area director overseeing camp operations
 */
export interface AreaDirector extends User {
  userRole: 'areadirector';
  areaName?: string;
}

/**
 * AdminPermission - Specific permissions an admin can have
 * This allows for granular access control if needed
 */
export type AdminPermission =
  | 'manage_users'
  | 'manage_badges'
  | 'manage_schedule'
  | 'view_reports'
  | 'manage_settings';

/** Merit badges, categories, requirements, and prerequisites. */
/**
 * MeritBadge - A merit badge that participants can earn
 * Contains all the requirements and prerequisites
 */
export interface MeritBadge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: BadgeCategory;
  requirements: Requirement[];
  prerequisites: Prerequisite[];
  isEagleRequired: boolean; // True if required for Eagle Scout rank
}

/**
 * BadgeCategory - Categories to organize merit badges
 * Based on official Scouting America categories
 */
export type BadgeCategory =
  | 'aquatics'
  | 'citizenship'
  | 'communication'
  | 'emergency_preparedness'
  | 'environment'
  | 'fitness'
  | 'nature'
  | 'outdoor_skills'
  | 'safety'
  | 'sports'
  | 'trades';

/**
 * Requirement - A single requirement for a merit badge
 * Requirements can be numbered like "1", "2a", "2b", etc.
 */
export interface Requirement {
  id: string;
  badgeId: string;
  number: string;            // e.g., "1", "2a", "2b"
  description: string;
  parentRequirementId?: string; // For sub-requirements (like 2a under 2)
}

/**
 * Prerequisite - Something required before starting a badge
 * Could be another badge, a certain rank, age, or skill
 */
export interface Prerequisite {
  id: string;
  badgeId: string;
  type: 'badge' | 'rank' | 'age' | 'skill';
  value: string; // Badge ID, rank name, minimum age, or skill name
  description: string;
}

/** Progress on badges and individual requirements. */
/**
 * BadgeProgress - Tracks a participant's progress on a specific badge
 */
export interface BadgeProgress {
  id: string;
  scoutId: string;
  badgeId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  counselorId?: string; // Counselor who signed off on completion
}

/**
 * RequirementProgress - Tracks completion of individual requirements
 */
export interface RequirementProgress {
  id: string;
  badgeProgressId: string;
  requirementId: string;
  completed: boolean;
  completedAt?: string;
  counselorId?: string;
  notes?: string; // Counselor can add notes about completion
}

/** Camp sessions, activities, enrollment, and attendance. */
/**
 * CampSession - A week-long camp session
 * Camp Geiger runs multiple sessions each summer
 */
export interface CampSession {
  id: string;
  name: string;       // e.g., "Week 1", "Week 2"
  startDate: string;
  endDate: string;
  year: number;
  isActive: boolean;  // True if this is the current session
}

/**
 * Activity - A scheduled merit badge class
 */
export interface Activity {
  id: string;
  sessionId: string;
  badgeId: string;
  counselorId: string;
  name: string;
  location: string;      // Where the class meets
  maxCapacity: number;   // Maximum number of participants
  schedule: ActivitySchedule[];
}

/**
 * ActivitySchedule - When an activity meets
 * Activities can meet multiple times per week
 */
export interface ActivitySchedule {
  id: string;
  activityId: string;
  dayOfWeek: number;   // 0 = Sunday, 1 = Monday, etc.
  startTime: string;   // HH:MM format
  endTime: string;
}

/**
 * Enrollment - A participant's enrollment in an activity
 */
export interface Enrollment {
  id: string;
  scoutId: string;
  activityId: string;
  status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed';
  enrolledAt: string;
}

/**
 * Attendance - Daily attendance record for enrolled participants
 */
export interface Attendance {
  id: string;
  enrollmentId: string;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
  markedBy: string;    // Counselor ID who took attendance
  markedAt: string;
}

/**
 * Navigation Types
 *
 * Param lists for each navigator so we get type-safe screen names and params.
 */
/** Root level: auth vs which dashboard to show. */
export type RootStackParamList = {
  Auth: undefined;              // No params needed
  AdminDashboard: undefined;
  CounselorDashboard: undefined;
};

// Authentication screens (login, register, etc.)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Admin tab navigation
export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Programs: undefined;
  Schedule: undefined;
  Reports: undefined;
  Settings: undefined;
};

// Counselor tab navigation
export type CounselorTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  MyActivities: undefined;
  Attendance: undefined;
  Progress: undefined;
  Profile: undefined;
};


// Area Director tab navigation (same structure as Admin)
export type AreaDirectorTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Programs: undefined;
  Schedule: undefined;
  Reports: undefined;
  Settings: undefined;
};

// Dev tab navigation
export type DevTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Programs: undefined;
  Schedule: undefined;
  Reports: undefined;
  Settings: undefined;
};
