/**
 * AdminNavigator.tsx - Responsive Admin Navigation
 *
 * Handles navigation for admin users. On small screens we show bottom tabs;
 * on wider screens (768px and up) we show a left sidebar instead. The same
 * six screens (Dashboard, Users, Badges, Schedule, Reports, Settings) are
 * available in both layouts.
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList } from '../types';
import { AdminSidebar } from '../components';
import {
  DashboardScreen,
  UsersScreen,
  BadgesScreen,
  ScheduleScreen,
  ReportsScreen,
  SettingsScreen,
} from '../screens/admin';

const TABLET_BREAKPOINT = 768;
const Tab = createBottomTabNavigator<AdminTabParamList>();

/**
 * MobileAdminNavigator
 *
 * Renders the admin screens in a bottom tab bar for phones and small tablets.
 * Each tab has an icon; we hide the default header because each screen has its own.
 */
const MobileAdminNavigator = () => {
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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

/**
 * Map of tab names to screen components. Used on desktop to render the
 * selected screen next to the sidebar.
 */
const screens: Record<keyof AdminTabParamList, React.ComponentType> = {
  Dashboard: DashboardScreen,
  Users: UsersScreen,
  Badges: BadgesScreen,
  Schedule: ScheduleScreen,
  Reports: ReportsScreen,
  Settings: SettingsScreen,
};

/**
 * DesktopAdminNavigator
 *
 * Renders the sidebar on the left and the current screen on the right.
 * Clicking a sidebar item updates state so we show that screen.
 */
const DesktopAdminNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState<keyof AdminTabParamList>('Dashboard');
  const CurrentScreen = screens[currentRoute];

  return (
    <View style={styles.desktopContainer}>
      <AdminSidebar
        currentRoute={currentRoute}
        onNavigate={(routeName: keyof AdminTabParamList) => setCurrentRoute(routeName)}
      />
      <View style={styles.content}>
        <CurrentScreen
          onNavigate={(routeName: keyof AdminTabParamList) => setCurrentRoute(routeName)}
        />
      </View>
    </View>
  );
};

/**
 * AdminNavigator Component
 *
 * Chooses which layout to show based on screen width. At 768px or wider we
 * use the sidebar layout; otherwise we use bottom tabs.
 */
export const AdminNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= TABLET_BREAKPOINT;

  if (isDesktop) {
    return <DesktopAdminNavigator />;
  }

  return <MobileAdminNavigator />;
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
