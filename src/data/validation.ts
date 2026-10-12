import { HourBlockEntity, ValidationResult } from '../types/dayledger';

export function formatBlockStartTime(block: HourBlockEntity): string {
  return `${String(block.hour).padStart(2, '0')}:${String(block.minute).padStart(2, '0')}`;
}

export function formatBlockEndTime(block: HourBlockEntity): string {
  const startMin = block.hour * 60 + block.minute;
  const endMin = startMin + block.durationMinutes;
  const endH = Math.min(Math.floor(endMin / 60), 24);
  const endM = endMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function validateTimeline(blocks: HourBlockEntity[]): ValidationResult {
  const warnings: string[] = [];
  const conflictingHours = new Set<number>();

  const scheduledTasks = blocks
    .filter((b) => b.title.trim().length > 0)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

  if (scheduledTasks.length === 0) {
    return {
      isValid: true,
      warnings: [],
      conflictingHours: [],
      totalScheduledHours: 24,
    };
  }

  let totalScheduledMinutes = 0;

  for (let i = 0; i < scheduledTasks.length; i++) {
    const current = scheduledTasks[i];
    const start = current.hour * 60 + current.minute;
    const duration = Math.max(current.durationMinutes, 30);
    const end = start + duration;
    totalScheduledMinutes += duration;

    // Check clipping 24-hour cycle (1440 minutes)
    if (end > 1440) {
      conflictingHours.add(current.hour);
      warnings.push(
        `Task '${current.title}' (${formatBlockStartTime(current)}) extends until ${formatBlockEndTime(current)}, clipping past midnight (24:00).`
      );
    }

    // Check overlaps with subsequent scheduled tasks
    for (let j = i + 1; j < scheduledTasks.length; j++) {
      const next = scheduledTasks[j];
      const nextStart = next.hour * 60 + next.minute;
      if (nextStart < end) {
        conflictingHours.add(current.hour);
        conflictingHours.add(next.hour);
        warnings.push(
          `Collision: '${current.title}' (${formatBlockStartTime(current)}–${formatBlockEndTime(current)}) overlaps with '${next.title}' (${formatBlockStartTime(next)}).`
        );
      }
    }
  }

  if (totalScheduledMinutes > 1440) {
    const totalH = Math.floor(totalScheduledMinutes / 60);
    const totalM = totalScheduledMinutes % 60;
    warnings.push(`Total scheduled task time (${totalH}h ${totalM}m) exceeds the 24-hour limit.`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    conflictingHours: Array.from(conflictingHours),
    totalScheduledHours: Math.ceil(totalScheduledMinutes / 60),
  };
}
