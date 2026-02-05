/**
 * types/index.ts - TypeScript Type Definitions
 *
 * This file contains all the TypeScript interfaces and types used in the app.
 * Having them in one place makes it easy to:
 * - See the structure of our data
 * - Reuse types across different files
 * - Get autocomplete and error checking in our IDE
 *
 * Note: These types should match our Supabase database schema!
 */

// ============================================================================
// User & Role Types
// ============================================================================

/**
 * UserRole - The different types of users in our system
 * - admin: Camp administrator with full access to everything
 * - counselor: Camp staff who teach merit badge classes
 * - scout_leader: Adult troop leaders who bring scouts to camp
 * - scout: Youth members working on merit badges
 */
export type UserRole = 'admin' | 'counselor' | 'scout_leader' | 'scout';

/**
 * Base User type - common fields for all users
 * This matches the 'users' table in our database
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;    // Optional profile picture
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Scout-Related Types
// ============================================================================

/**
 * Scout - Youth member working on merit badges
 * Extends User with scout-specific fields
 */
export interface Scout extends User {
  role: 'scout';
  troopNumber: string;
  rank: ScoutRank;
  dateOfBirth: string;
  parentGuardianName: string;
  parentGuardianPhone: string;
  parentGuardianEmail: string;
}

/**
 * ScoutRank - The ranks a scout can achieve
 * Listed in order from beginning to Eagle Scout
 */
export type ScoutRank =
  | 'scout'
  | 'tenderfoot'
  | 'second_class'
  | 'first_class'
  | 'star'
  | 'life'
  | 'eagle';

// ============================================================================
// Staff Types
// ============================================================================

/**
 * Counselor - Camp staff member who teaches merit badge classes
 */
export interface Counselor extends User {
  role: 'counselor';
  specializations: string[]; // Merit badge areas they can teach
  yearsExperience: number;
}

/**
 * Admin - Camp administrator with full system access
 */
export interface Admin extends User {
  role: 'admin';
  permissions: AdminPermission[];
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

// ============================================================================
// Merit Badge Types
// ============================================================================

/**
 * MeritBadge - A merit badge that scouts can earn
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

// ============================================================================
// Progress Tracking Types
// ============================================================================

/**
 * BadgeProgress - Tracks a scout's progress on a specific badge
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

// ============================================================================
// Camp Session & Scheduling Types
// ============================================================================

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
  maxCapacity: number;   // Maximum number of scouts
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
 * Enrollment - A scout's enrollment in an activity
 */
export interface Enrollment {
  id: string;
  scoutId: string;
  activityId: string;
  status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed';
  enrolledAt: string;
}

/**
 * Attendance - Daily attendance record for enrolled scouts
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

// ============================================================================
// Navigation Types (React Navigation)
// ============================================================================

/**
 * These types define the screens in each navigation stack
 * TypeScript uses these to ensure we navigate to valid screens
 * and pass the correct parameters
 */

// Root level navigation - switches between auth and main app
export type RootStackParamList = {
  Auth: undefined;              // No params needed
  AdminDashboard: undefined;
  CounselorDashboard: undefined;
  StudentDashboard: undefined;
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
  Badges: undefined;
  Schedule: undefined;
  Reports: undefined;
  Settings: undefined;
};

// Counselor tab navigation
export type CounselorTabParamList = {
  Dashboard: undefined;
  MyActivities: undefined;
  Attendance: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Scout/Student tab navigation
export type StudentTabParamList = {
  Dashboard: undefined;
  MyBadges: undefined;
  Schedule: undefined;
  Progress: undefined;
  Profile: undefined;
};
