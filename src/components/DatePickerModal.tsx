import React, { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDateString } from '../data/storage';

interface DatePickerModalProps {
  currentDate: string;
  onDismiss: () => void;
  onSelectDate: (date: string) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  currentDate,
  onDismiss,
  onSelectDate,
}) => {
  const [selected, setSelected] = useState(currentDate);

  const handleConfirm = () => {
    if (selected) {
      onSelectDate(selected);
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Select Ledger Date
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Choose calendar date (YYYY-MM-DD):
          </label>
          <input
            type="date"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => setSelected(formatDateString(new Date()))}
              className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const yest = new Date();
                yest.setDate(yest.getDate() - 1);
                setSelected(formatDateString(yest));
              }}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              Yesterday
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
          <button
            onClick={onDismiss}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            Go to Date
          </button>
        </div>
      </div>
    </div>
  );
};
