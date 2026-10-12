import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';

interface TopCorporateStatusBarProps {
  currentTime: string;
  currentDate: string;
  currentHour: number;
  isDarkMode: boolean;
  onMenuClick: () => void;
  onToggleTheme: () => void;
}

export const TopCorporateStatusBar: React.FC<TopCorporateStatusBarProps> = ({
  currentTime,
  currentDate,
  currentHour,
  isDarkMode,
  onMenuClick,
  onToggleTheme,
}) => {
  const nextHour = (currentHour + 1) % 24;
  const hourStr = `${String(currentHour).padStart(2, '0')}:00 - ${String(nextHour).padStart(2, '0')}:00`;

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#030712] border-b border-slate-200 dark:border-[#1E293B] shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Top Controls Row */}
        <div className="flex items-center justify-between">
          {/* Menu Drawer Button */}
          <button
            onClick={onMenuClick}
            data-testid="menu_drawer_button"
            aria-label="Open Navigation Drawer"
            className="p-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111827] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Real-time System Clock & Full Date */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span
                data-testid="live_clock_display"
                className="font-bold text-xl md:text-2xl tracking-wider text-slate-900 dark:text-white font-mono"
              >
                {currentTime}
              </span>
            </div>
            <span className="text-[11px] font-medium tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">
              {currentDate}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            data-testid="theme_toggle_button"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111827] transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Active Hour Telemetry Banner */}
        <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#111827] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] tracking-wider uppercase">
              ACTIVE SLOT
            </span>
            <span className="font-semibold text-blue-600 dark:text-[#38BDF8] font-mono">
              {hourStr}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400" />
            LIVE TICKER
          </div>
        </div>
      </div>
    </header>
  );
};
