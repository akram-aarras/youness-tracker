'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Ticket } from '@/lib/types';
import {
  Wrench,
  Plus,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  MapPin,
  ExternalLink,
  Check,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onOpenCreateTicketModal: () => void;
}

export default function TicketBoard({ onOpenCreateTicketModal }: Props) {
  const { tickets, technicians, updateTicketStatus, t } = useStore();

  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Resolution modal state
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const filteredTickets = tickets.filter((tk) => {
    const matchTech =
      selectedTechFilter === 'ALL' || tk.assignedToTechnicianId === selectedTechFilter;
    const matchCategory =
      selectedCategoryFilter === 'ALL' || tk.category === selectedCategoryFilter;
    return matchTech && matchCategory;
  });

  const openTickets = filteredTickets.filter((tk) => tk.status === 'open');
  const inProgressTickets = filteredTickets.filter((tk) => tk.status === 'in_progress');
  const resolvedTickets = filteredTickets.filter((tk) => tk.status === 'resolved');

  const handleStartResolving = (ticketId: string) => {
    setResolvingTicketId(ticketId);
    setResolutionNote(t('resolution_default_note'));
  };

  const handleConfirmResolved = () => {
    if (!resolvingTicketId || !resolutionNote.trim()) return;
    updateTicketStatus(resolvingTicketId, 'resolved', resolutionNote.trim());
    setResolvingTicketId(null);
    setResolutionNote('');
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3 text-rose-400 animate-pulse" />
            {t('prio_urgent')}
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            {t('prio_high')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t('tickets_title')}
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {openTickets.length + inProgressTickets.length} Active Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('tickets_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateTicketModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-lg shadow-amber-900/30 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('create_ticket_btn')}</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">
              Assigned Tech:
            </span>
            <select
              value={selectedTechFilter}
              onChange={(e) => setSelectedTechFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            >
              <option value="ALL">{t('all')} Technicians</option>
              {technicians.map((tch) => (
                <option key={tch.id} value={tch.id}>
                  {tch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">
              Issue Category:
            </span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
            >
              <option value="ALL">{t('all')} Categories</option>
              <option value="no_internet">{t('cat_no_internet')}</option>
              <option value="weak_signal">{t('cat_weak_signal')}</option>
              <option value="power_adapter">{t('cat_power_adapter')}</option>
              <option value="new_installation">{t('cat_new_installation')}</option>
              <option value="router_config">{t('cat_router_config')}</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'board'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kanban Columns
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dense List
          </button>
        </div>
      </div>

      {/* Board Empty Banner */}
      {tickets.length === 0 && (
        <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">{t('all_clear_title')}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('all_clear_subtitle')}
          </p>
          <button
            onClick={onOpenCreateTicketModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('create_ticket_btn')}</span>
          </button>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: OPEN */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-bold text-white text-sm">{t('col_open')}</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {openTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {openTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {t('no_tickets_found')}
                </div>
              ) : (
                openTickets.map((tk) => (
                  <TicketCard
                    key={tk.id}
                    ticket={tk}
                    getPriorityBadge={getPriorityBadge}
                    getCategoryLabel={getCategoryLabel}
                    onStartProgress={() => updateTicketStatus(tk.id, 'in_progress')}
                    onResolve={() => handleStartResolving(tk.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">{t('col_in_progress')}</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {inProgressTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {t('no_tickets_found')}
                </div>
              ) : (
                inProgressTickets.map((tk) => (
                  <TicketCard
                    key={tk.id}
                    ticket={tk}
                    getPriorityBadge={getPriorityBadge}
                    getCategoryLabel={getCategoryLabel}
                    onReopen={() => updateTicketStatus(tk.id, 'open')}
                    onResolve={() => handleStartResolving(tk.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: RESOLVED */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-white text-sm">{t('col_resolved')}</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {resolvedTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {resolvedTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {t('no_tickets_found')}
                </div>
              ) : (
                resolvedTickets.map((tk) => (
                  <TicketCard
                    key={tk.id}
                    ticket={tk}
                    getPriorityBadge={getPriorityBadge}
                    getCategoryLabel={getCategoryLabel}
                    onReopen={() => updateTicketStatus(tk.id, 'in_progress')}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DENSE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">{t('client_contact')}</th>
                  <th className="py-3 px-4">Category & Priority</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-300">{t('no_tickets_found')}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {tickets.length === 0
                          ? 'No dispatch tasks or incidents currently logged in Tétouan.'
                          : 'No tickets match the selected filters.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{ticket.clientName}</div>
                        <div className="text-[10px] text-slate-400">
                          {ticket.clientNeighborhood || 'Tétouan'} {ticket.clientAddress ? `— ${ticket.clientAddress}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">
                          {getCategoryLabel(ticket.category)}
                        </div>
                        <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">
                          {ticket.assignedTechnicianName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            ticket.status === 'open'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : ticket.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left">
                        {ticket.status !== 'resolved' ? (
                          <button
                            type="button"
                            onClick={() => handleStartResolving(ticket.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            {t('mark_resolved')}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t('tab_resolved')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {resolvingTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {t('resolution_modal_title')}
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
                placeholder="Ex: Replaced RJ45 connector, aligned LiteBeam to -60 dBm..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Quick Chips for Resolution Note */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Replaced RJ45 connector',
                'Reset PoE adapter & replaced cord',
                'Re-aligned LiteBeam antenna (-60 dBm)',
                'Configured PPPoE & Wi-Fi password',
                'Installed new rooftop mount & Cat6 cable',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setResolutionNote(chip)}
                  className="px-2 py-0.8 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResolvingTicketId(null)}
                className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmResolved}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Ticket Card
interface CardProps {
  ticket: Ticket;
  getPriorityBadge: (p: Ticket['priority']) => React.ReactNode;
  getCategoryLabel: (c: Ticket['category']) => string;
  onStartProgress?: () => void;
  onResolve?: () => void;
  onReopen?: () => void;
}

function TicketCard({
  ticket,
  getPriorityBadge,
  getCategoryLabel,
  onStartProgress,
  onResolve,
  onReopen,
}: CardProps) {
  const { t } = useStore();

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-3 shadow-md">
      {/* Top row: Ticket # & Priority */}
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-xs text-cyan-400">
          {ticket.ticketNumber}
        </span>
        {getPriorityBadge(ticket.priority)}
      </div>

      {/* Category */}
      <div className="text-xs font-semibold text-white">
        {getCategoryLabel(ticket.category)}
      </div>

      {/* Client & Address */}
      <div className="text-xs text-slate-300 space-y-1">
        <div className="font-bold text-white flex items-center gap-1.5">
          <span>{ticket.clientName}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">
            {ticket.clientNeighborhood || 'Tétouan'} {ticket.clientAddress ? `— ${ticket.clientAddress}` : ''}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
        {ticket.description}
      </p>

      {/* Resolution note if resolved */}
      {ticket.resolutionNote && (
        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300">
          <span className="font-bold block text-[10px] uppercase text-emerald-400">
            {t('completed_action')}
          </span>
          {ticket.resolutionNote}
        </div>
      )}

      {/* Quick contacts & actions strip */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <div className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">
            {ticket.assignedTechnicianName.charAt(0)}
          </div>
          <span className="text-[11px]">{ticket.assignedTechnicianName}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${ticket.clientPhone}`}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
            title="Call"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>

          <a
            href={ticket.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition"
            title="Directions"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Status Transition Action Buttons */}
      <div className="pt-1 flex items-center justify-end gap-1.5">
        {ticket.status === 'open' && onStartProgress && (
          <button
            type="button"
            onClick={onStartProgress}
            className="w-full py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t('start_task')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {ticket.status === 'in_progress' && onResolve && (
          <button
            type="button"
            onClick={onResolve}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{t('mark_resolved')}</span>
          </button>
        )}

        {ticket.status === 'resolved' && onReopen && (
          <button
            type="button"
            onClick={onReopen}
            className="text-[11px] text-slate-500 hover:text-slate-300 underline transition cursor-pointer"
          >
            {t('reopen_task')}
          </button>
        )}
      </div>
    </div>
  );
}
