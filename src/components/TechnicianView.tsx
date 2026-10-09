'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Ticket, TicketStatus, Technician } from '@/lib/types';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import {
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Radio,
  Wrench,
  Zap,
  AlertTriangle,
  ArrowLeft,
  Check,
  LogOut,
  Shield,
  WifiOff,
} from 'lucide-react';

export default function TechnicianView() {
  const {
    currentUser,
    switchRole,
    logout,
    tickets,
    clients,
    technicians,
    updateTicketStatus,
    t,
    language,
    dir,
    isOnline,
  } = useStore();

  const router = useRouter();
  const isTechUser = currentUser?.role === 'technician' || currentUser?.role === 'field_lead';

  // If logged in as technician, lock strictly to their own ID
  const effectiveTechId = isTechUser
    ? (currentUser?.technicianId || currentUser?.id || 'tech-1')
    : 'tech-1';

  const [selectedTechId, setSelectedTechId] = useState<string>(effectiveTechId);
  const [filterTab, setFilterTab] = useState<'pending' | 'resolved'>('pending');

  // Resolution modal state
  const [modalTicketId, setModalTicketId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<TicketStatus>('resolved');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const currentTech = isTechUser
    ? {
        id: effectiveTechId,
        name: currentUser?.name || 'Technicien',
        phone: currentUser?.phone || '',
        specialty: currentUser?.specialty || t('role_antenna'),
        status: 'active' as const,
      }
    : (technicians.find((tech) => tech.id === selectedTechId) || technicians[0]);

  // Filter tasks strictly assigned to this technician
  const techTickets = tickets.filter((ticket) => {
    if (isTechUser) {
      return (
        ticket.assignedToTechnicianId === effectiveTechId ||
        ticket.assignedToTechnicianId === currentUser?.id ||
        ticket.assignedToTechnicianId === currentUser?.technicianId
      );
    }
    return ticket.assignedToTechnicianId === selectedTechId;
  });

  const pendingTickets = techTickets.filter(
    (ticket) => ticket.status === 'open' || ticket.status === 'in_progress'
  );
  const resolvedTickets = techTickets.filter((ticket) => ticket.status === 'resolved');

  const displayedTickets =
    filterTab === 'pending' ? pendingTickets : resolvedTickets;

  // Handle Return to Admin Dashboard (NOC) for Admins
  const handleBack = () => {
    switchRole('admin');
    router.push('/');
  };

  // Handle Clean Logout for Field Technicians
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Open status modal
  const handleOpenStatusModal = (ticketId: string, status: TicketStatus) => {
    setModalTicketId(ticketId);
    setTargetStatus(status);
    setResolutionNote(
      status === 'resolved'
        ? t('resolution_default_note')
        : t('field_intervention_in_progress')
    );
  };

  const handleConfirmStatusUpdate = () => {
    if (!modalTicketId) return;
    updateTicketStatus(
      modalTicketId,
      targetStatus,
      resolutionNote.trim() || undefined
    );
    setModalTicketId(null);
    setResolutionNote('');
  };

  // Helper to find client hardware details for a ticket
  const getClientHardware = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.hardware;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm shadow-rose-950">
            <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            {t('prio_urgent')}
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {t('prio_high')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {t('prio_normal')}
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: Ticket['category']) => {
    switch (cat) {
      case 'no_internet':
        return t('cat_no_internet');
      case 'weak_signal':
        return t('cat_weak_signal');
      case 'power_adapter':
        return t('cat_power_adapter');
      case 'new_installation':
        return t('cat_new_installation');
      case 'router_config':
        return t('cat_router_config');
    }
  };

  const getSpecialtyLabel = (tech: Technician | { specialty?: string; id?: string }) => {
    if (tech.specialty) return tech.specialty;
    if (tech.id === 'tech-1') return t('role_antenna');
    return t('role_rooftop');
  };

  return (
    <div className="min-h-screen bg-[#0F0C14] text-[#F4F0F8] flex flex-col max-w-lg mx-auto border-x border-[#2D253B]/70 shadow-2xl relative">
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-30 bg-[#130F1A]/95 backdrop-blur-md border-b border-[#2D253B]/70 px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Back button (for Admin) or Logout button (for Technician) */}
          <div className="flex items-center gap-2.5 min-w-0">
            {isTechUser ? (
              <button
                type="button"
                onClick={handleLogout}
                aria-label={t('nav_sign_out')}
                title={t('nav_sign_out')}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white active:scale-95 transition cursor-pointer flex items-center gap-1.5 shrink-0 border border-rose-500/30"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-bold hidden xs:inline">{t('nav_sign_out')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                aria-label={t('back_to_noc')}
                title={t('back_to_noc')}
                className="p-2 rounded-xl bg-[#241E30] text-[#E0D8EB] hover:text-white hover:bg-[#2C243B] active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0 border border-[#3A2F4C]"
              >
                <ArrowLeft
                  className={`w-4 h-4 transition-transform duration-200 ${
                    dir === 'rtl' ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-[#F4F0F8] tracking-tight truncate">
                  {t('fieldtech_title')}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                  {t('mobile')}
                </span>
              </div>
              <p className="text-[10px] text-[#958B9F] truncate">
                {t('fieldtech_subtitle')}
              </p>
            </div>
          </div>

          {/* Actions: Theme Toggle & Language Switcher */}
          <div className="shrink-0 flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher variant="emerald" compact />
          </div>
        </div>

        {/* Worker Info Card */}
        <div className="mt-3 p-3 rounded-2xl bg-[#191522] border border-[#2D253B]/70 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              {currentTech.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#F4F0F8] flex items-center gap-1.5 truncate">
                <span className="truncate">{currentTech.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <div className="text-[10px] text-[#958B9F] truncate">
                {getSpecialtyLabel(currentTech)}
              </div>
            </div>
          </div>

          {/* If Admin inspecting: Show quick tech switcher. If Technician logged in: show active locked status */}
          {!isTechUser ? (
            <div className="flex items-center gap-1 bg-[#130F1A] p-1 rounded-xl border border-[#261E33] shrink-0">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => {
                    setSelectedTechId(tech.id);
                    switchRole('technician', tech.id);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    selectedTechId === tech.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#958B9F] hover:text-white'
                  }`}
                >
                  <span>{tech.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1.5 rounded-xl border border-emerald-800/80 text-[10px] font-bold text-emerald-300 shrink-0">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>{t('assigned_tasks_badge')}</span>
            </div>
          )}
        </div>

        {/* Status Counters Strip */}
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[#958B9F] text-[11px]">{t('pending')}:</span>
            <span className="font-bold font-mono text-amber-400">
              {pendingTickets.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[#958B9F] text-[11px]">{t('done_today')}:</span>
            <span className="font-bold font-mono text-emerald-400">
              {resolvedTickets.length}
            </span>
          </div>
        </div>

        {/* Filter Tabs: Pending vs Resolved */}
        <div className="mt-3 flex rounded-xl bg-[#130F1A] p-1 border border-[#2D253B]/70 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8]'
            }`}
          >
            <span>{t('tab_active_tasks')}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                pendingTickets.length > 0
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-[#241E30] text-[#958B9F]'
              }`}
            >
              {pendingTickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('resolved')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              filterTab === 'resolved'
                ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8]'
            }`}
          >
            <span>{t('tab_resolved')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#241E30] text-[#958B9F]">
              {resolvedTickets.length}
            </span>
          </button>
        </div>
      </header>

      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
            <span className="font-semibold text-[11px]">{t('offline_mode_banner')}</span>
          </div>
          <span className="text-[10px] bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 text-rose-300">
            {t('saved_locally')}
          </span>
        </div>
      )}

      {/* Main Task List */}
      <main className="flex-1 p-4 space-y-4 pb-20">
        {displayedTickets.length === 0 ? (
          <div className="p-10 text-center bg-[#191522] rounded-2xl border border-[#2D253B]/70 shadow-xl shadow-black/40 space-y-3 mt-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-[#F4F0F8]">{t('empty_tasks_title')}</h3>
            <p className="text-xs text-[#958B9F] leading-relaxed max-w-xs mx-auto">
              {filterTab === 'pending'
                ? t('empty_tasks_msg', { name: currentTech.name.split(' ')[0] })
                : t('empty_resolved_msg')}
            </p>
          </div>
        ) : (
          displayedTickets.map((ticket) => {
            const hw = getClientHardware(ticket.clientId);

            return (
              <div
                key={ticket.id}
                className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-5 shadow-xl shadow-black/40 space-y-3.5 relative overflow-hidden"
              >
                {/* Priority accent stripe */}
                {ticket.priority === 'urgent' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />
                )}

                {/* Top Row: Ticket Number & Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {ticket.ticketNumber}
                    </span>
                    {getPriorityBadge(ticket.priority)}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      ticket.status === 'open'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : ticket.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {ticket.status === 'open'
                      ? t('pending')
                      : ticket.status === 'in_progress'
                      ? t('tab_active_tasks')
                      : t('tab_resolved')}
                  </span>
                </div>

                {/* Issue Category */}
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {getCategoryLabel(ticket.category)}
                  </h3>
                  <p className="text-xs text-[#E0D8EB] mt-1 bg-[#0F0C14] p-2.5 rounded-xl border border-[#261E33] leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Client Info & Address */}
                <div className="p-3 rounded-2xl bg-[#130F1A] border border-[#261E33] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F0F8]">
                      {ticket.clientName}
                    </span>
                    <span className="text-[10px] font-medium text-[#958B9F]">
                      {ticket.clientNeighborhood || 'Tétouan'}
                    </span>
                  </div>

                  <div className="text-xs text-[#958B9F] flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{ticket.clientAddress || 'Tétouan'}</span>
                  </div>
                </div>

                {/* HARDWARE SPECS FOR FIELD DIAGNOSIS */}
                {hw && (
                  <div className="p-3 rounded-2xl bg-[#0F0C14] border border-[#261E33] text-[11px] space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#958B9F] flex items-center gap-1">
                      <Radio className="w-3 h-3 text-amber-400" />
                      {t('telemetry_title')}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">
                          {t('antenna_model')}
                        </span>
                        <span className="font-semibold text-white">
                          {hw.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">
                          {t('antenna_mac')}
                        </span>
                        <span className="font-mono text-cyan-300">
                          {hw.antennaMac || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">
                          {t('pppoe_account')}
                        </span>
                        <span className="font-mono text-white">
                          {hw.pppoeUsername || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">
                          {t('wifi_ssid')}
                        </span>
                        <span className="font-semibold text-emerald-400">
                          {hw.wifiSsid || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution note display if resolved */}
                {ticket.resolutionNote && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
                    <span className="font-bold text-[10px] uppercase block text-emerald-400 mb-0.5">
                      {t('completed_action')}
                    </span>
                    {ticket.resolutionNote}
                  </div>
                )}

                {/* 1-TAP BIG TOUCH BUTTONS: CALL & MAPS */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* Direct 1-tap Call Button */}
                  {ticket.clientPhone ? (
                    <a
                      href={`tel:${ticket.clientPhone}`}
                      className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-95"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                      <span>
                        {t('call')} ({ticket.clientPhone.slice(-4)})
                      </span>
                    </a>
                  ) : (
                    <div
                      className="py-3 px-4 rounded-2xl bg-[#130F1A] border border-[#261E33] text-[#695F77] font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                      title={language === 'ar' ? 'لا يوجد رقم هاتف' : 'Numéro non renseigné'}
                    >
                      <Phone className="w-4 h-4 text-[#695F77]" />
                      <span>{language === 'ar' ? 'بدون هاتف' : 'Sans tél'}</span>
                    </div>
                  )}

                  {/* Direct 1-tap Google Maps Navigation */}
                  <a
                    href={ticket.googleMapsUrl || 'https://maps.google.com/?q=35.5784,-5.3684'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950 transition active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t('directions')}</span>
                  </a>
                </div>

                {/* STATUS UPDATE ACTION BUTTON */}
                <div className="pt-2 border-t border-[#261E33]">
                  {ticket.status === 'open' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenStatusModal(ticket.id, 'in_progress')
                      }
                      className="w-full py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>{t('start_task')}</span>
                    </button>
                  )}

                  {ticket.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(ticket.id, 'resolved')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('mark_resolved')}</span>
                    </button>
                  )}

                  {ticket.status === 'resolved' && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{ticket.assignedTechnicianName}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenStatusModal(ticket.id, 'in_progress')
                        }
                        className="text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        {t('reopen_task')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* STATUS UPDATE & RESOLUTION NOTE MODAL */}
      {modalTicketId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  targetStatus === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {targetStatus === 'resolved' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Wrench className="w-6 h-6" />
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {targetStatus === 'resolved'
                    ? t('resolution_modal_title')
                    : t('resolution_modal_sub')}
                </h4>
                <p className="text-xs text-slate-400">
                  {t('resolution_modal_sub')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('resolution_action_label')} <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder={t('resolution_placeholder')}
                className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
              />
            </div>

            {/* Quick Note Suggestions for Mobile Field Workers */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#958B9F] uppercase font-bold">
                {t('quick_notes_label')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  t('preset_note_rj45'),
                  t('preset_note_poe'),
                  t('preset_note_realign'),
                  t('preset_note_cable'),
                  t('preset_note_pppoe'),
                ].map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setResolutionNote(note)}
                    className="px-2.5 py-1 rounded-lg bg-[#130F1A] border border-[#261E33] text-[10px] text-[#958B9F] hover:text-[#F4F0F8] hover:border-[#3A2F4C] transition cursor-pointer"
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#261E33]">
              <button
                type="button"
                onClick={() => setModalTicketId(null)}
                className="px-4 py-2 text-xs text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/15 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
