import React from 'react';
import { DurationOption, TripType } from '../types';
import { Clock, Calendar, Plus, Minus, Check } from 'lucide-react';
import { usePricing } from '../context/PricingContext';

interface DurationSelectorProps {
  selectedDuration: DurationOption;
  onSelectDuration: (duration: DurationOption) => void;
  tripType?: TripType;
  oneWayDays?: number;
  oneWayMode?: 'hours' | 'days';
  onSelectOneWayDays?: (days: number) => void;
  onSelectOneWayMode?: (mode: 'hours' | 'days') => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onSelectDuration,
  tripType = 'city',
  oneWayDays = 1,
  oneWayMode = 'hours',
  onSelectOneWayDays,
  onSelectOneWayMode,
}) => {
  const isOutside = tripType === 'outside';
  const isOneWay = tripType === 'oneway';
  const { getCityFare, getOutsideFare, getOneWayFare, cityHourlyRate, outsideHourlyRate, oneWayHourlyRate } = usePricing();

  const currentOneWayDays = Math.max(1, oneWayDays || 1);
  const currentOneWayMode = oneWayMode || 'hours';
  const oneWayDailyPrice = getOneWayFare(8); // Daily base price for 1 day full drive

  const getFare = (hours: DurationOption) => {
    if (isOutside) return getOutsideFare(hours);
    if (isOneWay) return getOneWayFare(hours);
    return getCityFare(hours);
  };

  const durations: { hours: DurationOption; price: number; perLabel: string }[] = [
    { hours: 2, price: getFare(2), perLabel: '(per 2 hours)' },
    { hours: 4, price: getFare(4), perLabel: '(per 4 hours)' },
    { hours: 6, price: getFare(6), perLabel: '(per 6 hours)' },
    { hours: 8, price: getFare(8), perLabel: isOneWay ? '(Full Day / 8h)' : '(per 8 hours)' },
  ];

  const handleSelectHours = (hours: DurationOption) => {
    onSelectOneWayMode?.('hours');
    onSelectDuration(hours);
  };

  const handleDaysChange = (newDays: number) => {
    const validDays = Math.max(1, newDays);
    onSelectOneWayMode?.('days');
    onSelectOneWayDays?.(validDays);
  };

  const handleAddDays = (count: number) => {
    const base = currentOneWayMode === 'days' ? currentOneWayDays : 1;
    handleDaysChange(base + count);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
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
              ? currentOneWayMode === 'days'
                ? `One Way multi-day drive (₹${oneWayDailyPrice.toLocaleString('en-IN')}/day) • Dedicated chauffeur`
                : `One Way drop tariff (₹${oneWayHourlyRate}/hr) • Single drop point-to-point`
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
            {currentOneWayMode === 'days' ? `${currentOneWayDays} Day${currentOneWayDays > 1 ? 's' : ''} One Way` : 'One Way Drop'}
          </span>
        )}
      </div>

      {/* Grid: 2-column on mobile, 4-column on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {durations.map((item) => {
          const isSelected = isOneWay
            ? (currentOneWayMode === 'hours' && selectedDuration === item.hours)
            : (selectedDuration === item.hours);

          return (
            <button
              key={item.hours}
              type="button"
              onClick={() => handleSelectHours(item.hours)}
              className={`relative cursor-pointer rounded-2xl p-3 sm:p-4 transition-all duration-150 select-none text-left w-full flex flex-col justify-between min-h-[96px] sm:min-h-[108px] ${
                isSelected
                  ? 'bg-white border-2 border-bee-600 shadow-sm ring-1 ring-bee-400/30'
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

              {/* Bottom Row: Price & Per Label */}
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

      {/* SPECIAL ONE WAY: Multi-Day Selection & +1 Day / +2 Day Stepper */}
      {isOneWay && (
        <div className={`mt-3 rounded-2xl p-3.5 sm:p-4 border transition-all ${
          currentOneWayMode === 'days'
            ? 'bg-amber-50/40 border-2 border-bee-600 shadow-sm ring-2 ring-bee-400/20'
            : 'bg-[#F9F8F5] border-navy-200/80 hover:border-navy-300'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                currentOneWayMode === 'days' ? 'bg-bee-600 text-white shadow-xs' : 'bg-navy-100 text-navy-700'
              }`}>
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-navy-950">
                    Need driver for full days? Book by Days
                  </span>
                  {currentOneWayMode === 'days' && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-bee-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-navy-500 font-normal">
                  Standard 8-hr daily rate (₹{oneWayDailyPrice.toLocaleString('en-IN')}/day) • Add +1 Day, +2 Days as needed
                </p>
              </div>
            </div>

            {/* Price Preview when days active */}
            {currentOneWayMode === 'days' && (
              <div className="sm:text-right">
                <span className="text-base sm:text-lg font-black text-bee-700">
                  ₹{(oneWayDailyPrice * currentOneWayDays).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-navy-400 block font-medium">
                  ({currentOneWayDays} × ₹{oneWayDailyPrice.toLocaleString('en-IN')})
                </span>
              </div>
            )}
          </div>

          {/* Controls: Quick Presets (1 Day, 2 Days, 3 Days) + Interactive Stepper & Quick Add (+1 Day, +2 Days) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-2.5">
            {/* Quick Day Presets */}
            <div className="grid grid-cols-3 gap-1.5 flex-1">
              {[1, 2, 3].map((d) => {
                const isSelected = currentOneWayMode === 'days' && currentOneWayDays === d;
                const dPrice = oneWayDailyPrice * d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDaysChange(d)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-bee-600 border-bee-600 text-white shadow-xs'
                        : 'bg-white border-navy-200 text-navy-800 hover:bg-navy-50 hover:border-navy-300'
                    }`}
                  >
                    <span className="leading-tight">{d} Day{d > 1 ? 's' : ''}</span>
                    <span className={`text-[10.5px] font-extrabold mt-0.5 ${isSelected ? 'text-bee-100' : 'text-navy-900'}`}>
                      ₹{dPrice.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stepper (Minus / Count / Plus) */}
            <div className="flex items-center justify-between bg-white border border-navy-200 rounded-xl p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleDaysChange(currentOneWayDays - 1)}
                disabled={currentOneWayDays <= 1}
                aria-label="Decrease days"
                className="w-8 h-8 rounded-lg bg-navy-50 hover:bg-navy-100 border border-navy-200 flex items-center justify-center text-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="px-2 text-center min-w-[62px]">
                <div className="text-xs font-black text-navy-950 leading-tight">
                  {currentOneWayDays} {currentOneWayDays === 1 ? 'Day' : 'Days'}
                </div>
                <div className="text-[9.5px] text-navy-500 font-semibold uppercase">Total</div>
              </div>

              <button
                type="button"
                onClick={() => handleDaysChange(currentOneWayDays + 1)}
                aria-label="Increase days"
                className="w-8 h-8 rounded-lg bg-navy-50 hover:bg-navy-100 border border-navy-200 flex items-center justify-center text-navy-700 transition-all cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Buttons: +1 Day and +2 Days */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleAddDays(1)}
                className="flex-1 md:flex-initial h-10 px-3 rounded-xl bg-bee-500 hover:bg-bee-600 active:bg-bee-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                title="Add 1 Day to One Way booking"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Day</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddDays(2)}
                className="flex-1 md:flex-initial h-10 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                title="Add 2 Days to One Way booking"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+2 Days</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
