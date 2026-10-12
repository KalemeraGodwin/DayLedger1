import {
  PerformanceReport,
  CategoryAccomplishment,
  SkippedTaskSummary,
  DailyPerformancePoint,
  HourBlockEntity,
} from '../types/dayledger';
import { getHourBlocks, formatDateString } from './storage';

export function compileReport(daysCount: number = 30): PerformanceReport {
  const endDateObj = new Date();
  const startDateObj = new Date(endDateObj);
  startDateObj.setDate(endDateObj.getDate() - (daysCount - 1));

  const allBlocks: HourBlockEntity[] = [];

  const cursor = new Date(startDateObj);
  while (cursor <= endDateObj) {
    const dateStr = formatDateString(cursor);
    const dayBlocks = getHourBlocks(dateStr);
    allBlocks.push(...dayBlocks);
    cursor.setDate(cursor.getDate() + 1);
  }

  const scheduledTasks = allBlocks.filter((b) => b.title.trim().length > 0);

  if (scheduledTasks.length === 0) {
    return {
      timelineDays: daysCount,
      overallCompletionRate: 0,
      totalTasksScheduled: 0,
      totalTasksCompleted: 0,
      topAccomplishedTaskTypes: [],
      mostFrequentlySkippedTasks: [],
      dailyTrend: [],
      currentStreak: 0,
      bestDayCompletionRate: 0,
    };
  }

  const totalTasksScheduled = scheduledTasks.length;
  const totalTasksCompleted = scheduledTasks.filter((b) => b.isCompleted).length;
  const overallCompletionRate = totalTasksScheduled > 0
    ? (totalTasksCompleted / totalTasksScheduled) * 100
    : 0;

  // Category stats
  const catMap = new Map<string, { completed: number; total: number }>();
  for (const t of scheduledTasks) {
    const entry = catMap.get(t.category) || { completed: 0, total: 0 };
    entry.total += 1;
    if (t.isCompleted) entry.completed += 1;
    catMap.set(t.category, entry);
  }

  const categoryAccomplishments: CategoryAccomplishment[] = Array.from(catMap.entries())
    .map(([cat, counts]) => ({
      category: cat,
      completedCount: counts.completed,
      totalCount: counts.total,
      completionPercentage: counts.total > 0 ? (counts.completed / counts.total) * 100 : 0,
    }))
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 3);

  // Skipped tasks stats
  const skippedTasks = scheduledTasks.filter((b) => !b.isCompleted);
  const skippedMap = new Map<string, { category: string; skipped: number; total: number }>();

  for (const t of skippedTasks) {
    const cleanTitle = t.title.trim();
    const entry = skippedMap.get(cleanTitle) || { category: t.category, skipped: 0, total: 0 };
    entry.skipped += 1;
    skippedMap.set(cleanTitle, entry);
  }

  for (const [title, entry] of skippedMap.entries()) {
    entry.total = scheduledTasks.filter((b) => b.title.trim() === title).length;
  }

  const mostFrequentlySkippedTasks: SkippedTaskSummary[] = Array.from(skippedMap.entries())
    .map(([title, entry]) => ({
      title,
      category: entry.category,
      skippedCount: entry.skipped,
      totalScheduled: entry.total,
      skipRatePercentage: entry.total > 0 ? (entry.skipped / entry.total) * 100 : 100,
    }))
    .sort((a, b) => b.skippedCount - a.skippedCount)
    .slice(0, 5);

  // Daily trend
  const dailyPoints: DailyPerformancePoint[] = [];
  const tasksByDate = new Map<string, HourBlockEntity[]>();
  for (const t of scheduledTasks) {
    const list = tasksByDate.get(t.date) || [];
    list.push(t);
    tasksByDate.set(t.date, list);
  }

  let bestRate = 0;
  const loopDate = new Date(startDateObj);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  while (loopDate <= endDateObj) {
    const dateStr = formatDateString(loopDate);
    const dayTasks = tasksByDate.get(dateStr) || [];
    const completedCount = dayTasks.filter((t) => t.isCompleted).length;
    const totalCount = dayTasks.length;
    const dayRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    if (dayRate > bestRate) {
      bestRate = dayRate;
    }

    const m = String(loopDate.getMonth() + 1).padStart(2, '0');
    const d = String(loopDate.getDate()).padStart(2, '0');

    dailyPoints.push({
      date: dateStr,
      shortLabel: `${m}/${d}`,
      dayOfWeek: daysOfWeek[loopDate.getDay()],
      completedCount,
      totalCount,
      completionRate: dayRate,
    });

    loopDate.setDate(loopDate.getDate() + 1);
  }

  // Streak calculation: working backwards from latest day
  let streak = 0;
  for (let i = dailyPoints.length - 1; i >= 0; i--) {
    const pt = dailyPoints[i];
    if (pt.totalCount > 0 && pt.completionRate >= 40) {
      streak += 1;
    } else if (pt.totalCount > 0) {
      break;
    }
  }

  return {
    timelineDays: daysCount,
    overallCompletionRate,
    totalTasksScheduled,
    totalTasksCompleted,
    topAccomplishedTaskTypes: categoryAccomplishments,
    mostFrequentlySkippedTasks,
    dailyTrend: dailyPoints,
    currentStreak: streak,
    bestDayCompletionRate: bestRate,
  };
}
