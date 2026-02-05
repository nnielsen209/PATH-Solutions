/**
 * supabase.ts - Supabase Client Configuration
 *
 * This file sets up our connection to Supabase, which is our backend service.
 * Supabase provides us with a PostgreSQL database and authentication out of the box.
 *
 * I chose Supabase because it's free for small projects and has great React Native support.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Load environment variables for Supabase connection
// These are stored in .env file and should never be committed to git
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Custom Storage Adapter
 *
 * Supabase needs somewhere to store the user's session token so they stay logged in.
 * - On mobile (iOS/Android): We use SecureStore which encrypts the data
 * - On web: We use localStorage (built into browsers)
 *
 * This lets our app work on all platforms with the same code!
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
 * Initialize the Supabase Client
 *
 * This creates our connection to Supabase with some important settings:
 * - storage: Where to save session tokens (using our adapter above)
 * - autoRefreshToken: Automatically get new tokens before they expire
 * - persistSession: Remember the user between app restarts
 * - detectSessionInUrl: Disabled because we're not using OAuth redirects
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================================
// Authentication Helper Functions
// These make it easier to call Supabase auth methods throughout the app
// ============================================================================

/**
 * Sign up a new user
 * Creates an account in Supabase Auth and stores metadata (name, role)
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
 * Sign out the current user
 * Clears the session from storage
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
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
