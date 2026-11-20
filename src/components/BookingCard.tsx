import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Car, 
  Check, 
  Sparkles,
  ChevronDown,
  Crosshair,
  Zap,
  Plane,
  Train,
  Landmark,
  Building2,
  X
} from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingState, DurationOption, ScheduleType } from '../types';
import { 
  isWarangalLocation, 
  getCityDisplayName, 
  detectAccurateLocation, 
  searchLocationSuggestions, 
  LocationSuggestion 
} from '../utils/location';
import { usePricing } from '../context/PricingContext';
import { 
  ALL_OUTSTATION_PRICING, 
  TELANGANA_DISTRICT_PRICING,
  OUTSTATION_ROUND_TRIP_PRICING,
  getOutstationRoundTripFare
} from '../data/telanganaPricing';

interface BookingCardProps {
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  onBookNow: () => void;
  selectedCity?: string;
  onSwitchToWarangal?: () => void;
}

// Custom Outstation Highway Road Icon matching reference design
const HighwayIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 22L8 2M20 22L16 2M12 5V7M12 11V13M12 17V19" />
  </svg>
);

// Vertical Two-Arrow Swap Icon matching reference design
const SwapArrowsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.4" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M7 4v16M7 4l-4 4M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" />
  </svg>
);

// Parse time string like "10:30 AM"
const parseTimeString = (t: string) => {
  const match = (t || '').trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    let m = match[2];
    let ampm = match[3] ? match[3].toUpperCase() : 'AM';
    if (!match[3]) {
      ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
    }
    const hStr = String(h).padStart(2, '0');
    return { hour: hStr, minute: m, ampm };
  }
  return { hour: '10', minute: '30', ampm: 'AM' };
};

// Location Suggestion Dropdown Popover
const LocationSuggestionDropdown: React.FC<{
  suggestions: LocationSuggestion[];
  query: string;
  onSelect: (address: string) => void;
  title: string;
}> = ({ suggestions, query, onSelect, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white rounded-2xl border border-neutral-200/95 shadow-[0_18px_45px_rgba(0,0,0,0.14)] overflow-hidden"
    >
      <div className="px-3.5 py-2 bg-gradient-to-r from-amber-50/80 to-white border-b border-neutral-100 flex items-center justify-between text-[11px] font-bold text-neutral-600">
        <span className="flex items-center gap-1.5 text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{title}</span>
        </span>
        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
          {suggestions.length} {suggestions.length === 1 ? 'place' : 'places'}
        </span>
      </div>

      <div className="max-h-[290px] overflow-y-auto divide-y divide-neutral-100/70 overscroll-contain">
        {suggestions.length > 0 ? (
          suggestions.map((item) => {
            const Icon = 
              item.type === 'airport' ? Plane :
              item.type === 'station' ? Train :
              item.type === 'landmark' ? Landmark :
              item.type === 'hub' ? Building2 : MapPin;

            return (
              <button
                key={item.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(item.fullAddress);
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 active:bg-amber-100/80 transition-colors flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-4 h-4 text-neutral-700 group-hover:text-amber-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-[13px] font-bold text-neutral-900 group-hover:text-amber-950 truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 group-hover:text-amber-900/80 truncate">
                    {item.city}, {item.state}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-500 group-hover:text-amber-900 bg-neutral-100 group-hover:bg-amber-200/70 px-2 py-0.5 rounded-md shrink-0 transition-colors">
                  {item.city}
                </span>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs text-neutral-500 font-medium">No direct landmark match found.</p>
            {query.trim() && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(query.trim());
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <span>Set to "{query.trim()}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const BookingCard: React.FC<BookingCardProps> = ({
  bookingState,
  updateBookingState,
  onBookNow,
  selectedCity = 'Warangal, Telangana',
  onSwitchToWarangal,
}) => {
  const { getCityFare, getPriceForKm } = usePricing();
  const [isLocating, setIsLocating] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isPickupSuggestOpen, setIsPickupSuggestOpen] = useState(false);
  const [isDropSuggestOpen, setIsDropSuggestOpen] = useState(false);

  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropContainerRef = useRef<HTMLDivElement>(null);

  const isServiceable = isWarangalLocation(bookingState.pickupLocation || selectedCity);
  const cityName = getCityDisplayName(bookingState.pickupLocation || selectedCity);

  // Suggestions computation
  const pickupValue = bookingState.pickupLocation ?? selectedCity ?? '';
  const dropValue = bookingState.dropLocation || '';

  const pickupSuggestions = useMemo(() => {
    return searchLocationSuggestions(pickupValue, 8);
  }, [pickupValue]);

  const dropSuggestions = useMemo(() => {
    return searchLocationSuggestions(dropValue, 8);
  }, [dropValue]);

  // Active popular service: 'local' | 'outstation' | 'hourly'
  const activeService = bookingState.selectedService || 
    (bookingState.tripType === 'outside' ? 'outstation' : 'local');

  // Handle location swap
  const handleSwap = () => {
    const currentPickup = bookingState.pickupLocation || selectedCity || '';
    const currentDrop = bookingState.dropLocation || '';
    updateBookingState({
      pickupLocation: currentDrop,
      dropLocation: currentPickup,
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setIsTimeOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
      }
      if (pickupContainerRef.current && !pickupContainerRef.current.contains(e.target as Node)) {
        setIsPickupSuggestOpen(false);
      }
      if (dropContainerRef.current && !dropContainerRef.current.contains(e.target as Node)) {
        setIsDropSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect GPS pickup location
  const handleDetectPickup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocating(true);
    try {
      const result = await detectAccurateLocation({ forceGps: true });
      if (result.formattedAddress) {
        updateBookingState({ pickupLocation: result.formattedAddress });
      }
    } catch (err) {
      console.warn('GPS detection failed:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Outstation Round Trip configurations
  const activeVehicleCategory: 'standard' | 'luxury' = bookingState.outstationVehicleCategory || 'standard';
  const activePackageHours: 6 | 12 = bookingState.outstationPackageHours === 12 ? 12 : 6;

  // Handle service category selection
  const handleSelectService = (service: 'local' | 'outstation') => {
    if (service === 'local') {
      updateBookingState({
        selectedService: 'local',
        tripType: 'city',
      });
    } else if (service === 'outstation') {
      const vehicleCat = bookingState.outstationVehicleCategory || 'standard';
      const pkgHours = bookingState.outstationPackageHours === 12 ? 12 : 6;
      const price = getOutstationRoundTripFare(vehicleCat, pkgHours);
      updateBookingState({
        selectedService: 'outstation',
        tripType: 'outside',
        outstationTripType: 'round_trip',
        outstationVehicleCategory: vehicleCat,
        outstationPackageHours: pkgHours,
        outstationPrice: price,
        duration: pkgHours as any,
      });
    }
  };

  const handleOutstationVehicleChange = (category: 'standard' | 'luxury') => {
    const pkgHours = bookingState.outstationPackageHours === 12 ? 12 : 6;
    const price = getOutstationRoundTripFare(category, pkgHours);
    updateBookingState({
      selectedService: 'outstation',
      tripType: 'outside',
      outstationTripType: 'round_trip',
      outstationVehicleCategory: category,
      outstationPrice: price,
    });
  };

  const handleOutstationHoursChange = (hours: 6 | 12) => {
    const vehicleCat = bookingState.outstationVehicleCategory || 'standard';
    const price = getOutstationRoundTripFare(vehicleCat, hours);
    updateBookingState({
      selectedService: 'outstation',
      tripType: 'outside',
      outstationTripType: 'round_trip',
      outstationPackageHours: hours,
      outstationPrice: price,
      duration: hours as any,
    });
  };

  // Dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Format date display
  const isDateToday = (bookingState.date || todayStr) === todayStr;
  const isDateTomorrow = bookingState.date === tomorrowStr;
  const isCustomDate = !isDateToday && !isDateTomorrow;

  const displayDateText = useMemo(() => {
    const curr = bookingState.date || todayStr;
    if (curr === todayStr) return 'Today';
    if (curr === tomorrowStr) return 'Tomorrow';
    try {
      const [y, m, d] = curr.split('-').map(Number);
      const obj = new Date(y, m - 1, d);
      return obj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return curr;
    }
  }, [bookingState.date, todayStr, tomorrowStr]);

  const displayCustomDateShort = useMemo(() => {
    if (!bookingState.date || isDateToday || isDateTomorrow) return 'Calendar';
    try {
      const [y, m, d] = bookingState.date.split('-').map(Number);
      const obj = new Date(y, m - 1, d);
      return obj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'Calendar';
    }
  }, [bookingState.date, isDateToday, isDateTomorrow]);

  // Parsed time
  const parsedTime = useMemo(() => parseTimeString(bookingState.time), [bookingState.time]);

  const setTimeValue = (h: string, m: string, ampm: string) => {
    updateBookingState({
      scheduleType: 'later',
      time: `${h}:${m} ${ampm}`,
    });
  };

  const isNow = bookingState.scheduleType === 'now';

  return (
    <div 
      id="booking-card-section" 
      className="w-full max-w-[1020px] mx-auto bg-white rounded-3xl sm:rounded-[32px] border border-neutral-200/90 shadow-[0_12px_45px_rgba(0,0,0,0.06)] p-5 sm:p-7 md:p-8 transition-all relative z-20"
    >
      {/* Non-Serviceable Warning Banner (Outside Telangana & Andhra Pradesh) */}
      {!isServiceable && (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950 shadow-2xs animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-amber-900" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 font-black text-amber-950 flex-wrap">
              <span>DriverBee is Coming Soon to {cityName}!</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-amber-200 text-amber-900 font-extrabold rounded">
                AP &amp; Telangana Live
              </span>
            </div>
            <p className="text-[11.5px] text-amber-900/90 mt-0.5 leading-relaxed">
              Driver bookings are currently available across <strong>all districts of Telangana and Andhra Pradesh</strong>. Driver pickup must originate within Telangana or Andhra Pradesh.
            </p>
            {onSwitchToWarangal && (
              <button
                type="button"
                onClick={onSwitchToWarangal}
                className="mt-2 text-xs font-bold text-bee-800 underline hover:text-bee-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Switch pickup location to Telangana / Andhra Pradesh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          ROW 1: Pickup Location — [Swap] — Drop Location
          ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        
        {/* Pickup Location Field */}
        <div 
          ref={pickupContainerRef}
          className="relative border border-neutral-200 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 rounded-2xl p-3.5 sm:p-4 bg-white flex items-center gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-neutral-950 fill-neutral-950" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs sm:text-[13px] font-bold text-neutral-950 leading-tight">
              Pickup Location
            </label>
            <input
              type="text"
              value={bookingState.pickupLocation ?? selectedCity}
              onFocus={() => {
                setIsPickupSuggestOpen(true);
                setIsDropSuggestOpen(false);
                setIsTimeOpen(false);
                setIsDateOpen(false);
              }}
              onChange={(e) => {
                updateBookingState({ pickupLocation: e.target.value });
                setIsPickupSuggestOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsPickupSuggestOpen(false);
              }}
              placeholder="Enter pickup address"
              className="w-full text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 font-medium bg-transparent focus:outline-none truncate mt-0.5"
            />
          </div>

          {/* Quick Clear Button if location exists */}
          {(bookingState.pickupLocation || selectedCity) && (
            <button
              type="button"
              onClick={() => {
                updateBookingState({ pickupLocation: '' });
                setIsPickupSuggestOpen(true);
              }}
              title="Clear pickup location"
              className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleDetectPickup}
            disabled={isLocating}
            title="Auto-detect current GPS location"
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors shrink-0 cursor-pointer"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-bee-600' : ''}`} />
          </button>

          {/* Autocomplete Suggestions Popover */}
          <AnimatePresence>
            {isPickupSuggestOpen && (
              <LocationSuggestionDropdown
                title="Select Pickup Location"
                query={pickupValue}
                suggestions={pickupSuggestions}
                onSelect={(address) => {
                  updateBookingState({ pickupLocation: address });
                  setIsPickupSuggestOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1 md:my-0">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap pickup and drop destinations"
            className="w-10 h-10 rounded-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 active:scale-90 flex items-center justify-center text-neutral-800 shadow-xs transition-all cursor-pointer"
          >
            <SwapArrowsIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Drop Location Field */}
        <div 
          ref={dropContainerRef}
          className="relative border border-neutral-200 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 rounded-2xl p-3.5 sm:p-4 bg-white flex items-center gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-neutral-950 fill-neutral-950" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs sm:text-[13px] font-bold text-neutral-950 leading-tight">
              Drop Location
            </label>
            <input
              type="text"
              value={bookingState.dropLocation || ''}
              onFocus={() => {
                setIsDropSuggestOpen(true);
                setIsPickupSuggestOpen(false);
                setIsTimeOpen(false);
                setIsDateOpen(false);
              }}
              onChange={(e) => {
                updateBookingState({ dropLocation: e.target.value });
                setIsDropSuggestOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsDropSuggestOpen(false);
              }}
              placeholder="Enter destination"
              className="w-full text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 font-medium bg-transparent focus:outline-none truncate mt-0.5"
            />
          </div>

          {/* Quick Clear Button if destination exists */}
          {Boolean(bookingState.dropLocation) && (
            <button
              type="button"
              onClick={() => {
                updateBookingState({ dropLocation: '' });
                setIsDropSuggestOpen(true);
              }}
              title="Clear destination"
              className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Suggestions Popover */}
          <AnimatePresence>
            {isDropSuggestOpen && (
              <LocationSuggestionDropdown
                title="Select Drop Location"
                query={dropValue}
                suggestions={dropSuggestions}
                onSelect={(address) => {
                  updateBookingState({ dropLocation: address });
                  setIsDropSuggestOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ============================================================
          ROW 2: Date — Time — Book Your Driver CTA
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
        
        {/* DATE FIELD WITH TODAY, TOMORROW & CALENDAR */}
        <div ref={dateDropdownRef} className="relative">
          <div 
            className={`border rounded-2xl p-2.5 sm:p-3 bg-white flex flex-col justify-between gap-1.5 transition-all ${
              isDateOpen 
                ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs' 
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {/* Header: Label + Selected Date Badge */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-950" />
                <label className="block text-xs font-bold text-neutral-950 leading-tight">
                  Date
                </label>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 truncate max-w-[130px]">
                {displayDateText}
              </span>
            </div>

            {/* Segmented Options: Today | Tomorrow | Calendar */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl gap-1">
              {/* Today Button */}
              <button
                type="button"
                onClick={() => {
                  updateBookingState({ date: todayStr });
                  setIsDateOpen(false);
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  isDateToday
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Today
              </button>

              {/* Tomorrow Button */}
              <button
                type="button"
                onClick={() => {
                  updateBookingState({ date: tomorrowStr });
                  setIsDateOpen(false);
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  isDateTomorrow
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Tomorrow
              </button>

              {/* Calendar Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setIsDateOpen(!isDateOpen);
                  setIsTimeOpen(false);
                }}
                className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isCustomDate || isDateOpen
                    ? 'bg-white text-neutral-950 shadow-xs ring-1 ring-amber-400'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span className="truncate">{isCustomDate ? displayCustomDateShort : 'Calendar'}</span>
                <Calendar className={`w-3 h-3 flex-shrink-0 ${isDateOpen || isCustomDate ? 'text-amber-500' : 'text-neutral-400'}`} />
              </button>
            </div>
          </div>

          {/* Custom Animated Calendar Popover */}
          <AnimatePresence>
            {isDateOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <CalendarPicker
                  value={bookingState.date || todayStr}
                  minDate={todayStr}
                  rangeDays={bookingState.selectedService === 'outstation' ? (bookingState.outstationDays || 1) : 1}
                  onChange={(newDate) => {
                    updateBookingState({ date: newDate });
                  }}
                  onClose={() => setIsDateOpen(false)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* TIME FIELD WITH CUSTOM ANIMATED POPOVER */}
        <div ref={timeDropdownRef} className="relative">
          <div 
            onClick={() => {
              setIsTimeOpen(!isTimeOpen);
              setIsDateOpen(false);
            }}
            className={`border rounded-2xl p-3.5 sm:p-4 bg-white flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
              isTimeOpen 
                ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs' 
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-neutral-950" />
              </div>
              <div className="min-w-0">
                <label className="block text-xs sm:text-[13px] font-bold text-neutral-950 leading-tight">
                  Time
                </label>
                <div className="text-xs sm:text-sm font-bold truncate mt-0.5 flex items-center gap-1.5">
                  {isNow ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Now (within 30m)</span>
                    </span>
                  ) : (
                    <span className="text-neutral-900">{bookingState.time || '10:30 AM'}</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${isTimeOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Custom Animated Time Popover (Replaces default browser picker) */}
          {isTimeOpen && (
            <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[330px] mt-2 z-50 bg-white rounded-3xl border border-neutral-200 shadow-2xl p-4 animate-fade-in space-y-3.5">
              
              {/* Segmented Switch: Now vs Schedule */}
              <div className="flex bg-neutral-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    updateBookingState({
                      scheduleType: 'now',
                      time: 'Now',
                    });
                    setIsTimeOpen(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isNow
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Right Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateBookingState({
                      scheduleType: 'later',
                      time: bookingState.time || '10:30 AM',
                    });
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isNow
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Schedule</span>
                </button>
              </div>

              {/* If Right Now selected */}
              {isNow && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1 text-xs font-black text-emerald-900 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Immediate Chauffeur Dispatch</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Your verified driver arrives at your doorstep within 30 minutes.
                  </p>
                </div>
              )}

              {/* If Schedule Later is active: Interactive Animated Selector */}
              {!isNow && (
                <div className="space-y-3 animate-fade-in">
                  
                  {/* Quick Preset Pills */}
                  <div>
                    <span className="block text-[11px] font-bold text-neutral-500 mb-1.5">
                      Popular Departure Times:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {['08:00 AM', '10:30 AM', '02:00 PM', '06:00 PM', '09:00 PM'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            updateBookingState({
                              scheduleType: 'later',
                              time: preset,
                            });
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            bookingState.time === preset
                              ? 'bg-amber-400 text-neutral-950 shadow-2xs font-black'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Wheel: Hour / Minute / AM-PM */}
                  <div className="p-3 bg-[#FAFBFD] rounded-2xl border border-neutral-200/80">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 mb-2 px-1">
                      <span>Hour</span>
                      <span>Minute</span>
                      <span>Period</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Hours: 01 - 12 */}
                      <select
                        value={parsedTime.hour}
                        onChange={(e) => setTimeValue(e.target.value, parsedTime.minute, parsedTime.ampm)}
                        className="flex-1 py-2 px-2 rounded-xl text-center font-black text-sm text-neutral-950 bg-white border border-neutral-200 shadow-2xs focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>

                      <span className="font-black text-neutral-400 text-sm">:</span>

                      {/* Minutes: 00, 15, 30, 45 */}
                      <select
                        value={parsedTime.minute}
                        onChange={(e) => setTimeValue(parsedTime.hour, e.target.value, parsedTime.ampm)}
                        className="flex-1 py-2 px-2 rounded-xl text-center font-black text-sm text-neutral-950 bg-white border border-neutral-200 shadow-2xs focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
                      >
                        {['00', '15', '30', '45'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      {/* AM / PM Toggle */}
                      <div className="flex bg-white p-0.5 rounded-xl border border-neutral-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setTimeValue(parsedTime.hour, parsedTime.minute, 'AM')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            parsedTime.ampm === 'AM'
                              ? 'bg-amber-400 text-neutral-950 shadow-2xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeValue(parsedTime.hour, parsedTime.minute, 'PM')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            parsedTime.ampm === 'PM'
                              ? 'bg-amber-400 text-neutral-950 shadow-2xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Done / Confirm Time Button */}
                  <button
                    type="button"
                    onClick={() => setIsTimeOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Set Time to {bookingState.time || `${parsedTime.hour}:${parsedTime.minute} ${parsedTime.ampm}`}</span>
                  </button>

                </div>
              )}

            </div>
          )}
        </div>

        {/* Book Your Driver CTA Button with Moving Border */}
        <div className="sm:col-span-2 md:col-span-1 h-full flex">
          <MovingBorderButton
            as="button"
            type="button"
            id="book-driver-cta-btn"
            onClick={onBookNow}
            borderRadius="1rem"
            duration={2800}
            containerClassName="w-full h-full min-h-[52px] sm:min-h-[58px] p-[2px] bg-neutral-950/10 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            borderClassName="h-24 w-24 opacity-100 bg-[radial-gradient(#111827_30%,#b45309_65%,transparent_80%)]"
            className="bg-[#FBBF24] hover:bg-[#F59E0B] active:scale-[0.99] text-neutral-950 font-black text-sm sm:text-base border-none transition-all flex items-center justify-center gap-2"
          >
            <span>Book Your Driver</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
          </MovingBorderButton>
        </div>

      </div>

      {/* ============================================================
          POPULAR SERVICES DIVIDER
          ============================================================ */}
      <div className="relative my-6 sm:my-7 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
            Popular Services
          </span>
        </div>
      </div>

      {/* ============================================================
          ROW 3: Popular Services Pills (Local Ride & Outstation at ₹10/km)
          ============================================================ */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        
        {/* 1. Local Ride */}
        <button
          type="button"
          onClick={() => handleSelectService('local')}
          className={`py-3 px-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeService === 'local'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300/40 text-neutral-950 font-black shadow-2xs'
              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 font-semibold'
          }`}
        >
          <Car className="w-4 h-4 text-neutral-950 shrink-0" />
          <span className="text-xs sm:text-sm whitespace-nowrap">Local Ride (₹10/km)</span>
        </button>

        {/* 2. Outstation */}
        <button
          type="button"
          onClick={() => handleSelectService('outstation')}
          className={`py-3 px-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeService === 'outstation'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300/40 text-neutral-950 font-black shadow-2xs'
              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800 font-semibold'
          }`}
        >
          <HighwayIcon className="w-4 h-4 text-neutral-950 shrink-0" />
          <span className="text-xs sm:text-sm whitespace-nowrap">Outstation Round Trip</span>
        </button>

      </div>

      {/* ============================================================
          OUTSTATION ROUND TRIP PRICING TIERS
          ============================================================ */}
      {activeService === 'outstation' && (
        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 rounded-2xl sm:rounded-3xl border border-amber-300/80 shadow-xs animate-fade-in space-y-4">
          
          {/* Header & Extra Hour Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black shadow-2xs">
                <HighwayIcon className="w-3.5 h-3.5 text-neutral-950" />
                <span>Outstation Round Trip</span>
              </span>
              <span className="text-xs text-amber-950 font-bold hidden sm:inline">
                Verified highway chauffeurs for return journeys
              </span>
            </div>
            <div className="text-[11px] font-bold text-amber-950 bg-amber-100 border border-amber-300/70 px-2.5 py-1 rounded-lg">
              Extra hour: <span className="font-black text-neutral-950">₹{activeVehicleCategory === 'luxury' ? '150' : '120'}/hr</span>
            </div>
          </div>

          {/* Vehicle Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
                1. Vehicle Type
              </label>
              <span className="text-[11px] font-semibold text-neutral-500">
                {activeVehicleCategory === 'luxury' ? 'Innova, Fortuner, Luxury' : 'Hatchback, Sedan, SUV'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Standard */}
              <button
                type="button"
                onClick={() => handleOutstationVehicleChange('standard')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeVehicleCategory === 'standard'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-400/50 shadow-xs'
                    : 'bg-white/80 hover:bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-neutral-950">Standard Vehicle</span>
                  {activeVehicleCategory === 'standard' ? (
                    <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-neutral-300" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                  Hatchback, Sedan &amp; Compact SUV
                </p>
                <div className="mt-2 text-xs font-black text-amber-950">
                  ₹899 <span className="text-[10px] font-semibold text-neutral-500">(Up to 6h)</span> • ₹1,499 <span className="text-[10px] font-semibold text-neutral-500">(Up to 12h)</span>
                </div>
              </button>

              {/* Premium / Luxury */}
              <button
                type="button"
                onClick={() => handleOutstationVehicleChange('luxury')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeVehicleCategory === 'luxury'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-400/50 shadow-xs'
                    : 'bg-white/80 hover:bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-neutral-950">Premium / Luxury</span>
                  {activeVehicleCategory === 'luxury' ? (
                    <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-neutral-300" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                  Innova Crysta, Fortuner, BMW, Mercedes
                </p>
                <div className="mt-2 text-xs font-black text-amber-950">
                  ₹1,149 <span className="text-[10px] font-semibold text-neutral-500">(Up to 6h)</span> • ₹1,899 <span className="text-[10px] font-semibold text-neutral-500">(Up to 12h)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Package Hours Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
                2. Round Trip Package Duration
              </label>
              <span className="text-[11px] font-bold text-amber-900">
                Selected: {activePackageHours} Hours (₹{bookingState.outstationPrice || (activeVehicleCategory === 'luxury' ? (activePackageHours === 12 ? 1899 : 1149) : (activePackageHours === 12 ? 1499 : 899))})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Up to 6 Hours */}
              <button
                type="button"
                onClick={() => handleOutstationHoursChange(6)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activePackageHours === 6
                    ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/40 shadow-2xs'
                    : 'bg-white hover:bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-neutral-950">Up to 6 Hours</span>
                  <span className="text-sm sm:text-base font-black text-amber-950">
                    ₹{activeVehicleCategory === 'luxury' ? '1,149' : '899'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Half-day round trip • +₹{activeVehicleCategory === 'luxury' ? '150' : '120'}/extra hr
                </p>
              </button>

              {/* Up to 12 Hours */}
              <button
                type="button"
                onClick={() => handleOutstationHoursChange(12)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activePackageHours === 12
                    ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-400/40 shadow-2xs'
                    : 'bg-white hover:bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-neutral-950">Up to 12 Hours</span>
                  <span className="text-sm sm:text-base font-black text-amber-950">
                    ₹{activeVehicleCategory === 'luxury' ? '1,899' : '1,499'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Full-day round trip • +₹{activeVehicleCategory === 'luxury' ? '150' : '120'}/extra hr
                </p>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================
          INTERACTIVE SERVICE DETAILS & TRANSMISSION PREFERENCE
          ============================================================ */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Active Rate Badge for Local Ride */}
        {activeService === 'local' && (
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 flex-wrap animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300/80 font-black">
              ⚡ ₹10 per km
            </span>
            <span className="text-neutral-500 font-semibold">Flat distance pricing • Zero hourly charges</span>
          </div>
        )}

        {/* Active Rate Badge for Outstation Round Trip */}
        {activeService === 'outstation' && (
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 flex-wrap animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-black shadow-2xs">
              ⚡ ₹{bookingState.outstationPrice || (activeVehicleCategory === 'luxury' ? (activePackageHours === 12 ? 1899 : 1149) : (activePackageHours === 12 ? 1499 : 899))} Total
            </span>
            <span className="text-neutral-600 font-semibold">
              {activeVehicleCategory === 'luxury' ? 'Premium/Luxury' : 'Standard'} • Up to {activePackageHours} Hours Round Trip
            </span>
          </div>
        )}

        {/* Transmission Preference (Automatic vs Manual) */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-bold text-neutral-600 text-[11.5px]">Transmission:</span>
          <div className="inline-flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80">
            <button
              type="button"
              onClick={() => updateBookingState({ transmission: 'automatic' })}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                bookingState.transmission === 'automatic'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Automatic
            </button>
            <button
              type="button"
              onClick={() => updateBookingState({ transmission: 'manual' })}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                bookingState.transmission === 'manual'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Manual
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
