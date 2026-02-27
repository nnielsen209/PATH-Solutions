/**
 * CounselorNavigator.tsx - Responsive Counselor Navigation
 *
 * Handles navigation for counselors. Uses bottom tabs on small screens and
 * a left sidebar on wider screens. Tabs are Dashboard, My Activities,
 * Attendance, Progress, and Profile.
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CounselorTabParamList, TABLET_BREAKPOINT } from '../types';
import { CounselorSidebar } from '../components';
import {
  CounselorDashboardScreen,
  CounselorUsersScreen,
  MyActivitiesScreen,
  AttendanceScreen,
  ProgressScreen,
  ProfileScreen,
} from '../screens/counselor';

const Tab = createBottomTabNavigator<CounselorTabParamList>();

/**
 * MobileCounselorNavigator
 *
 * Renders the counselor screens in a bottom tab bar. Headers are hidden
 * because each screen provides its own header.
 */
const MobileCounselorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'MyActivities':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
              break;
            case 'Progress':
              iconName = focused ? 'ribbon' : 'ribbon-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      })}
    >
      <Tab.Screen name="Dashboard" component={CounselorDashboardScreen} />
      <Tab.Screen name="Users" component={CounselorUsersScreen} />
      <Tab.Screen name="MyActivities" component={MyActivitiesScreen} options={{ tabBarLabel: 'Activities' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

/** Props that desktop screens can receive for navigation. */
type ScreenProps = {
  onNavigate?: (routeName: string) => void;
};

/** Map of tab names to screen components for the desktop sidebar layout. */
const screens: Record<keyof CounselorTabParamList, React.ComponentType<ScreenProps>> = {
  Dashboard: CounselorDashboardScreen,
  Users: CounselorUsersScreen,
  MyActivities: MyActivitiesScreen,
  Attendance: AttendanceScreen,
  Progress: ProgressScreen,
  Profile: ProfileScreen,
};

/**
 * DesktopCounselorNavigator
 *
 * Renders the counselor sidebar and the currently selected screen.
 */
const DesktopCounselorNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState<keyof CounselorTabParamList>('Dashboard');
  const CurrentScreen = screens[currentRoute];

  return (
    <View style={styles.desktopContainer}>
      <CounselorSidebar
        currentRoute={currentRoute}
        onNavigate={(routeName) => setCurrentRoute(routeName as keyof CounselorTabParamList)}
      />
      <View style={styles.content}>
        <CurrentScreen
          onNavigate={(routeName) => setCurrentRoute(routeName as keyof CounselorTabParamList)}
        />
      </View>
    </View>
  );
};

/**
 * CounselorNavigator Component
 *
 * Chooses bottom tabs or sidebar based on screen width (768px breakpoint).
 */
export const CounselorNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= TABLET_BREAKPOINT;
  if (isDesktop) return <DesktopCounselorNavigator />;
  return <MobileCounselorNavigator />;
};

const styles = StyleSheet.create({
  desktopContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
});
