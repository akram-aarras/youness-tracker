'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import TechnicianView from '@/components/TechnicianView';
import LoginScreen from '@/components/LoginScreen';

export default function TechnicianPage() {
  const { currentUser, isHydrated } = useStore();

  if (!isHydrated) {
    return (
      <div className="loading-screen" role="status"><div className="loading-bar" />Youness WiFi</div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <TechnicianView />;
}
