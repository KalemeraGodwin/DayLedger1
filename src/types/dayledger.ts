export interface DayPlanEntity {
  date: string; // yyyy-MM-dd
  quoteText: string;
  quoteAuthor: string;
  isQuoteLocked?: boolean;
  dayNotes?: string;
  lastModified?: number;
}

export interface HourBlockEntity {
  id: number;
  date: string; // yyyy-MM-dd
  hour: number; // 0 to 23
  minute: number; // 0 or 30
  durationMinutes: number; // 30, 60, 90, 120, etc.
  title: string; // empty string means available / unscheduled
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  durationHours: number;
  isCompleted: boolean;
  reviewLog: string;
  updatedAt: number;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  conflictingHours: number[];
  totalScheduledHours: number;
}

export interface CategoryAccomplishment {
  category: string;
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

export interface SkippedTaskSummary {
  title: string;
  category: string;
  skippedCount: number;
  totalScheduled: number;
  skipRatePercentage: number;
}

export interface DailyPerformancePoint {
  date: string; // yyyy-MM-dd
  shortLabel: string; // MM/dd
  dayOfWeek: string; // Mon, Tue, etc.
  completedCount: number;
  totalCount: number;
  completionRate: number; // 0..100
}

export interface PerformanceReport {
  timelineDays: number;
  overallCompletionRate: number;
  totalTasksScheduled: number;
  totalTasksCompleted: number;
  topAccomplishedTaskTypes: CategoryAccomplishment[];
  mostFrequentlySkippedTasks: SkippedTaskSummary[];
  dailyTrend: DailyPerformancePoint[];
  currentStreak: number;
  bestDayCompletionRate: number;
}

export type DayLedgerScreen = 'TIMELINE' | 'PERFORMANCE_REPORTS' | 'AUDIT_ARCHIVE';
