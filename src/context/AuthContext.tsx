/**
 * AuthContext.tsx - Authentication State Management
 *
 * Provides login state and user info to the whole app using React Context, so we
 * don't have to pass user and role down through every component. On app load we
 * check for an existing session and fetch the user's role from the database.
 */

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getSession } from '../services/supabase';
import { UserRole } from '../types';

/** What the auth context exposes: user, session, role, loading flags, and login/register/logout. */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  /** True while we're fetching user role from DB (only relevant when user is set). Prevents redirect-to-login before role is loaded. */
  isRoleLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (email: string, password: string, metadata: object) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 *
 * Returns the auth context (user, login, logout, etc.). Must be used inside
 * AuthProvider or it throws an error so we catch mistakes early.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 *
 * Wraps the app and supplies auth state to all children. On mount it checks for
 * a saved session and subscribes to auth changes; it also loads the user's role
 * from the database so we know which dashboard to show.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const lastSessionTokenRef = useRef<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    setIsRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data?.user_role as UserRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setIsRoleLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { session: existingSession } = await getSession();
        lastSessionTokenRef.current = existingSession?.access_token ?? null;
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        // If user is logged in, get their role from the database
        if (existingSession?.user) {
          await fetchUserRole(existingSession.user.id);
        } else {
          setIsRoleLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // When returning to the tab, Supabase can fire with null session or duplicate
        // events. Re-verify from storage before clearing so we don't log the user out.
        if (!newSession) {
          const { session: storedSession } = await getSession();
          if (storedSession) {
            newSession = storedSession;
          }
        }

        // Skip redundant updates (e.g. same session on tab focus) to avoid re-fetches and re-renders
        const newToken = newSession?.access_token ?? null;
        if (newToken === lastSessionTokenRef.current) {
          return;
        }
        lastSessionTokenRef.current = newToken;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchUserRole(newSession.user.id);
        } else {
          setUserRole(null);
          setIsRoleLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const register = async (email: string, password: string, metadata: object) => {
    try {
      const { error } = await signUp(email, password, metadata);
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      setUserRole(null);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userRole,
    isLoading,
    isRoleLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
