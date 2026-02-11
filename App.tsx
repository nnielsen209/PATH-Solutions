/**
 * App.tsx - Root Application Component
 *
 * Entry point of the app. Wraps everything in SafeAreaProvider, AuthProvider,
 * and NavigationContainer. RootNavigator then shows either the auth screens,
 * a loading spinner, or the right dashboard (admin, counselor, area director).
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthNavigator, AdminNavigator, CounselorNavigator, AreaDirectorNavigator } from './src/navigation';

/**
 * Shown when the user is logged in but has no valid role (e.g. role missing or unsupported).
 * Signs them out so they are redirected to the login screen.
 */
const RedirectToLogin = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
  }, [logout]);
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Signing out...</Text>
    </View>
  );
};

/**
 * RootNavigator Component
 *
 * Decides what to show based on auth state: loading spinner, login/register,
 * or the dashboard for the user's role (admin, counselor, area_director).
 * If the user has no valid role, we sign them out and redirect to login.
 */
const RootNavigator = () => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (userRole === 'admin') {
    return <AdminNavigator />;
  }
  if (userRole === 'counselor') {
    return <CounselorNavigator />;
  }
  if (userRole === 'area_director') {
    return <AreaDirectorNavigator />;
  }

  return <RedirectToLogin />;
};

/**
 * App Component
 *
 * Renders the app with providers (safe area, auth, navigation) and
 * RootNavigator so the right screen shows based on login and role.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
