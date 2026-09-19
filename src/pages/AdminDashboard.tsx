import React, { useState, useEffect, useRef } from 'react';
import { useBookings, LiveBooking, BookingStatus } from '../context/BookingContext';
import { formatDisplayDate } from '../types';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import {
  LayoutDashboard, Car, Users, Wallet, Bell, LogOut,
  CheckCircle2, XCircle, Clock, MapPin, TrendingUp, Eye, EyeOff, Mail, Lock,
  AlertCircle, UserCheck, ArrowRight, Shield,
  Activity, X, PhoneCall, Star
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const statusColor: Record<BookingStatus, string> = {
  pending:   'bg-amber-100 text-amber-700 border border-amber-200',
  assigned:  'bg-blue-100 text-blue-700 border border-blue-200',
  accepted:  'bg-indigo-100 text-indigo-700 border border-indigo-200',
  active:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border border-red-200',
};

const statusLabel: Record<BookingStatus, string> = {
  pending:   'Pending',
  assigned:  'Assigned',
  accepted:  'Accepted',
  active:    'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function tripLabel(t: string): string {
  return t === 'city' ? 'Within City' : t === 'outside' ? 'Outstation' : t === 'airport' ? 'Airport' : 'Intercity';
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Gate (Email & Password)
// ─────────────────────────────────────────────────────────────────────────────
const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@driverbee.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin@driverbee.in' && (password === 'Admin@2026' || password === 'admin123')) {
      localStorage.setItem('driverbee_admin_session', 'true');
      setIsLoading(false);
      onLogin();
    } else {
      setIsLoading(false);
      setError('Invalid admin credentials. Please check your email and password.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2 mb-3">
            <DriverBeeLogo height={42} />
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Admin Portal
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            DriverBee Operations Command Centre
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-xl font-extrabold text-navy-950">Sign In to Admin</h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter administrator email & password to manage live bookings
            </p>
          </div>

          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@driverbee.in"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 text-navy-950 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bee-500 text-sm font-semibold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Access Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>


        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Booking Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────
const BookingDetailDrawer: React.FC<{
  booking: LiveBooking | null;
  onClose: () => void;
  onAssign: (bookingId: string, driverId: string) => void;
  onAccept: (bookingId: string) => void;
  onCancel: (id: string) => void;
  drivers: ReturnType<typeof useBookings>['drivers'];
}> = ({ booking, onClose, onAssign, onAccept, onCancel, drivers }) => {
  if (!booking) return null;
  const availableDrivers = drivers.filter(d => d.isOnDuty && !d.assignedBookingId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white border-l border-gray-200 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-bee-600">Booking Detail</div>
            <h3 className="text-xl font-bold text-navy-950 mt-0.5">{booking.id}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusColor[booking.status]}`}>
              {statusLabel[booking.status]}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(booking.createdAt)}</span>
          </div>

          {/* Quick Accept Banner if pending */}
          {booking.status === 'pending' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-900">Awaiting Admin Acceptance</div>
                <div className="text-[10px] text-emerald-700">Accept ride & assign on-duty driver</div>
              </div>
              <button
                onClick={() => { onAccept(booking.id); onClose(); }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Ride</span>
              </button>
            </div>
          )}

          {/* Customer */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Customer</div>
            <div className="text-sm font-bold text-navy-950">{booking.customerName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-bee-600" />
              {booking.customerPhone}
            </div>
            <div className="text-xs text-gray-500">Booking for: <span className="text-navy-900 font-semibold">{booking.forWhom}</span></div>
          </div>

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Trip Details</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Trip Type', tripLabel(booking.tripType)],
                ['Duration', `${booking.duration} Hours`],
                ['Schedule', booking.scheduleType === 'now' ? 'Immediate' : `${formatDisplayDate(booking.date)} at ${booking.time}`],
                ['Transmission', booking.transmission],
                ['Vehicle', booking.carModel],
                ['Reg. No.', booking.carPlate],
                ['Area', booking.area],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="text-gray-400 block">{label}</span>
                  <span className={`capitalize ${label === 'Area' ? 'text-gray-600 font-normal text-xs' : 'text-navy-900 font-bold'}`}>{val}</span>
                </div>
              ))}
              <div>
                <span className="text-gray-400 block">Estimated Fare</span>
                <span className="text-bee-600 font-extrabold text-sm">₹{booking.estimatedFare}</span>
              </div>
            </div>
          </div>

          {/* Assign Driver */}
          {booking.status === 'pending' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Assign Driver</div>
              <div className="space-y-2">
                {availableDrivers.length === 0 && (
                  <p className="text-xs text-gray-400">No drivers currently on duty and available.</p>
                )}
                {availableDrivers.map(driver => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2.5">
                      <img src={driver.photo} alt={driver.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-navy-950">{driver.name}</div>
                        <div className="text-[10px] text-gray-400">{driver.area} • {driver.rating}★</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { onAssign(booking.id, driver.id); onClose(); }}
                      className="px-3 py-1.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-[11px] font-bold transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned driver */}
          {booking.assignedDriverName && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Assigned Driver</div>
              <div className="text-sm font-bold text-navy-950">{booking.assignedDriverName}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="p-5 border-t border-gray-100 flex gap-2 bg-white sticky bottom-0">
            <button
              onClick={() => { onCancel(booking.id); onClose(); }}
              className="flex-1 py-2.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors"
            >
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('driverbee_admin_session') === 'true';
  });
  const [activeSection, setActiveSection] = useState<'bookings' | 'drivers' | 'revenue'>('bookings');

  const handleSignOut = () => {
    localStorage.removeItem('driverbee_admin_session');
    setIsLoggedIn(false);
  };
  const [selectedBooking, setSelectedBooking] = useState<LiveBooking | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [latestNewBooking, setLatestNewBooking] = useState<LiveBooking | null>(null);

  const { bookings, drivers, newBookingAlert, clearNewBookingAlert, assignDriver, acceptBooking, updateBookingStatus, toggleDriverDuty } = useBookings();

  useEffect(() => {
    if (newBookingAlert) {
      setLatestNewBooking(newBookingAlert);
      setShowNewAlert(true);
      clearNewBookingAlert();
      const timer = setTimeout(() => setShowNewAlert(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [newBookingAlert, clearNewBookingAlert]);

  if (!isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.createdAt.startsWith(today));
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const activeCount = bookings.filter(b => b.status === 'active' || b.status === 'accepted').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.estimatedFare, 0);
  const driversOnDuty = drivers.filter(d => d.isOnDuty).length;

  const filteredBookings = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

  const navItems = [
    { id: 'bookings', icon: LayoutDashboard, label: 'Bookings' },
    { id: 'drivers', icon: Users, label: 'Drivers' },
    { id: 'revenue', icon: TrendingUp, label: 'Revenue' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 text-navy-950 flex flex-col lg:flex-row">

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-[240px] xl:w-[260px] bg-white border-r border-gray-200 p-6 h-screen sticky top-0 overflow-y-auto shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <DriverBeeLogo height={28} />
          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold border-l border-gray-200 pl-3 ml-1">
            Admin
          </div>
        </div>

        {/* Live indicator */}
        <div className="mb-6 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Live — Warangal</span>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === item.id
                    ? 'bg-bee-50 text-bee-700 border border-bee-200'
                    : 'text-gray-500 hover:text-navy-950 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.id === 'bookings' && pendingCount > 0 && (
                  <span className="ml-auto text-[10px] font-extrabold bg-bee-600 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="mt-auto pt-6 border-t border-gray-100 space-y-1">
          <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-navy-950 hover:bg-gray-50 transition-colors">
            <Car className="w-3.5 h-3.5" />
            <span>Customer Site</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-5 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-lg lg:text-2xl font-extrabold text-navy-950 tracking-tight">
              {activeSection === 'bookings' ? 'Booking Dashboard' : activeSection === 'drivers' ? 'Driver Management' : 'Revenue Analytics'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • Warangal Operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>{driversOnDuty} drivers on duty</span>
            </div>
            <div className="lg:hidden flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`p-2 rounded-xl transition-colors ${activeSection === item.id ? 'bg-bee-50 text-bee-600' : 'text-gray-400 hover:text-navy-950'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* New booking alert banner */}
        {showNewAlert && latestNewBooking && (
          <div className="mx-5 lg:mx-8 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-bee-600 animate-pulse flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-navy-950">
                  🔔 New Booking: {latestNewBooking.id}
                </div>
                <div className="text-xs text-gray-500">
                  {latestNewBooking.customerName} • {tripLabel(latestNewBooking.tripType)} • {latestNewBooking.duration}h • ₹{latestNewBooking.estimatedFare} • {latestNewBooking.area}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { acceptBooking(latestNewBooking.id); setShowNewAlert(false); }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Ride</span>
              </button>
              <button
                onClick={() => { setSelectedBooking(latestNewBooking); setShowNewAlert(false); }}
                className="px-3 py-1.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-colors"
              >
                Assign
              </button>
              <button onClick={() => setShowNewAlert(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-5 lg:p-8 space-y-6">

          {/* ── STATS BAR ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {[
              { label: 'Total Today', value: todayBookings.length, icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
              { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
              { label: 'Active Rides', value: activeCount, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
              { label: "Today's Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-bee-600', bg: 'bg-amber-50 border-amber-100' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`rounded-2xl border p-4 bg-white shadow-sm ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color} mb-2`} />
                  <div className={`text-2xl font-extrabold ${stat.color} leading-none`}>{stat.value}</div>
                  <div className="text-[11px] text-gray-400 font-medium mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* ── BOOKINGS SECTION ── */}
          {activeSection === 'bookings' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {(['all', 'pending', 'assigned', 'accepted', 'active', 'completed', 'cancelled'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      filterStatus === s
                        ? 'bg-bee-600 text-white border-bee-600'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-bee-300 hover:text-bee-600'
                    }`}
                  >
                    {s === 'all' ? `All (${bookings.length})` : `${statusLabel[s as BookingStatus]}`}
                  </button>
                ))}
              </div>

              {/* Bookings Table */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Booking ID', 'Customer', 'Trip', 'Duration', 'Schedule', 'Area', 'Fare', 'Driver', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredBookings.map(booking => (
                        <tr
                          key={booking.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <td className="px-4 py-3 font-bold text-bee-600 whitespace-nowrap">{booking.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-navy-950 whitespace-nowrap">{booking.customerName}</div>
                            <div className="text-gray-400">{booking.customerPhone}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{tripLabel(booking.tripType)}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{booking.duration}h</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {booking.scheduleType === 'now' ? 'Immediate' : booking.time}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{booking.area}</td>
                          <td className="px-4 py-3 text-bee-600 font-bold whitespace-nowrap">₹{booking.estimatedFare}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {booking.assignedDriverName || <span className="text-amber-500">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColor[booking.status]}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="p-1.5 rounded-lg bg-gray-50 hover:bg-bee-50 text-gray-400 hover:text-bee-600 transition-colors border border-gray-200"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => acceptBooking(booking.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap"
                                    title="Accept booking and assign driver"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedBooking(booking)}
                                    className="px-2 py-1 rounded-lg bg-bee-50 hover:bg-bee-600 text-bee-600 hover:text-white text-[10px] font-bold transition-colors border border-bee-200 whitespace-nowrap"
                                  >
                                    Assign
                                  </button>
                                </>
                              )}
                              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors border border-red-100"
                                  title="Cancel"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      No bookings found for this filter.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DRIVERS SECTION ── */}
          {activeSection === 'drivers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {drivers.map(driver => (
                <div key={driver.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={driver.photo} alt={driver.name} className="w-12 h-12 rounded-2xl object-cover" />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${driver.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy-950">{driver.name}</div>
                      <div className="text-[10px] text-bee-600 font-semibold">{driver.badge}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <div className="font-bold text-navy-950 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {driver.rating}
                      </div>
                      <div className="text-gray-400 text-[9px]">Rating</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <div className="font-bold text-navy-950">{driver.tripsCount}</div>
                      <div className="text-gray-400 text-[9px]">Trips</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <div className="font-bold text-bee-600">₹{driver.todayEarnings}</div>
                      <div className="text-gray-400 text-[9px]">Today</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {driver.area}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${driver.assignedBookingId ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                      {driver.assignedBookingId ? 'On Trip' : 'Available'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleDriverDuty(driver.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${
                      driver.isOnDuty
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                    }`}
                  >
                    {driver.isOnDuty ? '✓ On Duty — Click to Go Off Duty' : '✗ Off Duty — Click to Go On Duty'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── REVENUE SECTION ── */}
          {activeSection === 'revenue' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Completed Fare', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: `${completedCount} completed rides`, color: 'text-bee-600' },
                  { label: 'Pending Collection', value: `₹${bookings.filter(b => b.status === 'pending' || b.status === 'assigned').reduce((s, b) => s + b.estimatedFare, 0).toLocaleString('en-IN')}`, sub: 'In pipeline', color: 'text-amber-600' },
                  { label: 'Average Fare', value: completedCount > 0 ? `₹${Math.round(totalRevenue / completedCount)}` : '—', sub: 'Per completed trip', color: 'text-blue-600' },
                ].map((card, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className={`text-3xl font-black ${card.color} mb-1`}>{card.value}</div>
                    <div className="text-sm font-bold text-navy-950">{card.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="text-sm font-bold text-navy-950 mb-4">Recent Completed Bookings</div>
                <div className="space-y-2">
                  {bookings.filter(b => b.status === 'completed').map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs border border-gray-100">
                      <span className="font-bold text-bee-600">{b.id}</span>
                      <span className="text-gray-600">{b.customerName}</span>
                      <span className="text-gray-500">{tripLabel(b.tripType)} • {b.duration}h</span>
                      <span className="font-extrabold text-bee-600">₹{b.estimatedFare}</span>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === 'completed').length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-4">No completed bookings yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onAssign={assignDriver}
        onAccept={acceptBooking}
        onCancel={id => updateBookingStatus(id, 'cancelled')}
        drivers={drivers}
      />
    </div>
  );
};
