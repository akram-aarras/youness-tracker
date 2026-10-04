'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Radio,
  Smartphone,
  LayoutDashboard,
  Users,
  Ticket as TicketIcon,
  LogOut,
  RotateCcw,
  ChevronDown,
  Check,
} from 'lucide-react';

interface Props {
  activeTab?: 'dashboard' | 'clients' | 'tickets';
  setActiveTab?: (tab: 'dashboard' | 'clients' | 'tickets') => void;
}

export default function Navbar({ activeTab = 'dashboard', setActiveTab }: Props) {
  const { currentUser, switchRole, logout, resetDemoData, tickets, t, dir } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleResetData = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Nav Tabs */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40 group-hover:scale-105 transition">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-white">
                    {t('nav_brand')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    NOC
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 tracking-wider">
                  Wi-Fi Distribution Operations
                </div>
              </div>
            </Link>

            {/* Navigation Tabs (when in Admin Dashboard) */}
            {currentUser?.role === 'admin' && setActiveTab && pathname === '/' && (
              <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse pl-4 rtl:pl-0 rtl:pr-4 border-l rtl:border-l-0 rtl:border-r border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <TicketIcon className="w-3.5 h-3.5" />
                  <span>{t('nav_tickets')}</span>
                  {openTicketsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                      {openTicketsCount}
                    </span>
                  )}
                </button>
              </nav>
            )}
          </div>

          {/* Right Actions, Language Switcher & Role Menu */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="cyan" />

            {/* Direct Switch to Mobile Tech View button */}
            <Link
              href="/technician"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                pathname === '/technician'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('nav_fieldtech')}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                {t('mobile')}
              </span>
            </Link>

            {/* Role Dropdown / Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-sm">
                  {currentUser?.avatar || '👤'}
                </div>
                <div className="text-left rtl:text-right hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser?.name.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-[9px] text-cyan-400 font-mono uppercase">
                    {currentUser?.role === 'admin' ? t('admin') : t('field_tech')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                    Switch Active Session
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-1 cursor-pointer ${
                      currentUser?.role === 'admin'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>👨‍💼</span>
                      <div>
                        <div className="font-bold">Youness ({t('admin')})</div>
                        <div className="text-[10px] text-slate-400">Full Access NOC</div>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('technician', 'tech-1')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-1 cursor-pointer ${
                      currentUser?.role === 'technician' &&
                      currentUser.technicianId === 'tech-1'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🔧</span>
                      <div>
                        <div className="font-bold">Yassine ({t('field_tech')} 1)</div>
                        <div className="text-[10px] text-slate-400">{t('role_antenna')}</div>
                      </div>
                    </div>
                    {currentUser?.technicianId === 'tech-1' && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('technician', 'tech-2')}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left rtl:text-right transition my-1 cursor-pointer ${
                      currentUser?.role === 'technician' &&
                      currentUser.technicianId === 'tech-2'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🛠️</span>
                      <div>
                        <div className="font-bold">Omar ({t('field_tech')} 2)</div>
                        <div className="text-[10px] text-slate-400">{t('role_rooftop')}</div>
                      </div>
                    </div>
                    {currentUser?.technicianId === 'tech-2' && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="border-t border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 flex items-center gap-2 text-left rtl:text-right cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('nav_reset_demo')}</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 flex items-center gap-2 text-left rtl:text-right cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav_sign_out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{t('reset_modal_title')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('reset_modal_desc')}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-sm cursor-pointer"
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
