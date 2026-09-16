import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://xcisrhikagtpuqwseoqq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaXNyaGlrYWd0cHVxd3Nlb3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODQzOTAsImV4cCI6MjEwNTA2MDM5MH0.t4nk9kYFu8pRJ5cRNfwCD81I0OYTsdLboyR5h3hTUhI';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
}

export interface DBBooking {
  id: string;
  created_at: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  trip_type: 'city' | 'outside' | 'airport' | 'intercity';
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

export async function createBooking(booking: Omit<DBBooking, 'created_at' | 'updated_at' | 'completed_at' | 'status' | 'assigned_driver_id' | 'assigned_driver_name' | 'notes'>) {
  return supabase.from('bookings').insert({
    ...booking,
    status: 'pending',
  }).select().single();
}

export async function fetchAllBookings(): Promise<DBBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function fetchMyBookings(userId: string): Promise<DBBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function updateBookingStatus(
  bookingId: string,
  status: DBBooking['status'],
  extra?: { assigned_driver_id?: string; assigned_driver_name?: string; completed_at?: string }
) {
  return supabase.from('bookings').update({
    status,
    updated_at: new Date().toISOString(),
    ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    ...extra,
  }).eq('id', bookingId);
}

// ─── Driver Helpers ──────────────────────────────────────────────────────────

export async function fetchAllDrivers(): Promise<(DBDriverProfile & { profiles: DBProfile })[]> {
  const { data, error } = await supabase
    .from('driver_profiles')
    .select('*, profiles(*)');
  if (error) return [];
  return data as any;
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
