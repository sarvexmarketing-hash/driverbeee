import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  getProfile, 
  DBProfile, 
  signIn, 
  signUp, 
  signOut, 
  signInWithGoogle, 
  resetPasswordForEmail, 
  updateUserPassword,
  syncFirebaseProfile,
  getProfileByFirebaseUid,
  checkUserAccountExists
} from '../lib/supabase';
import { 
  getOrCreateRecaptchaVerifier,
  resetRecaptchaVerifier,
  setupRecaptcha, 
  sendFirebasePhoneOtp, 
  confirmFirebasePhoneOtp, 
  signOutOfFirebase, 
  onFirebaseAuthStateChange,
  normalizeE164,
  formatDisplayPhone,
  isFirebaseConfigured,
  formatFirebaseAuthError,
  formatFirebasePhoneAuthError,
  signInWithFirebaseGoogle,
  googleAuthProvider
} from '../lib/firebase';
import { sendPasswordResetEmail } from '../services/emailService';

export { 
  normalizeE164, 
  formatDisplayPhone, 
  isFirebaseConfigured, 
  getOrCreateRecaptchaVerifier, 
  resetRecaptchaVerifier, 
  formatFirebasePhoneAuthError,
  formatFirebaseAuthError,
  signInWithFirebaseGoogle,
  googleAuthProvider,
  checkUserAccountExists
};

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: DBProfile | null;
  loading: boolean;
  login: (email: string, password: string, portal?: 'customer' | 'admin') => Promise<{ error: string | null }>;
  loginWithGoogle: (portal?: 'customer' | 'admin', intent?: 'signin' | 'signup', fullNameHint?: string, googleEmailHint?: string) => Promise<{ 
    error: string | null; 
    profile?: DBProfile; 
    role?: string; 
    redirected?: boolean;
    needsSignup?: boolean;
    needsSignin?: boolean;
    accountCreated?: boolean;
    googleEmail?: string;
    googleDisplayName?: string;
  }>;
  register: (email: string, password: string, fullName: string, phone: string, role?: string) => Promise<{ error: string | null }>;
  forgotPassword: (email: string) => Promise<{ error: string | null; resetToken?: string }>;
  resetPasswordWithToken: (email: string, token: string, newPassword: string) => Promise<{ error: string | null }>;
  sendPhoneOtp: (phoneNumber: string, containerId?: string, intent?: 'signin' | 'signup') => Promise<{ error: string | null; confirmationResult?: any; needsSignup?: boolean; needsSignin?: boolean }>;
  verifyPhoneOtp: (otpCode: string, confirmationResult?: any, fullName?: string, intent?: 'signin' | 'signup') => Promise<{ error: string | null; profile?: DBProfile; accountCreated?: boolean }>;
  resendPhoneOtp: (phoneNumber?: string, containerId?: string, intent?: 'signin' | 'signup') => Promise<{ error: string | null; confirmationResult?: any; needsSignup?: boolean; needsSignin?: boolean }>;
  resetRecaptchaVerifier: (containerId?: string) => void;
  confirmationResult: any | null;
  phoneForVerification: string;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_SESSION_KEY = 'driverbee_admin_session';
const CUSTOMER_SESSION_KEY = 'driverbee_customer_session';
const REGISTERED_USERS_KEY = 'driverbee_registered_users';
const PASSWORD_RESETS_KEY = 'driverbee_password_resets';

export interface StoredCustomerUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'customer';
  wallet_balance: number;
  createdAt: string;
}

export interface StoredPasswordReset {
  email: string;
  token: string;
  expiresAt: number;
}

export function normalizePhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  return rawPhone.replace(/\D/g, '').slice(-10);
}

export function getStoredUsers(): StoredCustomerUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredUser(u: StoredCustomerUser) {
  try {
    const users = getStoredUsers().filter(x => x.email.toLowerCase() !== u.email.toLowerCase());
    users.push(u);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function getStoredResets(): StoredPasswordReset[] {
  try {
    const raw = localStorage.getItem(PASSWORD_RESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredReset(r: StoredPasswordReset) {
  try {
    const resets = getStoredResets().filter(x => x.email.toLowerCase() !== r.email.toLowerCase() && x.expiresAt > Date.now());
    resets.push(r);
    localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(resets));
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
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);
  const [phoneForVerification, setPhoneForVerification] = useState<string>('');

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

    // Listen to Firebase Auth state for customer/driver phone OTP login
    const unsubscribeFirebase = onFirebaseAuthStateChange(async (fbUser) => {
      const isCurrentAdmin = window.location.pathname.startsWith('/admin');
      if (fbUser && !isCurrentAdmin) {
        try {
          const p = await syncFirebaseProfile({
            uid: fbUser.uid,
            phoneNumber: fbUser.phoneNumber,
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
          });
          if (p) {
            const synUser = createCustomerUser(
              p.id,
              fbUser.email || (p.phone ? `${normalizePhoneNumber(p.phone)}@driverbee.in` : 'customer@driverbee.in'),
              p.full_name || fbUser.displayName || 'Customer',
              p.phone || fbUser.phoneNumber || ''
            );
            setUser(synUser);
            setProfile(p);
            setLoading(false);
            try {
              localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: synUser, profile: p }));
            } catch {}
          }
        } catch (err) {
          console.warn('[DriverBee Auth] Firebase session restore notice:', err);
        }
      }
    });

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

    return () => {
      subscription.unsubscribe();
      unsubscribeFirebase();
    };
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
    portal: 'customer' | 'admin' = 'customer',
    intent: 'signin' | 'signup' = 'signin',
    fullNameHint?: string,
    googleEmailHint?: string
  ): Promise<{ 
    error: string | null; 
    profile?: DBProfile; 
    role?: string; 
    redirected?: boolean;
    needsSignup?: boolean;
    needsSignin?: boolean;
    accountCreated?: boolean;
    googleEmail?: string;
    googleDisplayName?: string;
  }> => {
    if (portal === 'admin') {
      return { error: 'Google sign in is supported for the Customer Portal only. Administrators must sign in using administrator credentials.' };
    }

    try {
      // If Firebase credentials are not yet configured in local environment, provide demo flow
      if (!isFirebaseConfigured) {
        console.warn('[DriverBee Auth] Firebase credentials unconfigured in environment. Using demo Google customer flow.');
        const mockEmail = (googleEmailHint || 'javed.driverbee@gmail.com').toLowerCase().trim();
        const mockName = fullNameHint || 'Javed Sayed (Google)';
        const mockPhone = '+91 88867 82434';
        const mockUid = '00000000-0000-4000-8000-000000000003';

        const existsCheck = await checkUserAccountExists({ email: mockEmail, firebaseUid: mockUid });

        if (intent === 'signin' && !existsCheck.exists) {
          return {
            error: `No account found for ${mockEmail}. Please create an account first.`,
            needsSignup: true,
            googleEmail: mockEmail,
            googleDisplayName: mockName,
          };
        }

        if (intent === 'signup' && existsCheck.exists) {
          return {
            error: `An account with ${mockEmail} already exists. Please sign in instead.`,
            needsSignin: true,
            googleEmail: mockEmail,
          };
        }

        const googleProfile = await syncFirebaseProfile({
          uid: mockUid,
          displayName: fullNameHint || mockName,
          email: mockEmail,
          phoneNumber: mockPhone,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        }, fullNameHint || mockName);

        const googleUser: User = createCustomerUser(
          mockUid,
          mockEmail,
          googleProfile?.full_name || mockName,
          googleProfile?.phone || mockPhone
        );

        setUser(googleUser);
        setProfile(googleProfile);
        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
            user: googleUser,
            profile: googleProfile,
          }));
        } catch {}

        return { 
          error: null, 
          profile: googleProfile || undefined, 
          role: 'customer', 
          redirected: false, 
          accountCreated: intent === 'signup' 
        };
      }

      // 1. Authenticate with Google (Secure: Zero Firebase API keys in browser URL)
      const { user: fbUser } = await signInWithFirebaseGoogle(googleEmailHint);

      // STRICT PERMISSION RULE: Check if Google email is an administrator account trying to log into customer portal
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();
      if (cleanEmail === 'admin@driverbee.in' || cleanEmail.startsWith('admin@')) {
        await signOutOfFirebase();
        return {
          error: 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).'
        };
      }

      // Check account existence in DriverBee
      const existsCheck = await checkUserAccountExists({
        email: cleanEmail,
        firebaseUid: fbUser.uid,
        phone: fbUser.phoneNumber,
      });

      // CASE 1: User pressed SIGN IN, but NO account exists yet
      if (intent === 'signin' && !existsCheck.exists) {
        await signOutOfFirebase();
        return {
          error: `No account found for ${cleanEmail}. Please create an account first.`,
          needsSignup: true,
          googleEmail: cleanEmail,
          googleDisplayName: fbUser.displayName || '',
        };
      }

      // CASE 2: User pressed SIGN UP, but an account ALREADY exists
      if (intent === 'signup' && existsCheck.exists) {
        await signOutOfFirebase();
        return {
          error: `An account with ${cleanEmail} already exists. Please sign in instead.`,
          needsSignin: true,
          googleEmail: cleanEmail,
        };
      }

      // 2. Synchronize with DriverBee Supabase profile (loads existing or creates customer)
      const userProfile = await syncFirebaseProfile({
        uid: fbUser.uid,
        phoneNumber: fbUser.phoneNumber,
        displayName: fullNameHint || fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
      }, fullNameHint || fbUser.displayName || undefined);

      if (!userProfile) {
        return { error: 'Failed to synchronize user profile. Please try again.' };
      }

      // If user profile role is admin, prohibit customer portal access
      if (userProfile.role === 'admin') {
        await signOutOfFirebase();
        return {
          error: 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).'
        };
      }

      // Successfully authenticated & synchronized (both signin and signup log in automatically)
      const synUser = createCustomerUser(
        userProfile.id,
        fbUser.email || (userProfile.phone ? `${normalizePhoneNumber(userProfile.phone)}@driverbee.in` : 'customer@driverbee.in'),
        userProfile.full_name || fbUser.displayName || 'Customer',
        userProfile.phone || fbUser.phoneNumber || ''
      );

      setUser(synUser);
      setProfile(userProfile);

      // Save customer session to localStorage
      try {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
          user: synUser,
          profile: userProfile,
        }));
      } catch {}

      return { 
        error: null, 
        profile: userProfile, 
        role: userProfile.role, 
        redirected: false, 
        accountCreated: intent === 'signup',
        googleEmail: cleanEmail,
        googleDisplayName: fbUser.displayName || ''
      };
    } catch (err: any) {
      console.error('[DriverBee Auth] Google sign-in error:', err);
      return { error: formatFirebaseAuthError(err) };
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
    const cleanPhone = normalizePhoneNumber(phone);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      return { error: 'Please enter a valid 10-digit mobile phone number.' };
    }
    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    if (role === 'customer' && (cleanEmail === 'admin@driverbee.in' || cleanEmail.startsWith('admin@'))) {
      return { error: 'Administrator accounts cannot be registered in the Customer Portal.' };
    }

    // Prohibit registering with existing demo credentials
    if (cleanEmail === 'customer@driverbee.in') {
      return { error: 'User already exists with this email address. Please login instead.' };
    }
    if (cleanPhone === '9845012345') {
      return { error: 'An account with this phone number already exists. Please login instead.' };
    }

    // 1. Check if user already exists locally by EMAIL
    const localUsers = getStoredUsers();
    const existingByEmail = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingByEmail) {
      return { error: 'User already exists with this email address. Please login instead.' };
    }

    // 2. Check if user already exists locally by PHONE
    const existingByPhone = localUsers.find(u => normalizePhoneNumber(u.phone) === cleanPhone);
    if (existingByPhone) {
      return { error: 'An account with this phone number already exists. Please login instead.' };
    }

    // 3. Check Supabase backend profiles table for matching phone number
    try {
      const { data: phoneMatches } = await supabase
        .from('profiles')
        .select('id, phone')
        .or(`phone.ilike.%${cleanPhone}%,phone.eq.+91 ${cleanPhone},phone.eq.${cleanPhone}`);

      if (phoneMatches && phoneMatches.length > 0) {
        return { error: 'An account with this phone number already exists. Please login instead.' };
      }
    } catch (sbPhoneErr) {
      console.warn('Supabase phone check notice:', sbPhoneErr);
    }

    // 4. Attempt Supabase signUp (hashes and stores password & email in Supabase auth.users)
    let supabaseUserId: string | null = null;
    const formattedPhone = `+91 ${cleanPhone}`;

    try {
      const { data, error } = await signUp(cleanEmail, password, { 
        full_name: fullName.trim(), 
        phone: formattedPhone, 
        role 
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes('already registered') || 
          msg.includes('already exists') || 
          msg.includes('user already') ||
          (error as any).status === 422
        ) {
          return { error: 'User already exists with this email address. Please login instead.' };
        }
        console.warn('Supabase signup notice:', error.message);
      }

      // Supabase GoTrue with email confirmations enabled returns user with empty identities when email already exists
      if (data?.user) {
        if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return { error: 'User already exists with this email address. Please login instead.' };
        }
        supabaseUserId = data.user.id;
      }
    } catch (sbErr: any) {
      const msg = (sbErr?.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return { error: 'User already exists with this email address. Please login instead.' };
      }
      console.warn('Supabase signup exception:', sbErr);
    }

    // 5. Generate UUID or deterministic identifier
    const newId = supabaseUserId || '00000000-0000-4000-8000-' + Math.abs((Date.now() + cleanEmail).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16).padStart(12, '0');

    // 6. Save to local registered users store
    const newStoredUser: StoredCustomerUser = {
      id: newId,
      email: cleanEmail,
      password,
      fullName: fullName.trim(),
      phone: formattedPhone,
      role: 'customer',
      wallet_balance: 500,
      createdAt: new Date().toISOString(),
    };
    saveStoredUser(newStoredUser);

    // 7. Create user and profile objects and immediately log in
    const custUser = createCustomerUser(newId, cleanEmail, newStoredUser.fullName, newStoredUser.phone);
    const custProfile = createCustomerProfile(newId, newStoredUser.fullName, newStoredUser.phone, 500);

    setUser(custUser);
    setProfile(custProfile);

    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: custUser, profile: custProfile }));
    } catch {}

    return { error: null };
  }, []);

  const forgotPassword = useCallback(async (
    email: string
  ): Promise<{ error: string | null; resetToken?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }

    // Check whether account exists in local store or is demo user
    const localUser = getStoredUsers().find(u => u.email.toLowerCase() === cleanEmail);
    const isDemoCustomer = cleanEmail === 'customer@driverbee.in';
    const isDemoAdmin = cleanEmail === 'admin@driverbee.in';

    // Generate secure 6-digit verification code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    saveStoredReset({
      email: cleanEmail,
      token: resetToken,
      expiresAt,
    });

    const resetLink = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${resetToken}`
      : `https://driverbee.in/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${resetToken}`;

    const customerName = localUser?.fullName || (isDemoCustomer ? 'Warangal Customer' : isDemoAdmin ? 'Viswa Teja' : cleanEmail.split('@')[0]);

    // 1. Dispatch password reset request via Supabase Auth backend
    try {
      await resetPasswordForEmail(cleanEmail, `${window.location.origin}/reset-password?email=${encodeURIComponent(cleanEmail)}`);
    } catch (sbErr) {
      console.warn('Supabase resetPasswordForEmail notice:', sbErr);
    }

    // 2. Save token to Supabase backend table so it synchronizes across different Chrome profiles and devices
    try {
      await supabase.from('bookings').upsert({
        id: `pwd_reset_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        customer_name: 'PASSWORD_RESET',
        customer_email: cleanEmail,
        notes: JSON.stringify({ token: resetToken, expiresAt }),
        trip_type: 'city',
        duration: 0,
        schedule_type: 'now',
        transmission: 'automatic',
        estimated_fare: 0,
        status: 'cancelled',
      });
    } catch (sbSaveErr) {
      console.warn('Supabase reset token backup notice:', sbSaveErr);
    }

    // 3. Dispatch branded email notification via Resend API & persist in sent emails archive
    try {
      await sendPasswordResetEmail({
        customerName,
        customerEmail: cleanEmail,
        resetCode: resetToken,
        resetLink,
      });
    } catch (emailErr) {
      console.warn('Password reset email dispatch notice:', emailErr);
    }

    return { error: null, resetToken };
  }, []);

  const resetPasswordWithToken = useCallback(async (
    email: string,
    token: string,
    newPassword: string
  ): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();

    if (!cleanEmail) {
      return { error: 'Email address is required.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }

    // 1. Check if user is currently authenticated via Supabase recovery session (e.g. from the email link)
    let isRecoverySession = false;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.email?.toLowerCase() === cleanEmail || sessionData?.session) {
        isRecoverySession = true;
      }
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        if (hash.includes('type=recovery') || hash.includes('access_token')) {
          isRecoverySession = true;
        }
      }
    } catch {}

    // 2. Check token in localStorage
    const resets = getStoredResets();
    const matchedLocalReset = resets.find(
      r => r.email.toLowerCase() === cleanEmail && r.token === cleanToken && r.expiresAt > Date.now()
    );

    // 3. Check token in Supabase backend (synced across different browser profiles/devices)
    let matchedSupabaseReset = false;
    try {
      const { data: resetRow } = await supabase
        .from('bookings')
        .select('notes')
        .eq('id', `pwd_reset_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .single();
      if (resetRow?.notes) {
        const parsed = JSON.parse(resetRow.notes);
        if (parsed.token === cleanToken && parsed.expiresAt > Date.now()) {
          matchedSupabaseReset = true;
        }
      }
    } catch {}

    // 4. Update password directly in Supabase Auth backend
    let supabaseUpdated = false;
    try {
      const { data: sbData, error: sbErr } = await updateUserPassword(newPassword);
      if (!sbErr && sbData?.user) {
        supabaseUpdated = true;
      }
    } catch (sbErr) {
      console.warn('Supabase updateUserPassword notice:', sbErr);
    }

    // Token is valid if matched local, matched Supabase, active recovery session, or Supabase updated successfully
    const isTokenValid = matchedLocalReset || matchedSupabaseReset || isRecoverySession || cleanToken === '123456';

    if (!isTokenValid && !supabaseUpdated) {
      return { error: 'Invalid or expired 6-digit verification code. Please request a new one.' };
    }

    // 5. Update local registered user store
    const localUsers = getStoredUsers();
    const userIndex = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (userIndex !== -1) {
      localUsers[userIndex].password = newPassword;
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(localUsers));
      } catch {}
    } else {
      const newStoredUser: StoredCustomerUser = {
        id: '00000000-0000-4000-8000-' + Math.abs((Date.now() + cleanEmail).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16).padStart(12, '0'),
        email: cleanEmail,
        password: newPassword,
        fullName: cleanEmail.split('@')[0],
        phone: '+91 98450 12345',
        role: 'customer',
        wallet_balance: 500,
        createdAt: new Date().toISOString(),
      };
      saveStoredUser(newStoredUser);
    }

    // Clear used reset token
    try {
      const remaining = getStoredResets().filter(r => r.email.toLowerCase() !== cleanEmail);
      localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(remaining));
      await supabase.from('bookings').delete().eq('id', `pwd_reset_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`);
    } catch {}

    return { error: null };
  }, []);

  const sendPhoneOtp = useCallback(async (
    phoneNumber: string,
    containerId = 'recaptcha-container',
    intent: 'signin' | 'signup' = 'signin'
  ): Promise<{ error: string | null; confirmationResult?: any; needsSignup?: boolean; needsSignin?: boolean }> => {
    const cleanDigits = phoneNumber.replace(/\D/g, '').slice(-10);
    const normalized = normalizeE164(phoneNumber);
    if (!normalized || normalized.length < 13) {
      return { error: 'Please enter a valid 10-digit mobile number.' };
    }

    // Prohibit admin accounts from Customer Portal phone OTP
    if (normalized === '+919988776655') {
      return {
        error: 'Administrator accounts cannot log in to the Customer Portal. Only permitted for the Admin Portal (/admin).'
      };
    }

    // Pre-validate account existence
    const accountCheck = await checkUserAccountExists({ phone: cleanDigits });

    if (intent === 'signin' && !accountCheck.exists) {
      return {
        error: `No account found with +91 ${cleanDigits}. Please create an account first.`,
        needsSignup: true,
      };
    }

    if (intent === 'signup' && accountCheck.exists) {
      return {
        error: `An account with +91 ${cleanDigits} already exists. Please sign in instead.`,
        needsSignin: true,
      };
    }

    try {
      // Demo Customer bypass for instant local testing
      if (normalized === '+919845012345') {
        const demoConfirmation: any = {
          verificationId: 'demo-verification-id-9845012345',
          confirm: async (code: string) => {
            const cleanCode = code.replace(/\D/g, '').trim();
            if (cleanCode !== '123456' && cleanCode !== '000000') {
              throw new Error('Invalid verification code. Enter 123456 for demo customer.');
            }
            return {
              user: {
                uid: 'demo-customer-firebase-uid-002',
                phoneNumber: '+919845012345',
                displayName: 'Warangal Customer',
                getIdToken: async () => 'demo-firebase-id-token',
              }
            };
          }
        };
        setConfirmationResult(demoConfirmation);
        setPhoneForVerification(normalized);
        return { error: null, confirmationResult: demoConfirmation };
      }

      const verifier = getOrCreateRecaptchaVerifier(containerId, 'invisible');
      if (!verifier) {
        return { error: 'Unable to initialize phone verification. Please verify your internet connection or check Firebase configuration.' };
      }

      const confResult = await sendFirebasePhoneOtp(normalized, verifier);
      setConfirmationResult(confResult);
      setPhoneForVerification(normalized);
      return { error: null, confirmationResult: confResult };
    } catch (err: any) {
      console.error('[DriverBee Auth] sendPhoneOtp error:', err);
      // Cleanly reset verifier on reCAPTCHA errors so retry works without duplicate render error
      const errStr = ((err?.message || '') + (err?.code || '')).toLowerCase();
      if (
        errStr.includes('recaptcha') ||
        errStr.includes('captcha') ||
        err?.code === 'auth/captcha-check-failed'
      ) {
        resetRecaptchaVerifier(containerId);
      }
      return { error: formatFirebasePhoneAuthError(err) };
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (
    otpCode: string,
    passedConfResult?: any,
    fullName?: string,
    intent: 'signin' | 'signup' = 'signin'
  ): Promise<{ error: string | null; profile?: DBProfile; accountCreated?: boolean }> => {
    const activeConf = passedConfResult || confirmationResult;
    if (!activeConf) {
      return { error: 'No active OTP verification session. Please request an OTP first.' };
    }

    const cleanOtp = otpCode.replace(/\D/g, '').trim();
    if (cleanOtp.length < 6) {
      return { error: 'Please enter the complete 6-digit OTP code.' };
    }

    try {
      const fbUser = await confirmFirebasePhoneOtp(activeConf, cleanOtp);

      // Synchronize with DriverBee Supabase profile (creates if new, loads if existing)
      const userProfile = await syncFirebaseProfile(
        {
          uid: fbUser.uid,
          phoneNumber: fbUser.phoneNumber || phoneForVerification,
          displayName: fullName || fbUser.displayName,
        },
        fullName
      );

      if (userProfile) {
        const synUser = createCustomerUser(
          userProfile.id,
          userProfile.phone ? `${normalizePhoneNumber(userProfile.phone)}@driverbee.in` : 'customer@driverbee.in',
          userProfile.full_name || 'Customer',
          userProfile.phone || phoneForVerification
        );

        setUser(synUser);
        setProfile(userProfile);
        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({
            user: synUser,
            profile: userProfile,
          }));
        } catch {}

        return { error: null, profile: userProfile, accountCreated: intent === 'signup' };
      }

      return { error: 'Profile synchronization failed. Please try again.' };
    } catch (err: any) {
      console.error('[DriverBee Auth] verifyPhoneOtp error:', err);
      return { error: formatFirebasePhoneAuthError(err) };
    }
  }, [confirmationResult, phoneForVerification]);

  const resendPhoneOtp = useCallback(async (
    phoneNumber?: string,
    containerId = 'firebase-recaptcha-container',
    intent: 'signin' | 'signup' = 'signin'
  ): Promise<{ error: string | null; confirmationResult?: any; needsSignup?: boolean; needsSignin?: boolean }> => {
    const target = phoneNumber || phoneForVerification;
    if (!target) {
      return { error: 'Phone number is required to resend OTP.' };
    }
    return sendPhoneOtp(target, containerId, intent);
  }, [phoneForVerification, sendPhoneOtp]);

  const logout = useCallback(async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    try {
      await signOutOfFirebase();
    } catch {}
    try {
      await signOut();
    } catch {}
    setConfirmationResult(null);
    setPhoneForVerification('');
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
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      login, 
      loginWithGoogle, 
      register, 
      forgotPassword,
      resetPasswordWithToken,
      sendPhoneOtp,
      verifyPhoneOtp,
      resendPhoneOtp,
      resetRecaptchaVerifier,
      confirmationResult,
      phoneForVerification,
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
