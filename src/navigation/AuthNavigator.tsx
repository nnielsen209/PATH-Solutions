/**
 * AuthNavigator.tsx - Authentication Navigation Stack
 *
 * This file sets up the navigation for authentication screens.
 * It uses React Navigation's Native Stack Navigator for smooth transitions.
 *
 * Screens in this stack:
 * - Login: User sign in
 * - Register: New user registration
 * - (Future) ForgotPassword: Password reset
 *
 * This navigator is shown when the user is NOT logged in.
 * Once logged in, App.tsx switches to the appropriate dashboard navigator.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { LoginScreen, RegisterScreen } from '../screens/auth';

// Create the stack navigator with our type definitions
// This gives us type safety when navigating between screens
const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator Component
 *
 * Renders the authentication flow screens.
 * Headers are hidden because each screen has its own styled header.
 */
export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We use custom headers in each screen
      }}
    >
      {/* Login is the initial/default screen */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};
