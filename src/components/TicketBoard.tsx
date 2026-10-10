'use client';

import Dialog from '@/components/ui/Dialog';

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
  const { tickets, technicians, updateTicketStatus, t, language } = useStore();

  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;
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
          <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-rose-500/20 text-[var(--error)] border border-rose-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[var(--error)] animate-pulse" />
            {t('prio_urgent')}
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/20 text-[var(--warning)] border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[var(--warning)]" />
            {t('prio_high')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--info)]" />
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
    <div className="page-view tickets-view">
      {/* Top Banner */}
      <div className="page-heading flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)]/70 shadow-xl shadow-black/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">
              {t('tickets_title')}
            </h1>
            <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--warning)] border border-[var(--border)]">
              {openTickets.length + inProgressTickets.length} {text('en cours', 'active', 'قيد المعالجة')}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            {t('tickets_subtitle')}
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenCreateTicketModal}
            className="w-full sm:w-auto min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm sm:text-sm transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span className="text-slate-950">{t('create_ticket_btn')}</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-4 shadow-xl shadow-black/40 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] font-semibold uppercase text-[12px]">
              {text('Technicien', 'Technician', 'التقني')}
            </span>
            <select
              value={selectedTechFilter}
              onChange={(e) => setSelectedTechFilter(e.target.value)}
              className="bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
             aria-label={text('Filtrer par technicien', 'Filter by technician', 'تصفية حسب التقني')}>
              <option value="ALL">{text('Tous les techniciens', 'All technicians', 'جميع التقنيين')}</option>
              {technicians.map((tch) => (
                <option key={tch.id} value={tch.id}>
                  {tch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] font-semibold uppercase text-[12px]">
              {text('Catégorie', 'Category', 'الصنف')}
            </span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
             aria-label={text('Filtrer par catégorie', 'Filter by category', 'تصفية حسب الصنف')}>
              <option value="ALL">{text('Toutes les catégories', 'All categories', 'جميع الأصناف')}</option>
              <option value="no_internet">{t('cat_no_internet')}</option>
              <option value="weak_signal">{t('cat_weak_signal')}</option>
              <option value="power_adapter">{t('cat_power_adapter')}</option>
              <option value="new_installation">{t('cat_new_installation')}</option>
              <option value="router_config">{t('cat_router_config')}</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[var(--surface-muted)] p-1 rounded-xl border border-[var(--border)]/70">
          <button aria-pressed={viewMode === 'board'} onClick={() => setViewMode('board')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition cursor-pointer ${
              viewMode === 'board'
                ? 'bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {text('Tableau', 'Board', 'لوحة')}
          </button>
          <button aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)] font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {text('Liste', 'List', 'قائمة')}
          </button>
        </div>
      </div>

      {/* Board Empty Banner */}
      {tickets.length === 0 && (
        <div className="p-8 text-center bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)] space-y-3">
          <CheckCircle className="w-10 h-10 text-[var(--success)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text)]">{t('all_clear_title')}</h3>
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
            {t('all_clear_subtitle')}
          </p>
          <button
            onClick={onOpenCreateTicketModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm transition inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/15 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>{t('create_ticket_btn')}</span>
          </button>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="ticket-columns grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Column 1: OPEN */}
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[var(--border)]/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-bold text-[var(--text)] text-sm">{t('col_open')}</h3>
              </div>
              <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border)]">
                {openTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {openTickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--muted)]">
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
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[var(--border)]/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-bold text-[var(--text)] text-sm">{t('col_in_progress')}</h3>
              </div>
              <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border)]">
                {inProgressTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressTickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--muted)]">
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
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[var(--border)]/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-[var(--text)] text-sm">{t('col_resolved')}</h3>
              </div>
              <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border)]">
                {resolvedTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {resolvedTickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--muted)]">
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
        <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
          <div className="overflow-x-auto w-full">
            <table className="client-table w-full text-left rtl:text-right text-sm border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[var(--surface-muted)] text-[var(--muted)] border-b border-[var(--border)] uppercase font-semibold tracking-wider text-[12px]">
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">{t('client_contact')}</th>
                  <th className="py-3 px-4">{text('Catégorie & priorité', 'Category & priority', 'الصنف والأولوية')}</th>
                  <th className="py-3 px-4">{text('Technicien assigné', 'Assigned technician', 'التقني المكلف')}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-muted)]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--muted)]" data-label={"Ticket #"}>
                      <Wrench className="w-8 h-8 text-[var(--muted)] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[var(--text)]">{t('no_tickets_found')}</p>
                      <p className="text-sm text-[var(--muted)] mt-1">
                        {tickets.length === 0
                          ? text('Aucune intervention enregistrée à Tétouan.', 'No dispatch tasks or incidents logged in Tétouan.', 'لا توجد تدخلات أو أعطال مسجلة في تطوان.')
                          : text('Aucun ticket ne correspond aux filtres.', 'No tickets match the selected filters.', 'لا توجد تذاكر تطابق التصفية.')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[var(--surface)] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--warning)]" data-label="Ticket #">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3 px-4" data-label={t('client_contact')}>
                        <div className="font-bold text-[var(--text)]">{ticket.clientName}</div>
                        <div className="text-[12px] text-[var(--muted)]">
                          {ticket.clientNeighborhood || 'Tétouan'} {ticket.clientAddress ? `— ${ticket.clientAddress}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4" data-label={text('Catégorie & priorité', 'Category & priority', 'الصنف والأولوية')}>
                        <div className="text-[var(--text-secondary)] font-medium">
                          {getCategoryLabel(ticket.category)}
                        </div>
                        <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                      </td>
                      <td className="py-3 px-4" data-label={text('Technicien assigné', 'Assigned technician', 'التقني المكلف')}>
                        <span className="font-semibold text-[var(--text)]">
                          {ticket.assignedTechnicianName}
                        </span>
                      </td>
                      <td className="py-3 px-4" data-label={t('status')}>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${
                            ticket.status === 'open'
                              ? 'bg-rose-500/20 text-[var(--error)] border-rose-500/30'
                              : ticket.status === 'in_progress'
                              ? 'bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]'
                              : 'bg-emerald-500/20 text-[var(--success)] border border-emerald-500/30'
                          }`}
                        >
                          {t(ticket.status === 'open' ? 'ticket_status_open' : ticket.status === 'in_progress' ? 'ticket_status_in_progress' : 'ticket_status_resolved')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left" data-label={t('actions')}>
                        {ticket.status !== 'resolved' ? (
                          <button
                            type="button"
                            onClick={() => handleStartResolving(ticket.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                          >
                            {t('mark_resolved')}
                          </button>
                        ) : (
                          <span className="text-[12px] text-[var(--muted)] font-mono">
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
        <Dialog onClose={() => setResolvingTicketId(null)} label="Ticket Board">
          <div className="bg-[var(--surface)] sm:border sm:border-[var(--border)]/70 rounded-none sm:rounded-2xl p-4 sm:p-6 max-w-md w-full h-full sm:h-auto overflow-y-auto space-y-4 shadow-2xl shadow-black/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text)]">
                    {t('resolution_modal_title')}
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    {t('resolution_modal_sub')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="TicketBoard-field-0">
                  {t('resolution_action_label')} <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Ex: Replaced RJ45 connector, aligned LiteBeam to -60 dBm..."
                  className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                  id="TicketBoard-field-0"/>
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
                    className="px-2 py-1 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/70 text-[12px] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border)] transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between sm:justify-end gap-2 border-t border-[var(--border)] shrink-0">
              <button
                type="button"
                onClick={() => setResolvingTicketId(null)}
                className="min-h-[44px] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] rounded-xl cursor-pointer transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmResolved}
                className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </Dialog>
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
    <div className="p-4 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border)] transition space-y-3 shadow-md">
      {/* Top row: Ticket # & Priority */}
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-sm text-[var(--warning)]">
          {ticket.ticketNumber}
        </span>
        {getPriorityBadge(ticket.priority)}
      </div>

      {/* Category */}
      <div className="text-sm font-semibold text-[var(--text)]">
        {getCategoryLabel(ticket.category)}
      </div>

      {/* Client & Address */}
      <div className="text-sm text-[var(--text-secondary)] space-y-1">
        <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
          <span>{ticket.clientName}</span>
        </div>
        <div className="text-[12px] text-[var(--muted)] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[var(--muted)] shrink-0" />
          <span className="truncate">
            {ticket.clientNeighborhood || 'Tétouan'} {ticket.clientAddress ? `— ${ticket.clientAddress}` : ''}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--muted)] bg-[var(--background)] p-2.5 rounded-xl border border-[var(--border)] leading-relaxed">
        {ticket.description}
      </p>

      {/* Resolution note if resolved */}
      {ticket.resolutionNote && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-800/40 text-[12px] text-[var(--success)]">
          <span className="font-bold block text-[12px] uppercase text-[var(--success)]">
            {t('completed_action')}
          </span>
          {ticket.resolutionNote}
        </div>
      )}

      {/* Quick contacts & actions strip */}
      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
          <div className="w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[12px] font-bold flex items-center justify-center text-[var(--text-secondary)]">
            {ticket.assignedTechnicianName.charAt(0)}
          </div>
          <span className="text-[12px]">{ticket.assignedTechnicianName}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${ticket.clientPhone}`}
            className="p-1.5 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-emerald-400 transition"
            title="Call"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>

          <a
            href={ticket.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-blue-400 transition"
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
            className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-[var(--warning)] border border-amber-500/30 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t('start_task')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {ticket.status === 'in_progress' && onResolve && (
          <button
            type="button"
            onClick={onResolve}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{t('mark_resolved')}</span>
          </button>
        )}

        {ticket.status === 'resolved' && onReopen && (
          <button
            type="button"
            onClick={onReopen}
            className="text-[12px] text-[var(--muted)] hover:text-[var(--text)] underline transition cursor-pointer"
          >
            {t('reopen_task')}
          </button>
        )}
      </div>
    </div>
  );
}
