/**
 * Mock data for dashboard sections (Overview stats and Recent Activity).
 * Used by Admin, Area Director, and Counselor dashboards so all users see sample data.
 */

export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}

/** Admin overview: total users, counselors, active sessions */
export const MOCK_ADMIN_STATS = {
  totalUsers: 124,
  counselors: 18,
  activeSessions: 3,
};

/** Area Director overview: scoped to their area */
export const MOCK_AREA_DIRECTOR_STATS = {
  totalUsers: 42,
  counselors: 6,
  activeSessions: 2,
};

/** Counselor overview: my activities, today's attendance, progress to review */
export const MOCK_COUNSELOR_STATS = {
  myActivities: 4,
  todaysAttendance: 22,
  progressToReview: 7,
};

/** Recent activity items for Admin dashboard */
export const MOCK_ADMIN_ACTIVITY: ActivityItem[] = [
  { id: '1', icon: 'person-add', title: 'New user added', subtitle: 'Counselor account for J. Martinez', time: '12 min ago', color: '#2563eb' },
  { id: '2', icon: 'calendar', title: 'Session created', subtitle: 'Week 3 · June 16–22, 2025', time: '1 hour ago', color: '#059669' },
  { id: '3', icon: 'bar-chart', title: 'Report viewed', subtitle: 'Attendance summary — Week 2', time: '2 hours ago', color: '#d97706' },
  { id: '4', icon: 'ribbon', title: 'Badge updated', subtitle: 'First Aid — requirement 7 signed off', time: 'Yesterday', color: '#7c3aed' },
  { id: '5', icon: 'people', title: 'Bulk import', subtitle: '12 scouts added to Troop 101', time: 'Yesterday', color: '#2563eb' },
];

/** Recent activity items for Area Director dashboard */
export const MOCK_AREA_DIRECTOR_ACTIVITY: ActivityItem[] = [
  { id: '1', icon: 'person-add', title: 'Counselor assigned', subtitle: 'M. Chen → Swimming (Week 2)', time: '25 min ago', color: '#2563eb' },
  { id: '2', icon: 'calendar', title: 'Schedule change', subtitle: 'Rowing moved to 2:00 PM Tue/Thu', time: '1 hour ago', color: '#059669' },
  { id: '3', icon: 'checkmark-done', title: 'Progress approved', subtitle: '3 scouts — First Aid partials', time: '2 hours ago', color: '#d97706' },
  { id: '4', icon: 'people', title: 'Attendance submitted', subtitle: 'Aquatics area — 28 present', time: 'Yesterday', color: '#059669' },
];

/** Recent activity items for Counselor dashboard */
export const MOCK_COUNSELOR_ACTIVITY: ActivityItem[] = [
  { id: '1', icon: 'person-add', title: 'Attendance taken', subtitle: 'Swimming · 14 present, 1 excused', time: '15 min ago', color: '#059669' },
  { id: '2', icon: 'ribbon', title: 'Requirement signed', subtitle: 'First Aid — Req 6 (J. Smith)', time: '1 hour ago', color: '#d97706' },
  { id: '3', icon: 'calendar', title: 'Activity reminder', subtitle: 'Swimming class — 2:00 PM today', time: '2 hours ago', color: '#2563eb' },
  { id: '4', icon: 'checkmark-done', title: 'Progress updated', subtitle: 'Lifesaving partial — 2 scouts', time: 'Yesterday', color: '#7c3aed' },
];
