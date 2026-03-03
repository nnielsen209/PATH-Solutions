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
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TABLET_BREAKPOINT } from '../../types';
import { supabase } from '../../services/supabase';

const DESKTOP_BREAKPOINT = TABLET_BREAKPOINT;

const PROGRAM_ACCENT_COLOR = '#059669';

interface DbDepartment{
  dpmt_id: string;
  dpmt_name: string;
  dpmt_head_id: string | null;
}

/** Database program (merit badge) record */
interface DbProgram {
  badge_id: string;
  badge_name: string;
  badge_desc: string | null;
  eagle_badge: boolean;
  dpmt_id: string;
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

  const [areas, setAreas] = useState<DbDepartment[]>([]);
  const [programs, setPrograms] = useState<DbProgram[]>([]);
  const [requirements, setRequirements] = useState<Record<string, DbRequirement[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sxpandedArea, setExpandedArea] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [loadingRequirements, setLoadingRequirements] = useState<string | null>(null);

  const programCount = programs.length;
  const areaCount = areas.length;

  /** Fetch program areas from supabase */
  const fetchAreas = useCallback(async() =>{
    setLoading(true);
    setError(null);
    try{
      const{ data, error: fetchError} = await supabase
        .from('camp_dpmt')
        .select('dpmt_id, dpmt_name, dpmt_head_id')
        .order('dpmt_name', {ascending:true});

        if(fetchError) throw fetchError;
        setAreas(data || []);
        } catch(err){
          console.error('Error fetching areas: ', err);
          setError('Failed to load areas');
        } finally{
          setLoading(false);
        }
  },[]);


  /** Fetch all programs from a specific area from Supabase 
   *  TODO: adjust to grab one area at a time
  */
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('merit_badge')
        .select('badge_id, badge_name, badge_desc, eagle_badge, dpmt_id')
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
    fetchAreas();
  }, [fetchAreas]);

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
          <TouchableOpacity style={styles.retryButton} onPress={fetchAreas}>
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
              {areaCount === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="ribbon-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>No program areas created</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add program areas to sort programs into
                  </Text>
                </View>
              ) : (
                <View style={styles.areaList}>
                  {areas.map((area) => {
                    const isExpanded = expandedProgram === area.dpmt_id;
                    const areaPrograms = programs.filter(dpmt_id => area.dpmt_id);
                    const isLoadingPrograms = false;
                    // Get top-level requirements (no parent)
                    const topLevelReqs = [];//programReqs.filter((r) => !r.parent_rqmt_id);

                    return (
                      <View key={area.dpmt_id} style={styles.areaItem}>
                        <TouchableOpacity
                          style={styles.programHeader}
                          onPress={() => handleToggleProgram(area.dpmt_id)}
                        >
                          <View style={styles.areaInfo}>
                            <View style={styles.areaNameRow}>
                              <Text style={styles.areaName}>{area.dpmt_name}</Text>
                              {/* {program.eagle_badge && (
                                <View style={styles.eagleBadge}>
                                  <Ionicons name="star" size={10} color="#d97706" />
                                  <Text style={styles.eagleBadgeText}>Eagle</Text>
                                </View>
                              )} */}
                            </View>
                            {/* {program.badge_desc && (
                              <Text style={styles.programDesc} numberOfLines={isExpanded ? undefined : 2}>
                                {program.badge_desc}
                              </Text>
                            )} */}
                          </View>
                          <View style={styles.areaMeta}>
                            {/* <Text style={styles.reqCount}>
                              {programReqs.length > 0 ? `${topLevelReqs.length} reqs` : ''}
                            </Text> */}
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
                            ) : <Text style={styles.noReqsText}>No requirements defined</Text>
                               
                            }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: PROGRAM_ACCENT_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  headerInner: {},
  headerInnerDesktop: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  titleDesktop: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  scrollContentDesktop: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainCardDesktop: {
    marginBottom: 0,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardTitleDesktop: {
    fontSize: 19,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardContent: {
    minHeight: 200,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },
  areaList:{
    gap: 8,
  },
  areaItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  areaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programsList: {
    gap: 8,
  },
  programItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  programInfo: {
    flex: 1,
  },
  programNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  eagleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  eagleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  programDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  requirementsSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  reqLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  reqLoadingText: {
    fontSize: 13,
    color: '#6b7280',
  },
  noReqsText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 8,
  },
  requirementItem: {
    marginBottom: 8,
  },
  reqMainRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reqNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: PROGRAM_ACCENT_COLOR,
    minWidth: 24,
  },
  reqDesc: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  subRequirements: {
    marginLeft: 24,
    marginTop: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  subReqItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  subReqNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    minWidth: 20,
  },
  subReqDesc: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
});
