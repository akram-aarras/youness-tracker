'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Language } from '@/lib/i18n';
import { Globe } from 'lucide-react';

interface Props {
  variant?: 'cyan' | 'emerald' | 'amber';
  compact?: boolean;
  showIcon?: boolean;
}

export default function LanguageSwitcher({
  variant = 'amber',
  compact = false,
  showIcon = false,
}: Props) {
  const { language, setLanguage } = useStore();

  const activeBg =
    variant === 'amber'
      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
      : variant === 'emerald'
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'bg-cyan-600 text-white shadow-sm';

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'عربي' },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-[#130F1A] p-0.5 border border-[#2D253B]/70 ${
        compact ? 'text-[10px]' : 'text-xs'
      } font-bold select-none`}
      role="group"
      aria-label="Language selector"
    >
      {showIcon && (
        <div className="pl-2 pr-1 text-[#958B9F] flex items-center">
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
                ? activeBg
                : 'text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30]/60'
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
