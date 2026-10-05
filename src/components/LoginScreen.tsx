'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  User,
  KeyRound,
} from 'lucide-react';

export default function LoginScreen() {
  const { login } = useStore();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await login(username, password);
    if (res.success && res.user) {
      if (res.user.role === 'technician') {
        router.push('/technician');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Identifiant ou mot de passe non reconnu. Utilisez les profils ci-dessous.');
    }
  };

  const handleQuickLogin = async (uname: string, role: string) => {
    const res = await login(uname);
    if (res.success) {
      if (role === 'technician') {
        router.push('/technician');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0C14] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(94,45,90,0.2)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[radial-gradient(circle,rgba(71,59,94,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#130F1A] border border-[#2D253B]/70 text-xs font-medium text-amber-400 mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            NOC Gateway • Core Router 10.0.0.1 Online
          </div>
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/logo.png"
              alt="Youness WiFi Logo"
              width={48}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-[#F4F0F8]">
                Youness <span className="text-amber-500">WiFi</span>
              </h1>
              <p className="text-xs font-medium text-[#958B9F] uppercase tracking-widest">
                Operations & Dispatch NOC
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-8 shadow-xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#F4F0F8] flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Restricted Back-Office Access
            </h2>
            <p className="text-xs text-[#958B9F] mt-1">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1.5">
                Staff Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ex: youness, yassine, ou omar"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1.5">
                Terminal Password / Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
            >
              Sign In to Operations
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#261E33]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#191522] px-3 text-[#958B9F] font-semibold tracking-wider">
                Instant 1-Click Demo Profiles
              </span>
            </div>
          </div>

          {/* Quick Demo Access Roles */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('youness', 'admin')}
              className="w-full p-3 rounded-xl bg-[#130F1A] hover:bg-[#241E30] border border-[#261E33] hover:border-[#3A2F4C] transition flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👨‍💼</span>
                <div>
                  <div className="text-xs font-bold text-[#F4F0F8] group-hover:text-amber-400 transition">
                    Youness (Owner / NOC Admin)
                  </div>
                  <div className="text-[11px] text-[#958B9F]">
                    Full billing, subscriber ledger & dispatcher
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#382647] text-[#F3E8FF] border border-[#523368]">
                ADMIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('yassine', 'technician')}
              className="w-full p-3 rounded-xl bg-[#130F1A] hover:bg-[#241E30] border border-[#261E33] hover:border-[#3A2F4C] transition flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔧</span>
                <div>
                  <div className="text-xs font-bold text-[#F4F0F8] group-hover:text-emerald-400 transition">
                    Yassine (Lead Field Tech)
                  </div>
                  <div className="text-[11px] text-[#958B9F]">
                    Dedicated mobile task runner & antenna diagnostics
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                FIELD TECH
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('omar', 'technician')}
              className="w-full p-3 rounded-xl bg-[#130F1A] hover:bg-[#241E30] border border-[#261E33] hover:border-[#3A2F4C] transition flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛠️</span>
                <div>
                  <div className="text-xs font-bold text-[#F4F0F8] group-hover:text-amber-400 transition">
                    Omar (Network Installer)
                  </div>
                  <div className="text-[11px] text-[#958B9F]">
                    Rooftop cabling & client router configuration
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                FIELD TECH
              </span>
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center mt-6 text-[11px] text-[#958B9F] flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#958B9F]" />
          <span>Private WISP Operations Portal. All access and changes logged.</span>
        </div>
      </div>
    </div>
  );
}
