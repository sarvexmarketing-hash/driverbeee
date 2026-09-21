import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CalendarDays, 
  Users, 
  Car, 
  LogOut, 
  ChevronRight, 
  Wallet,
  PhoneCall,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookings: () => void;
  onOpenFamily: () => void;
  selectedCity?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenBookings,
  onOpenFamily,
  selectedCity = 'Warangal, Telangana',
}) => {
  const { user, profile, logout } = useAuth();
  const { bookings } = useBookings();

  if (!isOpen || !user) return null;

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer';
  const displayEmail = user.email || 'No email provided';
  const displayPhone = profile?.phone || user.phone || user.user_metadata?.phone || '+91 98450 12345';
  const userRole = profile?.role || 'customer';
  const walletBalance = profile?.wallet_balance ?? 500;
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div 
        className="relative w-full sm:max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl border border-navy-200 shadow-modal overflow-hidden z-10 max-h-[92vh] flex flex-col transition-all animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-bee-500/15 flex items-center justify-center text-bee-700">
              <User className="w-4 h-4 text-bee-700" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy-950 leading-tight">
                My Profile &amp; Account
              </h3>
              <p className="text-[11px] text-navy-500 font-medium">
                DriverBee verified customer portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-bee-50 via-amber-50/50 to-white border border-bee-200/90 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-bee-600 to-bee-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                  {initial}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-extrabold text-navy-950 truncate">
                    {displayName}
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.2 rounded-md">
                    Verified
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-navy-600 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span className="truncate">{displayEmail}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-navy-600 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span>{displayPhone}</span>
                </div>
              </div>
            </div>

            {/* Wallet & Rewards Banner */}
            <div className="mt-3.5 pt-3 border-t border-bee-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-bee-500/20 flex items-center justify-center text-bee-800">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-navy-500">
                    DriverBee Credits
                  </div>
                  <div className="text-xs font-black text-navy-950">
                    ₹{walletBalance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-bee-900 bg-white/80 px-2 py-1 rounded-lg border border-bee-200">
                <Sparkles className="w-3 h-3 text-bee-600" />
                <span>Active Balance</span>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider font-extrabold text-navy-500 px-1">
              Account Hub
            </div>

            {/* My Bookings */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBookings();
              }}
              className="w-full p-3 rounded-xl bg-white hover:bg-navy-50 border border-navy-100 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-navy-950">
                    My Bookings
                  </div>
                  <div className="text-[11px] text-navy-500">
                    {bookings.length} {bookings.length === 1 ? 'ride recorded' : 'rides recorded'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-navy-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Family Safety Hub */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFamily();
              }}
              className="w-full p-3 rounded-xl bg-white hover:bg-navy-50 border border-navy-100 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-navy-950">
                    Family Safety Hub
                  </div>
                  <div className="text-[11px] text-navy-500">
                    Manage family members &amp; emergency rides
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-navy-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Role-Specific Portal Links */}
            {userRole === 'driver' && (
              <a
                href="/driver"
                className="w-full p-3 rounded-xl bg-white hover:bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-950">
                      Driver Dashboard
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      View driver assignments &amp; payout status
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600" />
              </a>
            )}

            {userRole === 'admin' && (
              <a
                href="/admin"
                className="w-full p-3 rounded-xl bg-white hover:bg-purple-50/70 border border-purple-200/80 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-purple-950">
                      Admin Management Console
                    </div>
                    <div className="text-[11px] text-purple-700">
                      Driver approvals &amp; system dispatch
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-600" />
              </a>
            )}

            {userRole !== 'driver' && (
              <a
                href="/join-as-driver"
                className="w-full p-3 rounded-xl bg-white hover:bg-bee-50/70 border border-navy-100 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-bee-100 text-bee-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-navy-950">
                      Drive with DriverBee
                    </div>
                    <div className="text-[11px] text-navy-500">
                      Join Warangal&apos;s verified driver partner network
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-navy-400 group-hover:text-navy-700" />
              </a>
            )}
          </div>

          {/* Helpline Support Row */}
          <div className="p-3 bg-[#FAFBFD] border border-navy-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-navy-950">
                  Customer Helpline
                </div>
                <div className="text-[11px] text-navy-500">
                  +91 75694 02288 • 24/7 Support
                </div>
              </div>
            </div>

            <a
              href="tel:+917569402288"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Call
            </a>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full p-3 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 text-rose-700 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out of DriverBee</span>
          </button>
        </div>
      </div>
    </div>
  );
};
