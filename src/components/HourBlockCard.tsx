import React, { useState, useEffect } from 'react';
import {
  Check,
  Edit,
  Trash2,
  Lock,
  FileText,
  Plus,
  X,
} from 'lucide-react';
import { HourBlockEntity } from '../types/dayledger';
import { formatStartTime, formatEndTime, formatDuration } from '../data/cascade';

interface HourBlockCardProps {
  block: HourBlockEntity;
  isActiveNow: boolean;
  isPastDate: boolean;
  hasConflict: boolean;
  isEditingLog: boolean;
  onStartEditLog: () => void;
  onStopEditLog: () => void;
  onToggleCompletion: () => void;
  onEditBlock: () => void;
  onClearTask: () => void;
  onUpdateReviewLog: (newLog: string) => void;
}

export const HourBlockCard: React.FC<HourBlockCardProps> = ({
  block,
  isActiveNow,
  isPastDate,
  hasConflict,
  isEditingLog,
  onStartEditLog,
  onStopEditLog,
  onToggleCompletion,
  onEditBlock,
  onClearTask,
  onUpdateReviewLog,
}) => {
  const [logInput, setLogInput] = useState(block.reviewLog);

  useEffect(() => {
    if (!isEditingLog) {
      setLogInput(block.reviewLog);
    }
  }, [block.reviewLog, isEditingLog]);

  const isTaskAssigned = block.title.trim().length > 0;
  const startTimeStr = formatStartTime(block.hour, block.minute);
  const endTimeStr = formatEndTime(block.hour, block.minute, block.durationMinutes);
  const durationLabel = formatDuration(block.durationMinutes);

  const priorityColor = {
    HIGH: 'text-red-600 dark:text-red-400',
    MEDIUM: 'text-amber-600 dark:text-amber-400',
    LOW: 'text-slate-500 dark:text-slate-400',
  }[block.priority];

  // Dynamic card border
  const borderClass = hasConflict
    ? 'border-red-500 border-2'
    : isActiveNow
    ? 'border-blue-600 dark:border-sky-400 border-2'
    : isTaskAssigned && block.isCompleted
    ? 'border-emerald-500/50 dark:border-emerald-500/30'
    : 'border-slate-200 dark:border-[#1E293B]';

  const bgClass = isActiveNow
    ? 'bg-blue-50/40 dark:bg-[#1E293B]/40'
    : 'bg-white dark:bg-[#111827]';

  return (
    <div
      data-testid={`hour_block_card_${block.hour}_${block.minute}`}
      className={`w-full rounded-xl ${bgClass} border ${borderClass} p-3.5 shadow-xs transition-all`}
    >
      {/* Top Slot Metadata Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Time Range & Active Indicators */}
        <div className="flex items-center gap-2">
          <span
            data-testid={`hour_time_label_${block.hour}_${block.minute}`}
            className="font-bold text-sm md:text-base text-slate-900 dark:text-white font-mono"
          >
            {startTimeStr} – {endTimeStr}
          </span>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
            {durationLabel}
          </span>

          {isActiveNow && (
            <div
              data-testid="active_hour_pill"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ACTIVE NOW
            </div>
          )}

          {hasConflict && (
            <div className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold tracking-wider">
              COLLISION
            </div>
          )}
        </div>

        {/* Badges and Actions */}
        <div className="flex items-center gap-2">
          {isTaskAssigned ? (
            <>
              {/* Category */}
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300">
                {block.category}
              </span>

              {/* Priority */}
              <span className={`text-[11px] font-bold ${priorityColor}`}>
                {block.priority}
              </span>

              {!isPastDate ? (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      onStopEditLog();
                      onEditBlock();
                    }}
                    data-testid={`edit_block_button_${block.hour}_${block.minute}`}
                    aria-label="Edit Block"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937]"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onStopEditLog();
                      onClearTask();
                    }}
                    data-testid={`clear_block_button_${block.hour}_${block.minute}`}
                    aria-label="Clear Task"
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-[#1F2937]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span title="Frozen in Past">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                </span>
              )}
            </>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-[#1F2937] text-slate-500 dark:text-slate-400">
              AVAILABLE
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="mt-3">
        {isTaskAssigned ? (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={block.isCompleted}
              disabled={isPastDate}
              onChange={() => {
                if (!isPastDate) {
                  onStopEditLog();
                  onToggleCompletion();
                }
              }}
              data-testid={`hour_checkbox_${block.hour}_${block.minute}`}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
            />

            <span
              onClick={() => {
                if (!isPastDate) {
                  onStopEditLog();
                  onToggleCompletion();
                }
              }}
              className={`flex-1 text-sm md:text-base font-semibold select-none ${
                isPastDate ? 'cursor-default' : 'cursor-pointer'
              } ${
                block.isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {block.title}
            </span>

            {block.isCompleted && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                COMPLETED
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A101D] border border-slate-200 dark:border-[#1E293B]">
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Available Slot
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {startTimeStr} – {endTimeStr} • Open for scheduling
              </div>
            </div>

            {!isPastDate && (
              <button
                onClick={() => {
                  onStopEditLog();
                  onEditBlock();
                }}
                data-testid={`add_task_slot_button_${block.hour}_${block.minute}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Granular Review Logs / Diary Section */}
      <div className="mt-3 rounded-lg bg-slate-50 dark:bg-[#060D18] border border-slate-200 dark:border-[#1E293B] p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText
              className={`w-3.5 h-3.5 ${
                block.reviewLog.trim() ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            />
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              {isPastDate ? 'HISTORICAL DIARY AUDIT' : 'HOURLY REVIEW & EXECUTIVE DEBRIEF'}
            </span>
          </div>

          {!isEditingLog && (
            <div>
              {block.reviewLog.trim() ? (
                <button
                  onClick={() => {
                    setLogInput(block.reviewLog);
                    onStartEditLog();
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Edit className="w-3 h-3" />
                  EDIT LOG
                </button>
              ) : (
                <button
                  onClick={() => {
                    setLogInput('');
                    onStartEditLog();
                  }}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + ADD LOG
                </button>
              )}
            </div>
          )}
        </div>

        {isEditingLog ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              data-testid={`review_log_input_${block.hour}_${block.minute}`}
              rows={2}
              placeholder={
                isPastDate
                  ? 'Audit accomplishments, challenges, or notes for this slot...'
                  : 'Log accomplishments, metrics, or retrospective notes...'
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">
                {logInput.length} chars
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLogInput(block.reviewLog);
                    onStopEditLog();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px]"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>

                <button
                  onClick={() => {
                    onUpdateReviewLog(logInput.trim());
                    onStopEditLog();
                  }}
                  data-testid={`save_log_button_${block.hour}_${block.minute}`}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                >
                  <Check className="w-3 h-3" />
                  Save Log
                </button>
              </div>
            </div>
          </div>
        ) : (
          block.reviewLog.trim() && (
            <div className="mt-1.5 p-2 rounded-md bg-slate-100 dark:bg-[#111827]/80 text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
              {block.reviewLog}
            </div>
          )
        )}
      </div>
    </div>
  );
};
