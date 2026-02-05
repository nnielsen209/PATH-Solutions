/**
 * AuthContext.tsx - Authentication State Management
 *
 * This file creates a React Context for managing authentication throughout the app.
 * Context is like a "global state" that any component can access without passing props.
 *
 * Why use Context for auth?
 * - Many components need to know if a user is logged in
 * - We don't want to pass user data through every component as props
 * - Context makes auth state accessible anywhere with useAuth()
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getSession } from '../services/supabase';
import { UserRole } from '../types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * AuthContextType defines what data and functions are available in our auth context
 * This helps TypeScript catch errors if we try to use something that doesn't exist
 */
interface AuthContextType {
  user: User | null;           // The logged-in user (null if not logged in)
  session: Session | null;     // The session containing access tokens
  userRole: UserRole | null;   // The user's role (admin, counselor, scout_leader, scout)
  isLoading: boolean;          // True while checking if user is logged in
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (email: string, password: string, metadata: object) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

/**
 * Props for the AuthProvider component
 * children = the components that will be wrapped by this provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context Creation
// ============================================================================

// Create the context with undefined as initial value
// We check for undefined in useAuth() to make sure it's being used correctly
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access auth context
 *
 * Usage: const { user, login, logout } = useAuth();
 *
 * Throws an error if used outside of AuthProvider - this helps catch bugs early!
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// Auth Provider Component
// ============================================================================

/**
 * AuthProvider - Wraps the app and provides auth state to all components
 *
 * This component:
 * 1. Checks for existing session on app load
 * 2. Listens for auth changes (login, logout)
 * 3. Fetches the user's role from our database
 * 4. Provides login/register/logout functions
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State variables to track authentication
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true while we check auth

  /**
   * useEffect runs when the component mounts (app starts)
   * We use it to:
   * 1. Check if user was previously logged in (session persisted)
   * 2. Set up a listener for future auth changes
   */
  useEffect(() => {
    // Check for existing session when app loads
    const initializeAuth = async () => {
      try {
        const { session: existingSession } = await getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        // If user is logged in, get their role from the database
        if (existingSession?.user) {
          await fetchUserRole(existingSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false); // Done checking, stop showing loading
      }
    };

    initializeAuth();

    // Subscribe to auth state changes (login, logout, token refresh)
    // This runs whenever the user's auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchUserRole(newSession.user.id);
        } else {
          setUserRole(null); // Clear role when logged out
        }
      }
    );

    // Cleanup: unsubscribe when component unmounts
    // This prevents memory leaks
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty array means this only runs once on mount

  /**
   * Fetch the user's role from our 'users' table in the database
   * The role determines what screens/features they can access
   */
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single(); // .single() because we expect exactly one result

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data?.role as UserRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  /**
   * Login function - signs in a user with email and password
   * Returns an error object if something goes wrong
   */
  const login = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Register function - creates a new user account
   * metadata contains extra info like name and role
   */
  const register = async (email: string, password: string, metadata: object) => {
    try {
      const { error } = await signUp(email, password, metadata);
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Logout function - signs out the current user
   * Clears all user data from state
   */
  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  // Create the value object that will be provided to all children
  const value: AuthContextType = {
    user,
    session,
    userRole,
    isLoading,
    login,
    register,
    logout,
  };

  // Render the provider with our value
  // All children components can now access this value with useAuth()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
