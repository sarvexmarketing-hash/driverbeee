import React, { useEffect } from 'react';
import { ScheduleType, formatDisplayDate } from '../types';
import { Clock } from 'lucide-react';

interface ScheduleSelectorProps {
  scheduleType: ScheduleType;
  onSelectSchedule: (type: ScheduleType) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
}

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
        <div className="p-3 bg-[#FAFBFD] rounded-2xl border border-bee-200/80 space-y-2 animate-fade-in mt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-navy-800">
            <span>Pickup Date & Slot:</span>
            <span className="text-bee-700">{formatDisplayDate(date)} at {time}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {quickTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`px-2 py-1.5 text-[10.5px] rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    time === t ? 'bg-bee-600 text-white font-bold' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
