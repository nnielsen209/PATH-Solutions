/**
 * useScheduleGridData.ts - Hook for fetching and transforming schedule grid data
 *
 * Fetches activities, periods, and departments, then transforms them into
 * a grid structure for the timeline view.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { DEPARTMENT_ORDER } from '../constants/departmentColors';

export type Period = {
  period_id: string;
  period_nmbr: number;
  period_time: string;
};

export type Department = {
  dpmt_id: string;
  dpmt_name: string;
};

export type SpanPosition = 'single' | 'start' | 'middle' | 'end';

export type GridActivity = {
  activity_id: string;
  activity_name: string;
  activity_duration: number;
  period_id: string;
  period_nmbr: number;
  department_id: string | null;
  department_name: string | null;
  badge_name: string | null;
  spanPosition: SpanPosition; // Position within a multi-period span
};

export type GridData = {
  periods: Period[];
  departments: Department[];
  // Grid: department_id -> period_id -> activities (swapped axes)
  grid: Map<string, Map<string, GridActivity[]>>;
  // Activities without a department go here (by period for display)
  unassignedByPeriod: Map<string, GridActivity[]>;
};

type UseScheduleGridDataReturn = {
  data: GridData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useScheduleGridData = (): UseScheduleGridDataReturn => {
  const [data, setData] = useState<GridData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all three in parallel
      const [periodsRes, deptsRes, activitiesRes] = await Promise.all([
        supabase
          .from('period')
          .select('period_id, period_nmbr, period_time')
          .order('period_nmbr', { ascending: true }),

        supabase
          .from('camp_dpmt')
          .select('dpmt_id, dpmt_name')
          .neq('dpmt_name', 'DEV')
          .neq('dpmt_name', 'ADMIN')
          .order('dpmt_name', { ascending: true }),

        supabase.from('activity').select(`
            activity_id,
            activity_name,
            activity_duration,
            period_id,
            period:period_id (period_id, period_nmbr, period_time),
            activity_badge (
              merit_badge:badge_id (
                badge_id,
                badge_name,
                dpmt_id,
                camp_dpmt:dpmt_id (dpmt_id, dpmt_name)
              )
            )
          `),
      ]);

      if (periodsRes.error) {
        console.error('Periods fetch error:', periodsRes.error);
        throw periodsRes.error;
      }
      if (deptsRes.error) {
        console.error('Departments fetch error:', deptsRes.error);
        throw deptsRes.error;
      }
      if (activitiesRes.error) {
        console.error('Activities fetch error:', activitiesRes.error);
        throw activitiesRes.error;
      }

      const periods: Period[] = periodsRes.data || [];

      // Sort departments by preferred order
      const deptData = deptsRes.data || [];
      const departments: Department[] = deptData.sort((a, b) => {
        const aIndex = DEPARTMENT_ORDER.indexOf(a.dpmt_name);
        const bIndex = DEPARTMENT_ORDER.indexOf(b.dpmt_name);
        // Put unknown departments at the end
        const aOrder = aIndex === -1 ? 999 : aIndex;
        const bOrder = bIndex === -1 ? 999 : bIndex;
        return aOrder - bOrder;
      });

      // Transform activities
      const activities: GridActivity[] = (activitiesRes.data || []).map((item: any) => {
        const period = Array.isArray(item.period) ? item.period[0] : item.period;

        // Get first badge from activity_badge junction table
        const activityBadges = item.activity_badge || [];
        const firstActivityBadge = Array.isArray(activityBadges) ? activityBadges[0] : activityBadges;
        const badge = firstActivityBadge?.merit_badge;
        const badgeObj = Array.isArray(badge) ? badge[0] : badge;
        const dept = badgeObj?.camp_dpmt;
        const deptObj = Array.isArray(dept) ? dept[0] : dept;

        return {
          activity_id: item.activity_id,
          activity_name: item.activity_name,
          activity_duration: item.activity_duration ?? 1,
          period_id: item.period_id,
          period_nmbr: period?.period_nmbr ?? 0,
          department_id: deptObj?.dpmt_id ?? null,
          department_name: deptObj?.dpmt_name ?? null,
          badge_name: badgeObj?.badge_name ?? null,
          spanPosition: 'single' as SpanPosition,
        };
      });

      // Build grid structure (swapped: department_id -> period_id -> activities)
      const grid = new Map<string, Map<string, GridActivity[]>>();
      const unassignedByPeriod = new Map<string, GridActivity[]>();

      // Initialize grid: for each department, create a map of periods
      for (const dept of departments) {
        const deptMap = new Map<string, GridActivity[]>();
        for (const period of periods) {
          deptMap.set(period.period_id, []);
        }
        grid.set(dept.dpmt_id, deptMap);
      }

      // Initialize unassigned tracking by period
      for (const period of periods) {
        unassignedByPeriod.set(period.period_id, []);
      }

      // Create a map of period_nmbr -> period_id for easy lookup
      const periodNmbrToId = new Map<number, string>();
      for (const period of periods) {
        periodNmbrToId.set(period.period_nmbr, period.period_id);
      }

      // Populate grid with activities (spanning multiple periods if duration > 1)
      for (const activity of activities) {
        if (activity.department_id && grid.has(activity.department_id)) {
          const deptMap = grid.get(activity.department_id)!;

          // Place activity in each period it spans
          const startPeriodNmbr = activity.period_nmbr;
          const duration = activity.activity_duration;

          for (let i = 0; i < duration; i++) {
            const targetPeriodNmbr = startPeriodNmbr + i;
            const targetPeriodId = periodNmbrToId.get(targetPeriodNmbr);

            if (targetPeriodId && deptMap.has(targetPeriodId)) {
              // Determine span position
              let spanPosition: SpanPosition = 'single';
              if (duration > 1) {
                if (i === 0) spanPosition = 'start';
                else if (i === duration - 1) spanPosition = 'end';
                else spanPosition = 'middle';
              }

              const periodActivities = deptMap.get(targetPeriodId) || [];
              periodActivities.push({ ...activity, spanPosition });
              deptMap.set(targetPeriodId, periodActivities);
            }
          }
        } else {
          // No department or unknown department -> unassigned
          const unassigned = unassignedByPeriod.get(activity.period_id) || [];
          unassigned.push({ ...activity, spanPosition: 'single' });
          unassignedByPeriod.set(activity.period_id, unassigned);
        }
      }

      setData({ periods, departments, grid, unassignedByPeriod });
    } catch (err) {
      console.error('Error fetching schedule grid data:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
