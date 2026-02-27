/**
 * DevNavigator.tsx - Responsive Developer Navigation
 *
 * Handles navigation for developers. Has all admin screens with purple
 * accent color to distinguish from admin. Bottom tabs on mobile, sidebar
 * on tablet/desktop.
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DevTabParamList, TABLET_BREAKPOINT } from '../types';
import { DevSidebar } from '../components';
import { DevDashboardScreen, DevUsersScreen } from '../screens/dev';
import {
  ProgramsScreen,
  ScheduleScreen,
  ReportsScreen,
  SettingsScreen,
} from '../screens/admin';

const Tab = createBottomTabNavigator<DevTabParamList>();

/**
 * MobileDevNavigator
 *
 * Renders the dev screens in a bottom tab bar for phones and small tablets.
 * Uses purple accent color to distinguish from admin.
 */
const MobileDevNavigator = () => {
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
            case 'Programs':
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
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DevDashboardScreen} />
      <Tab.Screen name="Users" component={DevUsersScreen} />
      <Tab.Screen name="Programs" component={ProgramsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

/** Props that desktop screens can receive for navigation. */
type ScreenProps = {
  onNavigate?: (routeName: string) => void;
};

/**
 * Map of tab names to screen components. Used on desktop to render the
 * selected screen next to the sidebar.
 */
const screens: Record<keyof DevTabParamList, React.ComponentType<ScreenProps>> = {
  Dashboard: DevDashboardScreen,
  Users: DevUsersScreen,
  Programs: ProgramsScreen,
  Schedule: ScheduleScreen,
  Reports: ReportsScreen,
  Settings: SettingsScreen,
};

/**
 * DesktopDevNavigator
 *
 * Renders the sidebar on the left and the current screen on the right.
 * Clicking a sidebar item updates state so we show that screen.
 */
const DesktopDevNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState<keyof DevTabParamList>('Dashboard');
  const CurrentScreen = screens[currentRoute];

  return (
    <View style={styles.desktopContainer}>
      <DevSidebar
        currentRoute={currentRoute}
        onNavigate={(routeName) => setCurrentRoute(routeName as keyof DevTabParamList)}
      />
      <View style={styles.content}>
        <CurrentScreen
          onNavigate={(routeName) => setCurrentRoute(routeName as keyof DevTabParamList)}
        />
      </View>
    </View>
  );
};

/**
 * DevNavigator Component
 *
 * Chooses which layout to show based on screen width. At 768px or wider we
 * use the sidebar layout; otherwise we use bottom tabs.
 */
export const DevNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= TABLET_BREAKPOINT;

  if (isDesktop) {
    return <DesktopDevNavigator />;
  }

  return <MobileDevNavigator />;
};

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
});
