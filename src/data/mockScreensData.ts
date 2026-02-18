/**
 * Mock data for non-dashboard screens (Users, Badges, Schedule, Reports,
 * My Activities, Attendance, Progress, Counselor Users, Settings).
 * All screens pull from here so users see consistent sample data.
 */

import { UserRole } from '../types';

/** Single user row for Users screen list */
export interface MockUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** Users by role for Admin/Area Director UsersScreen */
export const MOCK_USERS_BY_ROLE: Record<UserRole, MockUserRow[]> = {
  admin: [
    { id: 'a1', name: 'Sarah Chen', email: 'sarah.chen@campgeiger.org', role: 'admin' },
    { id: 'a2', name: 'Mike Torres', email: 'mike.torres@campgeiger.org', role: 'admin' },
  ],
  counselor: [
    { id: 'c1', name: 'Jamie Martinez', email: 'jamie.m@campgeiger.org', role: 'counselor' },
    { id: 'c2', name: 'Alex Rivera', email: 'alex.r@campgeiger.org', role: 'counselor' },
    { id: 'c3', name: 'Jordan Lee', email: 'jordan.lee@campgeiger.org', role: 'counselor' },
    { id: 'c4', name: 'Sam Davis', email: 'sam.davis@campgeiger.org', role: 'counselor' },
    { id: 'c5', name: 'Morgan Kim', email: 'morgan.k@campgeiger.org', role: 'counselor' },
    { id: 'c6', name: 'Riley Johnson', email: 'riley.j@campgeiger.org', role: 'counselor' },
  ],
  area_director: [
    { id: 'd1', name: 'Chris Walsh', email: 'chris.walsh@campgeiger.org', role: 'area_director' },
    { id: 'd2', name: 'Pat Nguyen', email: 'pat.nguyen@campgeiger.org', role: 'area_director' },
  ],
};

/** Merit badge row for BadgesScreen */
export interface MockBadgeRow {
  id: string;
  name: string;
  category: string;
  requirementsCount: number;
}

export const MOCK_BADGES: MockBadgeRow[] = [
  { id: 'b1', name: 'First Aid', category: 'Emergency Preparedness', requirementsCount: 12 },
  { id: 'b2', name: 'Swimming', category: 'Aquatics', requirementsCount: 8 },
  { id: 'b3', name: 'Lifesaving', category: 'Aquatics', requirementsCount: 10 },
  { id: 'b4', name: 'Cooking', category: 'Life Skills', requirementsCount: 9 },
  { id: 'b5', name: 'Camping', category: 'Outdoor Skills', requirementsCount: 9 },
  { id: 'b6', name: 'Environmental Science', category: 'Nature', requirementsCount: 7 },
  { id: 'b7', name: 'Citizenship in the Community', category: 'Citizenship', requirementsCount: 8 },
  { id: 'b8', name: 'Personal Fitness', category: 'Fitness', requirementsCount: 8 },
];

/** Camp session row for ScheduleScreen */
export interface MockSessionRow {
  id: string;
  name: string;
  dateRange: string;
  year: number;
  activityCount: number;
}

export const MOCK_SESSIONS: MockSessionRow[] = [
  { id: 's1', name: 'Week 1', dateRange: 'Jun 2 – Jun 8', year: 2025, activityCount: 12 },
  { id: 's2', name: 'Week 2', dateRange: 'Jun 9 – Jun 15', year: 2025, activityCount: 14 },
  { id: 's3', name: 'Week 3', dateRange: 'Jun 16 – Jun 22', year: 2025, activityCount: 12 },
];

/** Report row for ReportsScreen */
export interface MockReportRow {
  id: string;
  title: string;
  subtitle: string;
  generatedAt: string;
}

export const MOCK_REPORTS: MockReportRow[] = [
  { id: 'r1', title: 'Attendance summary — Week 2', subtitle: 'By session and activity', generatedAt: 'Today, 10:30 AM' },
  { id: 'r2', title: 'Badge progress — June 2025', subtitle: 'Completions and partials', generatedAt: 'Yesterday' },
  { id: 'r3', title: 'Camp overview', subtitle: 'Participants and capacity', generatedAt: 'Jun 1, 2025' },
];

/** Counselor activity row for MyActivitiesScreen */
export interface MockActivityRow {
  id: string;
  name: string;
  badgeName: string;
  schedule: string;
  location: string;
  enrolled: number;
  maxCapacity: number;
}

export const MOCK_COUNSELOR_ACTIVITIES: MockActivityRow[] = [
  { id: 'ca1', name: 'Swimming — Week 2', badgeName: 'Swimming', schedule: 'Mon/Wed/Fri 2:00 PM', location: 'Pool', enrolled: 14, maxCapacity: 16 },
  { id: 'ca2', name: 'First Aid — Week 2', badgeName: 'First Aid', schedule: 'Tue/Thu 10:00 AM', location: 'Health Lodge', enrolled: 10, maxCapacity: 12 },
  { id: 'ca3', name: 'Lifesaving — Week 3', badgeName: 'Lifesaving', schedule: 'Mon/Wed 3:00 PM', location: 'Pool', enrolled: 6, maxCapacity: 8 },
  { id: 'ca4', name: 'Swimming — Week 3', badgeName: 'Swimming', schedule: 'Tue/Thu 2:00 PM', location: 'Pool', enrolled: 12, maxCapacity: 16 },
];

/** Attendance row (activity to take attendance for) */
export interface MockAttendanceRow {
  id: string;
  activityName: string;
  date: string;
  present: number;
  absent: number;
  total: number;
}

export const MOCK_ATTENDANCE_LIST: MockAttendanceRow[] = [
  { id: 'at1', activityName: 'Swimming — Week 2', date: 'Today', present: 14, absent: 0, total: 14 },
  { id: 'at2', activityName: 'First Aid — Week 2', date: 'Yesterday', present: 9, absent: 1, total: 10 },
  { id: 'at3', activityName: 'Lifesaving — Week 3', date: 'Mon', present: 6, absent: 0, total: 6 },
];

/** Progress-to-review row for ProgressScreen */
export interface MockProgressRow {
  id: string;
  scoutName: string;
  badgeName: string;
  requirement: string;
  submittedAt: string;
}

export const MOCK_PROGRESS_ITEMS: MockProgressRow[] = [
  { id: 'p1', scoutName: 'J. Smith', badgeName: 'First Aid', requirement: 'Req 6 — First aid for choking', submittedAt: '1 hour ago' },
  { id: 'p2', scoutName: 'T. Williams', badgeName: 'Swimming', requirement: 'Req 3 — 100 yd swim', submittedAt: '2 hours ago' },
  { id: 'p3', scoutName: 'M. Garcia', badgeName: 'First Aid', requirement: 'Req 7 — Shock and AED', submittedAt: 'Yesterday' },
  { id: 'p4', scoutName: 'A. Brown', badgeName: 'Lifesaving', requirement: 'Req 4 — Rescue carry', submittedAt: 'Yesterday' },
  { id: 'p5', scoutName: 'K. Johnson', badgeName: 'First Aid', requirement: 'Req 5 — Bleeding', submittedAt: '2 days ago' },
  { id: 'p6', scoutName: 'D. Lee', badgeName: 'Swimming', requirement: 'Req 5 — Different strokes', submittedAt: '2 days ago' },
  { id: 'p7', scoutName: 'C. Davis', badgeName: 'Cooking', requirement: 'Req 2 — Meal plan', submittedAt: '3 days ago' },
];

/** Counselor Users screen: participants/contacts */
export interface MockParticipantRow {
  id: string;
  name: string;
  troop: string;
  roleLabel: string;
}

export const MOCK_COUNSELOR_PARTICIPANTS: MockParticipantRow[] = [
  { id: 'cp1', name: 'James Smith', troop: 'Troop 101', roleLabel: 'Scout' },
  { id: 'cp2', name: 'Tyrell Williams', troop: 'Troop 101', roleLabel: 'Scout' },
  { id: 'cp3', name: 'Marcus Garcia', troop: 'Troop 204', roleLabel: 'Scout' },
  { id: 'cp4', name: 'Adam Brown', troop: 'Troop 101', roleLabel: 'Scout' },
  { id: 'cp5', name: 'Kai Johnson', troop: 'Troop 312', roleLabel: 'Scout' },
  { id: 'cp6', name: 'David Lee', troop: 'Troop 204', roleLabel: 'Scout' },
];

/** Settings screen: config rows */
export interface MockSettingRow {
  id: string;
  label: string;
  value: string;
}

export const MOCK_SETTINGS: MockSettingRow[] = [
  { id: 'set1', label: 'Camp name', value: 'Camp Geiger' },
  { id: 'set2', label: 'Contact email', value: 'admin@campgeiger.org' },
  { id: 'set3', label: 'Default session length', value: '1 week' },
  { id: 'set4', label: 'Notifications', value: 'On' },
];

/** Profile screen: preference rows (counselor) */
export const MOCK_PROFILE_PREFERENCES: MockSettingRow[] = [
  { id: 'pf1', label: 'Email notifications', value: 'On' },
  { id: 'pf2', label: 'Default view', value: 'My Activities' },
  { id: 'pf3', label: 'Time zone', value: 'Central (CDT)' },
];
