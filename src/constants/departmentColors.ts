/**
 * departmentColors.ts - Color mapping for camp departments/areas
 *
 * Each department gets a distinct color for visual identification
 * in the schedule grid and other UI elements.
 */

export const DEPARTMENT_COLORS: Record<string, string> = {
  AQUATICS: '#0ea5e9', // Sky blue (water theme)
  EAGLE: '#d97706', // Amber (eagle/gold)
  HANDICRAFT: '#8b5cf6', // Purple (crafts/creativity)
  'MIC-O-SAY': '#dc2626', // Red (Native American theme)
  NATURE: '#16a34a', // Green (nature)
  SCOUTCRAFT: '#065f46', // Dark green (outdoor skills)
  'RANGE AND TARGET': '#1f2937', // Dark gray (shooting sports)
  TRADES: '#ea580c', // Orange (construction)
  'INNOVATION SCOUTING': '#2563eb', // Blue (technology)
  UNASSIGNED: '#6b7280', // Gray (no department)
};

/**
 * Get color for a department name, with fallback to gray
 */
export const getDepartmentColor = (deptName: string | null | undefined): string => {
  if (!deptName) return DEPARTMENT_COLORS.UNASSIGNED;
  return DEPARTMENT_COLORS[deptName] ?? DEPARTMENT_COLORS.UNASSIGNED;
};

/**
 * Department display order for consistent grid layout
 */
export const DEPARTMENT_ORDER = [
  'AQUATICS',
  'SCOUTCRAFT',
  'NATURE',
  'TRADES',
  'HANDICRAFT',
  'EAGLE',
  'RANGE AND TARGET',
  'MIC-O-SAY',
  'INNOVATION SCOUTING',
];
