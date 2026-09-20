import React from 'react';
import { TripSelector } from './TripSelector';
import { DurationSelector } from './DurationSelector';
import { OutstationDestinationSelector } from './OutstationDestinationSelector';
import { ScheduleSelector } from './ScheduleSelector';
import { TripType, DurationOption, ScheduleType, BookingState } from '../types';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { isWarangalLocation, getCityDisplayName } from '../utils/location';
import { usePricing } from '../context/PricingContext';
import { ALL_OUTSTATION_PRICING, TELANGANA_DISTRICT_PRICING } from '../data/telanganaPricing';

interface BookingCardProps {
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  onBookNow: () => void;
  selectedCity?: string;
  onSwitchToWarangal?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  bookingState,
  updateBookingState,
  onBookNow,
  selectedCity = 'Warangal, Telangana',
  onSwitchToWarangal,
}) => {
  const { getPriceForKm } = usePricing();
  const isWarangal = isWarangalLocation(selectedCity);
  const cityName = getCityDisplayName(selectedCity);

  return (
    <div 
      id="booking-card-section" 
      className="w-full max-w-[1020px] mx-auto bg-transparent lg:bg-white lg:rounded-[26px] lg:border lg:border-navy-200/90 lg:shadow-card p-0 lg:p-8 transition-all relative z-20"
    >
      {/* Non-Warangal Warning Banner */}
      {!isWarangal && (
        <div className="mb-4 mx-3 lg:mx-0 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950 shadow-2xs animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-amber-900" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 font-black text-amber-950 flex-wrap">
              <span>DriverBee is Coming Soon to {cityName}!</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-amber-200 text-amber-900 font-extrabold rounded">
                Warangal Only
              </span>
            </div>
            <p className="text-[11.5px] text-amber-900/90 mt-0.5 leading-relaxed">
              Driver bookings are currently available exclusively with pickup originating from <strong>Warangal</strong> (Tri-City). Trips can travel anywhere across Telangana & AP, but driver pickup must start in Warangal.
            </p>
            {onSwitchToWarangal && (
              <button
                type="button"
                onClick={onSwitchToWarangal}
                className="mt-2 text-xs font-bold text-bee-800 underline hover:text-bee-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Switch pickup location to Warangal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top bar with car transmission preference (visible on both mobile and desktop) */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-2 lg:mb-4 border-b border-navy-100 px-4 lg:px-0 pt-2 lg:pt-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
          <span className="w-2 h-2 rounded-full bg-bee-600 shrink-0" />
          <span className="hidden sm:inline">Professional Driver Service For Your Personal Vehicle</span>
          <span className="sm:hidden text-xs font-bold text-navy-800">Transmission</span>
        </div>

        <div className="flex items-center gap-1.5 bg-navy-50 p-1 rounded-xl border border-navy-200/60 shrink-0">
          <button
            type="button"
            onClick={() => updateBookingState({ transmission: 'automatic' })}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border-2 ${
              bookingState.transmission === 'automatic'
                ? 'bg-white text-navy-950 border-bee-500 ring-1 ring-bee-400/40 shadow-xs font-bold'
                : 'border-transparent text-navy-600 hover:text-navy-900'
            }`}
          >
            Automatic
          </button>
          <button
            type="button"
            onClick={() => updateBookingState({ transmission: 'manual' })}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border-2 ${
              bookingState.transmission === 'manual'
                ? 'bg-white text-navy-950 border-bee-500 ring-1 ring-bee-400/40 shadow-xs font-bold'
                : 'border-transparent text-navy-600 hover:text-navy-900'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6 px-4 sm:px-0 pt-4 sm:pt-0">
        {/* SECTION 1: Trip Category Selector */}
        <TripSelector
          selectedTrip={bookingState.tripType}
          onSelectTrip={(tripType: TripType) => {
            if (tripType === 'outside') {
              const destId = bookingState.outstationDestinationId || 'hyderabad';
              const dest = ALL_OUTSTATION_PRICING.find((d) => d.id === destId) || TELANGANA_DISTRICT_PRICING[0];
              const days = bookingState.outstationDays || 1;
              const price = getPriceForKm(dest.distanceKm) * days;
              updateBookingState({
                tripType,
                outstationState: bookingState.outstationState || 'telangana',
                outstationDestinationId: dest.id,
                outstationDestinationName: dest.destination,
                outstationDistrict: dest.district,
                outstationDays: days,
                outstationPrice: price,
              });
            } else {
              updateBookingState({ tripType });
            }
          }}
        />

        {/* SECTION 2: Duration (for City) OR Outstation Destination Selector (for Outside) */}
        {bookingState.tripType === 'outside' ? (
          <OutstationDestinationSelector
            selectedState={bookingState.outstationState || 'telangana'}
            onStateChange={(state) => updateBookingState({ outstationState: state })}
            selectedDestinationId={bookingState.outstationDestinationId || 'hyderabad'}
            selectedDays={bookingState.outstationDays || 1}
            onSelectDestination={(dest, opt) => {
              updateBookingState({
                outstationMode: 'district',
                outstationState: dest.state || (dest.id.startsWith('ap-') ? 'andhra' : 'telangana'),
                outstationDestinationId: dest.id,
                outstationDestinationName: dest.destination,
                outstationDistrict: dest.district,
                outstationDays: opt.days,
                outstationPrice: opt.price,
                duration: 8 as DurationOption,
              });
            }}
          />
        ) : (
          <DurationSelector
            selectedDuration={bookingState.duration}
            onSelectDuration={(duration: DurationOption) => updateBookingState({ duration })}
            tripType={bookingState.tripType}
          />
        )}

        {/* SECTION 3: Schedule Timing Selector */}
        <ScheduleSelector
          scheduleType={bookingState.scheduleType}
          onSelectSchedule={(scheduleType: ScheduleType) => updateBookingState({ scheduleType })}
          date={bookingState.date}
          setDate={(date: string) => updateBookingState({ date })}
          time={bookingState.time}
          setTime={(time: string) => updateBookingState({ time })}
        />

        {/* SECTION 4: Primary CTA Button */}
        <div className="pt-2 sm:pt-4">
          <button
            id="book-driver-cta-btn"
            onClick={onBookNow}
            className={`w-full h-[52px] sm:h-[56px] rounded-full font-bold text-base sm:text-lg shadow-cta transition-all flex items-center justify-center gap-2 group cursor-pointer ${
              isWarangal
                ? 'bg-bee-600 hover:bg-bee-700 active:scale-[0.99] text-white'
                : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-navy-950 shadow-md'
            }`}
          >
            {isWarangal ? (
              <>
                <span>Book Driver Now</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1 stroke-[2.5]" />
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-navy-950" />
                <span>Coming Soon to {cityName} — View Details</span>
              </>
            )}
          </button>
          {!isWarangal && (
            <p className="text-center text-[11.5px] text-amber-900 font-semibold mt-2">
              ⚠️ Driver bookings currently only originate from Warangal. Click above to view launch details or switch to Warangal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
