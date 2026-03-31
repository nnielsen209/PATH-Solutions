/**
 * ScheduleGridStyles.ts - Styles for the schedule grid components
 */

import { StyleSheet } from 'react-native';

export const CELL_WIDTH_MOBILE = 140;
export const CELL_WIDTH_DESKTOP = 180;
export const PERIOD_LABEL_WIDTH_MOBILE = 80;
export const PERIOD_LABEL_WIDTH_DESKTOP = 100;
export const ROW_MIN_HEIGHT = 80;

export const styles = StyleSheet.create({
  // Container
  gridContainer: {
    flex: 1,
  },

  // Header row (department names)
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerPeriodSpacer: {
    width: PERIOD_LABEL_WIDTH_MOBILE,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  headerPeriodSpacerDesktop: {
    width: PERIOD_LABEL_WIDTH_DESKTOP,
  },
  headerDeptSpacer: {
    width: PERIOD_LABEL_WIDTH_MOBILE + 20,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  headerDeptSpacerDesktop: {
    width: PERIOD_LABEL_WIDTH_DESKTOP + 20,
  },
  headerScrollContent: {
    flexDirection: 'row',
  },
  headerCell: {
    width: CELL_WIDTH_MOBILE,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  headerCellDesktop: {
    width: CELL_WIDTH_DESKTOP,
  },
  headerCellText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerTimeText: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },

  // Period rows
  periodRow: {
    flexDirection: 'row',
    minHeight: ROW_MIN_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  periodLabel: {
    width: PERIOD_LABEL_WIDTH_MOBILE,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  periodLabelDesktop: {
    width: PERIOD_LABEL_WIDTH_DESKTOP,
  },
  periodNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  periodTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  cellsScrollContent: {
    flexDirection: 'row',
  },

  // Department rows (swapped layout - departments are now rows)
  departmentRow: {
    flexDirection: 'row',
    minHeight: ROW_MIN_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  departmentLabel: {
    width: PERIOD_LABEL_WIDTH_MOBILE + 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    borderLeftWidth: 4,
  },
  departmentLabelDesktop: {
    width: PERIOD_LABEL_WIDTH_DESKTOP + 20,
  },
  departmentName: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },

  // Grid cell
  gridCell: {
    width: CELL_WIDTH_MOBILE,
    minHeight: ROW_MIN_HEIGHT,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  gridCellDesktop: {
    width: CELL_WIDTH_DESKTOP,
    padding: 6,
  },
  emptyCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCellText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  // Activity card
  activityCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
  },
  activityCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityTextWrap: {
    flex: 1,
  },
  activityName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 16,
  },
  activityBadge: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  durationBadge: {
    marginTop: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#4b5563',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 2,
  },

  // Unassigned section
  unassignedSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  unassignedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  unassignedList: {
    gap: 4,
  },

  // Loading & empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },

  // View toggle
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});
