import React, { useState, useEffect, useRef } from 'react';
import { useBookings, LiveBooking, BookingStatus, DriverProfile, getDriverActiveBooking } from '../context/BookingContext';
import { usePricing, PricingConfig, DEFAULT_PRICING } from '../context/PricingContext';
import { formatDisplayDate } from '../types';
import { DriverBeeLogo } from '../components/DriverBeeLogo';
import {
  LayoutDashboard, Car, Users, Wallet, Bell, LogOut,
  CheckCircle2, XCircle, Clock, MapPin, TrendingUp, Eye, EyeOff, Mail, Lock,
  AlertCircle, UserCheck, ArrowRight, Shield,
  Activity, X, PhoneCall, Star, Edit2, Check, Trash2, Calendar, Navigation,
  Tag, IndianRupee, RefreshCw, Save, PlayCircle, FlagTriangleRight,
  UserPlus, UserX, Search, Filter, Plus, ChevronRight, Sparkles, Copy
} from 'lucide-react';

import { supabase } from '../lib/supabase';

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

function formatBookingDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatBookingTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatScheduledDate(dateStr?: string): string {
  if (!dateStr || dateStr === 'Today') return 'Today';
  return formatDisplayDate(dateStr);
}

function tripLabel(t: string): string {
  return t === 'city' ? 'Within City' : t === 'outside' ? 'Outstation' : 'Intercity';
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

function isBookingToday(dateOrIso?: string): boolean {
  if (!dateOrIso) return false;
  const now = new Date();
  const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const utcTodayStr = now.toISOString().split('T')[0];
  if (dateOrIso.startsWith(localTodayStr) || dateOrIso.startsWith(utcTodayStr)) return true;
  const d = new Date(dateOrIso);
  if (isNaN(d.getTime())) return false;
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.toLowerCase().trim();
    const envAdminPassword = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD;

    if (envAdminPassword && cleanEmail === 'admin@driverbee.in' && password === envAdminPassword) {
      localStorage.setItem('driverbee_admin_session', 'true');
      setIsLoading(false);
      onLogin();
      return;
    }

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // Supabase verified credentials if no error OR if email confirmation is pending
      if (!sbError || (sbError && sbError.message.toLowerCase().includes('email not confirmed'))) {
        localStorage.setItem('driverbee_admin_session', 'true');
        setIsLoading(false);
        onLogin();
        return;
      }

      setIsLoading(false);
      setError('Invalid administrator credentials. Please check your email and password.');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication error. Please try again.');
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
  onAssign: (bookingId: string, driverId: string, driverName?: string, driverPhone?: string) => void;
  onAccept: (bookingId: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onUpdateCustomerName: (bookingId: string, name: string) => void;
  drivers: DriverProfile[];
  bookings: LiveBooking[];
  onOpenAddDriver: () => void;
}> = ({ booking, onClose, onAssign, onAccept, onCancel, onDelete, onStatusChange, onUpdateCustomerName, drivers, bookings, onOpenAddDriver }) => {
  if (!booking) return null;
  const availableDrivers = drivers.filter(d => d.isOnDuty && !getDriverActiveBooking(d, bookings));
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(booking.customerName);

  useEffect(() => {
    if (booking) {
      setEditedName(booking.customerName);
      setIsEditingName(false);
    }
  }, [booking?.id, booking?.customerName]);

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
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer</div>
              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedName(booking.customerName.toLowerCase() === 'customer' ? '' : booking.customerName);
                    setIsEditingName(true);
                  }}
                  className="text-[11px] font-semibold text-bee-600 hover:text-bee-700 flex items-center gap-1 hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{booking.customerName.toLowerCase() === 'customer' ? 'Set Customer Name' : 'Edit Name'}</span>
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter customer's full name"
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-bee-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 shadow-xs"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = editedName.trim();
                      if (trimmed) {
                        onUpdateCustomerName(booking.id, trimmed);
                      }
                      setIsEditingName(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-bee-600 hover:bg-bee-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <span>{booking.customerName}</span>
                {booking.customerName.toLowerCase() === 'customer' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Needs Name
                  </span>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 flex items-center justify-between">
              <a
                href={`tel:${booking.customerPhone}`}
                className="text-bee-600 hover:text-bee-700 hover:underline font-bold flex items-center gap-1.5"
                title={`Call Customer ${booking.customerName} at ${booking.customerPhone}`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+91 {booking.customerPhone} (Click to Call)</span>
              </a>
            </div>
            <div className="text-xs text-gray-500">Booking for: <span className="text-navy-900 font-semibold">{booking.forWhom}</span></div>
          </div>

          {/* Booking Timing & Dates Card */}
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bee-600" />
                <span>Timing & Date of Booking</span>
              </span>
              <span className="text-[11px] font-medium text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                {timeAgo(booking.createdAt)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Date Booked</span>
                <span className="font-bold text-navy-950 text-sm block">{formatBookingDate(booking.createdAt)}</span>
                <span className="text-gray-500 text-[11.5px] flex items-center gap-1 mt-1 font-medium">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {formatBookingTime(booking.createdAt)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Ride Schedule</span>
                <span className="font-bold text-navy-950 text-sm block">
                  {booking.scheduleType === 'now' ? 'Today (Immediate)' : formatScheduledDate(booking.date)}
                </span>
                <span className="text-emerald-700 font-bold text-[11.5px] flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  {booking.scheduleType === 'now' ? 'Immediate (~30 mins)' : booking.time}
                </span>
              </div>
            </div>
          </div>

          {/* Outstation Destination Card (if outside city) */}
          {booking.tripType === 'outside' && (
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-purple-600" />
                  <span>Outside City Destination</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 uppercase">
                  Outstation
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs space-y-1.5">
                <div className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider">Destination</div>
                <div className="text-sm font-extrabold text-navy-950 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-950 font-bold">{extractDestination(booking)}</span>
                </div>
                {booking.area && (
                  <div className="text-[11.5px] text-gray-500 pt-1.5 border-t border-gray-100">
                    <span className="font-semibold text-gray-700">Full Route: </span>
                    <span>{booking.area}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Trip Details</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Date of Booking', `${formatBookingDate(booking.createdAt)} at ${formatBookingTime(booking.createdAt)}`],
                ['Ride Schedule', booking.scheduleType === 'now' ? 'Immediate (~30 mins)' : `${formatScheduledDate(booking.date)} at ${booking.time}`],
                ['Trip Type', tripLabel(booking.tripType)],
                ...(booking.tripType === 'outside' ? [['Destination', extractDestination(booking)]] : []),
                ['Duration', booking.tripType === 'outside' ? `${booking.duration} Day${booking.duration > 1 ? 's' : ''}` : `${booking.duration} Hours`],
                ['Transmission', booking.transmission],
                ['Vehicle', booking.carModel],
                ['Reg. No.', booking.carPlate],
                ['Area', booking.area],
              ].map(([label, val]) => (
                <div key={label} className={label === 'Destination' ? 'col-span-2 bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/70' : ''}>
                  <span className="text-gray-400 block">{label}</span>
                  <span className={`capitalize ${label === 'Destination' ? 'text-purple-900 font-extrabold text-sm' : label === 'Area' ? 'text-gray-600 font-normal text-xs' : 'text-navy-900 font-bold'}`}>{val}</span>
                </div>
              ))}
              <div>
                <span className="text-gray-400 block">Estimated Fare</span>
                <span className="text-bee-600 font-extrabold text-sm">₹{booking.estimatedFare}</span>
              </div>
            </div>
          </div>

          {/* Assign / Reassign Driver Section */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {booking.assignedDriverName ? 'Assigned Driver' : 'Assign Driver'}
                </div>
                <button
                  type="button"
                  onClick={onOpenAddDriver}
                  className="text-[11px] text-bee-600 hover:text-bee-700 font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Driver</span>
                </button>
              </div>

              {/* Currently assigned card */}
              {booking.assignedDriverName ? (
                (() => {
                  const assignedPhone = booking.assignedDriverPhone || drivers.find(d => d.id === booking.assignedDriverId || d.name.toLowerCase().trim() === booking.assignedDriverName?.toLowerCase().trim())?.phone;
                  return (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                          {booking.assignedDriverName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-navy-950 truncate flex items-center gap-1.5">
                            <span>{booking.assignedDriverName}</span>
                            <span className="text-[9px] bg-emerald-200/80 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded">
                              Assigned Driver
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-semibold truncate mt-0.5">
                            {assignedPhone ? `+91 ${assignedPhone}` : 'Assigned to this ride'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {assignedPhone && (
                          <a
                            href={`tel:${assignedPhone}`}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                            title={`Call Driver ${booking.assignedDriverName} (+91 ${assignedPhone})`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Call Driver</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>No driver assigned yet. Select a driver below to dispatch this ride.</span>
                </div>
              )}

              {/* Driver list for assignment */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-gray-500">
                  {booking.assignedDriverName ? 'Reassign to another driver:' : 'Select driver:'}
                </div>

                {drivers.length === 0 ? (
                  <div className="text-center p-4 bg-white rounded-xl border border-dashed border-gray-300 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">No drivers in fleet yet</p>
                    <button
                      type="button"
                      onClick={onOpenAddDriver}
                      className="px-3.5 py-1.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Enter Driver Details</span>
                    </button>
                  </div>
                ) : (
                  drivers.map(driver => {
                    const isAssigned = driver.id === booking.assignedDriverId || (booking.assignedDriverName && driver.name.toLowerCase().trim() === booking.assignedDriverName.toLowerCase().trim());
                    const activeRide = getDriverActiveBooking(driver, bookings);
                    const isBusyOnOtherRide = activeRide && activeRide.id !== booking.id;

                    return (
                      <div
                        key={driver.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isAssigned
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : isBusyOnOtherRide
                            ? 'bg-amber-50/40 border-amber-200/80'
                            : 'bg-white border-gray-200 hover:border-bee-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img src={driver.photo} alt={driver.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${isBusyOnOtherRide ? 'bg-amber-500 animate-pulse' : driver.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-navy-950 truncate flex items-center gap-1.5 flex-wrap">
                              <span>{driver.name}</span>
                              {isBusyOnOtherRide ? (
                                <span className="text-[9px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                                  Busy on Ride #{activeRide.id}
                                </span>
                              ) : driver.isOnDuty ? (
                                <span className="text-[9px] text-emerald-600 font-semibold">(On Duty)</span>
                              ) : (
                                <span className="text-[9px] text-gray-400 font-semibold">(Off Duty)</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                              {isBusyOnOtherRide
                                ? `Currently on ride with ${activeRide.customerName} • Complete ride first`
                                : `${driver.area} • ${driver.rating}★ ${driver.phone ? `• ${driver.phone}` : ''}`}
                            </div>
                          </div>
                        </div>

                        {isAssigned ? (
                          <span className="text-[10px] font-bold text-emerald-700 px-2 py-1 bg-emerald-100 rounded-lg flex items-center gap-0.5 flex-shrink-0">
                            <Check className="w-3 h-3" /> Driver Assigned
                          </span>
                        ) : isBusyOnOtherRide ? (
                          <span
                            className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex-shrink-0 select-none cursor-not-allowed"
                            title={`Driver is already assigned to active booking #${activeRide.id}. Please wait until their ride is completed.`}
                          >
                            Driver Assigned (#{activeRide.id})
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { onAssign(booking.id, driver.id, driver.name, driver.phone); onClose(); }}
                            className="px-3 py-1 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-[11px] font-bold transition-colors shadow-xs flex-shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 space-y-2">
          {/* Trip Started / Trip Completed primary actions */}
          {(booking.status === 'assigned' || booking.status === 'accepted') && (
            <button
              onClick={() => { onStatusChange(booking.id, 'active'); onClose(); }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Mark Trip Started
            </button>
          )}
          {booking.status === 'active' && (
            <button
              onClick={() => { onStatusChange(booking.id, 'completed'); onClose(); }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <FlagTriangleRight className="w-4 h-4" />
              Mark Trip Completed
            </button>
          )}
          {/* Secondary actions */}
          <div className="flex gap-2">
            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
              <button
                onClick={() => { onCancel(booking.id); onClose(); }}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors"
              >
                Cancel Booking
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently remove booking ${booking.id}?`)) {
                  onDelete(booking.id);
                  onClose();
                }
              }}
              className="px-4 py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Driver Management Modals
// ─────────────────────────────────────────────────────────────────────────────

const PRESET_DRIVER_AVATARS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
];

const WARANGAL_AREA_PRESETS = [
  'Hanamkonda',
  'Kazipet',
  'Subedari',
  'Naimnagar',
  'Warangal Railway Station',
  'Hunter Road',
  'Waddepally',
  'Kishanpura',
  'Kakatiya University (KU)',
  'Pochamma Maidan',
];

const DRIVER_BADGE_PRESETS = [
  'Professional Chauffeur',
  'Highway & Outstation Expert',
  'City Specialist (Warangal)',
  'Automatic & Manual Expert',
  'Senior Executive Chauffeur',
];

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DriverProfile, 'id' | 'todayEarnings' | 'tripsCount' | 'assignedBookingId'>) => void;
  initialData?: DriverProfile | null;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Hanamkonda');
  const [badge, setBadge] = useState('Professional Chauffeur');
  const [rating, setRating] = useState('4.9');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [photo, setPhoto] = useState(PRESET_DRIVER_AVATARS[0]);
  const [customPhoto, setCustomPhoto] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setArea(initialData.area);
      setBadge(initialData.badge);
      setRating(String(initialData.rating));
      setIsOnDuty(initialData.isOnDuty);
      setPhoto(initialData.photo);
      setCustomPhoto('');
    } else {
      setName('');
      setPhone('');
      setArea('Hanamkonda');
      setBadge('Professional Chauffeur');
      setRating('4.9');
      setIsOnDuty(true);
      setPhoto(PRESET_DRIVER_AVATARS[0]);
      setCustomPhoto('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Driver Full Name is required.');
      return;
    }
    const cleanPhone = phone.trim().replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    const finalPhoto = customPhoto.trim() || photo;
    onSave({
      name: cleanName,
      phone: cleanPhone,
      area: area.trim() || 'Warangal',
      badge: badge.trim() || 'Professional Driver',
      rating: parseFloat(rating) || 5.0,
      isOnDuty,
      photo: finalPhoto,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bee-500 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-950">
                {initialData ? 'Edit Driver Details' : 'Enter Driver Details'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {initialData ? 'Update driver profile and availability' : 'Manually register a driver to assign customer bookings'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Driver Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 font-semibold"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+91</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 font-semibold"
              />
            </div>
          </div>

          {/* Operating Area */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Operating Area in Warangal
            </label>
            <input
              type="text"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="e.g. Hanamkonda"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 font-semibold mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {WARANGAL_AREA_PRESETS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    area === a ? 'bg-bee-600 text-white border-bee-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Specialization Badge */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Specialization / Badge
            </label>
            <input
              type="text"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              placeholder="e.g. Highway & Outstation Expert"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 font-semibold mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {DRIVER_BADGE_PRESETS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBadge(b)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    badge === b ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Rating & Duty Status */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Rating
              </label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950"
              >
                <option value="5.0">5.0 ★★★★★</option>
                <option value="4.9">4.9 ★★★★☆</option>
                <option value="4.8">4.8 ★★★★☆</option>
                <option value="4.7">4.7 ★★★★☆</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Duty Status
              </label>
              <button
                type="button"
                onClick={() => setIsOnDuty(!isOnDuty)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isOnDuty
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
              </button>
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Profile Avatar
            </label>
            <div className="flex items-center gap-2.5">
              {PRESET_DRIVER_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setPhoto(url); setCustomPhoto(''); }}
                  className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                    photo === url && !customPhoto ? 'border-bee-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-bee-600 hover:bg-bee-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Driver' : 'Save & Register Driver'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AssignDriverModalProps {
  booking: LiveBooking | null;
  drivers: DriverProfile[];
  bookings: LiveBooking[];
  onClose: () => void;
  onAssign: (bookingId: string, driverId: string, driverName?: string, driverPhone?: string) => void;
  onOpenAddDriver: () => void;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  booking,
  drivers,
  bookings,
  onClose,
  onAssign,
  onOpenAddDriver,
}) => {
  const [search, setSearch] = useState('');
  if (!booking) return null;

  const filtered = drivers.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.area.toLowerCase().includes(q) || d.phone.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAFBFD]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-bee-600">Assign Driver to Customer</div>
            <h3 className="text-base font-extrabold text-navy-950 mt-0.5">Booking #{booking.id}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Ride Info Banner */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-100/80 flex items-start justify-between gap-3 text-xs">
          <div>
            <div className="font-extrabold text-navy-950 text-sm flex items-center gap-2">
              <span>{booking.customerName}</span>
              <span className="text-[11px] font-semibold text-gray-500">({booking.customerPhone})</span>
            </div>
            <div className="text-gray-600 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-white text-navy-900 font-bold border border-amber-200">
                {tripLabel(booking.tripType)}
              </span>
              <span>•</span>
              <span className="font-medium text-gray-700">{booking.area}</span>
              <span>•</span>
              <span className="font-bold text-bee-700">₹{booking.estimatedFare}</span>
            </div>
          </div>
          {booking.assignedDriverName && (
            <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap">
              Current: {booking.assignedDriverName}
            </span>
          )}
        </div>

        {/* Driver Search & Add */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search driver by name, phone, area..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950"
            />
          </div>
          <button
            type="button"
            onClick={() => { onClose(); onOpenAddDriver(); }}
            className="px-3 py-2 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Driver</span>
          </button>
        </div>

        {/* Drivers List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-bee-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-navy-950">
                {drivers.length === 0 ? 'No Drivers Registered Yet' : 'No matching drivers found'}
              </div>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {drivers.length === 0
                  ? 'Add your drivers first to assign them to customer bookings.'
                  : 'Try searching with a different name or area.'}
              </p>
              {drivers.length === 0 && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenAddDriver(); }}
                  className="px-4 py-2 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enter Driver Details Now</span>
                </button>
              )}
            </div>
          ) : (
            filtered.map(driver => {
              const isCurrent = driver.id === booking.assignedDriverId || (booking.assignedDriverName && driver.name.toLowerCase().trim() === booking.assignedDriverName.toLowerCase().trim());
              const activeRide = getDriverActiveBooking(driver, bookings);
              const isBusyOnOtherRide = activeRide && activeRide.id !== booking.id;

              return (
                <div
                  key={driver.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20'
                      : isBusyOnOtherRide
                      ? 'bg-amber-50/40 border-amber-200/80'
                      : 'bg-white border-gray-200 hover:border-bee-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img src={driver.photo} alt={driver.name} className="w-11 h-11 rounded-2xl object-cover" />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isBusyOnOtherRide ? 'bg-amber-500 animate-pulse' : driver.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5 flex-wrap">
                        <span>{driver.name}</span>
                        <span className="text-[10px] font-semibold text-bee-700 bg-bee-50 px-1.5 py-0.2 rounded border border-bee-200">
                          {driver.badge}
                        </span>
                        {isBusyOnOtherRide && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            Busy on Ride #{activeRide.id}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-0.5 font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {driver.rating}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {driver.area}
                        </span>
                        {driver.phone && (
                          <>
                            <span>•</span>
                            <a
                              href={`tel:${driver.phone}`}
                              className="text-bee-600 hover:text-bee-800 hover:underline font-mono font-bold flex items-center gap-1"
                              title={`Click to call ${driver.name}: +91 ${driver.phone}`}
                            >
                              <PhoneCall className="w-2.5 h-2.5" />
                              <span>{driver.phone}</span>
                            </a>
                          </>
                        )}
                      </div>
                      {isBusyOnOtherRide && (
                        <div className="text-[10.5px] text-amber-800 mt-1 font-semibold">
                          Currently with customer <strong>{activeRide.customerName}</strong>. Driver is locked until this ride is completed.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isCurrent ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Driver Assigned
                      </span>
                    ) : isBusyOnOtherRide ? (
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 cursor-not-allowed select-none"
                          title={`Driver is already assigned to active Ride #${activeRide.id}. Cannot assign until completed.`}
                        >
                          Driver Assigned (#{activeRide.id})
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onAssign(booking.id, driver.id, driver.name, driver.phone);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface AssignRideToDriverModalProps {
  driver: DriverProfile | null;
  bookings: LiveBooking[];
  onClose: () => void;
  onAssign: (bookingId: string, driverId: string, driverName?: string, driverPhone?: string) => void;
}

const AssignRideToDriverModal: React.FC<AssignRideToDriverModalProps> = ({
  driver,
  bookings,
  onClose,
  onAssign,
}) => {
  if (!driver) return null;

  const activeRide = getDriverActiveBooking(driver, bookings);
  const assignable = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.assignedDriverId !== driver.id && (!b.assignedDriverName || b.assignedDriverName.toLowerCase().trim() !== driver.name.toLowerCase().trim()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-3">
            <img src={driver.photo} alt={driver.name} className="w-10 h-10 rounded-2xl object-cover border" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-bee-600">Assign Ride to Driver</div>
              <h3 className="text-base font-extrabold text-navy-950">{driver.name} ({driver.area})</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if driver is currently busy */}
        {activeRide && (
          <div className="p-4 bg-blue-50 border-b border-blue-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-blue-900">Driver Assigned to Ride #{activeRide.id}</div>
              <div className="text-xs text-blue-700 mt-0.5">
                {driver.name} is already assigned to <span className="font-bold text-navy-950">Ride #{activeRide.id}</span> for customer <span className="font-bold text-navy-950">{activeRide.customerName}</span>. A driver cannot be assigned to another customer until this ride is completed or cancelled.
              </div>
            </div>
          </div>
        )}

        {/* List of customer rides */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Select Customer Ride to Assign:</div>
          {assignable.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No pending or unassigned customer rides available to assign.
            </div>
          ) : (
            assignable.map(b => (
              <div
                key={b.id}
                className="p-3.5 bg-white border border-gray-200 rounded-2xl flex items-center justify-between gap-3 hover:border-bee-300 transition-all hover:shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-navy-950 text-xs">{b.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${statusColor[b.status]}`}>
                      {b.status}
                    </span>
                    <span className="text-xs font-bold text-bee-600">₹{b.estimatedFare}</span>
                  </div>
                  <div className="text-xs font-semibold text-navy-900 mt-1">
                    {b.customerName} • {b.customerPhone}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {tripLabel(b.tripType)} • {b.area} • {b.scheduleType === 'now' ? 'Immediate' : `${b.date} ${b.time}`}
                  </div>
                </div>

                {activeRide ? (
                  <button
                    type="button"
                    disabled
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold whitespace-nowrap cursor-not-allowed"
                    title={`Driver is already assigned to Ride #${activeRide.id}`}
                  >
                    Driver Assigned
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onAssign(b.id, driver.id, driver.name, driver.phone);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-all shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Pricing Section Component
// ─────────────────────────────────────────────────────────────────────────────
const PricingSection: React.FC = () => {
  const { pricing, updatePricing, resetPricing } = usePricing();
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Raw string values the user is typing — keyed as "section.field"
  const [raw, setRaw] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    const p = pricing;
    (['hr2','hr4','hr6','hr8'] as const).forEach(f => {
      init[`cityRates.${f}`] = String(p.cityRates[f]);
      init[`outsideRates.${f}`] = String(p.outsideRates[f]);
    });
    init['outstationSlabs.slab100_150'] = String(p.outstationSlabs.slab100_150);
    init['outstationSlabs.slab150_250'] = String(p.outstationSlabs.slab150_250);
    init['outstationSlabs.slabAbove250'] = String(p.outstationSlabs.slabAbove250);
    return init;
  });

  // Sync raw inputs when pricing changes externally (e.g. cross-tab broadcast)
  useEffect(() => {
    setRaw({
      'cityRates.hr2': String(pricing.cityRates.hr2),
      'cityRates.hr4': String(pricing.cityRates.hr4),
      'cityRates.hr6': String(pricing.cityRates.hr6),
      'cityRates.hr8': String(pricing.cityRates.hr8),
      'outsideRates.hr2': String(pricing.outsideRates.hr2),
      'outsideRates.hr4': String(pricing.outsideRates.hr4),
      'outsideRates.hr6': String(pricing.outsideRates.hr6),
      'outsideRates.hr8': String(pricing.outsideRates.hr8),
      'outstationSlabs.slab100_150': String(pricing.outstationSlabs.slab100_150),
      'outstationSlabs.slab150_250': String(pricing.outstationSlabs.slab150_250),
      'outstationSlabs.slabAbove250': String(pricing.outstationSlabs.slabAbove250),
    });
    setErrors({});
  }, [pricing]);

  const handleChange = (key: string, val: string) => {
    const clean = val.replace(/[^\d]/g, '');
    setRaw(prev => ({ ...prev, [key]: clean }));
    // Clear error as they type
    if (errors[key]) setErrors(prev => { const n = {...prev}; delete n[key]; return n; });
  };

  // Parse raw strings → validate → save
  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    const parse = (key: string): number => {
      const clean = (raw[key] ?? '').replace(/,/g, '').trim();
      const v = parseInt(clean, 10);
      if (isNaN(v) || v < 0) { newErrors[key] = 'Enter a valid amount (≥ 0)'; return 0; }
      return v;
    };

    const built: PricingConfig = {
      cityRates: {
        hr2: parse('cityRates.hr2'),
        hr4: parse('cityRates.hr4'),
        hr6: parse('cityRates.hr6'),
        hr8: parse('cityRates.hr8'),
      },
      outsideRates: {
        hr2: parse('outsideRates.hr2'),
        hr4: parse('outsideRates.hr4'),
        hr6: parse('outsideRates.hr6'),
        hr8: parse('outsideRates.hr8'),
      },
      outstationSlabs: {
        slab100_150: parse('outstationSlabs.slab100_150'),
        slab150_250: parse('outstationSlabs.slab150_250'),
        slabAbove250: parse('outstationSlabs.slabAbove250'),
      },
      lastUpdated: pricing.lastUpdated,
    };

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    updatePricing(built);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all pricing to original defaults?')) resetPricing();
  };

  const inputClass = (key: string) =>
    `w-full pl-7 pr-3 py-2.5 text-sm font-bold bg-white border rounded-xl focus:outline-none focus:ring-2 text-navy-950 transition-colors ${
      errors[key]
        ? 'border-red-400 focus:ring-red-300 bg-red-50'
        : 'border-gray-200 focus:ring-bee-500/40'
    }`;

  const Field = ({ label, k }: { label: string; k: string }) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw[k] ?? ''}
          onChange={e => handleChange(k, e.target.value)}
          placeholder="e.g. 2000"
          className={inputClass(k)}
        />
      </div>
      {errors[k] && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors[k]}</p>}
    </div>
  );

  const liveCity = (key: string) => parseInt(raw[`cityRates.${key}`] ?? '0', 10) || 0;
  const liveOut  = (key: string) => parseInt(raw[`outsideRates.${key}`] ?? '0', 10) || 0;
  const cityHr   = Math.round(liveCity('hr2') / 2);
  const outHr    = Math.round(liveOut('hr2')  / 2);

  const lastUpdated = new Date(pricing.lastUpdated).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-navy-950">Pricing Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">Changes apply instantly to the booking form. Last saved: {lastUpdated}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm ${saved ? 'bg-emerald-600 text-white' : 'bg-bee-600 hover:bg-bee-700 text-white'}`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save Pricing'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
        <Tag className="w-4 h-4 text-bee-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Live pricing — </span>
          Type any value and click <strong>Save Pricing</strong>. Changes appear instantly in the booking form across all tabs.
        </div>
      </div>

      {/* Hourly rate cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City */}
        <div className="bg-white border border-blue-200/60 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-bee-600" />
              <span className="text-sm font-extrabold text-navy-950">City / Within Warangal</span>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-200">₹{cityHr}/hr</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="2 Hours" k="cityRates.hr2" />
            <Field label="4 Hours" k="cityRates.hr4" />
            <Field label="6 Hours" k="cityRates.hr6" />
            <Field label="8 Hours" k="cityRates.hr8" />
          </div>
        </div>
        {/* Outside */}
        <div className="bg-white border border-purple-200/60 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-extrabold text-navy-950">Outside City / Outstation (Hourly)</span>
            </div>
            <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full border border-purple-200">₹{outHr}/hr</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="2 Hours" k="outsideRates.hr2" />
            <Field label="4 Hours" k="outsideRates.hr4" />
            <Field label="6 Hours" k="outsideRates.hr6" />
            <Field label="8 Hours" k="outsideRates.hr8" />
          </div>
        </div>
      </div>

      {/* Outstation distance slabs */}
      <div className="bg-white border border-purple-200/60 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-extrabold text-navy-950">Outstation Distance Slabs (per day)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="100 – 150 km / day" k="outstationSlabs.slab100_150" />
          <Field label="150 – 250 km / day" k="outstationSlabs.slab150_250" />
          <Field label="Above 250 km / day" k="outstationSlabs.slabAbove250" />
        </div>
        <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-2">
          These rates apply when customers select a destination trip by distance. Enter any amount (e.g. ₹2000).
        </p>
      </div>

      {/* Live preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Live Preview — What Customers See</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([2, 4, 6, 8] as const).map(h => (
            <div key={h} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 font-medium mb-1">{h} Hours</div>
              <div className="text-sm font-black text-bee-600">₹{(liveCity(`hr${h}`) || 0).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-400">City</div>
              <div className="text-sm font-black text-purple-700 mt-1">₹{(liveOut(`hr${h}`) || 0).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-400">Outside</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-3">💡 The preview updates as you type. Click "Save Pricing" to push changes live.</p>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('driverbee_admin_session') === 'true';
  });
  const [activeSection, setActiveSection] = useState<'bookings' | 'drivers' | 'revenue' | 'pricing'>('bookings');

  const handleSignOut = () => {
    localStorage.removeItem('driverbee_admin_session');
    setIsLoggedIn(false);
  };
  const [selectedBooking, setSelectedBooking] = useState<LiveBooking | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [latestNewBooking, setLatestNewBooking] = useState<LiveBooking | null>(null);

  // Driver management state
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverProfile | null>(null);
  const [assigningBooking, setAssigningBooking] = useState<LiveBooking | null>(null);
  const [assigningDriverForRide, setAssigningDriverForRide] = useState<DriverProfile | null>(null);
  const [driverSearch, setDriverSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | 'on_duty' | 'available' | 'busy' | 'off_duty'>('all');
  const [driverToast, setDriverToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setDriverToast(msg);
    setTimeout(() => setDriverToast(null), 3500);
  };

  const {
    bookings,
    drivers,
    newBookingAlert,
    clearNewBookingAlert,
    assignDriver,
    acceptBooking,
    updateBookingStatus,
    updateCustomerName,
    deleteBooking,
    toggleDriverDuty,
    addDriver,
    updateDriver,
    deleteDriver,
  } = useBookings();

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

  // Stats - Daily & Overall Metrics
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => isBookingToday(b.createdAt));

  // Daily Trips (trips booked, scheduled, or completed today)
  const dailyTrips = bookings.filter(b =>
    isBookingToday(b.createdAt) ||
    isBookingToday(b.date) ||
    (b.status === 'completed' && isBookingToday(b.completedAt))
  );

  // Daily Completed Trips & Daily Earnings
  const dailyCompletedTrips = bookings.filter(b =>
    b.status === 'completed' &&
    (isBookingToday(b.completedAt) || isBookingToday(b.createdAt) || isBookingToday(b.date))
  );

  const dailyEarnings = dailyCompletedTrips.reduce((sum, b) => sum + b.estimatedFare, 0);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const activeCount = bookings.filter(b => b.status === 'active' || b.status === 'accepted').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.estimatedFare, 0);
  const driversOnDuty = drivers.filter(d => d.isOnDuty).length;

  const filteredBookings = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

  // Split filtered bookings into today vs previous (yesterday & older)
  const todayFilteredBookings = filteredBookings.filter(b => isBookingToday(b.createdAt));
  const previousFilteredBookings = filteredBookings.filter(b => !isBookingToday(b.createdAt));

  const navItems = [
    { id: 'bookings', icon: LayoutDashboard, label: 'Bookings' },
    { id: 'drivers', icon: Users, label: 'Drivers' },
    { id: 'revenue', icon: TrendingUp, label: 'Revenue' },
    { id: 'pricing', icon: Tag, label: 'Pricing' },
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
              {activeSection === 'bookings' ? 'Booking Dashboard'
              : activeSection === 'drivers' ? 'Driver Management'
              : activeSection === 'revenue' ? 'Revenue Analytics'
              : 'Pricing Management'}
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
                <div className="text-xs text-amber-800">
                  {latestNewBooking.customerName} • {tripLabel(latestNewBooking.tripType)}
                  {latestNewBooking.tripType === 'outside' && ` (Destination: ${extractDestination(latestNewBooking)})`} • {latestNewBooking.tripType === 'outside' ? `${latestNewBooking.duration}d` : `${latestNewBooking.duration}h`} • ₹{latestNewBooking.estimatedFare} • {latestNewBooking.area}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  acceptBooking(latestNewBooking.id);
                  setShowNewAlert(false);
                  setAssigningBooking(latestNewBooking);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Ride</span>
              </button>
              <button
                onClick={() => {
                  setAssigningBooking(latestNewBooking);
                  setShowNewAlert(false);
                }}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-3.5">
            {[
              {
                label: 'Daily Earnings',
                value: `₹${dailyEarnings.toLocaleString('en-IN')}`,
                sub: dailyCompletedTrips.length > 0 ? `${dailyCompletedTrips.length} ride${dailyCompletedTrips.length > 1 ? 's' : ''} completed today` : 'Today completed',
                icon: Wallet,
                color: 'text-bee-600',
                bg: 'bg-amber-50/70 border-amber-200/90 ring-1 ring-amber-300/30'
              },
              {
                label: 'Daily Trips',
                value: dailyTrips.length,
                sub: `${dailyCompletedTrips.length} done • ${dailyTrips.length - dailyCompletedTrips.length} in prog`,
                icon: Car,
                color: 'text-blue-600',
                bg: 'bg-blue-50/70 border-blue-200/90'
              },
              {
                label: 'Pending',
                value: pendingCount,
                sub: 'Awaiting driver',
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50 border-amber-200/60'
              },
              {
                label: 'Active Rides',
                value: activeCount,
                sub: 'On road currently',
                icon: Activity,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 border-emerald-200/60'
              },
              {
                label: 'Total Completed',
                value: completedCount,
                sub: 'All-time rides',
                icon: CheckCircle2,
                color: 'text-gray-700',
                bg: 'bg-gray-50 border-gray-200'
              },
              {
                label: 'Total Revenue',
                value: `₹${totalRevenue.toLocaleString('en-IN')}`,
                sub: 'All-time completed',
                icon: TrendingUp,
                color: 'text-purple-600',
                bg: 'bg-purple-50/70 border-purple-200/80'
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`rounded-2xl border p-4 bg-white shadow-xs transition-all hover:shadow-sm ${stat.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</span>
                  </div>
                  <div className={`text-2xl font-black ${stat.color} leading-none tracking-tight`}>{stat.value}</div>
                  <div className="text-[11px] text-gray-500 font-medium mt-1.5 truncate">{stat.sub}</div>
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

              {/* ── TODAY'S BOOKINGS ─────────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-sm font-extrabold text-navy-950">Today's Bookings</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {todayFilteredBookings.length} booking{todayFilteredBookings.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-amber-100 bg-amber-50/60">
                          {['Booking ID', 'Booked At', 'Customer', 'Trip', 'Duration', 'Ride Schedule', 'Area', 'Fare', 'Driver', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-amber-700 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-50/50">
                        {todayFilteredBookings.map(booking => (

                        <tr
                          key={booking.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <td className="px-4 py-3 font-bold text-bee-600 whitespace-nowrap">
                            <div>{booking.id}</div>
                            <div className="text-[10px] font-normal text-gray-400">{timeAgo(booking.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-navy-950 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />
                              <span>{formatBookingDate(booking.createdAt)}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span>{formatBookingTime(booking.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-navy-950 whitespace-nowrap flex items-center gap-1.5">
                              <span>{booking.customerName}</span>
                              {booking.customerName.toLowerCase() === 'customer' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  Default
                                </span>
                              )}
                            </div>
                            <a
                              href={`tel:${booking.customerPhone}`}
                              onClick={e => e.stopPropagation()}
                              className="text-gray-500 hover:text-bee-600 flex items-center gap-1 hover:underline text-[11px] font-medium"
                              title={`Call Customer: +91 ${booking.customerPhone}`}
                            >
                              <PhoneCall className="w-2.5 h-2.5 text-bee-600 flex-shrink-0" />
                              <span>{booking.customerPhone}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border uppercase tracking-wide ${
                                booking.tripType === 'outside'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {tripLabel(booking.tripType)}
                              </span>
                            </div>
                            {booking.tripType === 'outside' && (
                              <div className="text-[11px] font-bold text-purple-950 flex items-center gap-1 mt-1 max-w-[170px] truncate" title={extractDestination(booking)}>
                                <Navigation className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                <span className="truncate">{extractDestination(booking)}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                            {booking.tripType === 'outside'
                              ? `${booking.duration} Day${booking.duration > 1 ? 's' : ''}`
                              : `${booking.duration}h`}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-navy-950 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{booking.scheduleType === 'now' ? 'Today' : formatScheduledDate(booking.date)}</span>
                            </div>
                            <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span>{booking.scheduleType === 'now' ? 'Immediate (~30m)' : booking.time}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 min-w-[200px] max-w-[320px]">
                            {booking.tripType === 'outside' ? (
                              <div className="space-y-1">
                                <div className="text-[10.5px] font-bold text-purple-900 bg-purple-50/90 border border-purple-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                  <Navigation className="w-2.5 h-2.5 text-purple-600 flex-shrink-0" />
                                  <span className="truncate">Destination: {extractDestination(booking)}</span>
                                </div>
                                <div className="text-gray-500 text-[11px] truncate" title={booking.area}>
                                  {booking.area}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-600 text-xs truncate" title={booking.area}>
                                {booking.area}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-bee-600 font-bold whitespace-nowrap">₹{booking.estimatedFare}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {booking.assignedDriverName ? (
                              (() => {
                                const dPhone = booking.assignedDriverPhone || drivers.find(d => d.id === booking.assignedDriverId || d.name.toLowerCase().trim() === booking.assignedDriverName?.toLowerCase().trim())?.phone;
                                return (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                                      <UserCheck className="w-3 h-3 text-emerald-600" />
                                      <span>Driver Assigned: {booking.assignedDriverName}</span>
                                    </span>
                                    {dPhone && (
                                      <a
                                        href={`tel:${dPhone}`}
                                        onClick={e => e.stopPropagation()}
                                        className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                        title={`Call Driver ${booking.assignedDriverName}: +91 ${dPhone}`}
                                      >
                                        <PhoneCall className="w-2.5 h-2.5" />
                                        <span>Call</span>
                                      </a>
                                    )}
                                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setAssigningBooking(booking); }}
                                        className="text-[10px] text-bee-600 hover:text-bee-800 font-bold hover:underline cursor-pointer"
                                        title="Change / Reassign Driver"
                                      >
                                        Change
                                      </button>
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              booking.status !== 'completed' && booking.status !== 'cancelled' ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setAssigningBooking(booking); }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Assign driver to this customer"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Assign</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )
                            )}
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
                                    onClick={() => {
                                      acceptBooking(booking.id);
                                      setAssigningBooking(booking);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap"
                                    title="Accept ride & assign driver next"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() => setAssigningBooking(booking)}
                                    className="px-2 py-1 rounded-lg bg-bee-50 hover:bg-bee-600 text-bee-600 hover:text-white text-[10px] font-bold transition-colors border border-bee-200 whitespace-nowrap flex items-center gap-1"
                                    title="Assign driver"
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    <span>Assign</span>
                                  </button>
                                </>
                              )}
                              {booking.status === 'accepted' && !booking.assignedDriverName && (
                                <button
                                  onClick={() => setAssigningBooking(booking)}
                                  className="px-2.5 py-1 rounded-lg bg-bee-500 hover:bg-bee-600 text-navy-950 font-bold text-[10px] transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap animate-pulse"
                                  title="Assign driver to this accepted booking"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Assign</span>
                                </button>
                              )}
                              {/* Driver Assigned Tag and Call Driver in Actions */}
                              {booking.assignedDriverName && (booking.status === 'assigned' || booking.status === 'accepted' || booking.status === 'active') && (
                                (() => {
                                  const dPhone = booking.assignedDriverPhone || drivers.find(d => d.id === booking.assignedDriverId || d.name.toLowerCase().trim() === booking.assignedDriverName?.toLowerCase().trim())?.phone;
                                  return (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg whitespace-nowrap flex items-center gap-1">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                        <span>Driver Assigned</span>
                                      </span>
                                      {dPhone && (
                                        <a
                                          href={`tel:${dPhone}`}
                                          onClick={e => e.stopPropagation()}
                                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap cursor-pointer"
                                          title={`Call Driver ${booking.assignedDriverName}: +91 ${dPhone}`}
                                        >
                                          <PhoneCall className="w-2.5 h-2.5" />
                                          <span>Call Driver</span>
                                        </a>
                                      )}
                                    </div>
                                  );
                                })()
                              )}
                              {/* Trip Started */}
                              {(booking.status === 'assigned' || booking.status === 'accepted') && (
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'active')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap"
                                  title="Mark trip as started"
                                >
                                  <PlayCircle className="w-3 h-3" />
                                  <span>Started</span>
                                </button>
                              )}
                              {/* Trip Completed */}
                              {booking.status === 'active' && (
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap"
                                  title="Mark trip as completed"
                                >
                                  <FlagTriangleRight className="w-3 h-3" />
                                  <span>Completed</span>
                                </button>
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

                    {todayFilteredBookings.length === 0 && (
                      <div className="text-center py-10 text-gray-400 text-sm">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-amber-200" />
                        <p>No bookings today{filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── PREVIOUS BOOKINGS ─────────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" />
                  <span className="text-sm font-extrabold text-navy-950">Previous Bookings</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {previousFilteredBookings.length} booking{previousFilteredBookings.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Yesterday &amp; older</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          {['Booking ID', 'Booked At', 'Customer', 'Trip', 'Duration', 'Ride Schedule', 'Area', 'Fare', 'Driver', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {previousFilteredBookings.map(booking => (
                          <tr
                            key={booking.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer opacity-80"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <td className="px-4 py-3 font-bold text-bee-600 whitespace-nowrap">
                              <div>{booking.id}</div>
                              <div className="text-[10px] font-normal text-gray-400">{timeAgo(booking.createdAt)}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-navy-950 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />
                                <span>{formatBookingDate(booking.createdAt)}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span>{formatBookingTime(booking.createdAt)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-navy-950 whitespace-nowrap flex items-center gap-1.5">
                                <span>{booking.customerName}</span>
                                {booking.customerName.toLowerCase() === 'customer' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Default</span>
                                )}
                              </div>
                              <a href={`tel:${booking.customerPhone}`} onClick={e => e.stopPropagation()}
                                className="text-gray-500 hover:text-bee-600 flex items-center gap-1 hover:underline text-[11px] font-medium">
                                <PhoneCall className="w-2.5 h-2.5 text-bee-600 flex-shrink-0" />
                                <span>{booking.customerPhone}</span>
                              </a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border uppercase tracking-wide ${
                                booking.tripType === 'outside'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {tripLabel(booking.tripType)}
                              </span>
                              {booking.tripType === 'outside' && (
                                <div className="text-[11px] font-bold text-purple-950 flex items-center gap-1 mt-1 max-w-[170px] truncate">
                                  <Navigation className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                  <span className="truncate">{extractDestination(booking)}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                              {booking.tripType === 'outside'
                                ? `${booking.duration} Day${booking.duration > 1 ? 's' : ''}`
                                : `${booking.duration}h`}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-navy-950 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>{booking.scheduleType === 'now' ? 'Today' : formatScheduledDate(booking.date)}</span>
                              </div>
                              <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                <span>{booking.scheduleType === 'now' ? 'Immediate (~30m)' : booking.time}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 min-w-[200px] max-w-[320px]">
                              {booking.tripType === 'outside' ? (
                                <div className="space-y-1">
                                  <div className="text-[10.5px] font-bold text-purple-900 bg-purple-50/90 border border-purple-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                    <Navigation className="w-2.5 h-2.5 text-purple-600 flex-shrink-0" />
                                    <span className="truncate">Destination: {extractDestination(booking)}</span>
                                  </div>
                                  <div className="text-gray-500 text-[11px] truncate">{booking.area}</div>
                                </div>
                              ) : (
                                <div className="text-gray-600 text-xs truncate">{booking.area}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-bee-600 font-bold whitespace-nowrap">₹{booking.estimatedFare}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {booking.assignedDriverName ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  <span>{booking.assignedDriverName}</span>
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColor[booking.status]}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <button onClick={() => setSelectedBooking(booking)}
                                className="p-1.5 rounded-lg bg-gray-50 hover:bg-bee-50 text-gray-400 hover:text-bee-600 transition-colors border border-gray-200"
                                title="View Details">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {previousFilteredBookings.length === 0 && (
                      <div className="text-center py-10 text-gray-400 text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        <p>No previous bookings{filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ── DRIVERS SECTION ── */}
          {activeSection === 'drivers' && (
            <div className="space-y-5">
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-navy-950">Driver Fleet Management</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-bee-50 text-bee-700 border border-bee-200">
                      {drivers.length} {drivers.length === 1 ? 'Driver' : 'Drivers'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {drivers.filter(d => d.isOnDuty).length} On Duty
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manually enter driver profiles, manage on-duty availability, and dispatch rides to customers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDriver(null);
                      setIsAddDriverModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Driver</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={e => setDriverSearch(e.target.value)}
                    placeholder="Search drivers by name, phone, area, badge..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 text-navy-950 font-medium"
                  />
                  {driverSearch && (
                    <button
                      type="button"
                      onClick={() => setDriverSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All', count: drivers.length },
                    { id: 'on_duty', label: 'On Duty', count: drivers.filter(d => d.isOnDuty).length },
                    { id: 'available', label: 'Not Assigned', count: drivers.filter(d => d.isOnDuty && !getDriverActiveBooking(d, bookings)).length },
                    { id: 'busy', label: 'Driver Assigned', count: drivers.filter(d => !!getDriverActiveBooking(d, bookings)).length },
                    { id: 'off_duty', label: 'Off Duty', count: drivers.filter(d => !d.isOnDuty).length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDriverFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        driverFilter === tab.id
                          ? 'bg-navy-950 text-white shadow-xs'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        driverFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Grid or Empty State */}
              {(() => {
                const filteredDrivers = drivers.filter(d => {
                  const activeRide = getDriverActiveBooking(d, bookings);
                  if (driverFilter === 'on_duty' && !d.isOnDuty) return false;
                  if (driverFilter === 'available' && (!d.isOnDuty || activeRide)) return false;
                  if (driverFilter === 'busy' && !activeRide) return false;
                  if (driverFilter === 'off_duty' && d.isOnDuty) return false;
                  if (driverSearch.trim()) {
                    const q = driverSearch.toLowerCase().trim();
                    return (
                      d.name.toLowerCase().includes(q) ||
                      d.phone.includes(q) ||
                      d.area.toLowerCase().includes(q) ||
                      d.badge.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                if (drivers.length === 0) {
                  return (
                    <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm space-y-4 max-w-xl mx-auto my-6">
                      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-bee-700 flex items-center justify-center mx-auto shadow-sm">
                        <Users className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-navy-950">No Drivers Registered Yet</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
                          You can manually enter drivers with name, phone number, operating area (e.g. Hanamkonda, Kazipet), and specialization badge, then dispatch them to customer rides.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDriver(null);
                            setIsAddDriverModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Enter First Driver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const added = addDriver({
                              name: 'Ramesh Kumar',
                              phone: '9848012345',
                              area: 'Hanamkonda',
                              badge: 'Highway & Outstation Expert',
                              rating: 4.9,
                              isOnDuty: true,
                              photo: PRESET_DRIVER_AVATARS[0],
                            });
                            showToast(`Added sample driver ${added.name}`);
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-bee-600" />
                          <span>Add Sample Driver (Ramesh)</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                if (filteredDrivers.length === 0) {
                  return (
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xs">
                      <p className="text-xs text-gray-500 font-semibold">No drivers matching current filter / search "{driverSearch}".</p>
                      <button
                        type="button"
                        onClick={() => { setDriverSearch(''); setDriverFilter('all'); }}
                        className="mt-2 text-xs font-bold text-bee-600 hover:underline"
                      >
                        Reset Search & Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDrivers.map(driver => {
                      const dTrips = bookings.filter(b => b.assignedDriverId === driver.id && (isBookingToday(b.createdAt) || isBookingToday(b.date) || (b.status === 'completed' && isBookingToday(b.completedAt))));
                      const dCompleted = dTrips.filter(b => b.status === 'completed');
                      const dEarnings = dCompleted.reduce((sum, b) => sum + b.estimatedFare, 0) || driver.todayEarnings;
                      const activeRide = getDriverActiveBooking(driver, bookings);

                      return (
                        <div key={driver.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow relative">
                          {/* Driver header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative flex-shrink-0">
                                <img src={driver.photo} alt={driver.name} className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-2xs" />
                                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${driver.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-black text-navy-950 truncate">{driver.name}</div>
                                <div className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-purple-100 truncate max-w-[170px]">
                                  {driver.badge}
                                </div>
                              </div>
                            </div>

                            {/* Edit / Delete menu */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDriver(driver);
                                  setIsAddDriverModalOpen(true);
                                }}
                                className="p-1 rounded-lg text-gray-400 hover:text-navy-900 hover:bg-gray-100 transition-colors"
                                title="Edit Driver Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove driver ${driver.name} from the fleet?`)) {
                                    deleteDriver(driver.id);
                                    showToast(`Driver ${driver.name} removed from fleet.`);
                                  }
                                }}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Remove Driver"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Stats cards */}
                          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                              <div className="font-bold text-navy-950 flex items-center justify-center gap-0.5">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {driver.rating}
                              </div>
                              <div className="text-gray-400 text-[9px]">Rating</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                              <div className="font-bold text-navy-950">{driver.tripsCount}</div>
                              <div className="text-gray-400 text-[9px]">All Trips</div>
                            </div>
                            <div className="bg-blue-50/70 rounded-xl p-2 border border-blue-100">
                              <div className="font-bold text-blue-700">{dTrips.length}</div>
                              <div className="text-blue-600 text-[9px] font-semibold">Daily Trips</div>
                            </div>
                            <div className="bg-amber-50/70 rounded-xl p-2 border border-amber-100">
                              <div className="font-bold text-bee-600">₹{dEarnings}</div>
                              <div className="text-bee-700 text-[9px] font-semibold">Daily Earn</div>
                            </div>
                          </div>

                          {/* Contact & Location */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-gray-600">
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <MapPin className="w-3.5 h-3.5 text-bee-600" />
                                <span>{driver.area}</span>
                              </span>
                              {driver.phone && (
                                <a
                                  href={`tel:${driver.phone}`}
                                  className="text-bee-600 hover:underline font-bold flex items-center gap-1 text-[11px]"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{driver.phone}</span>
                                </a>
                              )}
                            </div>

                            {/* Ride assignment status */}
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px]">
                              <span className="text-gray-400">Current Status:</span>
                              {activeRide ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBooking(activeRide)}
                                  className="font-bold text-blue-700 hover:underline bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 cursor-pointer"
                                  title={`Click to view active Ride #${activeRide.id}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                  <span>Driver Assigned (#{activeRide.id})</span>
                                </button>
                              ) : (
                                <span className={`font-bold px-2 py-0.5 rounded-full border ${
                                  driver.isOnDuty ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                                }`}>
                                  {driver.isOnDuty ? 'Not Assigned' : 'Off Duty'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action: Driver Assigned vs Assign */}
                          {activeRide ? (
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(activeRide)}
                              className="w-full py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                              title={`Driver is assigned to customer ${activeRide.customerName} on Ride #${activeRide.id}. Click to view details.`}
                            >
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>Driver Assigned</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssigningDriverForRide(driver)}
                              className="w-full py-2 rounded-xl text-xs font-bold bg-bee-500 hover:bg-bee-600 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Assign</span>
                            </button>
                          )}

                          {/* Duty toggle button */}
                          <button
                            type="button"
                            onClick={() => toggleDriverDuty(driver.id)}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              driver.isOnDuty
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                          >
                            {driver.isOnDuty ? '✓ On Duty — Click to Go Off Duty' : '✗ Off Duty — Click to Go On Duty'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── REVENUE SECTION ── */}
          {activeSection === 'revenue' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Daily Earnings (Today)', value: `₹${dailyEarnings.toLocaleString('en-IN')}`, sub: `${dailyCompletedTrips.length} completed rides today`, color: 'text-bee-600' },
                  { label: 'Daily Trips (Today)', value: `${dailyTrips.length} Trips`, sub: `${dailyCompletedTrips.length} done • ${dailyTrips.length - dailyCompletedTrips.length} pending/active`, color: 'text-emerald-600' },
                  { label: 'Total Completed Fare', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: `${completedCount} completed rides all-time`, color: 'text-blue-600' },
                  { label: 'Pending Collection', value: `₹${bookings.filter(b => b.status === 'pending' || b.status === 'assigned').reduce((s, b) => s + b.estimatedFare, 0).toLocaleString('en-IN')}`, sub: 'In dispatch pipeline', color: 'text-amber-600' },
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

          {/* ── PRICING SECTION ── */}
          {activeSection === 'pricing' && <PricingSection />}

        </main>
      </div>

      {/* Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking ? (bookings.find(b => b.id === selectedBooking.id) || selectedBooking) : null}
        bookings={bookings}
        onClose={() => setSelectedBooking(null)}
        onAssign={(bookingId, driverId, driverName, driverPhone) => {
          const res = assignDriver(bookingId, driverId, driverName, driverPhone);
          if (res === false) {
            showToast(`⚠️ Cannot assign: Driver is already busy on another ride!`);
          } else {
            showToast(`Assigned ${driverName || 'driver'} to Booking #${bookingId}.`);
          }
        }}
        onAccept={(bookingId) => {
          acceptBooking(bookingId);
          const b = bookings.find(item => item.id === bookingId) || selectedBooking;
          if (b) setAssigningBooking(b);
        }}
        onCancel={id => updateBookingStatus(id, 'cancelled')}
        onDelete={deleteBooking}
        onStatusChange={updateBookingStatus}
        onUpdateCustomerName={updateCustomerName}
        drivers={drivers}
        onOpenAddDriver={() => {
          setSelectedBooking(null);
          setEditingDriver(null);
          setIsAddDriverModalOpen(true);
        }}
      />

      {/* Add / Edit Driver Modal */}
      <AddDriverModal
        isOpen={isAddDriverModalOpen}
        onClose={() => {
          setIsAddDriverModalOpen(false);
          setEditingDriver(null);
        }}
        initialData={editingDriver}
        onSave={(data) => {
          if (editingDriver) {
            updateDriver(editingDriver.id, data);
            showToast(`Driver ${data.name} updated successfully.`);
          } else {
            const added = addDriver(data);
            showToast(`Driver ${added.name} registered successfully.`);
          }
        }}
      />

      {/* Assign Driver to Booking Modal */}
      <AssignDriverModal
        booking={assigningBooking}
        bookings={bookings}
        drivers={drivers}
        onClose={() => setAssigningBooking(null)}
        onAssign={(bookingId, driverId, driverName, driverPhone) => {
          const res = assignDriver(bookingId, driverId, driverName, driverPhone);
          if (res === false) {
            showToast(`⚠️ Cannot assign: Driver is already busy on another ride!`);
          } else {
            showToast(`Assigned ${driverName || 'driver'} to Booking #${bookingId}.`);
          }
        }}
        onOpenAddDriver={() => {
          setEditingDriver(null);
          setIsAddDriverModalOpen(true);
        }}
      />

      {/* Assign Ride to Driver Modal */}
      <AssignRideToDriverModal
        driver={assigningDriverForRide}
        bookings={bookings}
        onClose={() => setAssigningDriverForRide(null)}
        onAssign={(bookingId, driverId, driverName, driverPhone) => {
          const res = assignDriver(bookingId, driverId, driverName, driverPhone);
          if (res === false) {
            showToast(`⚠️ Cannot assign: Driver is already busy on another ride!`);
          } else {
            showToast(`Assigned ride #${bookingId} to ${driverName || assigningDriverForRide?.name}.`);
          }
        }}
      />

      {/* Driver Toast Notification */}
      {driverToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-navy-950 text-white rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{driverToast}</span>
        </div>
      )}
    </div>
  );
};
