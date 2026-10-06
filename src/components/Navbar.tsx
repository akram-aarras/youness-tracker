'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import {
  Smartphone,
  LayoutDashboard,
  Users,
  Ticket as TicketIcon,
  ShieldCheck,
  LogOut,
  RotateCcw,
  ChevronDown,
  Check,
  Menu,
  X,
  Download,
  RefreshCw,
  CreditCard,
  WifiOff,
} from 'lucide-react';

interface Props {
  activeTab?: 'dashboard' | 'clients' | 'tickets' | 'team';
  setActiveTab?: (tab: 'dashboard' | 'clients' | 'tickets' | 'team') => void;
  onOpenPaymentModal?: () => void;
}

export default function Navbar({ activeTab = 'dashboard', setActiveTab, onOpenPaymentModal }: Props) {
  const {
    currentUser,
    switchRole,
    logout,
    resetDemoData,
    tickets,
    t,
    dir,
    exportDataAsJSON,
    refreshFromSupabase,
    isSyncing,
    isOnline,
  } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen && typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  const openTicketsCount = tickets.filter((ticket) => ticket.status !== 'resolved').length;

  const handleRoleSwitch = (role: 'admin' | 'technician', techId?: string) => {
    switchRole(role, techId);
    setShowRoleMenu(false);
    if (role === 'technician') {
      router.push('/technician');
    } else {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    setShowRoleMenu(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const handleResetData = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#130F1A]/80 backdrop-blur-xl border-b border-[#2D253B]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Nav Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <Image
                src="/logo.png"
                alt="Youness WiFi Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain shrink-0"
                priority
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base font-black tracking-tight text-[#F4F0F8] truncate">
                    {t('nav_brand')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-[#241E30] text-amber-400 border border-[#3A2F4C] shrink-0">
                    NOC
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#958B9F] tracking-wider truncate hidden xs:block">
                  Wi-Fi Distribution Operations
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Tabs (when in Admin Dashboard) */}
            {currentUser?.role === 'admin' && setActiveTab && pathname === '/' && (
              <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse pl-4 rtl:pl-0 rtl:pr-4 border-l rtl:border-l-0 rtl:border-r border-[#2D253B]/70 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                      : 'text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30]/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t('nav_dashboard')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('clients')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'clients'
                      ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                      : 'text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30]/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t('nav_clients')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 relative cursor-pointer ${
                    activeTab === 'tickets'
                      ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                      : 'text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30]/60'
                  }`}
                >
                  <TicketIcon className="w-3.5 h-3.5" />
                  <span>{t('nav_tickets')}</span>
                  {openTicketsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-xs">
                      {openTicketsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                      : 'text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30]/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('nav_team')}</span>
                </button>
              </nav>
            )}
          </div>

          {/* Right Actions, Language Switcher & Role Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Offline Alert Indicator */}
            {!isOnline && (
              <div
                title="Connexion réseau interrompue"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400"
              >
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline text-[11px]">Hors ligne</span>
              </div>
            )}

            {/* Theme Toggle (Desktop & Tablet) */}
            <ThemeToggle />

            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={() => refreshFromSupabase()}
              disabled={isSyncing}
              title="Synchroniser avec Supabase"
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                isSyncing
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#191522] border-[#2D253B]/70 text-[#958B9F] hover:text-[#F4F0F8] hover:border-[#3A2F4C]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden lg:inline text-[11px]">
                {isSyncing ? 'Sync...' : 'Supabase'}
              </span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher variant="amber" />

            {/* Direct Switch to Mobile Tech View button (Desktop & Tablet) */}
            <Link
              href="/technician"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                pathname === '/technician'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] text-[#E0D8EB]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('nav_fieldtech')}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#130F1A] text-emerald-300 font-mono border border-emerald-500/20">
                {t('mobile')}
              </span>
            </Link>

            {/* Role Dropdown / Switcher (Tablet & Desktop) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#130F1A] border border-[#2D253B]/70 hover:border-[#3A2F4C] transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-[#241E30] flex items-center justify-center text-sm border border-[#3A2F4C]/50">
                  {currentUser?.avatar || '👤'}
                </div>
                <div className="text-left rtl:text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#F4F0F8] leading-tight">
                    {currentUser?.name.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-[9px] text-amber-400 font-mono uppercase">
                    {currentUser?.role === 'admin' ? t('admin') : t('field_tech')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#958B9F]" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 rounded-2xl bg-[#191522] border border-[#2D253B]/70 shadow-2xl shadow-black/60 p-2 z-50 text-xs">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#958B9F] border-b border-[#2D253B]/70 flex items-center justify-between">
                    <span>Session Active</span>
                    <span className="font-mono text-amber-400">{currentUser?.role}</span>
                  </div>

                  {currentUser?.role === 'admin' && setActiveTab && (
                    <button
                      onClick={() => {
                        setActiveTab('team');
                        setShowRoleMenu(false);
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-2 text-[#E0D8EB] hover:text-white hover:bg-[#241E30] text-left rtl:text-right transition my-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold">Gérer l&apos;Équipe & RBAC</div>
                        <div className="text-[10px] text-[#958B9F]">Ajouter techniciens & rôles</div>
                      </div>
                    </button>
                  )}

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        const json = exportDataAsJSON();
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        const datePart = new Date().toISOString().split('T')[0];
                        a.href = url;
                        a.download = `youness-wifi-backup-${datePart}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setShowRoleMenu(false);
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-2 text-amber-300 hover:text-amber-200 hover:bg-[#241E30] text-left rtl:text-right transition my-1 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold">تصدير نسخة احتياطية (JSON)</div>
                        <div className="text-[10px] text-[#958B9F]">Sauvegarder la base de données</div>
                      </div>
                    </button>
                  )}

                  <div className="border-t border-[#2D253B]/70 my-1 pt-1">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#958B9F]">
                      Bascule Rapide (Démo)
                    </div>

                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-0.5 cursor-pointer ${
                        currentUser?.role === 'admin'
                          ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368]'
                          : 'text-[#E0D8EB] hover:bg-[#241E30]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>👨‍💼</span>
                        <span className="font-semibold">Youness (Admin)</span>
                      </div>
                      {currentUser?.role === 'admin' && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('technician', 'tech-1')}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-0.5 cursor-pointer ${
                        currentUser?.role === 'technician' &&
                        currentUser.technicianId === 'tech-1'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'text-[#E0D8EB] hover:bg-[#241E30]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🔧</span>
                        <span className="font-semibold">Yassine (Tech 1)</span>
                      </div>
                      {currentUser?.technicianId === 'tech-1' && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('technician', 'tech-2')}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-0.5 cursor-pointer ${
                        currentUser?.role === 'technician' &&
                        currentUser.technicianId === 'tech-2'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'text-[#E0D8EB] hover:bg-[#241E30]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🛠️</span>
                        <span className="font-semibold">Omar (Tech 2)</span>
                      </div>
                      {currentUser?.technicianId === 'tech-2' && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="border-t border-[#2D253B]/70 my-1 pt-1">
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full p-2 rounded-lg text-[#958B9F] hover:text-amber-400 hover:bg-[#241E30] flex items-center gap-2 text-left rtl:text-right cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('nav_reset_demo')}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full p-2 rounded-lg text-[#958B9F] hover:text-rose-400 hover:bg-[#241E30] flex items-center gap-2 text-left rtl:text-right cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav_sign_out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Button (< 768px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#130F1A] border border-[#2D253B]/70 text-[#E0D8EB] hover:text-[#F4F0F8] hover:border-[#3A2F4C] transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-amber-400" />
              ) : (
                <Menu className="w-5 h-5 text-[#E0D8EB]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Pills (Admin Dashboard) */}
      {currentUser?.role === 'admin' && setActiveTab && pathname === '/' && (
        <div className="md:hidden border-t border-[#2D253B]/60 bg-[#110D18]/95 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8] bg-[#191522]/80 border border-[#261E33]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t('nav_dashboard')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8] bg-[#191522]/80 border border-[#261E33]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('nav_clients')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer relative ${
              activeTab === 'tickets'
                ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8] bg-[#191522]/80 border border-[#261E33]'
            }`}
          >
            <TicketIcon className="w-3.5 h-3.5" />
            <span>{t('nav_tickets')}</span>
            {openTicketsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer ${
              activeTab === 'team'
                ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8] bg-[#191522]/80 border border-[#261E33]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('nav_team')}</span>
          </button>
        </div>
      )}

      {/* Full-Screen Mobile Drawer Navigation (< 768px) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 h-[100dvh] bg-[#0f111a] text-[#F4F0F8] flex flex-col md:hidden animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex-none flex items-center justify-between px-4 py-3.5 border-b border-[#2D253B]/70 bg-[#130F1A]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#241E30] flex items-center justify-center text-xl border border-[#3A2F4C] shrink-0">
                {currentUser?.avatar || '👤'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#F4F0F8] truncate leading-tight">
                  {currentUser?.name || 'Youness (Owner / NOC Admin)'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 truncate">
                    {currentUser?.role === 'admin'
                      ? 'Youness (Owner / NOC Admin) • المسؤول'
                      : 'Technicien Terrain • تقني الميدان'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-[#1e1929] hover:bg-[#2c243a] border border-[#2D253B] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Body (Scrollable seamless view) */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
            {/* Primary Navigation Links */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] px-2 py-0.5 tracking-wider">
                Navigation Principale
              </div>

              {/* 1. Dashboard */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname !== '/') router.push('/');
                  if (setActiveTab) setActiveTab('dashboard');
                }}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center gap-3 text-xs font-semibold cursor-pointer transition ${
                  pathname === '/' && activeTab === 'dashboard'
                    ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                    : 'text-[#E0D8EB] hover:bg-[#1f192b] bg-[#161220]/60 border border-[#261E33]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-left rtl:text-right font-bold text-sm">
                  {t('nav_dashboard')}
                </span>
              </button>

              {/* 2. Clients */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname !== '/') router.push('/');
                  if (setActiveTab) setActiveTab('clients');
                }}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center gap-3 text-xs font-semibold cursor-pointer transition ${
                  pathname === '/' && activeTab === 'clients'
                    ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                    : 'text-[#E0D8EB] hover:bg-[#1f192b] bg-[#161220]/60 border border-[#261E33]'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="flex-1 text-left rtl:text-right font-bold text-sm">
                  {t('nav_clients')}
                </span>
              </button>

              {/* 3. Payments */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname !== '/') {
                    router.push('/');
                  }
                  if (onOpenPaymentModal) {
                    onOpenPaymentModal();
                  } else if (setActiveTab) {
                    setActiveTab('dashboard');
                  }
                }}
                className="w-full min-h-[48px] p-3 rounded-xl flex items-center gap-3 text-xs font-semibold cursor-pointer transition text-[#E0D8EB] hover:bg-[#1f192b] bg-[#161220]/60 border border-[#261E33]"
              >
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-left rtl:text-right font-bold text-sm">
                  Paiements & Factures / الأداءات
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
                  MAD
                </span>
              </button>

              {/* 4. Tickets */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname !== '/') router.push('/');
                  if (setActiveTab) setActiveTab('tickets');
                }}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition ${
                  pathname === '/' && activeTab === 'tickets'
                    ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                    : 'text-[#E0D8EB] hover:bg-[#1f192b] bg-[#161220]/60 border border-[#261E33]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TicketIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm truncate">{t('nav_tickets')}</span>
                </div>
                {openTicketsCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {openTicketsCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono">0</span>
                )}
              </button>
            </div>

            {/* NOC Operations */}
            <div className="border-t border-[#2D253B]/70 pt-3 space-y-2">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] px-2 tracking-wider">
                Opérations Réseau & NOC
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    pathname === '/'
                      ? 'bg-[#382647] text-[#F3E8FF] border-[#523368]'
                      : 'bg-[#241E30] text-[#E0D8EB] border-[#3A2F4C] hover:bg-[#2C243B]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Portail NOC</span>
                </Link>
                <Link
                  href="/technician"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    pathname === '/technician'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#241E30] text-[#E0D8EB] border-[#3A2F4C] hover:bg-[#2C243B]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mode Terrain</span>
                </Link>
              </div>

              {currentUser?.role === 'admin' && setActiveTab && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (pathname !== '/') router.push('/');
                    setActiveTab('team');
                  }}
                  className={`w-full min-h-[44px] p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer transition ${
                    pathname === '/' && activeTab === 'team'
                      ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368]'
                      : 'text-[#E0D8EB] hover:bg-[#241E30] bg-[#161220]/60 border border-[#261E33]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold">Gestion de l&apos;Équipe & RBAC</span>
                  </div>
                  <span className="text-[10px] text-[#958B9F]">Staff</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  refreshFromSupabase();
                  setMobileMenuOpen(false);
                }}
                disabled={isSyncing}
                className="w-full min-h-[44px] p-2.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] text-[#E0D8EB] flex items-center justify-between text-xs font-medium cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : 'text-amber-400'} shrink-0`} />
                  <span className="font-bold">Synchroniser avec Supabase</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">
                  {isSyncing ? 'Sync...' : 'En ligne'}
                </span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    const json = exportDataAsJSON();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `youness-wifi-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] p-2.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] text-[#E0D8EB] flex items-center justify-between text-xs font-medium cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sauvegarder la base de données</span>
                  </div>
                  <span className="text-[10px] text-[#958B9F] font-mono">JSON</span>
                </button>
              )}
            </div>

            {/* Theme Toggle & Preferences */}
            <div className="border-t border-[#2D253B]/70 pt-3 space-y-2">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] px-2 tracking-wider">
                Thème & Préférences
              </div>
              <div className="space-y-2">
                <ThemeToggle showLabel className="w-full justify-between py-3 px-3.5 min-h-[48px] text-sm" />
                <div className="p-2.5 rounded-xl bg-[#161220]/60 border border-[#261E33] flex items-center justify-between">
                  <span className="text-xs text-[#958B9F] px-1 font-medium">Langue d&apos;affichage</span>
                  <LanguageSwitcher variant="amber" />
                </div>
              </div>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="border-t border-[#2D253B]/70 pt-3 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] px-2 tracking-wider">
                Bascule Rapide (Démo)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSwitch('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[42px] p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                    currentUser?.role === 'admin'
                      ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368]'
                      : 'text-[#E0D8EB] hover:bg-[#241E30] bg-[#161220]/40 border border-[#261E33]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>👨‍💼</span>
                    <span className="font-semibold truncate">Youness (Admin)</span>
                  </div>
                  {currentUser?.role === 'admin' && <Check className="w-4 h-4 shrink-0 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSwitch('technician', 'tech-1');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[42px] p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                    currentUser?.role === 'technician' && currentUser.technicianId === 'tech-1'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-[#E0D8EB] hover:bg-[#241E30] bg-[#161220]/40 border border-[#261E33]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>🔧</span>
                    <span className="font-semibold truncate">Yassine (Tech 1)</span>
                  </div>
                  {currentUser?.technicianId === 'tech-1' && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSwitch('technician', 'tech-2');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[42px] p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                    currentUser?.role === 'technician' && currentUser.technicianId === 'tech-2'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-[#E0D8EB] hover:bg-[#241E30] bg-[#161220]/40 border border-[#261E33]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>🛠️</span>
                    <span className="font-semibold truncate">Omar (Tech 2)</span>
                  </div>
                  {currentUser?.technicianId === 'tech-2' && <Check className="w-4 h-4 shrink-0 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Reset Demo Data Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowResetConfirm(true);
                }}
                className="w-full min-h-[42px] p-2 rounded-xl bg-[#241E30] text-[#958B9F] hover:text-amber-400 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer border border-[#3A2F4C]"
              >
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('nav_reset_demo')}</span>
              </button>
            </div>
          </div>

          {/* Footer (Pinned at the bottom) */}
          <div className="flex-none p-4 border-t border-[#2D253B]/70 bg-[#130F1A] pb-safe">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] min-h-[48px]"
            >
              <LogOut className="w-5 h-5 text-white shrink-0" />
              <span>Déconnexion / تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl shadow-black/60 animate-in fade-in">
            <h4 className="text-base font-bold text-[#F4F0F8] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{t('reset_modal_title')}</span>
            </h4>
            <p className="text-xs text-[#958B9F] leading-relaxed">
              {t('reset_modal_desc')}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] rounded-xl cursor-pointer transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/15 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition"
              >
                {t('reset_modal_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
