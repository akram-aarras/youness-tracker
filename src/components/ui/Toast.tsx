'use client';

import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const { t } = useStore();
  useEffect(() => {
    const timeout = setTimeout(onClose, 4500);
    return () => clearTimeout(timeout);
  }, [message, onClose]);
  return <div className="app-toast" role="status"><CheckCircle2 size={20} /><span>{message}</span><button type="button" onClick={onClose} aria-label={t('close')}><X size={17} /></button></div>;
}
