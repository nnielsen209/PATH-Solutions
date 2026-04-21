/**
 * @file ReportsScreen.tsx
 * @description This page is the primary interface for logging camper attendence/completion as well as generating reports
 *
 * This screen provides access to different report types, including:
 * - attendance rosters
 * - Individual progress reports
 * 
 *
 * Each report option includes a description and a generate button.
 * Currently, report generation is mocked with an alert for demo purposes.
 *
 * The layout is responsive and adapts to mobile and desktop screen sizes.
 */

import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles, DESKTOP_BREAKPOINT } from '../../styles/ReportsStyles';
import { supabase } from '../../services/supabase';

const ACCENT_COLOR = '#7c3aed';


interface dbActivity{
  activity_id: string;
  activity_name: string;
  period_id: string;
};

interface dbPeriod{
  period_id: string;
  period_time: string;
};

interface actView{
  id: string;
  title: string;
  desc?: string;
  time?: string;
  onHome: boolean;
}

const homeView: actView = {
  id: "Home",
  title: "Home",
  desc: "select and activity to view",
  onHome: true
};

export const ReportsScreen = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentPadding = isDesktop ? 32 : 20;

  const [viewStack, setStack] = useState<actView[]>([homeView]);
  const [viewList, setViewList] = useState<actView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () =>{
  try{

    setError(null);
    setIsLoading(true);

    const [activityResp, periodResp] = await Promise.all([
      supabase.from("activity").select(`
        activity_id,
        activity_name,
        period_id`), 
      supabase.from("period").select(`
        period_id,
        period_time`)]);

    if (activityResp.error) throw activityResp.error;
    if (periodResp.error) throw periodResp.error;

    const activities: dbActivity[] = activityResp.data || [];
    const periods: dbPeriod[] = periodResp.data || [];
    // console.log(activities)
    //swap period id to actual time
    const actViews = activities.map( (act) => {
        const per = periods.find( (p) => p.period_id === act.period_id);
        return{
          id: act.activity_id,
          title: act.activity_name,
          time: per?.period_time,
          onHome: false
        }
    });
    setViewList(actViews)

  }
  catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load campers and leaders');
  }
  finally {
    setIsLoading(false);
  }
  }, []);

  const pushView = (id: actView["id"]) => {
    const selected = viewList.find( (activity) => activity.id === id)
    if (selected) setStack([...viewStack, selected]);
  };

  const popView = () => {
    if (viewStack.length > 1){
      setStack(viewStack.slice(0, -1));
    }
  };

  const currView = viewStack[viewStack.length - 1];
  
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return(
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <View style={[styles.headerInner, isDesktop && styles.headerInnerDesktop]}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Reports</Text>
          <Text style={styles.subtitle}>
            Data entry and retrieval
          </Text>
        </View>
      </View>


      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
          <Text style={styles.loadingText}>Loading campers & leaders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
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

                <View style={[styles.cardIconWrap, { backgroundColor: ACCENT_COLOR + '20' }]}>
                  <Ionicons name="bar-chart" size={24} color={ACCENT_COLOR} />
                </View>

                <View style={styles.cardTitleBlock}>
                  <Text style={[styles.cardTitle, isDesktop && styles.cardTitleDesktop]}>
                    {currView.title}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {currView.desc}                
                  </Text>
                </View>

                <View style={styles.buttonRow}>
                  {viewStack.length > 1 && (
                    <TouchableOpacity onPress={popView} style={[styles.backButton, {borderColor: ACCENT_COLOR}]}>
                      <Text>← Back</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
          
            </View>

            {currView.onHome && 
              viewList?.sort((a, b) => a.title.localeCompare(b.title)).map((act) => (
                <TouchableOpacity
                  key={act.id}
                  onPress={() => pushView(act.id)}
                  style={styles.activityItem}
                >
                  <Text>{act.title}</Text>
                  <Text>{act.time}</Text>
                </TouchableOpacity>
              ))
            }

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

