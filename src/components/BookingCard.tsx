import React from 'react';
import { TripSelector } from './TripSelector';
import { DurationSelector } from './DurationSelector';
import { OutstationDestinationSelector } from './OutstationDestinationSelector';
import { ScheduleSelector } from './ScheduleSelector';
import { TripType, DurationOption, ScheduleType, BookingState } from '../types';
import { ArrowRight } from 'lucide-react';

interface BookingCardProps {
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  onBookNow: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  bookingState,
  updateBookingState,
  onBookNow
}) => {
  return (
    <div 
      id="booking-card-section" 
      className="w-full max-w-[1020px] mx-auto bg-transparent lg:bg-white lg:rounded-[26px] lg:border lg:border-navy-200/90 lg:shadow-card p-0 lg:p-8 transition-all relative z-20"
    >
      {/* Desktop-only top bar with car transmission preference */}
      <div className="hidden lg:flex items-center justify-between gap-2 pb-3 mb-4 border-b border-navy-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
          <span className="w-2 h-2 rounded-full bg-bee-600" />
          <span>Professional Driver Service For Your Personal Vehicle</span>
        </div>

        <div className="flex items-center gap-1.5 bg-navy-50 p-1 rounded-xl border border-navy-200/60">
          <button
            type="button"
            onClick={() => updateBookingState({ transmission: 'automatic' })}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              bookingState.transmission === 'automatic'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Automatic
          </button>
          <button
            type="button"
            onClick={() => updateBookingState({ transmission: 'manual' })}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              bookingState.transmission === 'manual'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-navy-600 hover:text-navy-900'
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
              updateBookingState({
                tripType,
                outstationDestinationId: bookingState.outstationDestinationId || 'hyderabad',
                outstationDestinationName: bookingState.outstationDestinationName || 'Hyderabad',
                outstationDistrict: bookingState.outstationDistrict || 'Hyderabad',
                outstationDays: bookingState.outstationDays || 1,
                outstationPrice: bookingState.outstationPrice || 2000,
              });
            } else {
              updateBookingState({ tripType });
            }
          }}
        />

        {/* SECTION 2: Duration (for City) OR Outstation Destination Selector (for Outside) */}
        {bookingState.tripType === 'outside' ? (
          <OutstationDestinationSelector
            selectedDestinationId={bookingState.outstationDestinationId || 'hyderabad'}
            selectedDays={bookingState.outstationDays || 1}
            onSelectDestination={(dest, opt) => {
              updateBookingState({
                outstationDestinationId: dest.id,
                outstationDestinationName: dest.destination,
                outstationDistrict: dest.district,
                outstationDays: opt.days,
                outstationPrice: opt.price,
                duration: (opt.days === 1 ? 8 : 8) as DurationOption,
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
            className="w-full h-[52px] sm:h-[56px] rounded-full bg-bee-600 hover:bg-bee-700 active:scale-[0.99] text-white font-bold text-base sm:text-lg shadow-cta transition-all flex items-center justify-center gap-2 group"
          >
            <span>Book Driver Now</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
