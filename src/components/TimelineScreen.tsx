import React, { useEffect, useRef } from 'react';
import { Lock, Plus } from 'lucide-react';
import {
  DayPlanEntity,
  HourBlockEntity,
  ValidationResult,
} from '../types/dayledger';
import { DateNavigationBar } from './DateNavigationBar';
import { ExecutiveQuoteWidget } from './ExecutiveQuoteWidget';
import { ValidationWarningBanner } from './ValidationWarningBanner';
import { HourBlockCard } from './HourBlockCard';

interface TimelineScreenProps {
  selectedDate: string;
  todayDate: string;
  isPastDate: boolean;
  currentHour: number;
  hourBlocks: HourBlockEntity[];
  dayPlan: DayPlanEntity | null;
  validationResult: ValidationResult;
  editingLogBlockId: number | null;
  onStartEditingLog: (id: number) => void;
  onStopEditingLog: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
  onOpenCalendar: () => void;
  onToggleCompletion: (block: HourBlockEntity) => void;
  onEditBlock: (block: HourBlockEntity) => void;
  onClearTask: (block: HourBlockEntity) => void;
  onUpdateReviewLog: (blockId: number, log: string) => void;
  onSaveQuote: (text: string, author: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  selectedDate,
  todayDate,
  isPastDate,
  currentHour,
  hourBlocks,
  dayPlan,
  validationResult,
  editingLogBlockId,
  onStartEditingLog,
  onStopEditingLog,
  onPreviousDay,
  onNextDay,
  onGoToToday,
  onOpenCalendar,
  onToggleCompletion,
  onEditBlock,
  onClearTask,
  onUpdateReviewLog,
  onSaveQuote,
}) => {
  const isToday = selectedDate === todayDate;
  const activeBlockRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active hour slot when on today
  useEffect(() => {
    if (isToday && activeBlockRef.current) {
      activeBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isToday, currentHour]);

  const scheduledTasks = hourBlocks.filter((b) => b.title.trim().length > 0);
  const completedCount = scheduledTasks.filter((b) => b.isCompleted).length;
  const totalCount = scheduledTasks.length;
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const firstEmptySlot = hourBlocks.find((b) => b.title.trim().length === 0);

  return (
    <div
      data-testid="timeline_lazy_column"
      className="max-w-4xl mx-auto px-4 py-4 space-y-4 pb-20"
    >
      {/* Date Navigation Bar */}
      <DateNavigationBar
        selectedDate={selectedDate}
        todayDate={todayDate}
        isPastDate={isPastDate}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        onGoToToday={onGoToToday}
        onOpenCalendar={onOpenCalendar}
      />

      {/* Historical Audit Archive Alert */}
      {isPastDate && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-[#D4AF37]/50 shadow-xs">
          <Lock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs text-[#D4AF37] uppercase tracking-wider">
              HISTORICAL AUDIT ARCHIVE
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              Scheduled tasks are frozen and read-only. Hourly review diary text boxes remain fully editable for your retrospective audit.
            </p>
          </div>
        </div>
      )}

      {/* Daily Locked Executive Quote Widget */}
      <ExecutiveQuoteWidget
        quoteText={dayPlan?.quoteText || ''}
        quoteAuthor={dayPlan?.quoteAuthor || ''}
        isPastDate={isPastDate}
        onSaveQuote={onSaveQuote}
      />

      {/* Daily Execution Ratio Progress Card */}
      <div className="w-full bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            24-HOUR EXECUTION RATIO
          </span>
          <span
            className={`font-bold ${
              completionPercent >= 70 && totalCount > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {totalCount > 0
              ? `${completedCount} of ${totalCount} Scheduled (${Math.round(completionPercent)}%)`
              : 'No tasks scheduled yet'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              completionPercent >= 70 ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(Math.max(completionPercent, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Timeline Integrity Validation Banner */}
      <ValidationWarningBanner validationResult={validationResult} />

      {/* Timeline Section Header & Quick Add Button */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            24-HOUR CONTINUOUS TIMELINE
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            00:00 → 24:00 • Custom scheduled tasks
          </p>
        </div>

        {!isPastDate && (
          <button
            onClick={() => {
              onStopEditingLog();
              if (firstEmptySlot) onEditBlock(firstEmptySlot);
            }}
            data-testid="quick_schedule_task_button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {/* Continuous 24-Hour Blocks Feed */}
      <div className="space-y-3">
        {hourBlocks.map((block) => {
          const isActiveNow =
            isToday &&
            currentHour * 60 >= block.hour * 60 + block.minute &&
            currentHour * 60 < block.hour * 60 + block.minute + block.durationMinutes;

          const hasConflict = validationResult.conflictingHours.includes(block.hour);

          return (
            <div
              key={`${block.date}_${block.hour}_${block.minute}_${block.id}`}
              ref={isActiveNow ? activeBlockRef : null}
            >
              <HourBlockCard
                block={block}
                isActiveNow={isActiveNow}
                isPastDate={isPastDate}
                hasConflict={hasConflict}
                isEditingLog={editingLogBlockId === block.id}
                onStartEditLog={() => onStartEditingLog(block.id)}
                onStopEditLog={onStopEditingLog}
                onToggleCompletion={() => onToggleCompletion(block)}
                onEditBlock={() => onEditBlock(block)}
                onClearTask={() => onClearTask(block)}
                onUpdateReviewLog={(log) => onUpdateReviewLog(block.id, log)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
