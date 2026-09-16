import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, getProfile, DBProfile, signIn, signUp, signOut } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: DBProfile | null;
  loading: boolean;
  login: (email: string, password: string, portal?: 'customer' | 'admin') => Promise<{ error: string | null }>;
  register: (email: string, password: string, fullName: string, phone: string, role?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_ADMIN_USER: User = {
  id: 'admin-0000-0000-0000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Viswa Teja', role: 'admin' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  email: 'admin@driverbee.in',
  phone: '+91 99887 76655',
  role: 'authenticated',
  updated_at: '2026-01-01T00:00:00.000Z',
} as User;

const DEMO_ADMIN_PROFILE: DBProfile = {
  id: 'admin-0000-0000-0000-000000000001',
  full_name: 'Viswa Teja (Administrator)',
  phone: '+91 99887 76655',
  role: 'admin',
  city: 'Warangal',
  wallet_balance: 0,
  avatar_url: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const p = await getProfile(userId);
    setProfile(p);
  }, []);

  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    // Admin demo session is strictly scoped to /admin route only
    if (localStorage.getItem('driverbee_admin_session') === 'true') {
      if (isAdminRoute) {
        setUser(DEMO_ADMIN_USER);
        setProfile(DEMO_ADMIN_PROFILE);
        setLoading(false);
        return;
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const p = await getProfile(session.user.id);
        // If user is admin and on customer portal, do not log them in as customer
        if (!isAdminRoute && p?.role === 'admin') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        setUser(session.user);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isCurrentlyAdminRoute = window.location.pathname.startsWith('/admin');
      if (localStorage.getItem('driverbee_admin_session') === 'true' && isCurrentlyAdminRoute) {
        setUser(DEMO_ADMIN_USER);
        setProfile(DEMO_ADMIN_PROFILE);
        return;
      }

      setSession(session);
      if (session?.user) {
        const p = await getProfile(session.user.id);
        if (!isCurrentlyAdminRoute && p?.role === 'admin') {
          setUser(null);
          setProfile(null);
          return;
        }
        setUser(session.user);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (
    email: string,
    password: string,
    portal: 'customer' | 'admin' = 'customer'
  ): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim();

    // STRICT PERMISSION RULE: Administrator is NOT permitted to log in to the customer portal
    if (portal === 'customer') {
      if (cleanEmail === 'admin@driverbee.in' || cleanEmail.startsWith('admin@')) {
        return {
          error: 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).'
        };
      }

      const { data, error } = await signIn(email, password);
      if (error) return { error: error.message };

      if (data?.user) {
        const p = await getProfile(data.user.id);
        if (p?.role === 'admin') {
          await signOut();
          return {
            error: 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).'
          };
        }
        setUser(data.user);
        setProfile(p);
      }
      return { error: null };
    }

    // Admin portal login
    if (portal === 'admin') {
      if (cleanEmail === 'admin@driverbee.in' && (password === 'admin123' || password === 'driverbee@admin')) {
        setUser(DEMO_ADMIN_USER);
        setProfile(DEMO_ADMIN_PROFILE);
        localStorage.setItem('driverbee_admin_session', 'true');
        return { error: null };
      }

      const { data, error } = await signIn(email, password);
      if (error) {
        if (cleanEmail === 'admin@driverbee.in' && password === 'admin123') {
          setUser(DEMO_ADMIN_USER);
          setProfile(DEMO_ADMIN_PROFILE);
          localStorage.setItem('driverbee_admin_session', 'true');
          return { error: null };
        }
        return { error: error.message };
      }

      if (data?.user) {
        const p = await getProfile(data.user.id);
        if (p?.role !== 'admin') {
          await signOut();
          return {
            error: 'Access denied: Only administrator accounts are permitted in the Admin Portal.'
          };
        }
        setUser(data.user);
        setProfile(p);
      }
      return { error: null };
    }

    return { error: 'Unknown portal specified.' };
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role = 'customer'
  ): Promise<{ error: string | null }> => {
    const { error } = await signUp(email, password, { full_name: fullName, phone, role });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('driverbee_admin_session');
    await signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
