import React, { useState } from 'react';
import { Quote, Lock, Sparkles, Edit, Check, X } from 'lucide-react';
import { QUOTES } from '../data/executiveTemplate';

interface ExecutiveQuoteWidgetProps {
  quoteText: string;
  quoteAuthor: string;
  isPastDate: boolean;
  onSaveQuote: (text: string, author: string) => void;
}

export const ExecutiveQuoteWidget: React.FC<ExecutiveQuoteWidgetProps> = ({
  quoteText,
  quoteAuthor,
  isPastDate,
  onSaveQuote,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(quoteText);
  const [author, setAuthor] = useState(quoteAuthor);

  const handleInspire = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    const [qText, qAuthor] = QUOTES[randomIndex];
    setText(qText);
    setAuthor(qAuthor);
    onSaveQuote(qText, qAuthor);
  };

  const handleSave = () => {
    if (text.trim()) {
      onSaveQuote(text.trim(), author.trim() || 'DayLedger Executive Codex');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setText(quoteText);
    setAuthor(quoteAuthor);
    setIsEditing(false);
  };

  return (
    <div
      data-testid="executive_quote_widget"
      className="w-full bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#1E293B] p-4 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Quote className="w-4 h-4" />
          <span className="text-[11px] font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
            EXECUTIVE DIRECTIVE
          </span>
        </div>

        {isPastDate ? (
          <div
            data-testid="locked_quote_badge"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-[#D4AF37] text-[11px] font-bold border border-[#D4AF37]/30"
          >
            <Lock className="w-3 h-3" />
            PERMANENTLY LOCKED
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleInspire}
              title="Generate Executive Inspiration"
              aria-label="Inspire"
              className="p-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {!isEditing && (
              <button
                onClick={() => {
                  setText(quoteText);
                  setAuthor(quoteAuthor);
                  setIsEditing(true);
                }}
                data-testid="edit_quote_button"
                aria-label="Edit Directive"
                className="p-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editing State vs Display State */}
      {isEditing && !isPastDate ? (
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Directive / Quote
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid="quote_text_input"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Plan meticulously, execute ruthlessly."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Author / Attribution
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              data-testid="quote_author_input"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1F2937] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Marcus Aurelius"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-700 dark:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              data-testid="save_quote_button"
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p
            data-testid="quote_display_text"
            className="italic font-medium text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed"
          >
            “{quoteText || 'Plan meticulously, execute ruthlessly.'}”
          </p>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1.5">
            — {quoteAuthor || 'DayLedger Executive Codex'}
          </div>

          {isPastDate && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
              <span>🔒</span> Security rule enforced: Historical day quotes cannot be modified.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
