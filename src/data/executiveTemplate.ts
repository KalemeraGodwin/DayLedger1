import { HourBlockEntity } from '../types/dayledger';

export const CATEGORIES = [
  'Executive Strategy',
  'Deep Work',
  'Operations',
  'Client Briefing',
  'Health & Wellness',
  'Rest & Recovery',
  'Personal Development',
] as const;

export const QUOTES: Array<[string, string]> = [
  ["At dawn, when you have trouble getting out of bed, tell yourself: 'I have to go to work — as a human being.'", "Marcus Aurelius"],
  ["Deciding what not to do is as important as deciding what to do.", "Steve Jobs"],
  ["Efficiency is doing things right; effectiveness is doing the right things.", "Peter Drucker"],
  ["The difference between successful people and really successful people is that really successful people say no to almost everything.", "Warren Buffett"],
  ["Our industry does not respect tradition — it only respects innovation.", "Satya Nadella"],
  ["It is not that we have so little time, but that we lose so much of it.", "Seneca"],
  ["Discipline equals freedom.", "Jocko Willink"],
  ["Amateurs talk about tactics, but professionals study logistics.", "Gen. Robert H. Barrow"],
  ["Focus is a muscle. The more you protect it, the sharper your execution becomes.", "DayLedger Executive Codex"],
  ["Simplicity is the prerequisite for reliability.", "Edsger W. Dijkstra"]
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailyQuoteForDate(date: string): [string, string] {
  const hash = stringHash(date);
  const index = hash % QUOTES.length;
  return QUOTES[index];
}

/**
 * Creates clean 24-hour canvas of available slots with NO pre-filled tasks.
 */
export function generateEmpty24HourSlots(date: string): HourBlockEntity[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    id: Date.now() + hour,
    date,
    hour,
    minute: 0,
    durationMinutes: 60,
    title: '',
    category: 'General',
    priority: 'MEDIUM',
    durationHours: 1,
    isCompleted: false,
    reviewLog: '',
    updatedAt: Date.now(),
  }));
}

/**
 * Pre-set executive routine that can be loaded on demand.
 */
export function generateExecutiveRoutineTemplate(date: string): HourBlockEntity[] {
  const schedule: Array<[number, string, string]> = [
    [0, "Deep Sleep Protocol & REM Recovery", "Rest & Recovery"],
    [1, "Deep Sleep & Cellular Regeneration", "Rest & Recovery"],
    [2, "Circadian Low Core Body Temp Sleep", "Rest & Recovery"],
    [3, "Memory Consolidation Phase Sleep", "Rest & Recovery"],
    [4, "Early Dawn Slumber & Fasting Window", "Rest & Recovery"],
    [5, "Executive Awakening, Hydration & Light Exposure", "Health & Wellness"],
    [6, "Cold Shower, Meditation & Physical Conditioning", "Health & Wellness"],
    [7, "Strategic Objectives Audit & High-Priority Alignment", "Executive Strategy"],
    [8, "Deep Focus Block I: High-Leverage Architecture", "Deep Work"],
    [9, "Deep Focus Block II: Core Engineering & Capital Allocation", "Deep Work"],
    [10, "Executive Standup & Leadership Synchronization", "Operations"],
    [11, "Deep Focus Block III: Milestone Execution", "Deep Work"],
    [12, "Nutritional Protocol, Fasting Break & Brisk Walk", "Health & Wellness"],
    [13, "Stakeholder Review & High-Stakes Negotiations", "Client Briefing"],
    [14, "Tactical Operations & Team Delegation Sync", "Operations"],
    [15, "Deep Focus Block IV: System Innovation & Synthesis", "Deep Work"],
    [16, "Client Strategy & Advisory Board Synchronization", "Client Briefing"],
    [17, "Ledger Reconcile, Daily Audit & Metric Logging", "Operations"],
    [18, "Zone 2 Cardio, Strength Protocol & Mobility", "Health & Wellness"],
    [19, "Family Dinner, Social Connection & Executive Downtime", "Personal Development"],
    [20, "Digital Sunset, Screen Shutdown & Ambient Lighting", "Rest & Recovery"],
    [21, "Strategic Reading, Executive Journaling & Philosophy", "Personal Development"],
    [22, "Sleep Chamber Priming & Mindful Wind Down", "Rest & Recovery"],
    [23, "Full System Shutdown & Sleep Initiation", "Rest & Recovery"]
  ];

  return schedule.map(([hour, title, category]) => {
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (hour >= 7 && hour <= 11) {
      priority = 'HIGH';
    } else if (hour >= 13 && hour <= 16) {
      priority = 'MEDIUM';
    }

    return {
      id: Date.now() + hour,
      date,
      hour,
      minute: 0,
      durationMinutes: 60,
      title,
      category,
      priority,
      durationHours: 1,
      isCompleted: false,
      reviewLog: '',
      updatedAt: Date.now(),
    };
  });
}
