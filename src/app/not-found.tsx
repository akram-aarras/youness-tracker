'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Wifi } from 'lucide-react';

export default function NotFound() {
  const { language } = useStore();
  const copy = language === 'ar' ? ['الصفحة غير موجودة', 'العودة إلى فضائي'] : language === 'en' ? ['Page not found', 'Back to my workspace'] : ['Page introuvable', 'Revenir à mon espace'];
  return <main className="loading-screen px-6 text-center"><span className="brand-mark"><Wifi /></span><p className="eyebrow">Youness WiFi · 404</p><h1 className="text-2xl font-semibold text-[var(--text)]">{copy[0]}</h1><Link className="btn-primary" href="/">{copy[1]}</Link></main>;
}
