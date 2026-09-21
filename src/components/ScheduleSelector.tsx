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

// Generate hour numbers 01 to 12
export const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

// Generate minute numbers 00 to 59
export const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// Parse time string like "04:45 PM" into hour, minute, and am/pm components
export const parseTimeString = (t: string): { hour: string; minute: string; ampm: string } => {
  const match = (t || '').trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
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

  // Parsed hour, minute, and AM/PM from current time string
  const parsedTime = useMemo(() => parseTimeString(time), [time]);

  const updateTime = (newHour: string, newMinute: string, newAmpm: string) => {
    setTime(`${newHour}:${newMinute} ${newAmpm}`);
  };

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

          {/* Row 1: Date Buttons + Scrolling Dropdowns (Hours, Minutes, AM/PM) */}
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

            {/* Timing Dropdown: Scroll Hour, Minute, and AM/PM */}
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-navy-200 hover:border-bee-400 shadow-xs transition-colors">
              <span className="text-[10.5px] uppercase tracking-wider font-extrabold text-navy-500 flex items-center gap-1 select-none">
                <Clock className="w-3.5 h-3.5 text-bee-600" />
                Time:
              </span>

              <div className="flex items-center gap-1">
                {/* Hour Scroll Dropdown (01-12) */}
                <div className="relative">
                  <select
                    id="pickup-hour-select"
                    aria-label="Select hour"
                    value={parsedTime.hour}
                    onChange={(e) => updateTime(e.target.value, parsedTime.minute, parsedTime.ampm)}
                    className="py-1 pl-1.5 pr-4 text-xs font-extrabold text-navy-950 bg-navy-50/80 hover:bg-navy-100 rounded-lg outline-none cursor-pointer appearance-none text-center transition-colors"
                  >
                    {hoursList.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 text-navy-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <span className="text-navy-400 font-extrabold text-xs select-none">:</span>

                {/* Minute Scroll Dropdown (00-59) */}
                <div className="relative">
                  <select
                    id="pickup-minute-select"
                    aria-label="Select minute"
                    value={parsedTime.minute}
                    onChange={(e) => updateTime(parsedTime.hour, e.target.value, parsedTime.ampm)}
                    className="py-1 pl-1.5 pr-4 text-xs font-extrabold text-navy-950 bg-navy-50/80 hover:bg-navy-100 rounded-lg outline-none cursor-pointer appearance-none text-center transition-colors"
                  >
                    {minutesList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 text-navy-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* AM / PM Scroll Dropdown */}
                <div className="relative ml-0.5">
                  <select
                    id="pickup-ampm-select"
                    aria-label="Select AM or PM"
                    value={parsedTime.ampm}
                    onChange={(e) => updateTime(parsedTime.hour, parsedTime.minute, e.target.value)}
                    className="py-1 pl-2 pr-5 text-xs font-extrabold text-bee-700 bg-bee-50 rounded-lg outline-none cursor-pointer appearance-none text-center hover:bg-bee-100 transition-colors border border-bee-200"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 text-bee-700 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
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
