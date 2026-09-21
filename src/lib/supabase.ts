import { createClient } from '@supabase/supabase-js';
import { DEFAULT_DRIVER_NO_PHOTO } from '../types';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  ? (import.meta.env.VITE_SUPABASE_URL as string)
  : '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
  : '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[DriverBee Security] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Please configure them in your environment variables.'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// ─── Database types ──────────────────────────────────────────────────────────

export interface DBProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin' | 'driver';
  city: string | null;
  wallet_balance: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBFamilyMember {
  id: string;
  user_id: string;
  name: string;
  relation: string;
  phone: string | null;
  created_at: string;
}

export interface DBDriverProfile {
  id: string;
  badge: string | null;
  rating: number;
  trips_count: number;
  is_on_duty: boolean;
  area: string | null;
  photo_url: string | null;
  today_earnings: number;
  assigned_booking_id: string | null;
  created_at: string;
  profiles?: DBProfile;
  name?: string | null;
  phone?: string | null;
}

export interface DBBooking {
  id: string;
  created_at: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  trip_type: 'city' | 'outside' | 'intercity';
  duration: number;
  schedule_type: 'now' | 'later';
  scheduled_date: string | null;
  scheduled_time: string | null;
  transmission: string;
  car_model: string | null;
  car_plate: string | null;
  for_whom: string | null;
  area: string | null;
  estimated_fare: number;
  status: 'pending' | 'assigned' | 'accepted' | 'active' | 'completed' | 'cancelled';
  assigned_driver_id: string | null;
  assigned_driver_name: string | null;
  notes: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface DBWalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string | null;
  booking_id: string | null;
  created_at: string;
}

// ─── Auth Helpers ────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, meta: { full_name: string; phone: string; role: string }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: meta },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle(redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function getProfile(userId: string): Promise<DBProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

// ─── Booking Helpers ─────────────────────────────────────────────────────────

export async function createBooking(
  booking: Omit<DBBooking, 'created_at' | 'updated_at' | 'completed_at' | 'status' | 'assigned_driver_id' | 'assigned_driver_name'> & {
    notes?: string | null;
  }
) {
  // Check if customer_id is a valid UUID that exists in profiles; otherwise use null to satisfy FK constraint bookings_customer_id_fkey
  let safeCustomerId: string | null = null;
  if (booking.customer_id && UUID_RE.test(booking.customer_id)) {
    try {
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', booking.customer_id)
        .maybeSingle();
      if (profileRow?.id) {
        safeCustomerId = profileRow.id;
      }
    } catch {}
  }

  const insertPayload = {
    ...booking,
    customer_id: safeCustomerId,
    notes: booking.notes ?? null,
    status: 'pending' as const,
  };

  let { data, error } = await supabase.from('bookings').insert(insertPayload).select().single();

  // If there is any FK error on customer_id, immediately retry with customer_id: null
  if (error && (error.code === '23503' || error.message?.toLowerCase().includes('foreign key'))) {
    console.warn('[DriverBee] Retrying createBooking with customer_id: null due to FK constraint');
    const retryResult = await supabase.from('bookings').insert({ ...insertPayload, customer_id: null }).select().single();
    if (!retryResult.error && retryResult.data) {
      return { data: retryResult.data as DBBooking, error: null };
    }
    error = retryResult.error;
  }

  if (error) {
    console.error('[DriverBee] Supabase createBooking error:', error);
    return { data: null, error };
  }
  return { data: data as DBBooking, error: null };
}

export function isRemovedBooking(b: DBBooking | { customer_phone?: string | null; notes?: string | null }): boolean {
  if (b.notes?.includes('[REMOVED_TEST_DATA]') || b.notes?.includes('[TEST_DATA_REMOVED]') || b.notes?.includes('[DELETED]')) return true;
  const digits = (b.customer_phone || '').replace(/\D/g, '');
  if (digits.includes('9845012345')) return true;
  return false;
}

export async function fetchAllBookings(): Promise<DBBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.filter(b => !isRemovedBooking(b));
}

export async function fetchMyBookings(userId: string): Promise<DBBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.filter(b => !isRemovedBooking(b));
}

export async function cancelBooking(bookingId: string) {
  return supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId);
}

export async function deleteBooking(bookingId: string) {
  // Soft-delete: mark as cancelled with tombstone note so it never reappears
  const result = await supabase
    .from('bookings')
    .update({ status: 'cancelled', notes: '[DELETED]', updated_at: new Date().toISOString() })
    .eq('id', bookingId);
  if (result.error) {
    console.error('[DriverBee] deleteBooking DB error:', result.error.message);
  }
  return result;
}

// UUID regex – Supabase driver_id FK requires a real UUID
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateBookingStatus(
  bookingId: string,
  status: DBBooking['status'],
  extra?: { assigned_driver_id?: string; assigned_driver_name?: string; completed_at?: string }
) {
  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'completed') payload.completed_at = new Date().toISOString();

  if (extra) {
    // Only include assigned_driver_id when it's a real UUID (FK constraint)
    if (extra.assigned_driver_id && UUID_RE.test(extra.assigned_driver_id)) {
      payload.assigned_driver_id = extra.assigned_driver_id;
    }
    if (extra.assigned_driver_name) {
      payload.assigned_driver_name = extra.assigned_driver_name;
    }
    if (extra.completed_at) {
      payload.completed_at = extra.completed_at;
    }
  }

  let result = await supabase.from('bookings').update(payload).eq('id', bookingId);

  // If there's an FK error on assigned_driver_id (e.g. custom/mock driver ID), retry with assigned_driver_id: null
  if (result.error && (result.error.code === '23503' || result.error.message?.toLowerCase().includes('foreign key'))) {
    console.warn('[DriverBee] FK constraint error on assigned_driver_id. Retrying with assigned_driver_id: null');
    delete payload.assigned_driver_id;
    result = await supabase.from('bookings').update(payload).eq('id', bookingId);
  }

  if (result.error) {
    console.error('[DriverBee] updateBookingStatus DB error:', result.error.message, payload);
  }
  return result;
}

export async function updateBookingCustomerName(bookingId: string, customerName: string) {
  const result = await supabase
    .from('bookings')
    .update({ customer_name: customerName, updated_at: new Date().toISOString() })
    .eq('id', bookingId);
  if (result.error) {
    console.error('[DriverBee] updateBookingCustomerName DB error:', result.error.message);
  }
  return result;
}

// ─── Driver Helpers ──────────────────────────────────────────────────────────

export async function fetchAllDrivers(): Promise<(DBDriverProfile & { profiles?: DBProfile })[]> {
  try {
    // Attempt 1: Fetch with nested profiles relation
    const resWithProfiles = await supabase
      .from('driver_profiles')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });

    if (!resWithProfiles.error && resWithProfiles.data) {
      return resWithProfiles.data as any;
    }
  } catch {}

  try {
    // Attempt 2: Fetch driver_profiles directly
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[DriverBee] fetchAllDrivers warning:', error.message);
      return [];
    }
    return (data || []) as any;
  } catch (err: any) {
    console.warn('[DriverBee] fetchAllDrivers network error:', err);
    return [];
  }
}

export async function sbCreateDriver(driverData: {
  id?: string;
  name: string;
  phone: string;
  area: string;
  badge: string;
  rating?: number;
  is_on_duty?: boolean;
  photo?: string;
}) {
  const id = driverData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'drv-' + Date.now());
  const payload: any = {
    id,
    name: driverData.name,
    phone: driverData.phone,
    area: driverData.area || 'Warangal Operations',
    badge: driverData.badge || 'Professional Driver',
    rating: driverData.rating ?? 5.0,
    trips_count: 0,
    is_on_duty: driverData.is_on_duty ?? true,
    photo_url: driverData.photo || DEFAULT_DRIVER_NO_PHOTO,
    today_earnings: 0,
    created_at: new Date().toISOString(),
  };

  const result = await supabase.from('driver_profiles').insert(payload).select().single();
  if (result.error) {
    console.warn('[DriverBee] sbCreateDriver warning:', result.error.message);
  }
  return { ...result, id };
}

export async function sbUpdateDriver(driverId: string, updates: Partial<{
  name: string;
  phone: string;
  area: string;
  badge: string;
  rating: number;
  isOnDuty: boolean;
  photo: string;
  todayEarnings: number;
  assignedBookingId: string | null;
}>) {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.area !== undefined) payload.area = updates.area;
  if (updates.badge !== undefined) payload.badge = updates.badge;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  if (updates.isOnDuty !== undefined) payload.is_on_duty = updates.isOnDuty;
  if (updates.photo !== undefined) payload.photo_url = updates.photo;
  if (updates.todayEarnings !== undefined) payload.today_earnings = updates.todayEarnings;
  if (updates.assignedBookingId !== undefined) payload.assigned_booking_id = updates.assignedBookingId;

  return supabase.from('driver_profiles').update(payload).eq('id', driverId);
}

export async function sbDeleteDriver(driverId: string) {
  return supabase.from('driver_profiles').delete().eq('id', driverId);
}

export async function toggleDriverDuty(driverId: string, isOnDuty: boolean) {
  return supabase.from('driver_profiles').update({ is_on_duty: isOnDuty }).eq('id', driverId);
}

// ─── Family Helpers ──────────────────────────────────────────────────────────

export async function fetchFamilyMembers(userId: string): Promise<DBFamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data;
}

export async function addFamilyMember(member: Omit<DBFamilyMember, 'id' | 'created_at'>) {
  return supabase.from('family_members').insert(member).select().single();
}

export async function removeFamilyMember(id: string) {
  return supabase.from('family_members').delete().eq('id', id);
}

// ─── Wallet Helpers ──────────────────────────────────────────────────────────

export async function addWalletCredit(userId: string, amount: number, description: string) {
  const { error: txError } = await supabase.from('wallet_transactions').insert({
    user_id: userId,
    type: 'credit',
    amount,
    description,
  });
  if (txError) return { error: txError };
  return supabase
    .from('profiles')
    .update({ wallet_balance: supabase.rpc('increment_wallet', { user_id: userId, amount }) })
    .eq('id', userId);
}

export async function fetchWalletTransactions(userId: string): Promise<DBWalletTransaction[]> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}
