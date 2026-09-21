import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { TripType, DurationOption } from '../types';
import {
  supabase,
  DBBooking,
  DBDriverProfile,
  DBProfile,
  fetchAllBookings,
  fetchAllDrivers,
  createBooking as sbCreateBooking,
  updateBookingStatus as sbUpdateStatus,
  updateBookingCustomerName as sbUpdateCustomerName,
  deleteBooking as sbDeleteBooking,
  isRemovedBooking,
  toggleDriverDuty as sbToggleDuty,
} from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Types (mapped from Supabase DB types)
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus = DBBooking['status'];

export interface LiveBooking {
  id: string;
  createdAt: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  tripType: TripType;
  duration: number;
  scheduleType: 'now' | 'later';
  date: string;
  time: string;
  transmission: 'automatic' | 'manual';
  carModel: string;
  carPlate: string;
  forWhom: string;
  area: string;
  estimatedFare: number;
  status: BookingStatus;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedDriverPhone?: string | null;
  notes?: string;
  completedAt?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  rating: number;
  tripsCount: number;
  isOnDuty: boolean;
  area: string;
  photo: string;
  badge: string;
  todayEarnings: number;
  assignedBookingId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mappers (DB → App types)
// ─────────────────────────────────────────────────────────────────────────────

function mapBooking(b: DBBooking): LiveBooking {
  let driverName = b.assigned_driver_name || null;
  let driverId = b.assigned_driver_id || null;
  let driverPhone: string | null = null;

  // Restore cached driver info if Supabase column was null or to retrieve driverPhone
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('driverbee_driver_' + b.id);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && !driverName) driverName = parsed.name;
        if (parsed.id && !driverId) driverId = parsed.id;
        if (parsed.phone) driverPhone = parsed.phone;
      }
    } catch {}
  }

  // Also if driverName is in DB, cache it locally so it survives refreshes
  if (driverName && typeof window !== 'undefined') {
    try {
      localStorage.setItem('driverbee_driver_' + b.id, JSON.stringify({
        name: driverName,
        phone: driverPhone || '+91 75694 02288',
        id: driverId,
      }));
    } catch {}
  }

  return {
    id: b.id,
    createdAt: b.created_at,
    customerId: b.customer_id,
    customerName: b.customer_name,
    customerPhone: b.customer_phone ?? '',
    tripType: b.trip_type as TripType,
    duration: b.duration,
    scheduleType: b.schedule_type,
    date: b.scheduled_date ?? '',
    time: b.scheduled_time ?? '',
    transmission: (b.transmission ?? 'automatic') as 'automatic' | 'manual',
    carModel: b.car_model ?? '',
    carPlate: b.car_plate ?? '',
    forWhom: b.for_whom ?? '',
    area: b.area ?? '',
    estimatedFare: Number(b.estimated_fare),
    status: (driverName && (b.status === 'accepted' || b.status === 'pending')) ? 'assigned' : b.status,
    assignedDriverId: driverId,
    assignedDriverName: driverName,
    assignedDriverPhone: driverPhone,
    notes: b.notes ?? undefined,
    completedAt: b.completed_at ?? undefined,
  };
}

function mapDriver(d: DBDriverProfile & { profiles?: DBProfile }): DriverProfile {
  return {
    id: d.id,
    name: d.profiles?.full_name ?? 'Driver',
    phone: d.profiles?.phone ?? '',
    rating: Number(d.rating),
    tripsCount: d.trips_count,
    isOnDuty: d.is_on_duty,
    area: d.area ?? '',
    photo: d.photo_url ?? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    badge: d.badge ?? 'Professional Driver',
    todayEarnings: Number(d.today_earnings),
    assignedBookingId: d.assigned_booking_id,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed data (fallback when DB is empty or not yet configured)
// ─────────────────────────────────────────────────────────────────────────────

// No seed/demo bookings — real bookings come exclusively from Supabase
const SEED_BOOKINGS: LiveBooking[] = [];

const CUSTOM_DRIVERS_STORAGE_KEY = 'driverbee_admin_drivers';

function loadCustomDrivers(): DriverProfile[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DRIVERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCustomDrivers(list: DriverProfile[]) {
  try {
    localStorage.setItem(CUSTOM_DRIVERS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface BookingContextValue {
  bookings: LiveBooking[];
  drivers: DriverProfile[];
  addBooking: (booking: Omit<LiveBooking, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'assignedDriverName'>) => Promise<string>;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateCustomerName: (id: string, customerName: string) => void;
  deleteBooking: (id: string) => void;
  assignDriver: (bookingId: string, driverId: string, driverName?: string, driverPhone?: string) => boolean | void;
  acceptBooking: (bookingId: string, driverId?: string) => void;
  toggleDriverDuty: (driverId: string) => void;
  addDriver: (driver: Omit<DriverProfile, 'id' | 'todayEarnings' | 'tripsCount' | 'assignedBookingId'>) => DriverProfile;
  updateDriver: (driverId: string, updates: Partial<DriverProfile>) => void;
  deleteDriver: (driverId: string) => void;
  getBookingsForDriver: (driverId: string) => LiveBooking[];
  newBookingAlert: LiveBooking | null;
  clearNewBookingAlert: () => void;
  useSupabase: boolean;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const BOOKING_BROADCAST_CHANNEL = 'driverbee_booking_channel';

export function getDriverActiveBooking(
  driver: { id: string; name: string; assignedBookingId?: string | null },
  bookings: LiveBooking[]
): LiveBooking | undefined {
  const todayStr = new Date().toISOString().split('T')[0];
  return bookings.find(b => {
    const isThisDriver =
      b.assignedDriverId === driver.id ||
      (b.assignedDriverName && driver.name && b.assignedDriverName.toLowerCase().trim() === driver.name.toLowerCase().trim()) ||
      (driver.assignedBookingId && b.id === driver.assignedBookingId && (!b.assignedDriverName || b.assignedDriverName.toLowerCase().trim() === driver.name.toLowerCase().trim()));

    if (!isThisDriver) return false;

    const isInProgress = b.status === 'assigned' || b.status === 'accepted' || b.status === 'active';
    if (!isInProgress) return false;

    // Active trips in progress are always busy
    if (b.status === 'active') return true;

    // For assigned / accepted rides, only count if scheduled today or in the future
    const bookingDate = b.date && b.date.match(/^\d{4}-\d{2}-\d{2}$/)
      ? b.date
      : (b.createdAt ? b.createdAt.split('T')[0] : todayStr);
    return bookingDate >= todayStr;
  });
}

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<LiveBooking[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('driverbee_live_bookings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter(b => !isRemovedBooking(b as any) && !b.id.startsWith('DB-'));
          }
        }
      } catch {}
    }
    return [];
  });
  const [drivers, setDrivers] = useState<DriverProfile[]>(loadCustomDrivers);
  const [newBookingAlert, setNewBookingAlert] = useState<LiveBooking | null>(null);
  const [useSupabase, setUseSupabase] = useState(false);
  const idCounter = useRef(100004);

  // Cross-tab sync via BroadcastChannel and StorageEvent
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel(BOOKING_BROADCAST_CHANNEL);
      bc.onmessage = (e) => {
        if (e.data?.type === 'BOOKING_ASSIGNED') {
          const { bookingId, status, driverId, driverName, driverPhone } = e.data;
          setBookings(prev =>
            prev.map(b =>
              b.id === bookingId
                ? {
                    ...b,
                    status: (status || 'assigned') as BookingStatus,
                    assignedDriverId: driverId,
                    assignedDriverName: driverName,
                    assignedDriverPhone: driverPhone,
                  }
                : b
            )
          );
        } else if (e.data?.type === 'STATUS_UPDATED') {
          const { bookingId, status } = e.data;
          setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
        } else if (e.data?.type === 'BOOKINGS_SYNC' && Array.isArray(e.data.bookings)) {
          setBookings(e.data.bookings);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'driverbee_live_bookings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setBookings(parsed);
        } catch (err) {
          console.warn(err);
        }
      }
      if (e.key === CUSTOM_DRIVERS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setDrivers(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const refreshFromSupabase = useCallback(() =>
    Promise.all([fetchAllBookings(), fetchAllDrivers()]).then(([bData, dData]) => {
      if (bData) {
        const mapped = bData.map(mapBooking);
        setBookings(mapped);
        try {
          localStorage.setItem('driverbee_live_bookings', JSON.stringify(mapped));
        } catch {}
      }
      const custom = loadCustomDrivers();
      if (dData && dData.length > 0) {
        const sbDrivers = dData.map(mapDriver);
        const merged = [...custom];
        for (const s of sbDrivers) {
          const idx = merged.findIndex(m => m.id === s.id);
          if (idx >= 0) merged[idx] = s;
          else merged.push(s);
        }
        setDrivers(merged);
      } else {
        setDrivers(custom);
      }
    }).catch(err => {
      console.warn('[DriverBee] Supabase refresh failed:', err);
    }), []);

  // ── Load from Supabase on mount (if configured) ──────────────────────────
  useEffect(() => {
    setUseSupabase(true);

    // Fetch initial data immediately
    refreshFromSupabase();

    // Fast polling every 2.5 seconds to guarantee immediate cross-window and cross-device sync
    const pollInterval = setInterval(refreshFromSupabase, 2500);

    // Use unique channel name per session to avoid cross-client conflicts
    const sessionId = Math.random().toString(36).slice(2, 8);

    // Real-time subscriptions (primary, instant updates)
    const bookingsSub = supabase
      .channel(`bookings-changes-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        if (payload.eventType === 'INSERT') {
          const raw = payload.new as DBBooking;
          if (isRemovedBooking(raw)) return;
          const newB = mapBooking(raw);
          setBookings(prev => {
            if (prev.some(b => b.id === newB.id)) return prev;
            return [newB, ...prev];
          });
          setNewBookingAlert(newB);
        } else if (payload.eventType === 'UPDATE') {
          const raw = payload.new as DBBooking;
          if (isRemovedBooking(raw)) {
            setBookings(prev => prev.filter(b => b.id !== raw.id));
            return;
          }
          const updatedB = mapBooking(raw);
          setBookings(prev => prev.map(b => b.id === updatedB.id ? updatedB : b));
        } else if (payload.eventType === 'DELETE') {
          setBookings(prev => prev.filter(b => b.id !== (payload.old as DBBooking).id));
        }
      })
      .subscribe();

    const driversSub = supabase
      .channel(`drivers-changes-${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'driver_profiles' }, _payload => {
        fetchAllDrivers().then(dData => { if (dData && dData.length > 0) setDrivers(dData.map(mapDriver)); });
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(driversSub);
    };
  }, []);

  // ── Add booking ──────────────────────────────────────────────────────────
  const addBooking = useCallback(async (
    data: Omit<LiveBooking, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'assignedDriverName'>
  ): Promise<string> => {
    // Determine the next sequential booking ID: 1, 2, 3, 4, 5...
    let maxId = 0;

    // 1. Scan in-memory bookings state
    setBookings(prev => {
      for (const b of prev) {
        if (isRemovedBooking(b as any)) continue;
        const n = parseInt(b.id.replace(/\D/g, ''), 10);
        if (!isNaN(n) && n < 100000 && n > maxId) maxId = n;
      }
      return prev;
    });

    // 2. Query Supabase directly for accurate count/max ID across all clients
    try {
      const { data: dbRows } = await supabase
        .from('bookings')
        .select('id, notes');
      if (dbRows) {
        for (const row of dbRows) {
          if (row.notes?.includes('[DELETED]') || row.notes?.includes('[REMOVED_TEST_DATA]')) continue;
          const n = parseInt(row.id.replace(/\D/g, ''), 10);
          if (!isNaN(n) && n < 100000 && n > maxId) maxId = n;
        }
      }
    } catch (e) {
      console.warn('[DriverBee] Error querying max booking id:', e);
    }

    // 3. Fallback counter from localStorage
    try {
      const storedSeq = parseInt(localStorage.getItem('driverbee_booking_seq') || '0', 10);
      if (!isNaN(storedSeq) && storedSeq > maxId) maxId = storedSeq;
    } catch {}

    let nextNum = maxId + 1;
    let id = String(nextNum);
    try {
      localStorage.setItem('driverbee_booking_seq', id);
    } catch {}

    const validDate = data.date && data.date !== 'Today'
      ? data.date
      : new Date().toISOString().split('T')[0];

    try {
      let insertResult = await sbCreateBooking({
        id,
        customer_id: data.customerId || null,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        trip_type: data.tripType,
        duration: data.duration,
        schedule_type: data.scheduleType,
        scheduled_date: validDate,
        scheduled_time: data.time || null,
        transmission: data.transmission,
        car_model: data.carModel,
        car_plate: data.carPlate,
        for_whom: data.forWhom,
        area: data.area,
        estimated_fare: data.estimatedFare,
        notes: data.notes || null,
      });

      // If duplicate key error, increment by 1 and retry
      if (insertResult.error && (insertResult.error.code === '23505' || insertResult.error.message?.includes('duplicate key'))) {
        nextNum += 1;
        id = String(nextNum);
        try {
          localStorage.setItem('driverbee_booking_seq', id);
        } catch {}
        insertResult = await sbCreateBooking({
          id,
          customer_id: data.customerId || null,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          trip_type: data.tripType,
          duration: data.duration,
          schedule_type: data.scheduleType,
          scheduled_date: validDate,
          scheduled_time: data.time || null,
          transmission: data.transmission,
          car_model: data.carModel,
          car_plate: data.carPlate,
          for_whom: data.forWhom,
          area: data.area,
          estimated_fare: data.estimatedFare,
          notes: data.notes || null,
        });
      }

      if (insertResult.error) {
        console.warn('[DriverBee] Supabase insert warning:', insertResult.error);
      } else {
        console.log('[DriverBee] Booking persisted to Supabase successfully:', id, insertResult.data);
      }
    } catch (err) {
      console.warn('[DriverBee] Supabase network error during booking:', err);
    }

    // Optimistic local update so customer immediately sees ride confirmation
    const booking: LiveBooking = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      assignedDriverId: null,
      assignedDriverName: null,
    };
    setBookings(prev => [booking, ...prev]);
    setNewBookingAlert(booking);
    return id;
  }, []);

  // ── Update status ────────────────────────────────────────────────────────
  const updateBookingStatus = useCallback((id: string, status: BookingStatus) => {
    setBookings(prev => {
      const next = prev.map(b =>
        b.id === id
          ? { ...b, status, completedAt: status === 'completed' ? new Date().toISOString() : b.completedAt }
          : b
      );
      try {
        localStorage.setItem('driverbee_live_bookings', JSON.stringify(next));
      } catch {}
      return next;
    });

    // If ride completed or cancelled, free the assigned driver immediately
    if (status === 'completed' || status === 'cancelled') {
      setDrivers(prev => {
        const updated = prev.map(d => (d.assignedBookingId === id ? { ...d, assignedBookingId: null } : d));
        saveCustomDrivers(updated);
        return updated;
      });
    }

    // Always persist to Supabase regardless of useSupabase flag
    sbUpdateStatus(id, status).then(({ error }: any) => {
      if (error) console.error('[DriverBee] updateBookingStatus failed:', error);
    });
  }, []);

  // ── Update customer name ──────────────────────────────────────────────────
  const updateCustomerName = useCallback((id: string, customerName: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, customerName } : b))
    );
    sbUpdateCustomerName(id, customerName).then(({ error }: any) => {
      if (error) console.error('[DriverBee] updateCustomerName failed:', error);
    });
  }, []);

  // ── Delete booking ───────────────────────────────────────────────────────
  const deleteBooking = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    sbDeleteBooking(id).then(({ error }: any) => {
      if (error) console.error('[DriverBee] deleteBooking failed:', error);
    });
  }, []);

  // ── Assign driver ────────────────────────────────────────────────────────
  const assignDriver = useCallback((
    bookingId: string,
    driverId: string,
    driverName?: string,
    driverPhone?: string
  ): boolean => {
    let driver = drivers.find(d => d.id === driverId || d.name.toLowerCase() === driverId.toLowerCase());
    if (!driver) {
      const stored = loadCustomDrivers();
      driver = stored.find(d => d.id === driverId || d.name.toLowerCase() === driverId.toLowerCase());
    }

    const finalName = driver?.name || driverName || (driverId.startsWith('drv-') ? 'Driver' : driverId);
    const finalPhone = driver?.phone || driverPhone || '+91 75694 02288';
    const finalId = driver?.id || driverId;

    // Strict guard: If driver is already assigned to another active, in-progress ride, reject assignment
    const todayStr = new Date().toISOString().split('T')[0];
    const busyTrip = bookings.find(b => {
      if (b.id === bookingId) return false;
      const isThisDriver =
        b.assignedDriverId === finalId ||
        (b.assignedDriverName && finalName && b.assignedDriverName.toLowerCase().trim() === finalName.toLowerCase().trim());
      if (!isThisDriver) return false;

      const isInProgress = b.status === 'assigned' || b.status === 'accepted' || b.status === 'active';
      if (!isInProgress) return false;

      // Active trip is always busy
      if (b.status === 'active') return true;

      // For assigned / accepted rides, only count if scheduled today or in the future
      const bookingDate = b.date && b.date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? b.date
        : (b.createdAt ? b.createdAt.split('T')[0] : todayStr);
      return bookingDate >= todayStr;
    });

    if (busyTrip) {
      console.warn(`[DriverBee] Cannot assign ${finalName}: Busy on active booking #${busyTrip.id}`);
      return false;
    }

    setBookings(prev => {
      const next = prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'assigned' as BookingStatus,
              assignedDriverId: finalId,
              assignedDriverName: finalName,
              assignedDriverPhone: finalPhone,
            }
          : b
      );
      try {
        localStorage.setItem('driverbee_live_bookings', JSON.stringify(next));
        localStorage.setItem('driverbee_driver_' + bookingId, JSON.stringify({
          name: finalName,
          phone: finalPhone,
          id: finalId,
        }));
      } catch {}
      return next;
    });

    // Cross-tab broadcast for instant UI response in customer portal
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BOOKING_BROADCAST_CHANNEL);
        bc.postMessage({
          type: 'BOOKING_ASSIGNED',
          bookingId,
          status: 'assigned',
          driverId: finalId,
          driverName: finalName,
          driverPhone: finalPhone,
        });
        bc.close();
      }
    } catch {}

    setDrivers(prev => {
      const updated = prev.map(d => {
        if (d.assignedBookingId === bookingId && d.id !== finalId) {
          return { ...d, assignedBookingId: null };
        }
        if (d.id === finalId || (finalName && d.name.toLowerCase().trim() === finalName.toLowerCase().trim())) {
          return { ...d, assignedBookingId: bookingId, isOnDuty: true };
        }
        return d;
      });
      saveCustomDrivers(updated);
      return updated;
    });

    // Always persist to Supabase immediately
    sbUpdateStatus(bookingId, 'assigned', {
      assigned_driver_id: finalId,
      assigned_driver_name: finalName,
    }).then(({ error }: any) => {
      if (error) {
        console.error('[DriverBee] assignDriver Supabase update failed:', error);
      } else {
        console.log('[DriverBee] Booking', bookingId, 'driver assigned →', finalName);
        // Refresh to guarantee database sync
        refreshFromSupabase();
      }
    });

    return true;
  }, [drivers, bookings, refreshFromSupabase]);

  // ── Accept booking (One-click accept & next assign) ──────────────────────────
  const acceptBooking = useCallback((bookingId: string, driverId?: string) => {
    const chosenDriver = driverId ? drivers.find(d => d.id === driverId) : undefined;
    const newStatus: BookingStatus = chosenDriver ? 'assigned' : 'accepted';

    setBookings(prev => {
      const next = prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: newStatus,
              assignedDriverId: chosenDriver?.id ?? b.assignedDriverId ?? null,
              assignedDriverName: chosenDriver?.name ?? b.assignedDriverName ?? null,
              assignedDriverPhone: chosenDriver?.phone ?? b.assignedDriverPhone ?? null,
            }
          : b
      );
      try {
        localStorage.setItem('driverbee_live_bookings', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BOOKING_BROADCAST_CHANNEL);
        bc.postMessage({
          type: 'STATUS_UPDATED',
          bookingId,
          status: newStatus,
        });
        bc.close();
      }
    } catch {}

    if (chosenDriver) {
      setDrivers(prev => {
        const updated = prev.map(d => (d.id === chosenDriver.id ? { ...d, assignedBookingId: bookingId, isOnDuty: true } : d));
        saveCustomDrivers(updated);
        return updated;
      });
    }
    // Always persist to Supabase immediately
    sbUpdateStatus(bookingId, newStatus, chosenDriver ? {
      assigned_driver_id: chosenDriver.id,
      assigned_driver_name: chosenDriver.name,
    } : undefined).then(({ error }: any) => {
      if (error) console.error('[DriverBee] acceptBooking Supabase update failed:', error);
      else console.log('[DriverBee] Booking', bookingId, 'status →', newStatus, 'persisted.');
    });
  }, [drivers]);

  // ── Toggle duty ──────────────────────────────────────────────────────────
  const toggleDriverDuty = useCallback((driverId: string) => {
    setDrivers(prev => {
      const updated = prev.map(d => {
        if (d.id !== driverId) return d;
        const newDuty = !d.isOnDuty;
        sbToggleDuty(driverId, newDuty); // Always persist
        return { ...d, isOnDuty: newDuty };
      });
      saveCustomDrivers(updated);
      return updated;
    });
  }, []);

  // ── Add driver (Admin manually enters driver) ─────────────────────────────
  const addDriver = useCallback((driverData: Omit<DriverProfile, 'id' | 'todayEarnings' | 'tripsCount' | 'assignedBookingId'>): DriverProfile => {
    const id = `drv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newDriver: DriverProfile = {
      ...driverData,
      id,
      todayEarnings: 0,
      tripsCount: 0,
      assignedBookingId: null,
    };
    setDrivers(prev => {
      const updated = [newDriver, ...prev];
      saveCustomDrivers(updated);
      return updated;
    });
    return newDriver;
  }, []);

  // ── Update driver ────────────────────────────────────────────────────────
  const updateDriver = useCallback((driverId: string, updates: Partial<DriverProfile>) => {
    setDrivers(prev => {
      const updated = prev.map(d => (d.id === driverId ? { ...d, ...updates } : d));
      saveCustomDrivers(updated);
      return updated;
    });
  }, []);

  // ── Delete driver ────────────────────────────────────────────────────────
  const deleteDriver = useCallback((driverId: string) => {
    setDrivers(prev => {
      const updated = prev.filter(d => d.id !== driverId);
      saveCustomDrivers(updated);
      return updated;
    });
  }, []);

  const getBookingsForDriver = useCallback(
    (driverId: string) => bookings.filter(b => b.assignedDriverId === driverId),
    [bookings]
  );

  const clearNewBookingAlert = useCallback(() => setNewBookingAlert(null), []);

  return (
    <BookingContext.Provider value={{
      bookings, drivers, addBooking, updateBookingStatus, updateCustomerName, deleteBooking,
      assignDriver, acceptBooking, toggleDriverDuty, addDriver, updateDriver, deleteDriver,
      getBookingsForDriver, newBookingAlert, clearNewBookingAlert, useSupabase, refreshBookings: refreshFromSupabase,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = (): BookingContextValue => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
  return ctx;
};
