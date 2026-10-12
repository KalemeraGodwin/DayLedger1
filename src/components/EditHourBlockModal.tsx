import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Zap,
  X,
} from 'lucide-react';
import { HourBlockEntity } from '../types/dayledger';
import { CATEGORIES } from '../data/executiveTemplate';
import { formatStartTime, formatEndTime, formatDuration } from '../data/cascade';

interface EditHourBlockModalProps {
  block: HourBlockEntity;
  onDismiss: () => void;
  onSave: (updatedBlock: HourBlockEntity) => void;
  onClearTask?: () => void;
}

export const EditHourBlockModal: React.FC<EditHourBlockModalProps> = ({
  block,
  onDismiss,
  onSave,
  onClearTask,
}) => {
  const isNewTask = block.title.trim().length === 0;

  const [title, setTitle] = useState(block.title);
  const [category, setCategory] = useState(
    block.category === 'General' || block.category === 'Unassigned'
      ? 'Deep Work'
      : block.category
  );
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>(block.priority);
  const [startHour, setStartHour] = useState(Math.min(Math.max(block.hour, 0), 23));
  const [startMinute, setStartMinute] = useState(block.minute >= 30 ? 30 : 0);
  const [durationMinutes, setDurationMinutes] = useState(
    block.durationMinutes >= 30 ? block.durationMinutes : 60
  );

  const startTotalMin = startHour * 60 + startMinute;
  const startTimeStr = formatStartTime(startHour, startMinute);
  const endTimeStr = formatEndTime(startHour, startMinute, durationMinutes);
  const durationLabel = formatDuration(durationMinutes);

  const handleSave = () => {
    const finalTitle = title.trim() || `Task at ${startTimeStr}`;
    onSave({
      ...block,
      hour: startHour,
      minute: startMinute,
      durationMinutes,
      durationHours: Math.ceil(durationMinutes / 60),
      title: finalTitle,
      category,
      priority,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl p-5 md:p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              {isNewTask ? 'SCHEDULE NEW TASK' : 'EDIT TASK BLOCK'}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {startTimeStr} – {endTimeStr} ({durationLabel})
            </h2>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 py-4">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Task / Activity Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="edit_block_title_input"
              placeholder="e.g., Executive Strategy, Deep Focus"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Start Time with Stepper and :00 / :30 */}
          <div>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              START TIME (30-MIN INCREMENTS)
            </span>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-[#1F2937]">
              {/* Hour Stepper */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={startHour <= 0}
                  onClick={() => setStartHour((prev) => Math.max(prev - 1, 0))}
                  className="p-1.5 rounded-md bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 disabled:opacity-40 shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-base md:text-lg text-slate-900 dark:text-white w-8 text-center">
                  {String(startHour).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  disabled={startHour >= 23}
                  onClick={() => setStartHour((prev) => Math.min(prev + 1, 23))}
                  className="p-1.5 rounded-md bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 disabled:opacity-40 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Minute 00 / 30 Toggle Pills */}
              <div className="flex items-center gap-1.5">
                {[0, 30].map((min) => {
                  const isSelected = startMinute === min;
                  return (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setStartMinute(min)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      :{String(min).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duration Stepper (30-Minute Increments) */}
          <div>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              DURATION (30-MIN INCREMENTS)
            </span>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-[#1F2937]">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {durationLabel} ({startTimeStr} – {endTimeStr})
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={durationMinutes <= 30}
                  onClick={() => setDurationMinutes((prev) => Math.max(prev - 30, 30))}
                  className="p-1.5 rounded-md bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 disabled:opacity-40 shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={startTotalMin + durationMinutes + 30 > 1440}
                  onClick={() => setDurationMinutes((prev) => prev + 30)}
                  className="p-1.5 rounded-md bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 disabled:opacity-40 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Duration Chips */}
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {[
                { m: 30, label: '30m' },
                { m: 60, label: '1h' },
                { m: 90, label: '1.5h' },
                { m: 120, label: '2h' },
                { m: 180, label: '3h' },
              ].map(({ m, label }) => {
                const isSelected = durationMinutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`py-1.5 rounded-md text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-500/50'
                        : 'bg-slate-50 dark:bg-[#1F2937]/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automatic Cascading Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs">
            <Zap className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">
              Automatic Cascade: Subsequent tasks will begin at {endTimeStr}.
            </span>
          </div>

          {/* Category Chips */}
          <div>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              CATEGORY
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              PRIORITY LEVEL
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      isSelected
                        ? p === 'HIGH'
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 dark:text-red-400'
                          : p === 'MEDIUM'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-700 dark:text-slate-300'
                        : 'bg-white dark:bg-[#1F2937] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1E293B]">
          {!isNewTask && onClearTask ? (
            <button
              onClick={onClearTask}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Task
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              data-testid="save_block_dialog_button"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              {isNewTask ? 'Schedule Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
