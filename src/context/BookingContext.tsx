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
  toggleDriverDuty as sbToggleDuty,
} from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Types (mapped from Supabase DB types)
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus = DBBooking['status'];

export interface LiveBooking {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  tripType: TripType;
  duration: DurationOption;
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
  return {
    id: b.id,
    createdAt: b.created_at,
    customerName: b.customer_name,
    customerPhone: b.customer_phone ?? '',
    tripType: b.trip_type as TripType,
    duration: b.duration as DurationOption,
    scheduleType: b.schedule_type,
    date: b.scheduled_date ?? '',
    time: b.scheduled_time ?? '',
    transmission: (b.transmission ?? 'automatic') as 'automatic' | 'manual',
    carModel: b.car_model ?? '',
    carPlate: b.car_plate ?? '',
    forWhom: b.for_whom ?? '',
    area: b.area ?? '',
    estimatedFare: Number(b.estimated_fare),
    status: b.status,
    assignedDriverId: b.assigned_driver_id,
    assignedDriverName: b.assigned_driver_name,
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

const SEED_BOOKINGS: LiveBooking[] = [
  {
    id: 'DB-100001',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customerName: 'Aditya Sharma',
    customerPhone: '+91 98450 11001',
    tripType: 'city',
    duration: 4,
    scheduleType: 'now',
    date: new Date().toISOString().split('T')[0],
    time: 'Immediate',
    transmission: 'automatic',
    carModel: 'Honda City',
    carPlate: 'TS-03-AB-1234',
    forWhom: 'Self',
    area: 'Hanamkonda',
    estimatedFare: 630,
    status: 'completed',
    assignedDriverId: null,
    assignedDriverName: 'Rajesh Kumar',
    completedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'DB-100002',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    customerName: 'Priya Menon',
    customerPhone: '+91 98450 22002',
    tripType: 'airport',
    duration: 2,
    scheduleType: 'later',
    date: new Date().toISOString().split('T')[0],
    time: '06:00 AM',
    transmission: 'automatic',
    carModel: 'Toyota Innova Crysta',
    carPlate: 'TS-03-CD-5678',
    forWhom: 'Savitri Devi (Parent)',
    area: 'Kazipet',
    estimatedFare: 315,
    status: 'pending',
    assignedDriverId: null,
    assignedDriverName: null,
  },
];

const SEED_DRIVERS: DriverProfile[] = [
  { id: 'drv-1', name: 'Rajesh Kumar', phone: '+91 98450 78210', rating: 4.98, tripsCount: 1420, isOnDuty: true, area: 'Hanamkonda', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', badge: 'Master Driver', todayEarnings: 1890, assignedBookingId: null },
  { id: 'drv-2', name: 'Venkatesh Murthy', phone: '+91 98450 56321', rating: 4.95, tripsCount: 980, isOnDuty: true, area: 'Kazipet', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', badge: 'Outstation Specialist', todayEarnings: 2400, assignedBookingId: null },
  { id: 'drv-3', name: 'Mohammed Zameer', phone: '+91 98450 44123', rating: 4.92, tripsCount: 1150, isOnDuty: false, area: 'Subedari', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', badge: 'Senior Citizen Care', todayEarnings: 0, assignedBookingId: null },
  { id: 'drv-4', name: 'Suresh Gowda', phone: '+91 98450 99001', rating: 4.97, tripsCount: 840, isOnDuty: true, area: 'Hunter Road', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', badge: 'Airport & Corporate', todayEarnings: 945, assignedBookingId: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface BookingContextValue {
  bookings: LiveBooking[];
  drivers: DriverProfile[];
  addBooking: (booking: Omit<LiveBooking, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'assignedDriverName'>) => Promise<string>;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  assignDriver: (bookingId: string, driverId: string) => void;
  acceptBooking: (bookingId: string, driverId?: string) => void;
  toggleDriverDuty: (driverId: string) => void;
  getBookingsForDriver: (driverId: string) => LiveBooking[];
  newBookingAlert: LiveBooking | null;
  clearNewBookingAlert: () => void;
  useSupabase: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<LiveBooking[]>(() => {
    try {
      const saved = localStorage.getItem('driverbee_live_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved bookings', e);
    }
    return SEED_BOOKINGS;
  });
  const [drivers, setDrivers] = useState<DriverProfile[]>(SEED_DRIVERS);
  const [newBookingAlert, setNewBookingAlert] = useState<LiveBooking | null>(null);
  const [useSupabase, setUseSupabase] = useState(false);
  const idCounter = useRef(100004);

  // Cross-tab and local storage sync
  useEffect(() => {
    try {
      localStorage.setItem('driverbee_live_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to save bookings to localStorage', e);
    }
  }, [bookings]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'driverbee_live_bookings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBookings(parsed);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ── Load from Supabase on mount (if configured) ──────────────────────────
  useEffect(() => {
    setUseSupabase(true);

    // Fetch initial data
    Promise.all([fetchAllBookings(), fetchAllDrivers()]).then(([bData, dData]) => {
      if (bData && bData.length > 0) setBookings(bData.map(mapBooking));
      if (dData && dData.length > 0) setDrivers(dData.map(mapDriver));
    }).catch(err => {
      console.warn('[DriverBee] Initial Supabase fetch failed, using offline seed:', err);
    });

    // Real-time subscriptions
    const bookingsSub = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newB = mapBooking(payload.new as DBBooking);
          setBookings(prev => [newB, ...prev]);
          setNewBookingAlert(newB);
        } else if (payload.eventType === 'UPDATE') {
          const updatedB = mapBooking(payload.new as DBBooking);
          setBookings(prev => prev.map(b => b.id === updatedB.id ? updatedB : b));
        } else if (payload.eventType === 'DELETE') {
          setBookings(prev => prev.filter(b => b.id !== (payload.old as DBBooking).id));
        }
      })
      .subscribe();

    const driversSub = supabase
      .channel('drivers-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'driver_profiles' }, _payload => {
        fetchAllDrivers().then(dData => { if (dData && dData.length > 0) setDrivers(dData.map(mapDriver)); });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(driversSub);
    };
  }, []);

  // ── Add booking ──────────────────────────────────────────────────────────
  const addBooking = useCallback(async (
    data: Omit<LiveBooking, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'assignedDriverName'>
  ): Promise<string> => {
    const id = `DB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await sbCreateBooking({
        id,
        customer_id: null,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        trip_type: data.tripType,
        duration: data.duration,
        schedule_type: data.scheduleType,
        scheduled_date: data.date || null,
        scheduled_time: data.time || null,
        transmission: data.transmission,
        car_model: data.carModel,
        car_plate: data.carPlate,
        for_whom: data.forWhom,
        area: data.area,
        estimated_fare: data.estimatedFare,
      });
      if (error) {
        console.warn('[DriverBee] Supabase insert warning:', error);
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
    setBookings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status, completedAt: status === 'completed' ? new Date().toISOString() : b.completedAt }
          : b
      )
    );
    if (useSupabase) sbUpdateStatus(id, status);
  }, [useSupabase]);

  // ── Assign driver ────────────────────────────────────────────────────────
  const assignDriver = useCallback((bookingId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: 'assigned', assignedDriverId: driverId, assignedDriverName: driver.name }
          : b
      )
    );
    setDrivers(prev =>
      prev.map(d => d.id === driverId ? { ...d, assignedBookingId: bookingId } : d)
    );
    if (useSupabase) {
      sbUpdateStatus(bookingId, 'assigned', {
        assigned_driver_id: driverId,
        assigned_driver_name: driver.name,
      });
    }
  }, [drivers, useSupabase]);

  // ── Accept booking (One-click accept & assign) ──────────────────────────
  const acceptBooking = useCallback((bookingId: string, driverId?: string) => {
    const chosenDriver = driverId
      ? drivers.find(d => d.id === driverId)
      : (drivers.find(d => d.isOnDuty) || drivers[0]);
    if (!chosenDriver) return;

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'assigned',
              assignedDriverId: chosenDriver.id,
              assignedDriverName: chosenDriver.name,
            }
          : b
      )
    );
    setDrivers(prev =>
      prev.map(d => (d.id === chosenDriver.id ? { ...d, assignedBookingId: bookingId } : d))
    );
    if (useSupabase) {
      sbUpdateStatus(bookingId, 'assigned', {
        assigned_driver_id: chosenDriver.id,
        assigned_driver_name: chosenDriver.name,
      });
    }
  }, [drivers, useSupabase]);

  // ── Toggle duty ──────────────────────────────────────────────────────────
  const toggleDriverDuty = useCallback((driverId: string) => {
    setDrivers(prev =>
      prev.map(d => {
        if (d.id !== driverId) return d;
        const newDuty = !d.isOnDuty;
        if (useSupabase) sbToggleDuty(driverId, newDuty);
        return { ...d, isOnDuty: newDuty };
      })
    );
  }, [useSupabase]);

  const getBookingsForDriver = useCallback(
    (driverId: string) => bookings.filter(b => b.assignedDriverId === driverId),
    [bookings]
  );

  const clearNewBookingAlert = useCallback(() => setNewBookingAlert(null), []);

  return (
    <BookingContext.Provider value={{
      bookings, drivers, addBooking, updateBookingStatus,
      assignDriver, acceptBooking, toggleDriverDuty, getBookingsForDriver,
      newBookingAlert, clearNewBookingAlert, useSupabase,
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
