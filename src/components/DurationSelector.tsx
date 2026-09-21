import React from 'react';
import { DurationOption, TripType } from '../types';
import { Clock } from 'lucide-react';
import { usePricing } from '../context/PricingContext';

interface DurationSelectorProps {
  selectedDuration: DurationOption;
  onSelectDuration: (duration: DurationOption) => void;
  tripType?: TripType;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onSelectDuration,
  tripType = 'city',
}) => {
  const isOutside = tripType === 'outside';
  const isOneWay = tripType === 'oneway';
  const { getCityFare, getOutsideFare, getOneWayFare, cityHourlyRate, outsideHourlyRate, oneWayHourlyRate } = usePricing();

  const getFare = (hours: DurationOption) => {
    if (isOutside) return getOutsideFare(hours);
    if (isOneWay) return getOneWayFare(hours);
    return getCityFare(hours);
  };

  const durations: { hours: DurationOption; price: number; perLabel: string }[] = [
    { hours: 2, price: getFare(2), perLabel: '(per 2 hours)' },
    { hours: 4, price: getFare(4), perLabel: '(per 4 hours)' },
    { hours: 6, price: getFare(6), perLabel: '(per 6 hours)' },
    { hours: 8, price: getFare(8), perLabel: '(per 8 hours)' },
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
            Select Duration
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 font-normal mt-0.5">
            {isOutside
              ? `Outside City tariff (₹${outsideHourlyRate}/hr) • Highway experienced drivers`
              : isOneWay
              ? `One Way drop tariff (₹${oneWayHourlyRate}/hr) • Single drop point-to-point`
              : `Choose how long you need the driver for (₹${cityHourlyRate}/hr)`}
          </p>
        </div>
        {isOutside && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-bee-500/10 text-bee-700 border border-bee-500/30">
            Outstation Rate (₹{outsideHourlyRate}/hr)
          </span>
        )}
        {tripType === 'oneway' && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/30">
            One Way Drop
          </span>
        )}
      </div>

      {/* Grid: 2-column on mobile, 4-column on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {durations.map((item) => {
          const isSelected = selectedDuration === item.hours;

          return (
            <button
              key={item.hours}
              type="button"
              onClick={() => onSelectDuration(item.hours)}
              className={`relative cursor-pointer rounded-2xl p-3 sm:p-4 transition-all duration-150 select-none text-left w-full flex flex-col justify-between min-h-[96px] sm:min-h-[108px] ${
                isSelected
                  ? 'bg-white border-2 border-bee-600 shadow-sm'
                  : 'bg-[#F6F4EE] hover:bg-[#EFECE3] border border-transparent'
              }`}
            >
              {/* Top Row: Icon + Hours + Orange Dot */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full border-2 border-bee-600 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-bee-600" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-navy-800 flex items-center justify-center flex-shrink-0 text-navy-800">
                      <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
                    </div>
                  )}
                  <span className="text-sm sm:text-base lg:text-[17px] font-black text-navy-950 tracking-tight">
                    {item.hours} Hours
                  </span>
                </div>

                {/* Solid Orange Circle Indicator when selected */}
                {isSelected && (
                  <span className="w-3.5 h-3.5 rounded-full bg-bee-600 flex-shrink-0" />
                )}
              </div>

              {/* Bottom Row: Price & Per Label (smaller amount) */}
              <div className="mt-2.5 sm:mt-3 pt-1 border-t border-navy-100/60 flex items-baseline justify-between">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-navy-800 tracking-tight">
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-navy-400 font-medium">
                  {item.perLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
