import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DayLedgerScreen,
  HourBlockEntity,
  DayPlanEntity,
  ValidationResult,
  PerformanceReport,
} from './types/dayledger';
import {
  getTodayDateString,
  formatDateString,
  parseDateString,
  isDateInPast,
  getDayPlan,
  getHourBlocks,
  saveHourBlocks,
  ensureDayInitialized,
  seedHistoricalLedgerIfEmpty,
  clearAllTasksForDate,
  loadExecutiveTemplateForDate,
  updateDayQuote,
} from './data/storage';
import { cascadeSchedule, clearTaskCascade } from './data/cascade';
import { validateTimeline } from './data/validation';
import { compileReport } from './data/analytics';
import { TopCorporateStatusBar } from './components/TopCorporateStatusBar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { TimelineScreen } from './components/TimelineScreen';
import { PerformanceReportsScreen } from './components/PerformanceReportsScreen';
import { AuditArchiveScreen } from './components/AuditArchiveScreen';
import { EditHourBlockModal } from './components/EditHourBlockModal';
import { DatePickerModal } from './components/DatePickerModal';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dayledger_is_dark_mode');
    return saved !== null ? saved === 'true' : true; // Default dark / executive theme
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dayledger_is_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Screen & Navigation State
  const [currentScreen, setCurrentScreen] = useState<DayLedgerScreen>('TIMELINE');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dates & Live Clock
  const todayDateString = useMemo(() => getTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateString);

  const [currentTimeString, setCurrentTimeString] = useState<string>('00:00:00');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeString(`${h}:${m}:${s}`);
      setCurrentHour(now.getHours());

      setCurrentDateFormatted(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize DB & Seed History
  useEffect(() => {
    ensureDayInitialized(todayDateString);
    seedHistoricalLedgerIfEmpty();
  }, [todayDateString]);

  // Ledger state for selected date
  const [hourBlocks, setHourBlocks] = useState<HourBlockEntity[]>([]);
  const [dayPlan, setDayPlan] = useState<DayPlanEntity | null>(null);

  const reloadLedger = useCallback((date: string) => {
    ensureDayInitialized(date);
    const plan = getDayPlan(date);
    const blocks = getHourBlocks(date);
    setDayPlan(plan);
    setHourBlocks(blocks);
  }, []);

  useEffect(() => {
    reloadLedger(selectedDate);
  }, [selectedDate, reloadLedger]);

  // Validation Result
  const validationResult: ValidationResult = useMemo(() => {
    return validateTimeline(hourBlocks);
  }, [hourBlocks]);

  // Performance Report State
  const [reportDaysFilter, setReportDaysFilter] = useState<number>(30);
  const performanceReport: PerformanceReport = useMemo(() => {
    return compileReport(reportDaysFilter);
  }, [reportDaysFilter, hourBlocks]);

  // Dialog & Edit States
  const [editingBlock, setEditingBlock] = useState<HourBlockEntity | null>(null);
  const [editingLogBlockId, setEditingLogBlockId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const isSelectedDateInPast = useCallback(() => {
    return isDateInPast(selectedDate, todayDateString);
  }, [selectedDate, todayDateString]);

  // Navigation handlers
  const handleSelectDate = useCallback((date: string) => {
    setEditingLogBlockId(null);
    setSelectedDate(date);
  }, []);

  const handlePreviousDay = useCallback(() => {
    setEditingLogBlockId(null);
    const cur = parseDateString(selectedDate);
    cur.setDate(cur.getDate() - 1);
    setSelectedDate(formatDateString(cur));
  }, [selectedDate]);

  const handleNextDay = useCallback(() => {
    setEditingLogBlockId(null);
    const cur = parseDateString(selectedDate);
    cur.setDate(cur.getDate() + 1);
    setSelectedDate(formatDateString(cur));
  }, [selectedDate]);

  const handleGoToToday = useCallback(() => {
    setEditingLogBlockId(null);
    setSelectedDate(todayDateString);
  }, [todayDateString]);

  // CRUD Operations
  const handleToggleCompletion = useCallback(
    (block: HourBlockEntity) => {
      setEditingLogBlockId(null);
      if (isSelectedDateInPast()) {
        showToast(
          'Historical Archive is Frozen: Task actions are read-only. Hourly diary logs remain editable.'
        );
        return;
      }

      const updated = hourBlocks.map((b) =>
        b.id === block.id ? { ...b, isCompleted: !b.isCompleted, updatedAt: Date.now() } : b
      );
      setHourBlocks(updated);
      saveHourBlocks(selectedDate, updated);
    },
    [isSelectedDateInPast, hourBlocks, selectedDate, showToast]
  );

  const handleSaveOrUpdateBlock = useCallback(
    (block: HourBlockEntity) => {
      if (isSelectedDateInPast()) {
        showToast('Historical Archive is Frozen: Cannot modify scheduled slots for past dates.');
        return;
      }

      const cascaded = cascadeSchedule(selectedDate, hourBlocks, block, true);
      setHourBlocks(cascaded);
      saveHourBlocks(selectedDate, cascaded);
      setEditingBlock(null);

      if (block.durationMinutes > 60) {
        showToast(
          `Task scheduled (${block.durationHours} hrs). Subsequent slots automatically synchronized.`
        );
      } else {
        showToast('Task successfully scheduled.');
      }
    },
    [isSelectedDateInPast, selectedDate, hourBlocks, showToast]
  );

  const handleClearTask = useCallback(
    (block: HourBlockEntity) => {
      if (isSelectedDateInPast()) {
        showToast('Historical Archive is Frozen: Cannot modify slots for past dates.');
        return;
      }

      const cleared = clearTaskCascade(selectedDate, hourBlocks, block);
      setHourBlocks(cleared);
      saveHourBlocks(selectedDate, cleared);
      setEditingBlock(null);
      showToast(`Task removed. Hour ${block.hour}:00 is now available.`);
    },
    [isSelectedDateInPast, selectedDate, hourBlocks, showToast]
  );

  const handleClearAllTasksForToday = useCallback(() => {
    if (isSelectedDateInPast()) {
      showToast('Cannot reset past ledger records.');
      return;
    }

    clearAllTasksForDate(selectedDate);
    reloadLedger(selectedDate);
    showToast('24-Hour Timeline cleared. All 24 slots are ready for your custom tasks.');
  }, [isSelectedDateInPast, selectedDate, reloadLedger, showToast]);

  const handleLoadExecutiveTemplate = useCallback(() => {
    if (isSelectedDateInPast()) {
      showToast('Cannot load templates onto past dates.');
      return;
    }

    loadExecutiveTemplateForDate(selectedDate);
    reloadLedger(selectedDate);
    showToast('Executive Blueprint routine loaded.');
  }, [isSelectedDateInPast, selectedDate, reloadLedger, showToast]);

  const handleUpdateReviewLog = useCallback(
    (blockId: number, newLog: string) => {
      const updated = hourBlocks.map((b) =>
        b.id === blockId ? { ...b, reviewLog: newLog, updatedAt: Date.now() } : b
      );
      setHourBlocks(updated);
      saveHourBlocks(selectedDate, updated);
      showToast('Review log debrief saved.');
    },
    [hourBlocks, selectedDate, showToast]
  );

  const handleSaveQuote = useCallback(
    (text: string, author: string) => {
      if (isSelectedDateInPast()) {
        showToast('Security Policy: Daily quotes on past dates are permanently locked.');
        return;
      }

      updateDayQuote(selectedDate, text, author);
      const plan = getDayPlan(selectedDate);
      setDayPlan(plan);
      showToast('Executive directive updated.');
    },
    [isSelectedDateInPast, selectedDate, showToast]
  );

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-[#0F172A] dark:text-[#FFFFFF] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Corporate Status Bar */}
      <TopCorporateStatusBar
        currentTime={currentTimeString}
        currentDate={currentDateFormatted}
        currentHour={currentHour}
        isDarkMode={isDarkMode}
        onMenuClick={() => setIsDrawerOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Navigation Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        currentScreen={currentScreen}
        isDarkMode={isDarkMode}
        onClose={() => setIsDrawerOpen(false)}
        onSelectScreen={(screen) => {
          setCurrentScreen(screen);
          setEditingLogBlockId(null);
        }}
        onToggleTheme={handleToggleTheme}
        onClearDay={handleClearAllTasksForToday}
        onLoadTemplate={handleLoadExecutiveTemplate}
      />

      {/* Main View Port */}
      <main className="flex-1 w-full">
        {currentScreen === 'TIMELINE' && (
          <TimelineScreen
            selectedDate={selectedDate}
            todayDate={todayDateString}
            isPastDate={isSelectedDateInPast()}
            currentHour={currentHour}
            hourBlocks={hourBlocks}
            dayPlan={dayPlan}
            validationResult={validationResult}
            editingLogBlockId={editingLogBlockId}
            onStartEditingLog={(id) => setEditingLogBlockId(id)}
            onStopEditingLog={() => setEditingLogBlockId(null)}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            onGoToToday={handleGoToToday}
            onOpenCalendar={() => setShowDatePicker(true)}
            onToggleCompletion={handleToggleCompletion}
            onEditBlock={(block) => setEditingBlock(block)}
            onClearTask={handleClearTask}
            onUpdateReviewLog={handleUpdateReviewLog}
            onSaveQuote={handleSaveQuote}
          />
        )}

        {currentScreen === 'PERFORMANCE_REPORTS' && (
          <PerformanceReportsScreen
            report={performanceReport}
            currentFilterDays={reportDaysFilter}
            onSelectFilterDays={(days) => setReportDaysFilter(days)}
          />
        )}

        {currentScreen === 'AUDIT_ARCHIVE' && (
          <AuditArchiveScreen
            todayDate={todayDateString}
            onSelectDate={(date) => {
              handleSelectDate(date);
              setCurrentScreen('TIMELINE');
            }}
          />
        )}
      </main>

      {/* Edit / Schedule Task Modal */}
      {editingBlock && (
        <EditHourBlockModal
          block={editingBlock}
          onDismiss={() => setEditingBlock(null)}
          onSave={handleSaveOrUpdateBlock}
          onClearTask={
            editingBlock.title.trim() ? () => handleClearTask(editingBlock) : undefined
          }
        />
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          currentDate={selectedDate}
          onDismiss={() => setShowDatePicker(false)}
          onSelectDate={handleSelectDate}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-xs border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[90vw] text-center">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
