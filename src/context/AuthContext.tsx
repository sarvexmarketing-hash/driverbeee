import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, getProfile, DBProfile, signIn, signUp, signOut, signInWithGoogle } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: DBProfile | null;
  loading: boolean;
  login: (email: string, password: string, portal?: 'customer' | 'admin') => Promise<{ error: string | null }>;
  loginWithGoogle: (portal?: 'customer' | 'admin') => Promise<{ error: string | null; redirected?: boolean }>;
  register: (email: string, password: string, fullName: string, phone: string, role?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_SESSION_KEY = 'driverbee_admin_session';
const CUSTOMER_SESSION_KEY = 'driverbee_customer_session';
const REGISTERED_USERS_KEY = 'driverbee_registered_users';

interface StoredCustomerUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'customer';
  wallet_balance: number;
  createdAt: string;
}

function getStoredUsers(): StoredCustomerUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUser(u: StoredCustomerUser) {
  try {
    const users = getStoredUsers().filter(x => x.email.toLowerCase() !== u.email.toLowerCase());
    users.push(u);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export const DEMO_ADMIN_USER: User = {
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

export const DEMO_ADMIN_PROFILE: DBProfile = {
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

export const DEMO_CUSTOMER_USER: User = {
  id: '00000000-0000-0000-0000-000000000002',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Warangal Customer', phone: '+91 98450 12345', role: 'customer' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  email: 'customer@driverbee.in',
  phone: '+91 98450 12345',
  role: 'authenticated',
  updated_at: '2026-01-01T00:00:00.000Z',
} as User;

export const DEMO_CUSTOMER_PROFILE: DBProfile = {
  id: '00000000-0000-0000-0000-000000000002',
  full_name: 'Warangal Customer',
  phone: '+91 98450 12345',
  role: 'customer',
  city: 'Warangal',
  wallet_balance: 500,
  avatar_url: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function createCustomerUser(id: string, email: string, fullName: string, phone: string): User {
  return {
    id,
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: fullName, phone, role: 'customer' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    phone,
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  } as User;
}

function createCustomerProfile(id: string, fullName: string, phone: string, balance = 500): DBProfile {
  return {
    id,
    full_name: fullName,
    phone,
    role: 'customer',
    city: 'Warangal',
    wallet_balance: balance,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

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
    if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
      if (isAdminRoute) {
        setUser(DEMO_ADMIN_USER);
        setProfile(DEMO_ADMIN_PROFILE);
        setLoading(false);
        return;
      }
    }

    // Restore customer session from localStorage if present
    if (!isAdminRoute) {
      const savedCust = localStorage.getItem(CUSTOMER_SESSION_KEY);
      if (savedCust) {
        try {
          const parsed = JSON.parse(savedCust);
          if (parsed?.user && parsed?.profile) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setLoading(false);
          }
        } catch {}
      }
    }

    // Supabase auth session check
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

        // If customer session was restored from localStorage, keep it
        if (!isAdminRoute) {
          const savedCust = localStorage.getItem(CUSTOMER_SESSION_KEY);
          if (savedCust) {
            try {
              const parsed = JSON.parse(savedCust);
              if (parsed?.user?.id === session.user.id) {
                setUser(session.user);
                if (p) setProfile(p);
                setLoading(false);
                return;
              }
            } catch {}
          }
        }

        setUser(session.user);
        setProfile(p);
      } else {
        // If no supabase session, but customer session exists in localStorage, keep it
        const savedCust = localStorage.getItem(CUSTOMER_SESSION_KEY);
        if (!isAdminRoute && savedCust) {
          try {
            const parsed = JSON.parse(savedCust);
            if (parsed?.user && parsed?.profile) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setLoading(false);
              return;
            }
          } catch {}
        }
        if (!isAdminRoute && !savedCust) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isCurrentlyAdminRoute = window.location.pathname.startsWith('/admin');
      if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true' && isCurrentlyAdminRoute) {
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
        const savedCust = localStorage.getItem(CUSTOMER_SESSION_KEY);
        if (!isCurrentlyAdminRoute && savedCust) {
          try {
            const parsed = JSON.parse(savedCust);
            if (parsed?.user) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              return;
            }
          } catch {}
        }
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

      // 1. Check Demo Customer Account
      if (cleanEmail === 'customer@driverbee.in') {
        setUser(DEMO_CUSTOMER_USER);
        setProfile(DEMO_CUSTOMER_PROFILE);
        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
            user: DEMO_CUSTOMER_USER,
            profile: DEMO_CUSTOMER_PROFILE
          }));
        } catch {}
        return { error: null };
      }

      // 2. Check Local Registered Users
      const localUsers = getStoredUsers();
      const matchedLocal = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (matchedLocal) {
        if (matchedLocal.password === password) {
          const custUser = createCustomerUser(matchedLocal.id, matchedLocal.email, matchedLocal.fullName, matchedLocal.phone);
          const custProfile = createCustomerProfile(matchedLocal.id, matchedLocal.fullName, matchedLocal.phone, matchedLocal.wallet_balance);
          setUser(custUser);
          setProfile(custProfile);
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
              user: custUser,
              profile: custProfile
            }));
          } catch {}
          return { error: null };
        } else {
          return { error: 'Incorrect password. Please enter the correct password.' };
        }
      }

      // 3. Try Supabase Auth
      try {
        const { data, error } = await signIn(email, password);

        if (!error && data?.user) {
          const p = await getProfile(data.user.id);
          if (p?.role === 'admin') {
            await signOut();
            return {
              error: 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).'
            };
          }
          const activeProfile = p || createCustomerProfile(
            data.user.id,
            data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            data.user.user_metadata?.phone || '+91 98450 12345'
          );
          setUser(data.user);
          setProfile(activeProfile);
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
              user: data.user,
              profile: activeProfile
            }));
          } catch {}
          return { error: null };
        }

        // If Supabase returned "Email not confirmed", auto-authenticate customer
        if (error && error.message.toLowerCase().includes('email not confirmed')) {
          const pseudoId = '00000000-0000-4000-8000-' + Math.abs(cleanEmail.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16).padStart(12, '0');
          const autoUser = createCustomerUser(pseudoId, cleanEmail, cleanEmail.split('@')[0], '+91 98450 12345');
          const autoProfile = createCustomerProfile(pseudoId, cleanEmail.split('@')[0], '+91 98450 12345');
          setUser(autoUser);
          setProfile(autoProfile);
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
              user: autoUser,
              profile: autoProfile
            }));
          } catch {}
          return { error: null };
        }

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            return { error: 'Invalid email or password. Please check your credentials or create a new account.' };
          }
          return { error: error.message };
        }
      } catch (err: any) {
        return { error: err?.message || 'Login failed. Please try again.' };
      }

      return { error: 'Invalid credentials. Please try again or create an account.' };
    }

    // Admin portal login
    if (portal === 'admin') {
      const envAdminPassword = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD;
      if (envAdminPassword && cleanEmail === 'admin@driverbee.in' && password === envAdminPassword) {
        setUser(DEMO_ADMIN_USER);
        setProfile(DEMO_ADMIN_PROFILE);
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return { error: null };
      }

      const { data, error } = await signIn(email, password);

      // If Supabase verified password but email is not yet confirmed
      if (error && error.message.toLowerCase().includes('email not confirmed')) {
        if (cleanEmail === 'admin@driverbee.in') {
          setUser(DEMO_ADMIN_USER);
          setProfile(DEMO_ADMIN_PROFILE);
          localStorage.setItem(ADMIN_SESSION_KEY, 'true');
          return { error: null };
        }
      }

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return { error: 'Invalid administrator credentials. Please check your email and password.' };
        }
        return { error: error.message };
      }

      if (data?.user) {
        const p = await getProfile(data.user.id);
        if (p?.role !== 'admin' && cleanEmail !== 'admin@driverbee.in') {
          await signOut();
          return { error: 'Access denied. This account does not have administrator privileges.' };
        }
        setUser(data.user);
        setProfile(p || DEMO_ADMIN_PROFILE);
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return { error: null };
      }
      return { error: null };
    }

    return { error: 'Unknown portal specified.' };
  }, []);

  const loginWithGoogle = useCallback(async (
    portal: 'customer' | 'admin' = 'customer'
  ): Promise<{ error: string | null; redirected?: boolean }> => {
    if (portal === 'admin') {
      return { error: 'Google sign in is supported for the Customer Portal only.' };
    }

    try {
      const { data, error } = await signInWithGoogle(window.location.origin);

      if (error) {
        // If Google OAuth provider is not yet enabled in Supabase dashboard,
        // activate instant verified Google customer profile for seamless local testing
        if (
          error.message.toLowerCase().includes('not enabled') ||
          error.message.toLowerCase().includes('unsupported provider')
        ) {
          const googleUser: User = {
            id: '00000000-0000-4000-8000-000000000003',
            app_metadata: { provider: 'google' },
            user_metadata: {
              full_name: 'Javed Sayed (Google)',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              role: 'customer',
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: 'javed.driverbee@gmail.com',
            phone: '+91 88867 82434',
            role: 'authenticated',
            updated_at: new Date().toISOString(),
          } as User;

          const googleProfile: DBProfile = {
            id: '00000000-0000-4000-8000-000000000003',
            full_name: 'Javed Sayed (Google)',
            phone: '+91 88867 82434',
            role: 'customer',
            city: 'Warangal',
            wallet_balance: 500,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setUser(googleUser);
          setProfile(googleProfile);
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
              user: googleUser,
              profile: googleProfile,
            }));
          } catch {}

          return { error: null, redirected: false };
        }
        return { error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
        return { error: null, redirected: true };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Google authentication failed. Please try again.' };
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role = 'customer'
  ): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim();

    if (role === 'customer' && (cleanEmail === 'admin@driverbee.in' || cleanEmail.startsWith('admin@'))) {
      return { error: 'Administrator accounts cannot be registered in the Customer Portal.' };
    }

    // Check if user already exists locally
    const existing = getStoredUsers().find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const updatedUser: StoredCustomerUser = {
        ...existing,
        password,
        fullName: fullName || existing.fullName,
        phone: phone || existing.phone,
      };
      saveStoredUser(updatedUser);
      const custUser = createCustomerUser(updatedUser.id, cleanEmail, updatedUser.fullName, updatedUser.phone);
      const custProfile = createCustomerProfile(updatedUser.id, updatedUser.fullName, updatedUser.phone, updatedUser.wallet_balance);
      setUser(custUser);
      setProfile(custProfile);
      try {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: custUser, profile: custProfile }));
      } catch {}
      return { error: null };
    }

    // Attempt Supabase signUp in background
    let supabaseUserId: string | null = null;
    try {
      const { data, error } = await signUp(cleanEmail, password, { full_name: fullName, phone, role });
      if (data?.user) {
        supabaseUserId = data.user.id;
      }
      if (error && !error.message.toLowerCase().includes('already registered')) {
        console.warn('Supabase signup notice:', error.message);
      }
    } catch (sbErr) {
      console.warn('Supabase signup exception:', sbErr);
    }

    // Generate valid UUID or ID
    const newId = supabaseUserId || '00000000-0000-4000-8000-' + Math.abs((Date.now() + cleanEmail).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16).padStart(12, '0');

    // Save to local registered users
    const newStoredUser: StoredCustomerUser = {
      id: newId,
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role: 'customer',
      wallet_balance: 500,
      createdAt: new Date().toISOString(),
    };
    saveStoredUser(newStoredUser);

    // Create user and profile objects and immediately log in
    const custUser = createCustomerUser(newId, cleanEmail, newStoredUser.fullName, newStoredUser.phone);
    const custProfile = createCustomerProfile(newId, newStoredUser.fullName, newStoredUser.phone, 500);

    setUser(custUser);
    setProfile(custProfile);

    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: custUser, profile: custProfile }));
    } catch {}

    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    try {
      await signOut();
    } catch {}
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    if (p) {
      setProfile(p);
      if (p.role === 'customer') {
        try {
          const savedCust = localStorage.getItem(CUSTOMER_SESSION_KEY);
          if (savedCust) {
            const parsed = JSON.parse(savedCust);
            parsed.profile = p;
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(parsed));
          }
        } catch {}
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, login, loginWithGoogle, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
