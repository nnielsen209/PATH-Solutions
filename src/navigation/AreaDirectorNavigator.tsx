/**
 * AreaDirectorNavigator.tsx - Responsive Area Director Navigation
 *
 * Same layout idea as Admin: bottom tabs on small screens, sidebar on large.
 * Area directors get the same six screens (Dashboard, Users, Badges, Schedule,
 * Reports, Settings) but use their own dashboard screen.
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AreaDirectorTabParamList } from '../types';
import { AreaDirectorSidebar } from '../components';
import { AreaDirectorDashboardScreen } from '../screens/areaDirector';
import {
  UsersScreen,
  BadgesScreen,
  ScheduleScreen,
  ReportsScreen,
  SettingsScreen,
} from '../screens/admin';

const TABLET_BREAKPOINT = 768;
const Tab = createBottomTabNavigator<AreaDirectorTabParamList>();

/**
 * MobileAreaDirectorNavigator
 *
 * Renders the area director screens in a bottom tab bar. Headers are hidden
 * because each screen has its own header.
 */
const MobileAreaDirectorNavigator = () => {
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
            case 'Badges':
              iconName = focused ? 'ribbon' : 'ribbon-outline';
              break;
            case 'Schedule':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Reports':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
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
      <Tab.Screen name="Dashboard" component={AreaDirectorDashboardScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

/** Map of tab names to screen components for the desktop sidebar layout. */
const screens: Record<keyof AreaDirectorTabParamList, React.ComponentType> = {
  Dashboard: AreaDirectorDashboardScreen,
  Users: UsersScreen,
  Badges: BadgesScreen,
  Schedule: ScheduleScreen,
  Reports: ReportsScreen,
  Settings: SettingsScreen,
};

/**
 * DesktopAreaDirectorNavigator
 *
 * Renders the area director sidebar and the currently selected screen.
 */
const DesktopAreaDirectorNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState<keyof AreaDirectorTabParamList>('Dashboard');
  const CurrentScreen = screens[currentRoute];

  return (
    <View style={styles.desktopContainer}>
      <AreaDirectorSidebar
        currentRoute={currentRoute}
        onNavigate={(routeName) => setCurrentRoute(routeName as keyof AreaDirectorTabParamList)}
      />
      <View style={styles.content}>
        <CurrentScreen />
      </View>
    </View>
  );
};

/**
 * AreaDirectorNavigator Component
 *
 * Chooses bottom tabs or sidebar based on screen width (768px breakpoint).
 */
export const AreaDirectorNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= TABLET_BREAKPOINT;
  if (isDesktop) return <DesktopAreaDirectorNavigator />;
  return <MobileAreaDirectorNavigator />;
};

const styles = StyleSheet.create({
  desktopContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
});
