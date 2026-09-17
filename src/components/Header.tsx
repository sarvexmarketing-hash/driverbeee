import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Car, 
  Users, 
  CalendarDays,
  Check,
  Sparkles,
  Crosshair,
  LogIn,
  LogOut,
  UserPlus,
  Phone,
  Mail
} from 'lucide-react';
import { DriverBeeLogo } from './DriverBeeLogo';
import { useAuth } from '../context/AuthContext';

import { isWarangalLocation } from '../utils/location';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBookings: () => void;
  onOpenDrivers: () => void;
  onOpenFamily: () => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onDetectLocation?: () => void;
  isDetectingLocation?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

const WARANGAL_AREAS = [
  'Warangal, Telangana',
  'Hanamkonda, Warangal',
  'Kazipet, Warangal',
  'Subedari, Warangal',
  'Nakkalagutta, Warangal',
  'Hunter Road, Warangal',
  'Ramnagar, Warangal',
  'Balasamudram, Warangal',
  'Pochamma Maidan, Warangal',
  'Waddepally, Warangal'
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBookings,
  onOpenDrivers,
  onOpenFamily,
  selectedCity,
  setSelectedCity,
  onDetectLocation,
  isDetectingLocation,
  onOpenAuth
}) => {
  const { user, profile, logout } = useAuth();
  const isWarangal = isWarangalLocation(selectedCity);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', action: () => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { id: 'book', label: 'Book a Driver', action: () => { setActiveTab('book'); const el = document.getElementById('booking-card-section'); el?.scrollIntoView({ behavior: 'smooth' }); } },
    { id: 'bookings', label: 'My Bookings', action: () => onOpenBookings() },
    { id: 'founder', label: 'Founder', action: () => { setActiveTab('founder'); const el = document.getElementById('founder-section'); el?.scrollIntoView({ behavior: 'smooth' }); } },
  ];

  return (
    <header className={`hidden lg:block sticky top-0 z-40 w-full transition-all duration-200 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-navy-200/80' 
        : 'bg-white border-b border-navy-100'
    }`}>
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] md:h-[76px] flex items-center justify-between">
        
        {/* LEFT: DriverBee Logo */}
        <div className="flex items-center gap-3">
          <div onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <DriverBeeLogo height={32} />
          </div>
        </div>

        {/* CENTER: Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="relative px-3.5 py-2 text-[14.5px] font-medium transition-colors group text-navy-800 hover:text-navy-950"
              >
                <span className={isActive ? 'font-semibold text-navy-950' : 'text-navy-700'}>
                  {item.label}
                </span>

                {/* Yellow/Amber underline under active item */}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-bee-600 rounded-full transition-all" />
                )}
                {!isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-bee-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Location selector, Notification, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 hover:bg-navy-100/80 border border-navy-200/70 rounded-full text-xs sm:text-[13px] font-medium text-navy-900 transition-colors"
              title="Change pickup location"
            >
              {isDetectingLocation ? (
                <Crosshair className="w-3.5 h-3.5 text-bee-600 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-bee-600 fill-bee-600/20" />
              )}
              <span className="truncate max-w-[105px] sm:max-w-[130px]">
                {isDetectingLocation ? 'Locating...' : selectedCity.split(',')[0]}
              </span>
              {!isWarangal && (
                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300/80 px-1 py-0.2 rounded font-black">
                  Soon
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-navy-500" />
            </button>

            {isCityOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCityOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-card border border-navy-200 p-2.5 z-20 animate-fade-in">
                  {!isWarangal && (
                    <div className="p-2.5 mb-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                      <div className="font-extrabold text-[11px] text-amber-900 mb-0.5">
                        📍 DriverBee is live in Warangal
                      </div>
                      <p className="text-[11px] text-amber-900/90 leading-tight mb-1.5">
                        Bookings currently only happen from Warangal. Driver service in {selectedCity.split(',')[0]} is coming soon!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity('Warangal, Telangana');
                          setIsCityOpen(false);
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-bee-500 hover:bg-bee-600 text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                      >
                        Switch to Warangal
                      </button>
                    </div>
                  )}
                  
                  {/* GPS Auto-Detect Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onDetectLocation?.();
                      setIsCityOpen(false);
                    }}
                    disabled={isDetectingLocation}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-semibold bg-bee-50/90 hover:bg-bee-100/90 border border-bee-200/80 text-navy-950 flex items-center justify-between transition-colors mb-2 group shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-bee-500/20 flex items-center justify-center">
                        <Crosshair className={`w-3.5 h-3.5 text-bee-700 ${isDetectingLocation ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-navy-950">Grasp Current Location</div>
                        <div className="text-[10px] text-navy-500 font-normal">Use high-accuracy device GPS</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-bee-200/70 text-bee-800 rounded">
                      GPS
                    </span>
                  </button>

                  <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-navy-500 border-b border-navy-100 flex items-center justify-between">
                    <span>Or Select Local Area</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {WARANGAL_AREAS.map((area) => (
                      <button
                        key={area}
                        onClick={() => {
                          setSelectedCity(area);
                          setIsCityOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedCity === area 
                            ? 'bg-bee-50 text-bee-700 font-semibold' 
                            : 'hover:bg-navy-50 text-navy-800'
                        }`}
                      >
                        <span>{area}</span>
                        {selectedCity === area && <Check className="w-3.5 h-3.5 text-bee-600" />}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-2 bg-navy-50 rounded-xl mt-1 text-[11px] text-navy-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Drivers arrive in 30 mins across Warangal</span>
                  </div>
                </div>
              </>
            )}
          </div>



          {/* User Profile / Auth State */}
          {user && profile?.role === 'admin' ? (
            <div className="flex items-center gap-2">
              <a
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-bee-600" />
                <span>Admin Portal</span>
              </a>
              <button
                onClick={logout}
                className="text-xs text-navy-500 hover:text-navy-950 font-semibold px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : user && profile?.role !== 'admin' ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-navy-100 cursor-pointer transition-colors border border-navy-200/60"
                title="Account Menu"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden ring-1.5 ring-bee-600/40 bg-bee-600 text-white flex items-center justify-center font-bold text-xs">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-navy-950 leading-tight truncate max-w-[120px]">
                    {profile?.full_name || user.email?.split('@')[0] || 'Customer'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold leading-tight">
                    Verified Customer
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-navy-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-navy-200/80 py-2 z-40 animate-scale-up">
                    <div className="px-4 py-2.5 border-b border-navy-100">
                      <div className="font-bold text-xs text-navy-950">
                        {profile?.full_name || 'DriverBee Customer'}
                      </div>
                      <div className="text-[11px] text-navy-500 truncate mt-0.5">
                        {user.email}
                      </div>
                      {profile?.phone && (
                        <div className="text-[11px] text-navy-500 mt-0.5">
                          {profile.phone}
                        </div>
                      )}
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenBookings();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-navy-50 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-bee-600" />
                        <span>My Bookings</span>
                      </button>

                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Official Helpline */}
              <a
                href="tel:+917569402288"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-xs font-bold text-emerald-950 transition-colors shadow-xs"
                title="DriverBee Helpline: +91 75694 02288"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 75694 02288</span>
              </a>

              <button
                onClick={() => onOpenAuth?.('login')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-navy-200/90 text-xs font-bold text-navy-800 hover:bg-navy-100 hover:text-navy-950 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-bee-600" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth?.('signup')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-bee-600 hover:bg-bee-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button (Hamburger) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-navy-800 hover:bg-navy-100 transition-colors ml-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-navy-200/80 bg-white/98 backdrop-blur-md px-5 py-4 space-y-3 animate-fade-in shadow-lg">
          
          {/* Mobile Auth Header in drawer */}
          {user ? (
            <div className="p-3 bg-navy-50 rounded-2xl border border-navy-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-bee-600 text-white font-bold text-xs flex items-center justify-center">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-950">
                    {profile?.full_name || 'Customer'}
                  </div>
                  <div className="text-[10px] text-navy-500 truncate max-w-[150px]">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await logout();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-white rounded-lg border border-rose-200 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth?.('login');
                }}
                className="py-2.5 px-3 rounded-xl border border-navy-200 bg-white text-xs font-bold text-navy-900 flex items-center justify-center gap-1.5 shadow-xs hover:bg-navy-50"
              >
                <LogIn className="w-4 h-4 text-bee-600" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth?.('signup');
                }}
                className="py-2.5 px-3 rounded-xl bg-bee-600 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs hover:bg-bee-700"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-navy-100">
            <button
              onClick={() => { const el = document.getElementById('booking-card-section'); el?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-bee-50 text-left text-xs font-semibold text-navy-900 hover:bg-bee-100"
            >
              <Car className="w-4 h-4 text-bee-700" />
              <span>Book a Driver</span>
            </button>
            <button
              onClick={() => { onOpenBookings(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-50 text-left text-xs font-semibold text-navy-900 hover:bg-navy-100"
            >
              <CalendarDays className="w-4 h-4 text-bee-600" />
              <span>My Bookings</span>
            </button>
            <button
              onClick={() => { const el = document.getElementById('founder-section'); el?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-bee-50 to-amber-50 text-left text-xs font-semibold text-navy-950 border border-bee-200/80 hover:bg-bee-100"
            >
              <Sparkles className="w-4 h-4 text-bee-600" />
              <span>Meet Founder: Mr. Viswa Teja</span>
            </button>
          </div>

          <div className="pt-2.5 border-t border-navy-100 space-y-1.5 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-navy-400">
              Customer Helpline & Support
            </div>
            <div className="flex flex-col gap-1.5">
              <a 
                href="tel:+917569402288" 
                className="flex items-center gap-2 font-bold text-navy-900 hover:text-bee-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>+91 75694 02288</span>
              </a>
              <a 
                href="mailto:officialdriverbee@gmail.com" 
                className="flex items-center gap-2 text-navy-600 hover:text-bee-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />
                <span className="truncate">officialdriverbee@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-navy-500">
            <span>Operating 24/7 across Warangal</span>
            <span className="font-bold text-navy-900">4.9 ★ (18k+ reviews)</span>
          </div>
        </div>
      )}
    </header>
  );
};
