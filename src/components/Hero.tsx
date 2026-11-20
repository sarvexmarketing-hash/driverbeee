import React from 'react';
import { 
  ChevronDown, 
  User, 
  MapPin, 
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DriverBeeLogo } from './DriverBeeLogo';
import { isWarangalLocation } from '../utils/location';
import { BookingCard } from './BookingCard';
import { BookingState } from '../types';

interface HeroProps {
  onQuickBook?: () => void;
  selectedCity?: string;
  onOpenCitySelector?: () => void;
  onOpenNotifications?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onOpenProfile?: () => void;
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  onBookNow: () => void;
  onSwitchToWarangal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  selectedCity = 'Warangal, Telangana',
  onOpenCitySelector,
  onOpenAuth,
  onOpenProfile,
  bookingState,
  updateBookingState,
  onBookNow,
  onSwitchToWarangal,
}) => {
  const { user, profile } = useAuth();
  const isServiceable = isWarangalLocation(selectedCity);

  return (
    <section className="relative bg-[#FAFBFD] pt-3 sm:pt-6 pb-12 sm:pb-16 lg:pb-20">
      
      {/* Decorative Golden Arc Watermark in Top-Right (isolated overflow so popovers are never clipped) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute -top-12 -right-12 sm:-top-20 sm:-right-20 md:-top-24 md:-right-24 w-80 h-80 sm:w-[480px] sm:h-[480px] md:w-[620px] md:h-[620px]">
          <svg 
            viewBox="0 0 500 500" 
            className="w-full h-full text-amber-400" 
            fill="none"
          >
            {/* Outer primary arc ring */}
            <circle 
              cx="400" 
              cy="100" 
              r="280" 
              stroke="currentColor" 
              strokeWidth="38" 
              opacity="0.18" 
            />
            {/* Inner accent ring */}
            <circle 
              cx="400" 
              cy="100" 
              r="210" 
              stroke="currentColor" 
              strokeWidth="12" 
              opacity="0.12" 
            />
            {/* Subtle soft glow circle */}
            <circle 
              cx="400" 
              cy="100" 
              r="140" 
              stroke="currentColor" 
              strokeWidth="4" 
              opacity="0.08" 
            />
          </svg>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile Top App Bar (Only visible on screens < lg) */}
        <div className="lg:hidden flex items-center justify-between gap-2 mb-6 pt-1">
          {/* DriverBee Logo */}
          <div className="flex items-center">
            <DriverBeeLogo
              height={26}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>

          {/* Right Action Cluster: City Selector + Call Helpline + User */}
          <div className="flex items-center gap-1.5">
            {/* City Selector Pill */}
            <button
              type="button"
              onClick={onOpenCitySelector}
              className="flex items-center gap-1 px-2.5 py-1 bg-white active:scale-95 shadow-xs border border-neutral-200/80 rounded-full text-[11.5px] font-bold text-neutral-900 cursor-pointer transition-all"
              title="Change Pickup City"
            >
              <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0 fill-amber-500/20" />
              <span className="truncate max-w-[85px] sm:max-w-[110px]">
                {selectedCity.split(',')[0]}
              </span>
              {!isServiceable && (
                <span className="text-[9px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.2 rounded shrink-0">
                  Soon
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Helpline Phone */}
            <a
              href="tel:+917569402288"
              className="w-7 h-7 rounded-full bg-white active:scale-95 shadow-xs border border-neutral-200/80 flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-all"
              aria-label="Call DriverBee Support"
              title="Helpline: +91 75694 02288"
            >
              <Phone className="w-3.5 h-3.5 fill-emerald-600/20" />
            </a>

            {/* Auth Profile or Sign In */}
            {user ? (
              <button
                type="button"
                onClick={() => onOpenProfile?.()}
                className="flex items-center gap-1 px-2.5 py-1 bg-white active:scale-95 rounded-full shadow-xs border border-neutral-200/80 text-[11px] font-bold text-neutral-950 cursor-pointer transition-transform"
                title={profile?.full_name || user.email || ''}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                <span className="truncate max-w-[70px]">
                  {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth?.('login')}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-50 rounded-full shadow-xs border border-neutral-200/80 text-[11px] font-bold text-neutral-950 transition-colors"
              >
                <User className="w-3 h-3 text-amber-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================
            HERO TITLE & SUBTITLE (Matching Reference Image Exactly)
            ============================================================ */}
        <div className="max-w-[1020px] mx-auto mb-6 sm:mb-8 text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-neutral-950 font-display tracking-tight leading-[1.08]">
            Book Your Driver
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium text-neutral-700 mt-1.5 sm:mt-2 tracking-tight">
            Your car. Your route. Your driver.
          </p>
        </div>

        {/* ============================================================
            HERO BOOKING CARD (Matching Reference Image Pixel-for-Pixel)
            ============================================================ */}
        <BookingCard
          bookingState={bookingState}
          updateBookingState={updateBookingState}
          onBookNow={onBookNow}
          selectedCity={selectedCity}
          onSwitchToWarangal={onSwitchToWarangal}
        />

      </div>

    </section>
  );
};
