import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, Lock } from 'lucide-react';
import { parseDateString } from '../data/storage';

interface DateNavigationBarProps {
  selectedDate: string;
  todayDate: string;
  isPastDate: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
  onOpenCalendar: () => void;
}

export const DateNavigationBar: React.FC<DateNavigationBarProps> = ({
  selectedDate,
  todayDate,
  isPastDate,
  onPreviousDay,
  onNextDay,
  onGoToToday,
  onOpenCalendar,
}) => {
  const isToday = selectedDate === todayDate;

  // Format date display (e.g. Monday, Oct 12, 2026)
  const formattedDisplay = (() => {
    try {
      const dateObj = parseDateString(selectedDate);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  })();

  return (
    <div
      data-testid="date_navigation_bar"
      className="w-full bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-3 shadow-xs"
    >
      <div className="flex items-center justify-between">
        {/* Prev Day */}
        <button
          onClick={onPreviousDay}
          data-testid="prev_day_button"
          aria-label="Previous Day"
          className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Date Display */}
        <div
          onClick={onOpenCalendar}
          className="flex flex-col items-center cursor-pointer px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1F2937] transition-colors"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Calendar
              className={`w-3.5 h-3.5 ${
                isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
              }`}
            />
            <span
              className={
                isToday
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isPastDate
                  ? 'text-[#D4AF37]'
                  : 'text-blue-600 dark:text-blue-400'
              }
            >
              {isToday ? 'TODAY' : isPastDate ? 'HISTORICAL ARCHIVE' : 'FUTURE PLAN'}
            </span>
          </div>

          <div className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
            {formattedDisplay}
          </div>
        </div>

        {/* Next Day */}
        <button
          onClick={onNextDay}
          data-testid="next_day_button"
          aria-label="Next Day"
          className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Status Row */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-[#1E293B]/60 text-xs">
        {isPastDate ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1F2937] text-slate-600 dark:text-slate-300 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>FROZEN ARCHIVE (Diary Logs Editable)</span>
          </div>
        ) : isToday ? (
          <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Real-time 24-Hour Cycle Active
          </div>
        ) : (
          <div className="text-blue-600 dark:text-blue-400 font-semibold">
            Forward Horizon Planning
          </div>
        )}

        {!isToday && (
          <button
            onClick={onGoToToday}
            data-testid="jump_today_button"
            className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#1E293B] text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          >
            Return to Today
          </button>
        )}
      </div>
    </div>
  );
};
