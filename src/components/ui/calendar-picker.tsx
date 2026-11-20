"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarPickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  onClose?: () => void;
  minDate?: string; // YYYY-MM-DD
  rangeDays?: number; // Optional trip duration in days (e.g. outstation multiple days)
  className?: string;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function CalendarPicker({
  value,
  onChange,
  onClose,
  minDate,
  rangeDays = 1,
  className,
}: CalendarPickerProps) {
  // Parse initial selected date or default to today
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const minAllowed = minDate || todayStr;
  const activeDate = value || todayStr;

  const [initialYear, initialMonth] = useMemo(() => {
    if (activeDate && /^\d{4}-\d{2}-\d{2}$/.test(activeDate)) {
      const [y, m] = activeDate.split('-').map(Number);
      return [y, m - 1];
    }
    return [today.getFullYear(), today.getMonth()];
  }, [activeDate, today]);

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
  const [direction, setDirection] = useState<number>(0);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Check if prev month navigation should be disabled
  const canGoPrev = useMemo(() => {
    const [minY, minM] = minAllowed.split('-').map(Number);
    if (currentYear < minY) return false;
    if (currentYear === minY && currentMonth <= minM - 1) return false;
    return true;
  }, [currentYear, currentMonth, minAllowed]);

  // Range end date if rangeDays > 1
  const rangeEndDate = useMemo(() => {
    if (!activeDate || rangeDays <= 1) return activeDate;
    try {
      const [y, m, d] = activeDate.split('-').map(Number);
      const end = new Date(y, m - 1, d);
      end.setDate(end.getDate() + (rangeDays - 1));
      const ey = end.getFullYear();
      const em = String(end.getMonth() + 1).padStart(2, '0');
      const ed = String(end.getDate()).padStart(2, '0');
      return `${ey}-${em}-${ed}`;
    } catch {
      return activeDate;
    }
  }, [activeDate, rangeDays]);

  // Month and Year for current calendar view
  const currentMonthTitle = useMemo(() => {
    return `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  }, [currentMonth, currentYear]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
      isRangeStart: boolean;
      isRangeEnd: boolean;
      isInRange: boolean;
    }> = [];

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isDisabled: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === activeDate,
        isRangeStart: dateStr === activeDate,
        isRangeEnd: dateStr === rangeEndDate,
        isInRange: dateStr >= activeDate && dateStr <= rangeEndDate,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isDisabled = dateStr < minAllowed;
      const isRangeStart = dateStr === activeDate;
      const isRangeEnd = dateStr === rangeEndDate;
      const isInRange = rangeDays > 1 && dateStr >= activeDate && dateStr <= rangeEndDate;

      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isDisabled,
        isToday: dateStr === todayStr,
        isSelected: dateStr === activeDate,
        isRangeStart,
        isRangeEnd,
        isInRange,
      });
    }

    // Leading days from next month to fill complete grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isDisabled: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === activeDate,
        isRangeStart: dateStr === activeDate,
        isRangeEnd: dateStr === rangeEndDate,
        isInRange: rangeDays > 1 && dateStr >= activeDate && dateStr <= rangeEndDate,
      });
    }

    return days;
  }, [currentYear, currentMonth, minAllowed, todayStr, activeDate, rangeDays, rangeEndDate]);

  // Tomorrow string
  const tomorrowStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [today]);

  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
    if (onClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "w-[295px] sm:w-[315px] max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-neutral-200 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-3 sm:p-3.5 select-none",
        className
      )}
    >
      {/* ============================================================
          HEADER: Clean Month & Year with Navigation Arrows
          ============================================================ */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className="text-sm sm:text-[15px] font-black text-neutral-900 tracking-tight">
          {currentMonthTitle}
        </h4>

        {/* Month Arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer",
              canGoPrev
                ? "hover:bg-neutral-100 text-neutral-700 active:scale-90"
                : "text-neutral-300 opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-700 active:scale-90 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ============================================================
          WEEKDAY LABELS (S, M, T, W, T, F, S)
          ============================================================ */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 border-b border-neutral-100 pb-1">
        {DAYS_OF_WEEK.map((d, idx) => (
          <div
            key={`${d}-${idx}`}
            className="text-xs font-bold text-neutral-400 py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ============================================================
          DAYS MATRIX (Animated with framer-motion)
          ============================================================ */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${currentYear}-${currentMonth}`}
          initial={{ opacity: 0, x: direction * 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -12 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-y-0.5 gap-x-0"
          onMouseLeave={() => setHoveredDate(null)}
        >
          {calendarDays.map((cell) => {
            const isHovered = hoveredDate === cell.dateStr && !cell.isDisabled;
            const isSingleSelected = cell.isSelected && rangeDays <= 1;

            return (
              <div
                key={cell.dateStr}
                className="relative h-8 sm:h-8.5 flex items-center justify-center"
                onMouseEnter={() => !cell.isDisabled && setHoveredDate(cell.dateStr)}
              >
                {/* Connecting Range Capsule */}
                {rangeDays > 1 && cell.isInRange && (
                  <div
                    className={cn(
                      "absolute inset-y-0.5 bg-[#FFEDD5] z-0",
                      cell.isRangeStart && "left-0.5 right-0 rounded-l-full",
                      cell.isRangeEnd && "left-0 right-0.5 rounded-r-full",
                      !cell.isRangeStart && !cell.isRangeEnd && "left-0 right-0"
                    )}
                  />
                )}

                {/* Smooth Animated Hover Capsule */}
                {isHovered && !cell.isSelected && !cell.isInRange && (
                  <motion.div
                    layoutId="calendar-hover-pill"
                    className="absolute inset-0.5 rounded-full bg-neutral-100 z-0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}

                {/* Range Start / Range End Circle or Single Selected Date */}
                {(isSingleSelected || cell.isRangeStart || cell.isRangeEnd) && (
                  <motion.div
                    layoutId="calendar-selected-pill"
                    className="absolute inset-0.5 rounded-full bg-[#F97316] shadow-xs z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}

                {/* Date Button */}
                <button
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() => handleSelect(cell.dateStr)}
                  className={cn(
                    "relative z-10 w-full h-full flex flex-col items-center justify-center text-xs font-bold transition-transform cursor-pointer rounded-full",
                    !cell.isDisabled && "active:scale-90",
                    isSingleSelected || cell.isRangeStart || cell.isRangeEnd
                      ? "text-white font-black"
                      : cell.isInRange
                      ? "text-orange-950 font-black"
                      : cell.isDisabled
                      ? "text-neutral-300 cursor-not-allowed font-medium"
                      : cell.isCurrentMonth
                      ? "text-neutral-800 hover:text-neutral-950"
                      : "text-neutral-300 font-medium"
                  )}
                >
                  <span>{cell.dayNum}</span>

                  {/* Dot indicator for today */}
                  {cell.isToday && !cell.isSelected && !cell.isInRange && (
                    <span className="w-1 h-1 rounded-full bg-orange-500 absolute bottom-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
