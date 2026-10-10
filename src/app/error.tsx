'use client';

import { useStore } from '@/lib/store';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { language } = useStore();
  const copy = language === 'ar'
    ? ['تعذر تحميل هذا الفضاء', 'حاول مرة أخرى للعودة إلى عملك.', 'إعادة المحاولة']
    : language === 'en'
      ? ['This workspace could not load', 'Try again to get back to your work.', 'Try again']
      : ['Cet espace n’a pas pu se charger', 'Réessayez pour reprendre votre travail.', 'Réessayer'];
  return <main className="loading-screen px-6 text-center"><span className="brand-mark"><RefreshCw /></span><h1 className="text-2xl font-semibold text-[var(--text)]">{copy[0]}</h1><p>{copy[1]}</p><button type="button" className="btn-primary" onClick={retry}>{copy[2]}</button></main>;
}
