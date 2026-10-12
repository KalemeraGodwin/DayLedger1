import React from 'react';
import {
  BarChart3,
  Flame,
  Trophy,
  AlertOctagon,
} from 'lucide-react';
import { PerformanceReport } from '../types/dayledger';
import { CorporateTrendChart } from './CorporateTrendChart';

interface PerformanceReportsScreenProps {
  report: PerformanceReport;
  currentFilterDays: number;
  onSelectFilterDays: (days: number) => void;
}

export const PerformanceReportsScreen: React.FC<PerformanceReportsScreenProps> = ({
  report,
  currentFilterDays,
  onSelectFilterDays,
}) => {
  return (
    <div
      data-testid="performance_reports_screen"
      className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-20"
    >
      {/* Executive Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            EXECUTIVE PERFORMANCE REPORTS
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Historical Velocity & Analytical Audit
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aggregated historical telemetry across 24-hour daily ledgers.
        </p>
      </div>

      {/* Timeline Filter Chips */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { days: 30, label: '30-Day Executive Audit' },
          { days: 14, label: '14-Day Trajectory' },
          { days: 7, label: '7-Day Sprint' },
        ].map(({ days, label }) => {
          const isSelected = currentFilterDays === days;
          return (
            <button
              key={days}
              type="button"
              onClick={() => onSelectFilterDays(days)}
              data-testid={`filter_days_${days}`}
              className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-colors border ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1F2937]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Key KPI Executive Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Overall Completion Rate */}
        <div
          data-testid="overall_completion_rate_card"
          className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs"
        >
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            OVERALL COMPLETION
          </span>
          <div
            className={`text-4xl font-extrabold mt-1.5 font-mono ${
              report.overallCompletionRate >= 70
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {Math.round(report.overallCompletionRate)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {report.totalTasksCompleted} of {report.totalTasksScheduled} blocks executed
          </p>
        </div>

        {/* Consistency Streak & Peak */}
        <div
          data-testid="consistency_streak_card"
          className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <span>STREAK & PEAK</span>
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-mono">
            {report.currentStreak} Days
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Best Day: {Math.round(report.bestDayCompletionRate)}% completion
          </p>
        </div>
      </div>

      {/* Corporate Trend Chart */}
      <CorporateTrendChart points={report.dailyTrend} />

      {/* Top 3 Most Accomplished Task Types */}
      <div
        data-testid="top_accomplished_tasks_card"
        className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
              TOP 3 MOST ACCOMPLISHED TASK TYPES
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">By Volume & Success</span>
        </div>

        {report.topAccomplishedTaskTypes.length > 0 ? (
          <div className="space-y-3.5">
            {report.topAccomplishedTaskTypes.map((cat, idx) => (
              <div key={cat.category} data-testid={`accomplished_category_${idx}`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-[#D4AF37] text-slate-900'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.category}
                    </span>
                  </div>

                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {cat.completedCount}/{cat.totalCount} completed ({Math.round(cat.completionPercentage)}%)
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-[#D4AF37]' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(Math.max(cat.completionPercentage, 0), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-2">
            No category completions recorded yet.
          </div>
        )}
      </div>

      {/* Breakdown of Tasks Most Frequently Skipped */}
      <div
        data-testid="frequently_skipped_tasks_card"
        className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
              FREQUENTLY SKIPPED TASK AUDIT
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Attrition Analysis</span>
        </div>

        {report.mostFrequentlySkippedTasks.length > 0 ? (
          <div className="space-y-2.5">
            {report.mostFrequentlySkippedTasks.map((item, idx) => (
              <div
                key={item.title}
                data-testid={`skipped_item_${idx}`}
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#060D18] border border-slate-200 dark:border-[#1E293B] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-500/20">
                    Skipped {item.skippedCount}x ({Math.round(item.skipRatePercentage)}%)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>Total Scheduled: {item.totalScheduled} cycles</span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  💡 Executive Advice: Reschedule this block earlier in the day to minimize friction and energy depletion.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 py-2">
            Zero skipped tasks detected! 100% executive execution achieved across this timeline.
          </div>
        )}
      </div>
    </div>
  );
};
