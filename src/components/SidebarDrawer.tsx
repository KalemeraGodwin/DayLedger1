import React from 'react';
import {
  Shield,
  Clock,
  BarChart3,
  Calendar,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { DayLedgerScreen } from '../types/dayledger';

interface SidebarDrawerProps {
  isOpen: boolean;
  currentScreen: DayLedgerScreen;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectScreen: (screen: DayLedgerScreen) => void;
  onToggleTheme: () => void;
  onClearDay: () => void;
  onLoadTemplate: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  currentScreen,
  isDarkMode,
  onClose,
  onSelectScreen,
  onToggleTheme,
  onClearDay,
  onLoadTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        data-testid="sidebar_navigation_drawer"
        className="relative flex flex-col w-[320px] max-w-[85vw] h-full bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-[#1E293B] shadow-2xl p-5 z-10 overflow-y-auto"
      >
        {/* Close Button on Mobile */}
        <button
          onClick={onClose}
          aria-label="Close Drawer"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Corporate Header */}
        <div className="flex items-center gap-3 pt-2 pb-5">
          <div className="w-11 h-11 rounded-lg bg-[#0A192F] border border-[#D4AF37] flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-slate-900 dark:text-white">
              DAYLEDGER
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Executive 24-Hour Codex
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-[#1E293B] my-2" />

        {/* Navigation Console */}
        <div className="mt-4">
          <h2 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">
            NAVIGATION CONSOLE
          </h2>

          <div className="space-y-2">
            {/* Timeline */}
            <button
              onClick={() => {
                onSelectScreen('TIMELINE');
                onClose();
              }}
              data-testid="drawer_nav_timeline"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left border transition-all ${
                currentScreen === 'TIMELINE'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/50 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-[#1F2937]/50 border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1F2937]'
              }`}
            >
              <Clock
                className={`w-5 h-5 ${
                  currentScreen === 'TIMELINE' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`}
              />
              <div>
                <div className="font-semibold text-sm">24-Hour Day Ledger</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous 24h timeline & diary
                </div>
              </div>
            </button>

            {/* Performance Reports */}
            <button
              onClick={() => {
                onSelectScreen('PERFORMANCE_REPORTS');
                onClose();
              }}
              data-testid="drawer_nav_reports"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left border transition-all ${
                currentScreen === 'PERFORMANCE_REPORTS'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/50 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-[#1F2937]/50 border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1F2937]'
              }`}
            >
              <BarChart3
                className={`w-5 h-5 ${
                  currentScreen === 'PERFORMANCE_REPORTS' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`}
              />
              <div>
                <div className="font-semibold text-sm">Performance Reports</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  30-day analytics & completion trends
                </div>
              </div>
            </button>

            {/* Audit Archive */}
            <button
              onClick={() => {
                onSelectScreen('AUDIT_ARCHIVE');
                onClose();
              }}
              data-testid="drawer_nav_archive"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left border transition-all ${
                currentScreen === 'AUDIT_ARCHIVE'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/50 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-[#1F2937]/50 border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1F2937]'
              }`}
            >
              <Calendar
                className={`w-5 h-5 ${
                  currentScreen === 'AUDIT_ARCHIVE' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`}
              />
              <div>
                <div className="font-semibold text-sm">Audit Archive</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Historical dates & locked review audit
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-[#1E293B] my-5" />

        {/* Executive Controls */}
        <div>
          <h2 className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">
            EXECUTIVE CONTROLS
          </h2>

          <div className="space-y-3">
            {/* Theme Toggle */}
            <div
              onClick={onToggleTheme}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-[#1F2937] cursor-pointer hover:bg-slate-200/70 dark:hover:bg-[#1F2937]/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-[#D4AF37]" />
                ) : (
                  <Sun className="w-5 h-5 text-blue-600" />
                )}
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {isDarkMode ? 'Obsidian Navy' : 'Canvas White'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isDarkMode ? 'Dark Theme Active' : 'Light Theme Active'}
                  </div>
                </div>
              </div>

              {/* Pill Switch */}
              <button
                type="button"
                data-testid="drawer_theme_switch"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isDarkMode ? 'bg-[#0A192F]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-5 !bg-[#D4AF37]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Clear Schedule */}
            <button
              onClick={() => {
                onClearDay();
                onClose();
              }}
              data-testid="drawer_clear_day_button"
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1F2937] text-left transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  Clear Schedule
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Start clean with all 24 slots open
                </div>
              </div>
            </button>

            {/* Load Routine Template */}
            <button
              onClick={() => {
                onLoadTemplate();
                onClose();
              }}
              data-testid="drawer_load_template_button"
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1F2937] text-left transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  Load Routine Template
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-fill standard executive blueprint
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#1F2937]/70 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-600" />
              OFFLINE DATABASE ENCRYPTED
            </div>
            <div>
              100% On-Device Storage • Zero external cloud dependency.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
