'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import TechnicianView from '@/components/TechnicianView';
import LoginScreen from '@/components/LoginScreen';

export default function TechnicianPage() {
  const { currentUser, isHydrated } = useStore();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400 font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2" />
        Initializing Field Gateway...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <TechnicianView />;
}
