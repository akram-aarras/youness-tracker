'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Server,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
} from 'lucide-react';

function LoginForm() {
  const { login, registerOwner, hasAdminAccount } = useStore();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Mode: 'login' or 'setup_admin'
  const [mode, setMode] = useState<'login' | 'setup_admin'>('login');

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup Admin Form State
  const [setupName, setSetupName] = useState('Youness');
  const [setupEmail, setSetupEmail] = useState('youness@atlasnet.ma');
  const [setupPhone, setSetupPhone] = useState('+212 661-000111');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Auto-switch to setup mode on first run if no admin account exists
  useEffect(() => {
    if (!hasAdminAccount) {
      setMode('setup_admin');
    }
  }, [hasAdminAccount]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success && res.user) {
        // Enforce direct browser redirection to guarantee fresh cookie delivery to middleware
        const targetUrl = redirectParam || (res.user.role === 'admin' ? '/' : '/technician');
        window.location.href = targetUrl;
      } else {
        setError(res.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors de la tentative de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (setupPassword !== setupConfirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (setupPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerOwner({
        name: setupName,
        email: setupEmail,
        password: setupPassword,
        phone: setupPhone,
      });

      if (res.success && res.user) {
        setSetupSuccess(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        setError(res.error || "Impossible de créer le compte Administrateur.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement de l'administrateur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#130F1A] border border-[#2D253B]/70 text-xs font-medium text-amber-400 mb-4 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          NOC Gateway 10.0.0.1 • RBAC Security Online
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
            <p className="text-xs font-semibold text-[#958B9F] uppercase tracking-widest">
              Telecom NOC & Field Operations
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-8 shadow-xl shadow-black/40 backdrop-blur-xl">
        {mode === 'login' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#F4F0F8] flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Unified Staff Portal Login</span>
              </h2>
              <p className="text-xs text-[#958B9F] mt-1 leading-relaxed">
                Sign in with your email or username to access your operations workspace.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 leading-snug">
                  <strong className="block text-rose-300 font-bold mb-0.5">Échec de connexion</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1.5">
                  Email or Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="youness@atlasnet.ma ou identifiant"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB]">
                    Password <span className="text-rose-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#958B9F] hover:text-[#F4F0F8] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Verifying Authentication...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Operations</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </>
                )}
              </button>
            </form>

            {/* Public Registration Locked Security Badge */}
            <div className="mt-6 pt-5 border-t border-[#261E33]">
              <div className="p-3 rounded-2xl bg-[#130F1A] border border-[#261E33] text-[11px] text-[#958B9F] flex items-center gap-2.5">
                <LockKeyhole className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="leading-tight">
                  <span className="font-semibold text-[#E0D8EB] block">
                    Public Registration Closed
                  </span>
                  <span>
                    Staff accounts are provisioned exclusively by Youness in the NOC Admin Panel.
                  </span>
                </div>
              </div>

              {/* Initial Setup trigger link if no admin exists */}
              {!hasAdminAccount && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('setup_admin')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                  >
                    Premier Démarrage ? Configurer le Master Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SETUP MASTER ADMIN / OWNER REGISTRATION FLOW */
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Initial Setup Mode
              </div>
              <h2 className="text-lg font-bold text-[#F4F0F8] flex items-center gap-2">
                <span>Setup Master Admin Account</span>
              </h2>
              <p className="text-xs text-[#958B9F] mt-1 leading-relaxed">
                Configure your Master Admin account (Youness). Once completed, public registration will be permanently closed.
              </p>
            </div>

            {setupSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Compte Maître créé avec succès ! Connexion au tableau de bord...</span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSetupAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Youness"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1">
                  Master Admin Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="youness@atlasnet.ma"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1">
                  Phone (WhatsApp NOC)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+212 661-000111"
                    value={setupPhone}
                    onChange={(e) => setSetupPhone(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1">
                  Master Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    placeholder="Choose a strong master password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-10 py-2 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPassword(!showSetupPassword)}
                    className="absolute right-3.5 top-3 text-[#958B9F] hover:text-[#F4F0F8] transition cursor-pointer"
                  >
                    {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#E0D8EB] mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#958B9F] absolute left-3.5 top-3" />
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    placeholder="Repeat master password"
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Provisioning Master Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Master Admin & Lock Registration</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              {hasAdminAccount && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-[#958B9F] hover:text-[#F4F0F8] transition cursor-pointer"
                  >
                    ← Retour à la connexion standard
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Footer Notice */}
      <div className="text-center mt-6 text-[11px] text-[#958B9F] flex items-center justify-center gap-1.5">
        <Server className="w-3.5 h-3.5 text-[#958B9F]" />
        <span>Strict Role-Based Access Control (RBAC). Protected with HTTP-Only Sessions.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0F0C14] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(94,45,90,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[radial-gradient(circle,rgba(71,59,94,0.12)_0%,transparent_70%)] pointer-events-none" />

      <Suspense fallback={
        <div className="text-xs text-[#958B9F] font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Loading Secure Terminal...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
