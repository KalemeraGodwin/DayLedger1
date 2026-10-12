import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ValidationResult } from '../types/dayledger';

interface ValidationWarningBannerProps {
  validationResult: ValidationResult;
}

export const ValidationWarningBanner: React.FC<ValidationWarningBannerProps> = ({
  validationResult,
}) => {
  if (!validationResult.isValid) {
    return (
      <div
        data-testid="timeline_validation_warning_banner"
        className="w-full rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/60 p-3.5 text-red-700 dark:text-red-300 shadow-xs"
      >
        <div className="flex items-center gap-2 font-bold text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>TIMELINE INTEGRITY WARNING</span>
        </div>

        <p className="text-xs font-semibold mt-1 text-red-800 dark:text-red-300">
          Chronological conflicts detected in 24-hour cycle ({validationResult.totalScheduledHours} hours scheduled):
        </p>

        <ul className="mt-2 space-y-1 text-xs">
          {validationResult.warnings.map((warning, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="font-bold">•</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      data-testid="timeline_validated_chip"
      className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] text-xs shadow-xs"
    >
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          24-Hour Timeline Synchronized
        </span>
      </div>

      <span className="font-bold text-emerald-600 dark:text-emerald-400">
        24/24 One-Hour Slots
      </span>
    </div>
  );
};
