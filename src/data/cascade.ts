import { HourBlockEntity } from '../types/dayledger';

export function formatStartTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatEndTime(hour: number, minute: number, durationMinutes: number): string {
  const startMin = hour * 60 + minute;
  const endMin = startMin + durationMinutes;
  const endH = Math.min(Math.floor(endMin / 60), 24);
  const endM = endMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function formatDuration(durationMinutes: number): string {
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${m} min`;
}

/**
 * Saves or updates a task with automatic chronological cascading with 30-minute granularity.
 * Reconstructs continuous 24-hour feed (0 to 1440 minutes).
 */
export function cascadeSchedule(
  date: string,
  existingBlocks: HourBlockEntity[],
  updatedBlock: HourBlockEntity,
  autoChainNext: boolean = true
): HourBlockEntity[] {
  const startMin = updatedBlock.hour * 60 + updatedBlock.minute;
  const oldBlock = existingBlocks.find(
    (b) => (updatedBlock.id !== 0 && b.id === updatedBlock.id) ||
           (b.hour * 60 + b.minute === startMin && b.date === date)
  );

  const oldDuration = oldBlock?.durationMinutes ?? 60;
  const newDuration = Math.max(updatedBlock.durationMinutes, 30);
  const oldEndMin = startMin + oldDuration;
  const newEndMin = startMin + newDuration;
  const addedMinutes = newDuration - oldDuration;

  // Extract all other scheduled tasks
  const otherScheduledTasks = existingBlocks
    .filter((b) => b.id !== updatedBlock.id && b.title.trim().length > 0 && (b.hour * 60 + b.minute) !== startMin)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))
    .map((b) => ({ ...b }));

  if (addedMinutes > 0 || autoChainNext) {
    let currentChainEnd = newEndMin;

    for (let i = 0; i < otherScheduledTasks.length; i++) {
      const task = otherScheduledTasks[i];
      const taskStartMin = task.hour * 60 + task.minute;

      if (taskStartMin >= startMin) {
        const wasAdjacent = taskStartMin === oldEndMin;
        const isOverlapped = taskStartMin < currentChainEnd;

        if (wasAdjacent || isOverlapped) {
          const shiftedStart = currentChainEnd;
          const shiftedH = Math.floor(shiftedStart / 60);
          const shiftedM = shiftedStart % 60;

          otherScheduledTasks[i] = {
            ...task,
            hour: shiftedH,
            minute: shiftedM,
            updatedAt: Date.now(),
          };

          currentChainEnd = shiftedStart + Math.max(task.durationMinutes, 30);
        }
      }
    }
  }

  const allScheduledTasks = [
    ...otherScheduledTasks,
    {
      ...updatedBlock,
      hour: Math.floor(startMin / 60),
      minute: startMin % 60,
      durationMinutes: newDuration,
      durationHours: Math.ceil(newDuration / 60),
      updatedAt: Date.now(),
    },
  ]
    .filter((b) => b.title.trim().length > 0)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

  // Preserve review logs by start minute
  const existingLogs = new Map<number, string>();
  for (const b of existingBlocks) {
    existingLogs.set(b.hour * 60 + b.minute, b.reviewLog);
  }

  // Reconstruct continuous 24-hour feed (0 to 1440 minutes)
  const reconstructedFeed: HourBlockEntity[] = [];
  let cursorMin = 0;

  while (cursorMin < 1440) {
    const taskAtCursor = allScheduledTasks.find((t) => t.hour * 60 + t.minute === cursorMin);
    if (taskAtCursor) {
      reconstructedFeed.push(taskAtCursor);
      cursorMin += Math.max(taskAtCursor.durationMinutes, 30);
    } else {
      const nextTask = allScheduledTasks.find((t) => t.hour * 60 + t.minute > cursorMin);
      const nextStopMin = nextTask ? (nextTask.hour * 60 + nextTask.minute) : 1440;

      const stepMin = (cursorMin % 60 !== 0)
        ? Math.min(60 - (cursorMin % 60), nextStopMin - cursorMin)
        : Math.min(60, nextStopMin - cursorMin);

      const slotH = Math.floor(cursorMin / 60);
      const slotM = cursorMin % 60;
      const log = existingLogs.get(cursorMin) || '';

      reconstructedFeed.push({
        id: Date.now() + cursorMin,
        date,
        hour: slotH,
        minute: slotM,
        durationMinutes: stepMin,
        durationHours: Math.ceil(stepMin / 60),
        title: '',
        category: 'General',
        priority: 'MEDIUM',
        isCompleted: false,
        reviewLog: log,
        updatedAt: Date.now(),
      });

      cursorMin += stepMin;
    }
  }

  // Any tasks pushed past midnight
  const beyondMidnight = allScheduledTasks.filter((t) => t.hour * 60 + t.minute >= 1440);
  reconstructedFeed.push(...beyondMidnight);

  return reconstructedFeed;
}

export function clearTaskCascade(date: string, existingBlocks: HourBlockEntity[], blockToClear: HourBlockEntity): HourBlockEntity[] {
  const blockStartMin = blockToClear.hour * 60 + blockToClear.minute;
  const remainingTasks = existingBlocks
    .filter((b) => b.id !== blockToClear.id && (b.hour * 60 + b.minute) !== blockStartMin && b.title.trim().length > 0)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

  const existingLogs = new Map<number, string>();
  for (const b of existingBlocks) {
    existingLogs.set(b.hour * 60 + b.minute, b.reviewLog);
  }

  const reconstructedFeed: HourBlockEntity[] = [];
  let cursorMin = 0;

  while (cursorMin < 1440) {
    const taskAtCursor = remainingTasks.find((t) => t.hour * 60 + t.minute === cursorMin);
    if (taskAtCursor) {
      reconstructedFeed.push(taskAtCursor);
      cursorMin += Math.max(taskAtCursor.durationMinutes, 30);
    } else {
      const nextTask = remainingTasks.find((t) => t.hour * 60 + t.minute > cursorMin);
      const nextStopMin = nextTask ? (nextTask.hour * 60 + nextTask.minute) : 1440;

      const stepMin = (cursorMin % 60 !== 0)
        ? Math.min(60 - (cursorMin % 60), nextStopMin - cursorMin)
        : Math.min(60, nextStopMin - cursorMin);

      const slotH = Math.floor(cursorMin / 60);
      const slotM = cursorMin % 60;
      const log = existingLogs.get(cursorMin) || (cursorMin === blockStartMin ? blockToClear.reviewLog : '');

      reconstructedFeed.push({
        id: Date.now() + cursorMin,
        date,
        hour: slotH,
        minute: slotM,
        durationMinutes: stepMin,
        durationHours: Math.ceil(stepMin / 60),
        title: '',
        category: 'General',
        priority: 'MEDIUM',
        isCompleted: false,
        reviewLog: log,
        updatedAt: Date.now(),
      });

      cursorMin += stepMin;
    }
  }

  const beyondMidnight = remainingTasks.filter((t) => t.hour * 60 + t.minute >= 1440);
  reconstructedFeed.push(...beyondMidnight);

  return reconstructedFeed;
}
