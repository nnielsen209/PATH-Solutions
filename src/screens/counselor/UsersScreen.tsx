/**
 * UsersScreen.tsx - Counselor Scouts View
 *
 * Fetches scouts from the scout table for counselors to view.
 * Read-only - counselors cannot add scouts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/UsersStyles';

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
    <View style={[styles.scoutCard, isDesktop && styles.scoutCardDesktop]}>
      <View style={styles.scoutAvatar}>
        <Text style={styles.scoutInitials}>
          {scout.scout_first_name[0]}{scout.scout_last_name[0]}
        </Text>
      </View>
      <View style={styles.scoutInfo}>
        <Text style={styles.scoutName}>
          {scout.scout_first_name} {scout.scout_last_name}
        </Text>
        <Text style={styles.scoutTroop}>{troopInfo}</Text>
      </View>
    </View>
  );
};

/**
 * CounselorUsersScreen Component
 *
 * Shows scouts from the scout table for counselors.
 * Read-only view - no add functionality.
 */
export const CounselorUsersScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [scouts, setScouts] = useState<DbScout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch scouts from Supabase */
  const fetchScouts = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
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
        .order('scout_first_name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setScouts(data || []);
    } catch (err) {
      console.error('Error fetching scouts:', err);
      setError('Failed to load scouts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScouts();
  }, [fetchScouts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Scouts</Text>
          <Text style={styles.subtitle}>View all scout participants</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d97706" />
          <Text style={styles.loadingText}>Loading scouts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchScouts}>
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
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsIconWrap}>
              <Ionicons name="people" size={28} color="#d97706" />
            </View>
            <View style={styles.statsInfo}>
              <Text style={styles.statValue}>{scouts.length}</Text>
              <Text style={styles.statLabel}>Total Scouts</Text>
            </View>
          </View>

          {/* Scouts List */}
          <View style={[styles.listCard, isDesktop && styles.listCardDesktop]}>
            <View style={styles.listHeader}>
              <View style={styles.listTitleRow}>
                <View style={styles.listIconWrap}>
                  <Ionicons name="person" size={24} color="#d97706" />
                </View>
                <View style={styles.listTitleBlock}>
                  <Text style={[styles.listTitle, isDesktop && styles.listTitleDesktop]}>
                    All Scouts
                  </Text>
                  <Text style={styles.listDescription}>Scout participants</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{scouts.length}</Text>
                </View>
              </View>
            </View>
            <View style={styles.listContent}>
              {scouts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="person-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No scouts yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Scouts will appear here once added
                  </Text>
                </View>
              ) : (
                <View style={styles.scoutsList}>
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

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
