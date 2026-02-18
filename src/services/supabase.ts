/**
 * supabase.ts - Supabase Client Configuration
 *
 * Creates the Supabase client we use for auth and database. We use a custom
 * storage adapter so sessions are saved in SecureStore on mobile and
 * localStorage on web. URL and key come from environment variables.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * ExpoSecureStoreAdapter
 *
 * Tells Supabase where to store the session so the user stays logged in.
 * On mobile we use SecureStore; on web we use localStorage.
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * supabase - Shared Supabase client.
 *
 * Used for auth and database calls. Session is persisted using our storage
 * adapter; tokens refresh automatically.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * signUp - Create a new user account in Supabase Auth.
 * Optional metadata (e.g. name, role) is stored on the user and used by our app.
 */
export const signUp = async (email: string, password: string, metadata?: object) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // This gets stored in the user's profile
    },
  });
  return { data, error };
};

/**
 * Sign in an existing user
 * Uses email/password authentication
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * Sign out the current user.
 * scope: 'local' clears the session from our storage (SecureStore / localStorage)
 * so the user is not restored on next load.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  return { error };
};

/**
 * Get the currently logged in user
 * Returns null if no one is logged in
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

/**
 * Get the current session
 * Sessions contain the access token and user info
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

/**
 * Send a password reset email
 * User will get an email with a link to reset their password
 */
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

/**
 * Update the authenticated user's password.
 * Caller should verify current password (e.g. via signIn) before calling this.
 */
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
};
