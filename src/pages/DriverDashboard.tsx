import React, { useState, useEffect } from 'react';
import { useBookings, LiveBooking, DriverProfile } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import { DEFAULT_DRIVER_NO_PHOTO } from '../types';
import {
  Car, CheckCircle2, XCircle, Bell,
  Star, LogOut, Activity, Shield, Home,
  ArrowRight, Wallet, Navigation, ChevronRight, Phone
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function tripLabel(t: string): string {
  return t === 'city' ? 'Within City' : t === 'outside' ? 'Outstation' : t === 'oneway' ? 'One Way' : 'Intercity';
}

function extractDestination(b: LiveBooking): string {
  if (b.notes) {
    const destMatch = b.notes.match(/•\s*Destination:\s*([^\n\r]+)/i);
    if (destMatch && destMatch[1]?.trim()) return destMatch[1].trim();
    const destAddrMatch = b.notes.match(/•\s*Destination Address:\s*([^\n\r]+)/i);
    if (destAddrMatch && destAddrMatch[1]?.trim()) return destAddrMatch[1].trim();
    const slabMatch = b.notes.match(/•\s*Distance Slab:\s*([^\n\r]+)/i);
    if (slabMatch && slabMatch[1]?.trim()) return slabMatch[1].trim();
  }
  if (b.area && b.area.includes('➔')) {
    const parts = b.area.split('➔');
    const dest = parts[1]?.trim();
    if (dest) return dest;
  }
  if (b.area && b.area.includes('->')) {
    const parts = b.area.split('->');
    const dest = parts[1]?.trim();
    if (dest) return dest;
  }
  return b.area || 'Outstation';
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver Selection Screen
// ─────────────────────────────────────────────────────────────────────────────
const DriverSelect: React.FC<{ drivers: DriverProfile[]; onSelect: (d: DriverProfile) => void }> = ({ drivers, onSelect }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex flex-col items-center gap-2 mb-4">
          <DriverBeeLogo height={36} />
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Driver Portal</div>
        </div>
        <p className="text-gray-500 text-sm">Select your driver profile to continue</p>
      </div>

      <div className="space-y-3">
        {drivers.map(driver => (
          <button
            key={driver.id}
            onClick={() => onSelect(driver)}
            className="w-full flex items-center gap-4 p-4 bg-white hover:bg-bee-50 border border-gray-200 hover:border-bee-300 rounded-2xl transition-all text-left group shadow-sm"
          >
            <div className="relative flex-shrink-0">
              <img
                src={driver.photo && driver.photo.trim() ? driver.photo : DEFAULT_DRIVER_NO_PHOTO}
                alt={driver.name}
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DRIVER_NO_PHOTO; }}
                className="w-12 h-12 rounded-xl object-cover bg-gray-100"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${driver.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-navy-950">{driver.name}</div>
              <div className="text-[11px] text-bee-600 font-semibold">{driver.badge}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{driver.rating}</span>
                <span>•</span>
                <span>{driver.tripsCount} trips</span>
                <span>•</span>
                <span className={driver.isOnDuty ? 'text-emerald-600' : 'text-gray-400'}>{driver.isOnDuty ? 'On Duty' : 'Off Duty'}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-bee-500 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Active Ride Card
// ─────────────────────────────────────────────────────────────────────────────
const ActiveRideCard: React.FC<{ booking: LiveBooking; onComplete: () => void }> = ({ booking, onComplete }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Ride In Progress</span>
      </div>
      <span className="text-xs font-bold text-gray-400">{booking.id}</span>
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs">
      {[
        ['Passenger', booking.forWhom],
        ['Trip Type', tripLabel(booking.tripType)],
        ...(booking.tripType === 'outside' ? [['Destination', extractDestination(booking)]] : []),
        ['Vehicle', booking.carModel],
        ['Duration', booking.tripType === 'outside' ? `${booking.duration} Day${booking.duration > 1 ? 's' : ''}` : `${booking.duration} Hours`],
      ].map(([label, val]) => (
        <div key={label} className={`bg-white rounded-xl p-3 border border-emerald-100 ${label === 'Destination' ? 'col-span-2 bg-purple-50/70 border-purple-200' : ''}`}>
          <div className="text-gray-400 font-medium mb-0.5">{label}</div>
          <div className={`font-bold ${label === 'Destination' ? 'text-purple-950 text-sm' : 'text-navy-950'}`}>{val}</div>
          {label === 'Vehicle' && <div className="text-bee-600 text-[10px] font-bold">{booking.carPlate}</div>}
          {label === 'Duration' && <div className="text-bee-600 text-[10px] font-bold">₹{booking.estimatedFare}</div>}
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-emerald-100 text-xs">
      <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      <div>
        <div className="font-bold text-navy-950">{booking.customerName}</div>
        <div className="text-gray-400">{booking.customerPhone}</div>
      </div>
    </div>

    <button
      onClick={onComplete}
      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
    >
      <CheckCircle2 className="w-5 h-5" />
      <span>Mark Ride as Completed</span>
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// New Booking Alert Modal
// ─────────────────────────────────────────────────────────────────────────────
const NewBookingAlert: React.FC<{
  booking: LiveBooking;
  onAccept: () => void;
  onDecline: () => void;
}> = ({ booking, onAccept, onDecline }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Bell className="w-6 h-6 text-bee-600 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-bold text-bee-600 uppercase tracking-wider">New Booking Alert!</div>
          <div className="text-lg font-extrabold text-navy-950">{booking.id}</div>
        </div>
      </div>

      <div className="space-y-1 text-xs bg-gray-50 rounded-2xl p-4 border border-gray-100">
        {[
          ['Trip Type', tripLabel(booking.tripType)],
          ...(booking.tripType === 'outside' ? [['Destination', extractDestination(booking)]] : []),
          ['Duration', booking.tripType === 'outside' ? `${booking.duration} Day${booking.duration > 1 ? 's' : ''}` : `${booking.duration} Hours`],
          ['Schedule', booking.scheduleType === 'now' ? 'Immediate' : `${booking.date} at ${booking.time}`],
          ['Vehicle', `${booking.carModel} (${booking.carPlate})`],
          ['Pickup Area', booking.area],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
            <span className="text-gray-400">{label}</span>
            <span className={`font-bold ${label === 'Destination' ? 'text-purple-900 font-extrabold' : 'text-navy-950'}`}>{val}</span>
          </div>
        ))}
        <div className="flex justify-between py-1.5 pt-2">
          <span className="text-gray-400">Your Earning</span>
          <span className="font-extrabold text-bee-600 text-sm">₹{booking.estimatedFare}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDecline}
          className="flex-1 py-3 rounded-2xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Decline
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          Accept
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Driver Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const DriverDashboard: React.FC = () => {
  const [activeDriver, setActiveDriver] = useState<DriverProfile | null>(null);
  const { bookings, drivers, updateBookingStatus, toggleDriverDuty, getBookingsForDriver } = useBookings();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.role === 'driver' && !activeDriver) {
      const match = drivers.find(d => d.id === user.id);
      if (match) {
        setActiveDriver(match);
      } else {
        setActiveDriver({
          id: user.id,
          name: profile.full_name || 'Driver',
          phone: profile.phone || '',
          photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&auto=format&fit=crop&q=80',
          badge: 'DriverBee Verified',
          rating: 5.0,
          tripsCount: 0,
          isOnDuty: true,
          area: 'Warangal',
          todayEarnings: 0,
          assignedBookingId: null
        });
      }
    }
  }, [user, profile, drivers, activeDriver]);

  const liveDriver = activeDriver ? drivers.find(d => d.id === activeDriver.id) ?? activeDriver : null;

  const pendingForDriver = liveDriver
    ? bookings.find(b => b.assignedDriverId === liveDriver.id && b.status === 'assigned')
    : null;

  const activeRide = liveDriver
    ? bookings.find(b => b.assignedDriverId === liveDriver.id && (b.status === 'accepted' || b.status === 'active'))
    : null;

  const history = liveDriver
    ? getBookingsForDriver(liveDriver.id).filter(b => b.status === 'completed' || b.status === 'cancelled')
    : [];

  const todayDate = new Date().toISOString().split('T')[0];
  const todayEarnings = liveDriver
    ? getBookingsForDriver(liveDriver.id)
        .filter(b => b.status === 'completed' && b.completedAt?.startsWith(todayDate))
        .reduce((s, b) => s + b.estimatedFare, 0)
    : 0;

  const handleAccept = () => { if (pendingForDriver) updateBookingStatus(pendingForDriver.id, 'accepted'); };
  const handleDecline = () => { if (pendingForDriver) updateBookingStatus(pendingForDriver.id, 'pending'); };
  const handleComplete = () => { if (activeRide) updateBookingStatus(activeRide.id, 'completed'); };

  if (!liveDriver) {
    return <DriverSelect drivers={drivers} onSelect={setActiveDriver} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-navy-950">

      {/* New Booking Alert */}
      {pendingForDriver && (
        <NewBookingAlert
          booking={pendingForDriver}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {/* ── TOP BAR ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={liveDriver.photo && liveDriver.photo.trim() ? liveDriver.photo : DEFAULT_DRIVER_NO_PHOTO}
              alt={liveDriver.name}
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_DRIVER_NO_PHOTO; }}
              className="w-10 h-10 rounded-xl object-cover bg-gray-100"
            />
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${liveDriver.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          </div>
          <div>
            <DriverBeeLogo height={26} />
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {liveDriver.name} — Driver Portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="/admin" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:text-navy-950 hover:bg-gray-50 transition-colors border border-gray-200">
            <Shield className="w-3.5 h-3.5" />
            Admin
          </a>
          <a href="/" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:text-navy-950 hover:bg-gray-50 transition-colors border border-gray-200">
            <Home className="w-3.5 h-3.5" />
            Main Site
          </a>
          <button
            onClick={() => setActiveDriver(null)}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-200"
            title="Switch Driver"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── STATS ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Rating', value: `${liveDriver.rating}★`, color: 'text-amber-500' },
            { label: 'Total Trips', value: liveDriver.tripsCount, color: 'text-blue-600' },
            { label: "Today's Earn", value: `₹${todayEarnings}`, color: 'text-bee-600' },
            { label: 'Completed', value: history.filter(b => b.status === 'completed').length, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-3 text-center shadow-sm">
              <div className={`text-base lg:text-xl font-extrabold leading-none ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── DUTY TOGGLE ── */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${
          liveDriver.isOnDuty
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${liveDriver.isOnDuty ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <Activity className={`w-5 h-5 ${liveDriver.isOnDuty ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <div className={`text-sm font-bold ${liveDriver.isOnDuty ? 'text-emerald-700' : 'text-gray-500'}`}>
                {liveDriver.isOnDuty ? 'You are On Duty' : 'You are Off Duty'}
              </div>
              <div className="text-xs text-gray-400">
                {liveDriver.isOnDuty ? 'Receiving booking requests from DriverBee' : 'Go on duty to receive bookings'}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleDriverDuty(liveDriver.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              liveDriver.isOnDuty
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                : 'bg-bee-600 text-white border-bee-600 hover:bg-bee-700 shadow-sm'
            }`}
          >
            {liveDriver.isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
          </button>
        </div>

        {/* ── ACTIVE RIDE ── */}
        {activeRide ? (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Active Ride</div>
            <ActiveRideCard booking={activeRide} onComplete={handleComplete} />
          </div>
        ) : !pendingForDriver && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
              <Navigation className="w-6 h-6 text-gray-300" />
            </div>
            <div className="text-sm font-bold text-navy-950">
              {liveDriver.isOnDuty ? 'Waiting for a booking assignment...' : 'You are currently off duty.'}
            </div>
            <div className="text-xs text-gray-400">
              {liveDriver.isOnDuty
                ? "Admin will assign your next booking. You'll get an alert here."
                : 'Go on duty to start receiving booking assignments.'}
            </div>
          </div>
        )}

        {/* ── TRIP HISTORY ── */}
        {history.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Trip History</div>
            <div className="space-y-2">
              {history.map(trip => (
                <div key={trip.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-2xl text-xs shadow-sm">
                  <div>
                    <div className="font-bold text-bee-600">{trip.id}</div>
                    <div className="text-gray-600 mt-0.5">
                      {tripLabel(trip.tripType)}
                      {trip.tripType === 'outside' && ` (${extractDestination(trip)})`} • {trip.tripType === 'outside' ? `${trip.duration}d` : `${trip.duration}h`} • {trip.forWhom}
                    </div>
                    <div className="text-gray-400">{trip.carModel} ({trip.carPlate})</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-navy-950">₹{trip.estimatedFare}</div>
                    <div className={`text-[10px] font-bold mt-1 ${trip.status === 'completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {trip.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
