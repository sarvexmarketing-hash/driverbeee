import React from 'react';
import { ShieldCheck, HeartHandshake, Clock, ChevronDown, LogIn, User, MapPin, Sparkles, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DriverBeeLogo } from './DriverBeeLogo';

import { isWarangalLocation } from '../utils/location';

interface HeroProps {
  onQuickBook?: () => void;
  selectedCity?: string;
  onOpenCitySelector?: () => void;
  onOpenNotifications?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onOpenProfile?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onQuickBook,
  selectedCity = 'Warangal',
  onOpenCitySelector,
  onOpenNotifications,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, profile } = useAuth();
  const isWarangal = isWarangalLocation(selectedCity);

  return (
    <>
      {/* ======================================================
          MOBILE HERO: Matches reference image exactly
          - Light blue-gray atmospheric gradient background
          - Top-right: Bell + Warangal pill + Auth button
          - Left: Good Morning / Book a Driver / tagline
          - Right: Luxury sedan + driver photo
          ====================================================== */}
      <section className="lg:hidden relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #D8E9F5 0%, #E6F1F8 30%, #EDF4FA 55%, #F5F8FB 80%, #FFFFFF 100%)'
        }}
      >
        <div className="relative px-4 pt-3 pb-0">
          
          {/* Top Row: DriverBee Logo + Location Pill + Bell + Auth Button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Left: Official DriverBee Brand Logo */}
            <div className="flex items-center">
              <DriverBeeLogo
                height={26}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </div>

            {/* Right: City Selector + Notification Bell + Auth */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCitySelector}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/95 active:scale-95 backdrop-blur-xs rounded-full shadow-xs border border-white/80 text-[11.5px] font-bold text-navy-900 cursor-pointer transition-all"
                title="Change Location"
              >
                <MapPin className="w-3 h-3 text-bee-600 flex-shrink-0 fill-bee-600/20" />
                <span className="truncate max-w-[85px] sm:max-w-[110px]">{selectedCity.split(',')[0]}</span>
                {!isWarangal && (
                  <span className="text-[9px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.2 rounded shrink-0">
                    Soon
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-navy-400" />
              </button>

              {/* Call Helpline Button */}
              <a
                href="tel:+917569402288"
                className="w-7 h-7 rounded-full bg-white/95 active:scale-95 backdrop-blur-xs shadow-xs border border-white/80 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-all"
                aria-label="Call DriverBee Support"
                title="Call Helpline: +91 75694 02288"
              >
                <Phone className="w-3.5 h-3.5 fill-emerald-600/20" />
              </a>

              {user ? (
                <button
                  type="button"
                  onClick={() => onOpenProfile?.()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/95 active:scale-95 rounded-full shadow-xs border border-white/80 text-[11px] font-bold text-navy-950 cursor-pointer transition-transform"
                  title={profile?.full_name || user.email || ''}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                  <span className="truncate max-w-[70px]">{profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth?.('login')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/90 hover:bg-white rounded-full shadow-xs border border-white/80 text-[11px] font-bold text-navy-950 transition-colors"
                >
                  <User className="w-3 h-3 text-bee-600" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Content: 2-column flex matching reference image */}
          <div className="flex items-end justify-between">
            
            {/* Left: Text & Titles */}
            <div className="flex-1 pb-4 pr-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/80 rounded-full text-[10px] font-bold text-navy-800 mb-1 shadow-2xs border border-white/60">
                <Sparkles className="w-2.5 h-2.5 text-bee-600" />
                <span>On-Demand Car Drivers</span>
              </div>
              <p className="text-xs text-navy-600 font-medium leading-none mb-1">
                Good Morning
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy-950 leading-tight font-display">
                Book a Driver
              </h1>
              <p className="text-xs font-display font-bold tracking-tight text-navy-950 mt-0.5">
                Your car our driver, on demand
              </p>
            </div>

            {/* Right: Car + Driver Image (positioned center-right, fills height) */}
            <div className="flex-shrink-0 w-[52%] relative">
              <img
                src="/hero-driver-car.jpg"
                alt="DriverBee driver beside luxury car with Warangal skyline"
                width={300}
                height={170}
                fetchPriority="high"
                decoding="async"
                className="w-full h-[170px] object-cover object-[65%_center] rounded-tl-3xl"
                style={{ borderRadius: '24px 0 0 0' }}
              />
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          DESKTOP HERO: Cinematic full-width layout
          ====================================================== */}
      <section className="hidden lg:block relative overflow-hidden bg-gradient-to-b from-[#EDF5FD] via-[#F3F8FD] to-[#F8FAFD] pt-9 pb-28">
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-[400px] h-[300px] bg-bee-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1340px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 items-center">
            
            {/* LEFT: Headline + Trust Badges */}
            <div className="col-span-6 z-10">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-navy-200/80 rounded-full shadow-subtle mb-4">
                <span className="w-2 h-2 rounded-full bg-bee-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-navy-800">
                  Safe Drives. Brighter Days.
                </span>
              </div>

              <h1 className="text-[52px] font-extrabold tracking-tight text-navy-950 leading-[1.08] mb-3 font-display">
                Book a Driver
              </h1>

              <p className="text-xl font-display font-bold tracking-tight text-navy-950 mb-6 max-w-lg">
                Your car our driver, on demand
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 border border-navy-200/70 rounded-xl shadow-subtle">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-navy-900">Verified Drivers</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 border border-navy-200/70 rounded-xl shadow-subtle">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-semibold text-navy-900">Safe for Family</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 border border-navy-200/70 rounded-xl shadow-subtle">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-navy-900">On Time Always</span>
                </div>
              </div>

            </div>

            {/* RIGHT: Car + Driver Photo */}
            <div className="col-span-6 relative">
              <div className="absolute -top-4 right-10 z-20 pointer-events-none transform -rotate-3 select-none">
                <span className="font-script text-3xl text-navy-700 tracking-wide drop-shadow-sm">
                  Warangal Drives Better
                </span>
                <svg className="w-20 h-3 text-bee-600 -mt-1 ml-auto" viewBox="0 0 100 15" fill="none">
                  <path d="M5 10C35 4 65 14 95 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-card border border-white/80 group">
                <img
                  src="/hero-driver-car.jpg"
                  alt="Professional DriverBee driver opening car door for passenger"
                  width={600}
                  height={380}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-[380px] object-cover object-[55%_center] transform transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent pointer-events-none" />

                {/* Verified Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-navy-200/80 shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-navy-950">
                    Rajesh K. • 4.97 ★ (1,420 drives)
                  </span>
                  <span className="bg-bee-100 text-bee-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    Warangal Verified
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
