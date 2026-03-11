/**
 * ProgramsScreen.tsx - Admin Program Management
 *
 * Page for admins to manage programs (merit badges). Fetches data from
 * merit_badge table and shows requirements from merit_badge_rqmt table.
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
import { styles, PROGRAM_ACCENT_COLOR, DESKTOP_BREAKPOINT } from '../../styles/ProgramsStyles';

/** Database program (merit badge) record */
interface DbProgram {
  badge_id: string;
  badge_name: string;
  badge_desc: string | null;
  eagle_badge: boolean;
}

/** Database requirement record */
interface DbRequirement {
  rqmt_id: string;
  badge_id: string;
  rqmt_desc: string;
  rqmt_idnf: string;
  parent_rqmt_id: string | null;
}

/**
 * ProgramsScreen Component
 *
 * Renders the programs management page with real data from Supabase.
 */
export const ProgramsScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [programs, setPrograms] = useState<DbProgram[]>([]);
  const [requirements, setRequirements] = useState<Record<string, DbRequirement[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [loadingRequirements, setLoadingRequirements] = useState<string | null>(null);

  const programCount = programs.length;

  /** Fetch all programs from Supabase */
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('merit_badge')
        .select('badge_id, badge_name, badge_desc, eagle_badge')
        .order('badge_name', { ascending: true });

      if (fetchError) throw fetchError;
      setPrograms(data || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch requirements for a specific program */
  const fetchRequirements = async (badgeId: string) => {
    if (requirements[badgeId]) return; // Already loaded

    setLoadingRequirements(badgeId);
    try {
      const { data, error: fetchError } = await supabase
        .from('merit_badge_rqmt')
        .select('rqmt_id, badge_id, rqmt_desc, rqmt_idnf, parent_rqmt_id')
        .eq('badge_id', badgeId)
        .order('rqmt_idnf', { ascending: true });

      if (fetchError) throw fetchError;
      setRequirements((prev) => ({ ...prev, [badgeId]: data || [] }));
    } catch (err) {
      console.error('Error fetching requirements:', err);
    } finally {
      setLoadingRequirements(null);
    }
  };

  /** Toggle program expansion and load requirements if needed */
  const handleToggleProgram = (badgeId: string) => {
    if (expandedProgram === badgeId) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(badgeId);
      fetchRequirements(badgeId);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleAddProgram = () => {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
            Programs
          </Text>
          <Text style={styles.subtitle}>
            Manage programs and their requirements
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PROGRAM_ACCENT_COLOR} />
          <Text style={styles.loadingText}>Loading programs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPrograms}>
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
          <View style={[styles.mainCard, isDesktop && styles.mainCardDesktop]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: PROGRAM_ACCENT_COLOR + '20' }]}>
                  <Ionicons name="ribbon" size={24} color={PROGRAM_ACCENT_COLOR} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                    Programs
                  </Text>
                  <Text style={styles.cardDescription}>
                    Add and edit programs participants can work on at camp
                  </Text>
                </View>
                <View style={styles.cardMeta}>
                  <View style={[styles.countBadge, { backgroundColor: PROGRAM_ACCENT_COLOR + '20' }]}>
                    <Text style={[styles.countText, { color: PROGRAM_ACCENT_COLOR }]}>
                      {programCount}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, { borderColor: PROGRAM_ACCENT_COLOR }]}
                    onPress={handleAddProgram}
                  >
                    <Ionicons name="add-circle" size={18} color={PROGRAM_ACCENT_COLOR} />
                    <Text style={[styles.addButtonText, { color: PROGRAM_ACCENT_COLOR }]}>
                      Add program
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.cardContent}>
              {programCount === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="ribbon-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No programs yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add programs to let participants and counselors use them in the system
                  </Text>
                </View>
              ) : (
                <View style={styles.programsList}>
                  {programs.map((program) => {
                    const isExpanded = expandedProgram === program.badge_id;
                    const programReqs = requirements[program.badge_id] || [];
                    const isLoadingReqs = loadingRequirements === program.badge_id;
                    // Get top-level requirements (no parent)
                    const topLevelReqs = programReqs.filter((r) => !r.parent_rqmt_id);

                    return (
                      <View key={program.badge_id} style={styles.programItem}>
                        <TouchableOpacity
                          style={styles.programHeader}
                          onPress={() => handleToggleProgram(program.badge_id)}
                        >
                          <View style={styles.programInfo}>
                            <View style={styles.programNameRow}>
                              <Text style={styles.programName}>{program.badge_name}</Text>
                              {program.eagle_badge && (
                                <View style={styles.eagleBadge}>
                                  <Ionicons name="star" size={10} color="#d97706" />
                                  <Text style={styles.eagleBadgeText}>Eagle</Text>
                                </View>
                              )}
                            </View>
                            {program.badge_desc && (
                              <Text style={styles.programDesc} numberOfLines={isExpanded ? undefined : 2}>
                                {program.badge_desc}
                              </Text>
                            )}
                          </View>
                          <View style={styles.programMeta}>
                            <Text style={styles.reqCount}>
                              {programReqs.length > 0 ? `${topLevelReqs.length} reqs` : ''}
                            </Text>
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color="#6b7280"
                            />
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.requirementsSection}>
                            {isLoadingReqs ? (
                              <View style={styles.reqLoading}>
                                <ActivityIndicator size="small" color={PROGRAM_ACCENT_COLOR} />
                                <Text style={styles.reqLoadingText}>Loading requirements...</Text>
                              </View>
                            ) : topLevelReqs.length === 0 ? (
                              <Text style={styles.noReqsText}>No requirements defined</Text>
                            ) : (
                              topLevelReqs.map((req) => {
                                const subReqs = programReqs.filter(
                                  (r) => r.parent_rqmt_id === req.rqmt_id
                                );
                                return (
                                  <View key={req.rqmt_id} style={styles.requirementItem}>
                                    <View style={styles.reqMainRow}>
                                      <Text style={styles.reqNumber}>{req.rqmt_idnf}</Text>
                                      <Text style={styles.reqDesc}>{req.rqmt_desc}</Text>
                                    </View>
                                    {subReqs.length > 0 && (
                                      <View style={styles.subRequirements}>
                                        {subReqs.map((subReq) => (
                                          <View key={subReq.rqmt_id} style={styles.subReqItem}>
                                            <Text style={styles.subReqNumber}>{subReq.rqmt_idnf}</Text>
                                            <Text style={styles.subReqDesc}>{subReq.rqmt_desc}</Text>
                                          </View>
                                        ))}
                                      </View>
                                    )}
                                  </View>
                                );
                              })
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
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
