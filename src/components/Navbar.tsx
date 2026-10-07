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
  CreditCard,
  WifiOff,
  Search,
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
    language,
    exportDataAsJSON,
    isOnline,
  } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Ctrl+K shortcut to focus subscriber search
  React.useEffect(() => {
    const handleGlobalSearch = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (setActiveTab) setActiveTab('clients');
        setTimeout(() => {
          const input = document.getElementById('client-directory-search-input') as HTMLInputElement;
          if (input) {
            input.focus();
            input.select();
          }
        }, 50);
      }
    };
    window.addEventListener('keydown', handleGlobalSearch);
    return () => window.removeEventListener('keydown', handleGlobalSearch);
  }, [setActiveTab]);

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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Nav Tabs */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="relative flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="Youness WiFi Logo"
                  width={144}
                  height={80}
                  className="h-9 sm:h-10 w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {t('nav_brand')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 shrink-0">
                    NOC
                  </span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide truncate hidden xs:block">
                  {language === 'ar' ? 'عمليات التوزيع اللاسلكي' : language === 'fr' ? 'Opérations de Distribution Wi-Fi' : 'Wi-Fi Distribution Operations'}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Tabs (when in Admin Dashboard) */}
            {currentUser?.role === 'admin' && setActiveTab && pathname === '/' && (
              <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t('nav_dashboard')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('clients')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'clients'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav_clients')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 relative cursor-pointer ${
                    activeTab === 'tickets'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <TicketIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('nav_tickets')}</span>
                  {openTicketsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                      {openTicketsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('nav_team')}</span>
                </button>
              </nav>
            )}
          </div>

          {/* Central Modern Search Field with Ctrl+K shortcut */}
          {currentUser?.role === 'admin' && (
            <div className="hidden lg:flex items-center flex-1 max-w-xs mx-2">
              <div
                onClick={() => {
                  if (setActiveTab) setActiveTab('clients');
                  setTimeout(() => {
                    const input = document.getElementById('client-directory-search-input') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      input.select();
                    }
                  }, 50);
                }}
                className="w-full relative flex items-center bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3 py-1.5 transition-all duration-150 cursor-pointer shadow-2xs group"
                title="Rechercher des abonnés (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 dark:text-slate-500 dark:group-hover:text-orange-400 mr-2 rtl:mr-0 rtl:ml-2 shrink-0 transition-colors" />
                <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:text-slate-400 truncate flex-1 select-none">
                  {t('search')}...
                </span>
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded shadow-2xs">
                  Ctrl+K
                </kbd>
              </div>
            </div>
          )}

          {/* Right Actions, Language Switcher & Role Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Offline Alert Indicator */}
            {!isOnline && (
              <div
                title={language === 'ar' ? 'تم انقطاع الاتصال بالشبكة' : language === 'fr' ? 'Connexion réseau interrompue' : 'Network connection lost'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-400"
              >
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline text-[11px]">{language === 'ar' ? 'غير متصل' : language === 'fr' ? 'Hors ligne' : 'Offline'}</span>
              </div>
            )}

            {/* Theme Toggle (Desktop & Tablet) */}
            <ThemeToggle />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Direct Switch to Mobile Tech View button (Desktop & Tablet) */}
            <Link
              href="/technician"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                pathname === '/technician'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('nav_fieldtech')}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 font-mono border border-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-400">
                {t('mobile')}
              </span>
            </Link>

            {/* Role Dropdown / Switcher (Tablet & Desktop) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-slate-700 flex items-center justify-center text-sm border border-orange-100 dark:border-slate-600">
                  {currentUser?.avatar || '👤'}
                </div>
                <div className="text-left rtl:text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {currentUser?.name.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-[9px] text-orange-600 dark:text-amber-400 font-semibold uppercase">
                    {currentUser?.role === 'admin' ? t('admin') : t('field_tech')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-2 z-50 text-xs">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>{t('nav_active_session')}</span>
                    <span className="font-mono text-orange-600 font-bold">{currentUser?.role}</span>
                  </div>

                  {currentUser?.role === 'admin' && setActiveTab && (
                    <button
                      onClick={() => {
                        setActiveTab('team');
                        setShowRoleMenu(false);
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 text-left rtl:text-right transition my-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="font-bold">{t('nav_manage_team_rbac')}</div>
                        <div className="text-[10px] text-slate-400">{t('nav_add_techs_roles')}</div>
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
                      className="w-full p-2.5 rounded-xl flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 text-left rtl:text-right transition my-1 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="font-bold">{t('nav_backup_export')}</div>
                        <div className="text-[10px] text-slate-400">{t('nav_backup_desc')}</div>
                      </div>
                    </button>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                      {t('nav_quick_demo_switch')}
                    </div>

                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-0.5 cursor-pointer ${
                        currentUser?.role === 'admin'
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>👨‍💼</span>
                        <span className="font-semibold">Youness (Admin)</span>
                      </div>
                      {currentUser?.role === 'admin' && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('technician', 'tech-1')}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-0.5 cursor-pointer ${
                        currentUser?.role === 'technician' &&
                        currentUser.technicianId === 'tech-1'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🔧</span>
                        <span className="font-semibold">Yassine (Tech 1)</span>
                      </div>
                      {currentUser?.technicianId === 'tech-1' && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('technician', 'tech-2')}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-0.5 cursor-pointer ${
                        currentUser?.role === 'technician' &&
                        currentUser.technicianId === 'tech-2'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🛠️</span>
                        <span className="font-semibold">Omar (Tech 2)</span>
                      </div>
                      {currentUser?.technicianId === 'tech-2' && (
                        <Check className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full p-2 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-left rtl:text-right cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('nav_reset_demo')}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-left rtl:text-right cursor-pointer"
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
              className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shadow-2xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-orange-500" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Pills (Admin Dashboard) */}
      {currentUser?.role === 'admin' && setActiveTab && pathname === '/' && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
            <span>{t('nav_dashboard')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('nav_clients')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer relative ${
              activeTab === 'tickets'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700'
            }`}
          >
            <TicketIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('nav_tickets')}</span>
            {openTicketsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center">
                {openTicketsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer ${
              activeTab === 'team'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
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
                      ? (language === 'ar' ? 'يونس (المالك / مسؤول NOC)' : language === 'fr' ? 'Youness (Propriétaire / Admin NOC)' : 'Youness (Owner / NOC Admin)')
                      : (language === 'ar' ? 'تقني الميدان' : language === 'fr' ? 'Technicien Terrain' : 'Field Technician')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-[#1e1929] hover:bg-[#2c243a] border border-[#2D253B] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('close')}
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
                {t('nav_main_navigation')}
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
                  {t('nav_payments_invoices')}
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
                {t('nav_operations_noc')}
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
                  <span>{t('nav_portal_noc')}</span>
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
                  <span>{t('nav_field_mode')}</span>
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
                    <span className="font-bold">{t('nav_manage_team_rbac')}</span>
                  </div>
                  <span className="text-[10px] text-[#958B9F]">Staff</span>
                </button>
              )}


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
                    <span>{t('nav_backup_desc')}</span>
                  </div>
                  <span className="text-[10px] text-[#958B9F] font-mono">JSON</span>
                </button>
              )}
            </div>

            {/* Theme Toggle & Preferences */}
            <div className="border-t border-[#2D253B]/70 pt-3 space-y-2">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] px-2 tracking-wider">
                {t('nav_theme_preferences')}
              </div>
              <div className="space-y-2">
                <ThemeToggle showLabel className="w-full justify-between py-3 px-3.5 min-h-[48px] text-sm" />
                <div className="p-2.5 rounded-xl bg-[#161220]/60 border border-[#261E33] flex items-center justify-between">
                  <span className="text-xs text-[#958B9F] px-1 font-medium">{t('nav_display_language')}</span>
                  <LanguageSwitcher variant="amber" />
                </div>
              </div>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="border-t border-[#2D253B]/70 pt-3 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] px-2 tracking-wider">
                {t('nav_quick_demo_switch')}
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
              <span>{t('nav_sign_out')}</span>
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
