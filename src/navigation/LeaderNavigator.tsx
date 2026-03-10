/**
 * LeaderNavigator.tsx - Responsive Leader Navigation
 *
 * Handles navigation for troop leaders. Uses bottom tabs on small screens and
 * a left sidebar on wider screens. Tabs are Dashboard, Scouts, Schedule,
 * Progress, and Profile. All screens are view-only.
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LeaderTabParamList, TABLET_BREAKPOINT } from '../types';
import { LeaderSidebar } from '../components';
import {
  LeaderDashboardScreen,
  LeaderScoutsScreen,
  LeaderScheduleScreen,
  LeaderProgressScreen,
  LeaderProfileScreen,
} from '../screens/leader';

const ACCENT_COLOR = '#16a34a'; // Green accent for Leaders

const Tab = createBottomTabNavigator<LeaderTabParamList>();

/**
 * MobileLeaderNavigator
 *
 * Renders the leader screens in a bottom tab bar. Headers are hidden
 * because each screen provides its own header.
 */
const MobileLeaderNavigator = () => {
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
            case 'Scouts':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Schedule':
              iconName = focused ? 'calendar' : 'calendar-outline';
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
        tabBarActiveTintColor: ACCENT_COLOR,
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
      <Tab.Screen name="Dashboard" component={LeaderDashboardScreen} />
      <Tab.Screen name="Scouts" component={LeaderScoutsScreen} options={{ tabBarLabel: 'My Scouts' }} />
      <Tab.Screen name="Schedule" component={LeaderScheduleScreen} />
      <Tab.Screen name="Progress" component={LeaderProgressScreen} />
      <Tab.Screen name="Profile" component={LeaderProfileScreen} />
    </Tab.Navigator>
  );
};

/** Props that desktop screens can receive for navigation. */
type ScreenProps = {
  onNavigate?: (routeName: string) => void;
};

/** Map of tab names to screen components for the desktop sidebar layout. */
const screens: Record<keyof LeaderTabParamList, React.ComponentType<ScreenProps>> = {
  Dashboard: LeaderDashboardScreen,
  Scouts: LeaderScoutsScreen,
  Schedule: LeaderScheduleScreen,
  Progress: LeaderProgressScreen,
  Profile: LeaderProfileScreen,
};

/**
 * DesktopLeaderNavigator
 *
 * Renders the leader sidebar and the currently selected screen.
 */
const DesktopLeaderNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState<keyof LeaderTabParamList>('Dashboard');
  const CurrentScreen = screens[currentRoute];

  return (
    <View style={styles.desktopContainer}>
      <LeaderSidebar
        currentRoute={currentRoute}
        onNavigate={(routeName) => setCurrentRoute(routeName as keyof LeaderTabParamList)}
      />
      <View style={styles.content}>
        <CurrentScreen
          onNavigate={(routeName) => setCurrentRoute(routeName as keyof LeaderTabParamList)}
        />
      </View>
    </View>
  );
};

/**
 * LeaderNavigator Component
 *
 * Chooses bottom tabs or sidebar based on screen width (768px breakpoint).
 */
export const LeaderNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= TABLET_BREAKPOINT;
  if (isDesktop) return <DesktopLeaderNavigator />;
  return <MobileLeaderNavigator />;
};

const styles = StyleSheet.create({
  desktopContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
});
