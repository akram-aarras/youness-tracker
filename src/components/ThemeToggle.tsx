'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface Props {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-[#2D253B]/70 bg-[#130F1A] opacity-50 ${className}`}
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
      className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
        isDark
          ? 'bg-[#130F1A] hover:bg-[#241E30] text-amber-400 border-[#2D253B]/70 hover:border-[#3A2F4C]'
          : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 shadow-sm'
      } ${className}`}
      title={isDark ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
      aria-label="Changer de thème"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 shrink-0 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 shrink-0 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Mode Clair' : 'Mode Sombre'}
        </span>
      )}
    </button>
  );
}
