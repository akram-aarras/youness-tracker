'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
import { Sun, Moon } from 'lucide-react';

interface Props {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const { language } = useStore();
  const label = language === 'ar' ? 'تغيير المظهر' : language === 'en' ? 'Change theme' : 'Changer de thème';

  if (!mounted) {
    return (
      <div
        className={`w-11 h-11 rounded-xl border border-[var(--border)]/70 bg-[var(--surface-muted)] opacity-50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
        isDark
          ? 'bg-[var(--surface-muted)] hover:bg-[var(--surface-muted)] text-[var(--warning)] border-[var(--border)]/70 hover:border-[var(--border)]'
          : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 shadow-sm'
      } ${className}`}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[var(--warning)] shrink-0 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 shrink-0 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {language === 'ar' ? (isDark ? 'فاتح' : 'داكن') : language === 'en' ? (isDark ? 'Light' : 'Dark') : (isDark ? 'Clair' : 'Sombre')}
        </span>
      )}
    </button>
  );
}
