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

// database department
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
  requirements?: DbRequirement[]; 
}

const buildRequirementTree = (
  flatRequirments: DbRequirement[], 
  parent_rqmt_id: string | null = null 
): DbRequirement[] => {
  return flatRequirments.filter((r) => r.parent_rqmt_id == parent_rqmt_id)
  .map((r) => ({
    ...r,
    requirements: buildRequirementTree(flatRequirments, r.rqmt_id)
  })).sort((a,b) => a.rqmt_idnf.localeCompare(b.rqmt_idnf, undefined, { numeric: true, sensitivity: 'base' }));
};

const RequirementItem = ({ req }: { req: DbRequirement}) => {
  return (
    <View key={req.rqmt_id} style={styles.requirementItem}>
      <View style={styles.reqMainRow}>
        <Text style={styles.reqNumber}>{req.rqmt_idnf}</Text>
        <Text style={styles.reqDesc}>{req.rqmt_desc}</Text>
      </View>

      {req.requirements && req.requirements.length > 0 && (
        <View style={styles.subRequirements}>
          {req.requirements.map((child) => (
            <RequirementItem key={child.rqmt_id} req={child} />
          ))}
        </View>
      )}
    </View>
  );
};

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
  const [programs, setPrograms] = useState<Record<string, DbProgram[]>>({});
  const [requirements, setRequirements] = useState<Record<string, DbRequirement[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [loadingPrograms, setLoadingPrograms] = useState<string | null>(null);
  const [loadingRequirements, setLoadingRequirements] = useState<string | null>(null);

  const programCount = programs.length;
  const areaCount = areas.length;

  /** Fetch program areas from supabase skip dev and admin areas*/
  const fetchAreas = useCallback(async() =>{
    setLoading(true);
    setError(null);
    try{
      const{ data, error: fetchError} = await supabase
        .from('camp_dpmt')
        .select('dpmt_id, dpmt_name, dpmt_head_id')
        .neq('dpmt_name', 'DEV')
        .neq('dpmt_name', 'ADMIN')
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
  */
  const fetchPrograms = async (areaId: string) => {
    if(programs[areaId]) return; // already fetched
    console.log("attempting program fetch");
    setLoadingPrograms(areaId);
    try {
      const { data, error: fetchError } = await supabase
        .from('merit_badge')
        .select('badge_id, badge_name, badge_desc, eagle_badge, dpmt_id')
        .eq('dpmt_id', areaId)
        .order('badge_name', { ascending: true });

      if (fetchError) throw fetchError;
      setPrograms((prev) => ({...prev, [areaId]: data || [] }));
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs');
    } finally {
      setLoadingPrograms(null);
    }
  };

  /** Fetch requirements for a specific program */
  const fetchRequirements = async (badgeId: string) => {
    if (requirements[badgeId]) return; // Already loaded
    console.log("attempting req fetch")
    setLoadingRequirements(badgeId);
    try {
      const { data, error: fetchError } = await supabase
        .from('merit_badge_rqmt')
        .select('rqmt_id, badge_id, rqmt_desc, rqmt_idnf, parent_rqmt_id')
        .eq('badge_id', badgeId)
        .order('rqmt_idnf', { ascending: true });

      if (fetchError) throw fetchError;

      const requirementTree = buildRequirementTree(data || []); 

      setRequirements((prev) => ({ ...prev, [badgeId]: requirementTree || [] }));
    } catch (err) {
      console.error('Error fetching requirements:', err);
    } finally {
      setLoadingRequirements(null);
    }
  };

  /** Toggle program expansion and load requirements if needed */
  const handleToggleArea = (areaId: string) => {
    if (expandedArea === areaId) {
      setExpandedArea(null);
    } else {
      setExpandedArea(areaId);
      fetchPrograms(areaId);
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
                      {areaCount}
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
                    const isExpanded = expandedArea === area.dpmt_id;
                    const areaPrograms = programs[area.dpmt_id] || [];
                    const isLoadingPrograms = loadingPrograms === area.dpmt_id;

                    return (
                      <View key={area.dpmt_id} style={styles.areaItem}>
                        <TouchableOpacity
                          style={styles.programHeader}
                          onPress={() => handleToggleArea(area.dpmt_id)}
                        >
                          <View style={styles.areaInfo}>
                            <View style={styles.areaNameRow}>
                              <Text style={styles.areaName}>{area.dpmt_name}</Text>
                            </View>
                          </View>
                          <View style={styles.areaMeta}>
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={20}
                              color="#6b7280"
                            />
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.requirementsSection}>
                            {isLoadingPrograms ? (
                              <View style={styles.reqLoading}>
                                <ActivityIndicator size="small" color={PROGRAM_ACCENT_COLOR} />
                                <Text style={styles.reqLoadingText}>Loading programs...</Text>
                              </View>
                            ) : areaPrograms.length === 0 ? (
                              <Text style={styles.noReqsText}>No programs defined</Text>
                            ) : (
                            //TODO: list out programs from the current area
                              <View style={styles.programsList}>
                                {areaPrograms.map((program) => {
                                  const isSubExpanded = expandedProgram === program.badge_id;
                                  const programReqs = requirements[program.badge_id] || [];
                                  const isLoadingReqs = loadingRequirements === program.badge_id;
                                  const topLevelReqs = programReqs.filter( r => !r.parent_rqmt_id);

                                  return(
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
                                                <Ionicons name="star" size={10} color="d97706"/>
                                                <Text style={styles.eagleBadgeText}></Text>
                                              </View>
                                            )}
                                          </View>
                                          {program.badge_desc && (
                                            <Text style={styles.programDesc} numberOfLines={isSubExpanded ? undefined: 2}>
                                              {program.badge_desc}
                                            </Text>
                                          )}
                                        </View>
                                        <View style={styles.programMeta}>
                                          <Text style={styles.reqCount}>
                                            {programReqs.length > 0 ? `${topLevelReqs.length} reqs`: ''}
                                          </Text>
                                          <Ionicons
                                            name={isSubExpanded ? 'chevron-up': 'chevron-down'}
                                            size={20}
                                            color='6b7280'
                                          />
                                        </View>
                                      </TouchableOpacity>

                                      {isSubExpanded && (
                                        <View style={styles.requirementsSection}>
                                          {isLoadingReqs ? (
                                           <View style={styles.reqLoading}>
                                              <ActivityIndicator size="small" color={PROGRAM_ACCENT_COLOR} />
                                              <Text style={styles.reqLoadingText}>Loading requirements...</Text>
                                            </View>
                                          ) : topLevelReqs.length === 0 ? (
                                            <Text style={styles.noReqsText}>No requirements defined</Text>
                                          ) : (


                                            topLevelReqs.map( (req) => (
                                              <RequirementItem key={req.rqmt_id} req={req}/>
                                            ))
                                          )}
                                        </View>
                                      )}
                                    </View>
                                  );
                                })}
                              </View>
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
