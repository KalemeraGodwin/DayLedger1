import React from 'react';
import { History, Lock, ArrowRight } from 'lucide-react';
import { formatDateString, parseDateString } from '../data/storage';
import { getDailyQuoteForDate } from '../data/executiveTemplate';

interface AuditArchiveScreenProps {
  todayDate: string;
  onSelectDate: (date: string) => void;
}

export const AuditArchiveScreen: React.FC<AuditArchiveScreenProps> = ({
  todayDate,
  onSelectDate,
}) => {
  // Generate past 30 days from todayDate
  const today = parseDateString(todayDate);
  const pastDays = Array.from({ length: 30 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (idx + 1));
    return d;
  });

  return (
    <div
      data-testid="audit_archive_screen"
      className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-20"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <History className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            EXECUTIVE AUDIT ARCHIVE
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Historical Ledgers & Review Diary
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select any past date to inspect frozen action items and audit or edit granular review diary debriefs.
        </p>
      </div>

      {/* List of past 30 days */}
      <div className="space-y-2.5">
        {pastDays.map((dateObj) => {
          const dateStr = formatDateString(dateObj);
          const [quote] = getDailyQuoteForDate(dateStr);
          const displayStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              data-testid={`archive_date_item_${dateStr}`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] shadow-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1F2937] transition-all group"
            >
              <div className="flex-1 pr-4 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase mb-1">
                  <Lock className="w-3 h-3" />
                  LOCKED RECORD
                </div>

                <div className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                  {displayStr}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">
                  “{quote}”
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1F2937] text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  Audit Logs
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
