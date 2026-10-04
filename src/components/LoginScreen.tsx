'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Radio,
  Wifi,
  Lock,
  ArrowRight,
  Server,
  User,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function LoginScreen() {
  const { login, users } = useStore();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = login(username);
    if (success) {
      const user = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase().trim()
      );
      if (user?.role === 'technician') {
        router.push('/technician');
      } else {
        router.push('/');
      }
    } else {
      setError('Identifiant non reconnu. Utilisez les profils de démonstration ci-dessous.');
    }
  };

  const handleQuickLogin = (uname: string, role: string) => {
    login(uname);
    if (role === 'technician') {
      router.push('/technician');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-cyan-400 mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            NOC Gateway • Core Router 10.0.0.1 Online
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-900/30">
              <Radio className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-white">
                AtlasNet <span className="text-cyan-400">WISP</span>
              </h1>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Operations & Dispatch NOC
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Restricted Back-Office Access
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Internal portal for Wi-Fi distribution management, subscriber billing, and field task dispatch.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ex: youness, yassine, ou omar"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Terminal Password / Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 group"
            >
              Sign In to Operations
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                Instant 1-Click Demo Profiles
              </span>
            </div>
          </div>

          {/* Quick Demo Access Roles */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('youness', 'admin')}
              className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👨‍💼</span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                    Youness (Owner / NOC Admin)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Full billing, subscriber ledger & dispatcher
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ADMIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('yassine', 'technician')}
              className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔧</span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                    Yassine (Lead Field Tech)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Dedicated mobile task runner & antenna diagnostics
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FIELD TECH
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('omar', 'technician')}
              className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛠️</span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                    Omar (Network Installer)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Rooftop cabling & client router configuration
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                FIELD TECH
              </span>
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Private WISP Operations Portal. All access and changes logged.</span>
        </div>
      </div>
    </div>
  );
}
