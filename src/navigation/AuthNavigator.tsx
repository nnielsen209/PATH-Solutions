/**
 * AuthNavigator.tsx - Authentication Navigation Stack
 *
 * Sets up the navigation for login and registration. Uses a stack so users
 * can go from Login to Register and back. This navigator is only shown when
 * no one is logged in; after login, App.tsx shows the right dashboard.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { LoginScreen, RegisterScreen } from '../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthNavigator Component
 *
 * Renders the authentication flow screens (Login and Register).
 * Headers are hidden because each screen has its own styled header.
 */
export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We use custom headers in each screen
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};
