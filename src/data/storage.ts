import { DayPlanEntity, HourBlockEntity } from '../types/dayledger';
import { getDailyQuoteForDate, generateEmpty24HourSlots, generateExecutiveRoutineTemplate } from './executiveTemplate';

const STORAGE_PREFIX = 'dayledger_';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isDateInPast(dateStr: string, todayStr: string = getTodayDateString()): boolean {
  return dateStr < todayStr;
}

export function getDayPlan(date: string): DayPlanEntity | null {
  const key = `${STORAGE_PREFIX}plan_${date}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveDayPlan(plan: DayPlanEntity): void {
  const key = `${STORAGE_PREFIX}plan_${plan.date}`;
  localStorage.setItem(key, JSON.stringify(plan));
}

export function getHourBlocks(date: string): HourBlockEntity[] {
  const key = `${STORAGE_PREFIX}blocks_${date}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveHourBlocks(date: string, blocks: HourBlockEntity[]): void {
  const key = `${STORAGE_PREFIX}blocks_${date}`;
  localStorage.setItem(key, JSON.stringify(blocks));
}

export function ensureDayInitialized(date: string): void {
  const today = getTodayDateString();
  const isPast = isDateInPast(date, today);

  const existingPlan = getDayPlan(date);
  if (!existingPlan) {
    const [quote, author] = getDailyQuoteForDate(date);
    saveDayPlan({
      date,
      quoteText: quote,
      quoteAuthor: author,
      isQuoteLocked: isPast,
      lastModified: Date.now(),
    });
  } else if (isPast && !existingPlan.isQuoteLocked) {
    saveDayPlan({
      ...existingPlan,
      isQuoteLocked: true,
      lastModified: Date.now(),
    });
  }

  const existingBlocks = getHourBlocks(date);
  if (existingBlocks.length === 0) {
    const emptySlots = generateEmpty24HourSlots(date);
    saveHourBlocks(date, emptySlots);
  }
}

export function clearAllTasksForDate(date: string): void {
  const emptySlots = generateEmpty24HourSlots(date);
  saveHourBlocks(date, emptySlots);
}

export function loadExecutiveTemplateForDate(date: string): void {
  const templateBlocks = generateExecutiveRoutineTemplate(date);
  saveHourBlocks(date, templateBlocks);
}

export function updateDayQuote(date: string, quoteText: string, quoteAuthor: string): void {
  const today = getTodayDateString();
  if (isDateInPast(date, today)) return;

  saveDayPlan({
    date,
    quoteText,
    quoteAuthor,
    isQuoteLocked: false,
    lastModified: Date.now(),
  });
}

/**
 * Seeds historical records if the database is fresh.
 * Today is left clean for the user.
 */
export function seedHistoricalLedgerIfEmpty(): void {
  const isInitialized = localStorage.getItem(`${STORAGE_PREFIX}seeded_history_v1`);
  if (isInitialized) return;

  const todayDate = new Date();
  
  // Seed past 28 days
  for (let i = 1; i <= 28; i++) {
    const pastDateObj = new Date(todayDate);
    pastDateObj.setDate(todayDate.getDate() - i);
    const pastDateStr = formatDateString(pastDateObj);

    const [quote, author] = getDailyQuoteForDate(pastDateStr);
    saveDayPlan({
      date: pastDateStr,
      quoteText: quote,
      quoteAuthor: author,
      isQuoteLocked: true,
      dayNotes: 'Historical ledger audited.',
      lastModified: Date.now(),
    });

    const template = generateExecutiveRoutineTemplate(pastDateStr);
    // Pseudo random generator with deterministic seed based on day offset
    const pastBlocks = template.map((block) => {
      const seedVal = ((i * 37 + block.hour * 19) % 100) / 100;
      let shouldComplete = false;

      if (block.hour >= 0 && block.hour <= 4) {
        shouldComplete = true;
      } else if (block.hour >= 7 && block.hour <= 11) {
        shouldComplete = seedVal > 0.15;
      } else if (block.hour >= 12 && block.hour <= 14) {
        shouldComplete = seedVal > 0.30;
      } else if (block.hour >= 15 && block.hour <= 17) {
        shouldComplete = seedVal > 0.25;
      } else if (block.hour === 18) {
        shouldComplete = seedVal > 0.40;
      } else if (block.hour === 20) {
        shouldComplete = seedVal > 0.45;
      } else {
        shouldComplete = seedVal > 0.25;
      }

      const sampleLog = (shouldComplete && [7, 8, 10, 13, 17].includes(block.hour))
        ? 'Executive Log: Accomplished key milestone. Deliverables aligned with quarterly objectives.'
        : '';

      return {
        ...block,
        isCompleted: shouldComplete,
        reviewLog: sampleLog,
      };
    });

    saveHourBlocks(pastDateStr, pastBlocks);
  }

  localStorage.setItem(`${STORAGE_PREFIX}seeded_history_v1`, 'true');
}
