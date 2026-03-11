import { supabase } from './supabase';

export type ScheduleActivityRow = {
  activity_id: string;
  activity_start_time: string; // "HH:MM:SS"
  activity_duration: string;   // interval text ("01:30:00" or "1:30:00")
  bdge_id: string;
  merit_badge?: {
    badge_name?: string;
  };
};

const SELECT_STRING = `
  activity_id,
  activity_start_time,
  activity_duration,
  bdge_id,
  merit_badge:merit_badge (
    badge_name
  )
`.trim();

export async function fetchScheduleActivities(): Promise<ScheduleActivityRow[]> {
  const { data, error } = await supabase
    .from('activity')
    .select(SELECT_STRING)
    .order('activity_start_time', { ascending: true });

  if (error) return [];

  return (data ?? []) as ScheduleActivityRow[];
}
}