/**
 * App.tsx - Root Application Component
 *
 * This is the entry point of our React Native application.
 * It sets up all the providers and handles the main navigation logic.
 *
 * Structure:
 * - SafeAreaProvider: Handles safe areas (notches, status bars) on different devices
 * - AuthProvider: Provides authentication state to all components
 * - NavigationContainer: React Navigation's container for all navigators
 * - RootNavigator: Decides which screens to show based on auth state
 *
 * Flow:
 * 1. App loads and shows loading spinner
 * 2. AuthContext checks if user is already logged in
 * 3. If not logged in -> Show AuthNavigator (Login/Register)
 * 4. If logged in -> Show appropriate dashboard based on role
 */

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthNavigator } from './src/navigation';

// ============================================================================
// Root Navigator Component
// ============================================================================

/**
 * RootNavigator - Handles top-level navigation logic
 *
 * This component decides what to render based on the authentication state:
 * - Loading: Shows a spinner while checking auth status
 * - Not logged in: Shows the AuthNavigator (Login/Register screens)
 * - Logged in: Shows the appropriate dashboard (TODO: implement role-based dashboards)
 */
const RootNavigator = () => {
  // Get authentication state from our context
  const { user, userRole, isLoading } = useAuth();

  // Show loading spinner while checking if user is logged in
  // This prevents a flash of the login screen on app start
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no user is logged in, show the authentication screens
  if (!user) {
    return <AuthNavigator />;
  }

  // ========== User is Logged In ==========
  // TODO: Replace this with role-based navigators:
  // - Admin -> AdminNavigator (dashboard, user management, reports)
  // - Counselor -> CounselorNavigator (activities, attendance)
  // - Scout Leader -> ScoutLeaderNavigator (troop management)
  // - Scout -> ScoutNavigator (badges, progress)

  // For now, show a simple welcome screen with user info
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Logged in as: {userRole || 'Unknown role'}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <StatusBar style="auto" />
    </View>
  );
};

// ============================================================================
// Main App Component
// ============================================================================

/**
 * App - The root component exported to the system
 *
 * Sets up all the necessary providers in the correct order:
 * 1. SafeAreaProvider - Must wrap everything for safe area handling
 * 2. AuthProvider - Makes auth state available throughout the app
 * 3. NavigationContainer - Required by React Navigation
 * 4. RootNavigator - Our custom navigation logic
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

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Temporary container for logged-in state
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Loading screen container
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
  // Welcome text styles (temporary)
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
