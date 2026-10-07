'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Language } from '@/lib/i18n';
import { Globe } from 'lucide-react';

interface Props {
  variant?: 'cyan' | 'emerald' | 'amber' | 'orange';
  compact?: boolean;
  showIcon?: boolean;
}

export default function LanguageSwitcher({
  compact = false,
  showIcon = false,
}: Props) {
  const { language, setLanguage } = useStore();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'عربي' },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60 ${
        compact ? 'text-[10px]' : 'text-xs'
      } font-semibold select-none shadow-2xs`}
      role="group"
      aria-label="Language selector"
    >
      {showIcon && (
        <div className="pl-2 pr-1 text-slate-400 flex items-center">
          <Globe className="w-3.5 h-3.5" />
        </div>
      )}
      {languages.map((l) => {
        const isActive = language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            aria-pressed={isActive}
            className={`transition-all duration-150 rounded-lg cursor-pointer ${
              compact ? 'px-2 py-0.5' : 'px-2.5 py-1'
            } ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs border border-slate-200/50 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
