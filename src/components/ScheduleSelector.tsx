import React, { useEffect, useMemo } from 'react';
import { ScheduleType, formatDisplayDate } from '../types';
import { Clock, ChevronDown } from 'lucide-react';

interface ScheduleSelectorProps {
  scheduleType: ScheduleType;
  onSelectSchedule: (type: ScheduleType) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
}

// Generate all 15-minute time slots for 24 hours (96 slots from 12:00 AM to 11:45 PM)
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '15', '30', '45']) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      const hStr = String(displayH).padStart(2, '0');
      slots.push(`${hStr}:${m} ${ampm}`);
    }
  }
  return slots;
};

// Helper to convert 12-hour string (e.g. "04:45 PM" or "4.45 PM" or "16:45") to 24-hour "HH:mm"
export const format12To24 = (timeStr: string): string => {
  if (!timeStr) return '10:30';
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  const match = trimmed.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (!match) return '10:30';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3] ? match[3].toUpperCase() : (hours >= 12 ? 'PM' : 'AM');
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

// Helper to convert 24-hour "HH:mm" to 12-hour "hh:mm AM/PM"
export const format24To12 = (time24: string): string => {
  if (!time24) return '10:30 AM';
  const parts = time24.trim().split(':');
  if (parts.length < 2) return '10:30 AM';
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return '10:30 AM';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  scheduleType,
  onSelectSchedule,
  date,
  setDate,
  time,
  setTime,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (date !== todayStr && date !== tomorrowStr) {
      setDate(todayStr);
    }
  }, [date, todayStr, tomorrowStr, setDate]);
  
  const quickTimes = ['08:00 AM', '10:30 AM', '02:00 PM', '05:30 PM', '08:00 PM'];

  // All 15-minute time slots across 24h, ensuring current time is included if customized
  const timeSlots = useMemo(() => {
    const baseSlots = generateTimeSlots();
    if (time && !baseSlots.includes(time)) {
      return [time, ...baseSlots];
    }
    return baseSlots;
  }, [time]);

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 tracking-tight">
          Schedule Your Driver
        </h2>
        <p className="text-xs sm:text-sm text-navy-500 font-normal mt-0.5">
          Choose when you want the driver for.
        </p>
      </div>

      {/* 2 Cards side-by-side */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        
        {/* CARD 1: Schedule for Right Now */}
        <button
          type="button"
          onClick={() => onSelectSchedule('now')}
          className={`relative cursor-pointer rounded-2xl p-3 sm:p-4 transition-all duration-150 select-none text-left w-full flex flex-col justify-between min-h-[96px] sm:min-h-[108px] ${
            scheduleType === 'now'
              ? 'bg-white border-2 border-bee-600 shadow-sm'
              : 'bg-[#F6F4EE] hover:bg-[#EFECE3] border border-transparent'
          }`}
        >
          {/* Top Row: Stopwatch Icon + Circle Indicator */}
          <div className="flex items-start justify-between w-full">
            {/* Custom Stopwatch SVG */}
            <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 text-navy-900">
              <circle cx="14" cy="15" r="9" stroke="currentColor" strokeWidth="2.2" />
              <line x1="14" y1="10" x2="14" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="14" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="14" y1="3" x2="14" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="11" y1="3" x2="17" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Circle Indicator */}
            {scheduleType === 'now' ? (
              <span className="w-3.5 h-3.5 rounded-full bg-bee-600 flex-shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-navy-300 flex-shrink-0" />
            )}
          </div>

          {/* Bottom Text */}
          <div className="mt-2">
            <div className="text-xs sm:text-sm font-bold text-navy-950 leading-tight">
              Schedule for
            </div>
            <div className="text-xs sm:text-sm font-bold text-navy-950 flex items-center gap-1 mt-0.5">
              <span>Right Now</span>
              <Clock className="w-3.5 h-3.5 text-navy-600 stroke-[2]" />
            </div>
          </div>
        </button>

        {/* CARD 2: Schedule for Later */}
        <button
          type="button"
          onClick={() => onSelectSchedule('later')}
          className={`relative cursor-pointer rounded-2xl p-3 sm:p-4 transition-all duration-150 select-none text-left w-full flex flex-col justify-between min-h-[96px] sm:min-h-[108px] ${
            scheduleType === 'later'
              ? 'bg-white border-2 border-bee-600 shadow-sm'
              : 'bg-[#F6F4EE] hover:bg-[#EFECE3] border border-transparent'
          }`}
        >
          {/* Top Row: Calendar+ Icon + Orange Circle */}
          <div className="flex items-start justify-between w-full">
            {/* Custom Calendar Plus SVG matching reference */}
            <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6 text-navy-900">
              <rect x="4" y="6" width="20" height="18" rx="4" stroke="currentColor" strokeWidth="2.2" />
              <line x1="4" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="2" />
              <line x1="9" y1="3" x2="9" y2="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="19" y1="3" x2="19" y2="7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              {/* Plus badge */}
              <circle cx="18" cy="18" r="4.5" fill="#E89218" />
              <line x1="18" y1="15.5" x2="18" y2="20.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15.5" y1="18" x2="20.5" y2="18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Solid Orange Circle Indicator */}
            {scheduleType === 'later' ? (
              <span className="w-3.5 h-3.5 rounded-full bg-bee-600 flex-shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-navy-300 flex-shrink-0" />
            )}
          </div>

          {/* Bottom Text */}
          <div className="mt-2">
            <div className="text-xs sm:text-sm font-bold text-navy-950 leading-tight">
              Schedule for Later
            </div>
            <div className="text-[11px] text-navy-500 font-normal mt-0.5">
              Add date and time.
            </div>
          </div>
        </button>

      </div>

      {/* Inline Date & Time Picker when Schedule for Later is active */}
      {scheduleType === 'later' && (
        <div className="p-3 bg-[#FAFBFD] rounded-2xl border border-bee-200/80 space-y-2.5 animate-fade-in mt-2">
          {/* Header Row */}
          <div className="flex items-center justify-between text-[11px] font-bold text-navy-800">
            <span className="text-navy-600">Pickup Date & Timing:</span>
            <span className="text-bee-700 bg-bee-50 border border-bee-200/80 px-2.5 py-0.5 rounded-md font-extrabold flex items-center gap-1">
              <Clock className="w-3 h-3 text-bee-600" />
              {formatDisplayDate(date)} at {time}
            </span>
          </div>

          {/* Row 1: Date Buttons + Timing Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            {/* Date Quick Selection: Today / Tomorrow */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`py-2 px-3 text-xs rounded-xl font-bold transition-all text-center cursor-pointer ${
                  date === todayStr
                    ? 'bg-bee-600 text-white shadow-xs'
                    : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrowStr)}
                className={`py-2 px-3 text-xs rounded-xl font-bold transition-all text-center cursor-pointer ${
                  date === tomorrowStr
                    ? 'bg-bee-600 text-white shadow-xs'
                    : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'
                }`}
              >
                Tomorrow
              </button>
            </div>

            {/* Timing Dropdown Selector */}
            <div className="relative flex items-center">
              <Clock className="w-4 h-4 text-bee-600 absolute left-3 pointer-events-none" />
              <select
                id="pickup-time-dropdown"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs font-bold text-navy-950 bg-white border border-navy-200 rounded-xl hover:border-bee-500 focus:border-bee-600 focus:ring-2 focus:ring-bee-500/20 outline-none appearance-none cursor-pointer transition-all shadow-xs"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-navy-500 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Quick Shortcut Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-navy-100/60 pb-0.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-navy-400 whitespace-nowrap mr-0.5">
              Quick:
            </span>
            {quickTimes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`px-2.5 py-1 text-[10.5px] rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  time === t
                    ? 'bg-bee-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

