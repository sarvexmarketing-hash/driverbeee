import React from 'react';
import { TripType } from '../types';
import { CityIcon, OutsideCityIcon, AirportIcon, IntercityIcon } from './CustomTripIcons';

interface TripSelectorProps {
  selectedTrip: TripType;
  onSelectTrip: (trip: TripType) => void;
  activeCount?: string;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  selectedTrip,
  onSelectTrip,
  activeCount = '1,250+'
}) => {
  const tripOptions = [
    {
      id: 'city' as TripType,
      title: 'Within the City',
      subtitle: 'Local rides, errands, meetings',
      Icon: CityIcon,
    },
    {
      id: 'outside' as TripType,
      title: 'Outside City',
      subtitle: 'Outstation trips & long distance',
      Icon: OutsideCityIcon,
    }
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header with Title and 1,250+ count on the right */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
            Select Your Trip
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 font-normal mt-0.5">
            Choose your destination type.
          </p>
        </div>

        <div className="text-right">
          <span className="text-base sm:text-lg font-bold text-navy-950 tracking-tight">
            {activeCount}
          </span>
        </div>
      </div>

      {/* 2-column Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {tripOptions.map((trip) => {
          const isSelected = selectedTrip === trip.id;
          const { Icon } = trip;

          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => onSelectTrip(trip.id)}
              className={`relative cursor-pointer rounded-2xl p-3 sm:p-4 transition-all duration-150 select-none min-h-[64px] sm:min-h-[72px] flex items-center gap-3 text-left w-full ${
                isSelected
                  ? 'bg-white border-2 border-bee-600 shadow-sm'
                  : 'bg-[#F6F4EE] hover:bg-[#EFECE3] border border-transparent'
              }`}
            >
              {/* Left: Custom SVG / PNG Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
                <Icon className="w-9 h-9 sm:w-10 sm:h-10" />
              </div>

              {/* Right: Label */}
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-navy-950 leading-tight">
                  {trip.title}
                </div>
              </div>

              {/* Gold/amber circle indicator when selected (matches 2 Hours / DurationSelector) */}
              {isSelected && (
                <span className="w-3.5 h-3.5 rounded-full bg-bee-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
