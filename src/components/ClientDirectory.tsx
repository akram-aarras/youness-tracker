'use client';

import React, { useState } from 'react';
import { useStore, getDaysDiffFromToday } from '@/lib/store';
import { Client, SubscriptionStatus } from '@/lib/types';
import {
  Search,
  UserPlus,
  Radio,
  Phone,
  CreditCard,
  MessageSquare,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { TETOUAN_NEIGHBORHOODS } from './Modals/RegisterClientModal';

interface Props {
  onOpenRegisterModal: () => void;
  onOpenPaymentModal: (clientId?: string) => void;
  onOpenTicketModal: (clientId?: string) => void;
  onOpenWhatsAppModal: (client: Client) => void;
  onOpenClientDetailModal: (client: Client) => void;
}

export default function ClientDirectory({
  onOpenRegisterModal,
  onOpenPaymentModal,
  onOpenTicketModal,
  onOpenWhatsAppModal,
  onOpenClientDetailModal,
}: Props) {
  const { clients, t } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | SubscriptionStatus>('ALL');

  // Extract unique neighborhoods from existing clients or fallback to Tétouan areas
  const clientNeighborhoods = Array.from(
    new Set(clients.map((c) => c.neighborhood).filter(Boolean) as string[])
  );
  const neighborhoods = [
    'ALL',
    ...(clientNeighborhoods.length > 0 ? clientNeighborhoods : TETOUAN_NEIGHBORHOODS),
  ];

  // Filtering
  const filteredClients = clients.filter((client) => {
    // Search query
    const matchSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      Boolean(client.hardware?.antennaMac?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      Boolean(client.hardware?.pppoeUsername?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Neighborhood filter
    const matchNeighborhood =
      selectedNeighborhood === 'ALL' || client.neighborhood === selectedNeighborhood;

    // Status filter
    const matchStatus =
      selectedStatusTab === 'ALL' || client.status === selectedStatusTab;

    return matchSearch && matchNeighborhood && matchStatus;
  });

  // Signal level badge helper
  const getSignalColor = (dbm: number) => {
    if (dbm >= -62) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (dbm >= -70) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (dbm >= -78) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t('dir_title')}
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {clients.length} {t('all')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('dir_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPaymentModal()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-900/30 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>{t('dash_record_payment')}</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-900/30 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('dash_new_installation')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3" />
            <input
              type="text"
              placeholder={t('dir_search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Neighborhood filter */}
          <div>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            >
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n === 'ALL' ? `🌍 ${t('filter_all_neighborhoods')}` : `📍 ${n}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] uppercase mr-1 rtl:mr-0 rtl:ml-1">
            {t('status')}:
          </span>

          <button
            onClick={() => setSelectedStatusTab('ALL')}
            className={`px-3 py-1 rounded-xl font-medium transition cursor-pointer ${
              selectedStatusTab === 'ALL'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t('all')} ({clients.length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('active')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {t('status_active')} ({clients.filter((c) => c.status === 'active').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('due_soon')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'due_soon'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {t('status_due_soon')} ({clients.filter((c) => c.status === 'due_soon').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('overdue')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'overdue'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {t('status_overdue')} ({clients.filter((c) => c.status === 'overdue').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('suspended')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'suspended'
                ? 'bg-red-950 text-red-300 border border-red-800 font-bold'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {t('status_suspended')} ({clients.filter((c) => c.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {clients.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('no_clients_found')}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {t('no_subscribers_registered_sub')}
              </p>
            </div>
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition inline-flex items-center gap-2 shadow-lg shadow-cyan-900/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('register_first_client')}</span>
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {t('no_clients_match_filters')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold tracking-wider text-[11px]">
                  <th className="py-3 px-4">{t('client_contact')}</th>
                  <th className="py-3 px-4">Quartier</th>
                  <th className="py-3 px-4">{t('metric_monthly_revenue')}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4">{t('antenna_model')}</th>
                  <th className="py-3 px-4">PPPoE & Router</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredClients.map((client) => {
                  const daysDiff = getDaysDiffFromToday(client.nextDueDate);
                  const isOverdue = daysDiff < 0;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onOpenClientDetailModal(client)}
                          className="font-bold text-white hover:text-cyan-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{client.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
                        </button>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <a
                            href={`tel:${client.phone}`}
                            className="hover:text-emerald-400 transition"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </td>

                      {/* Neighborhood */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {client.neighborhood || 'Tétouan'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {client.address || 'N/A'}
                        </div>
                      </td>

                      {/* Plan & Fee */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white text-sm">
                          {client.monthlyFee || 100}{' '}
                          <span className="text-[10px] text-slate-400">{t('currency')}/mo</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {client.subscriptionPlan}
                        </div>
                      </td>

                      {/* Due Date & Status */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-white text-xs">
                          {client.nextDueDate}
                        </div>
                        <div className="mt-1">
                          {client.status === 'suspended' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 w-fit">
                              <ShieldAlert className="w-3 h-3" />
                              {t('status_suspended')}
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.abs(daysDiff)}d {t('status_overdue')}
                            </span>
                          ) : client.status === 'due_soon' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              {t('status_due_soon')} ({daysDiff}d)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              {t('status_active')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Hardware & Signal */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium flex items-center gap-1">
                          <Radio className="w-3 h-3 text-cyan-400" />
                          <span>{client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono border font-bold ${getSignalColor(
                              client.hardware?.signalStrengthDbm || -65
                            )}`}
                          >
                            {client.hardware?.signalStrengthDbm || -65} dBm
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {client.hardware?.antennaMac || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* PPPoE & Router */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-cyan-300 text-[11px]">
                          {client.hardware?.pppoeUsername || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {client.hardware?.routerModel || 'Standard Router'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenWhatsAppModal(client)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(client.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition cursor-pointer"
                            title={t('dash_record_payment')}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTicketModal(client.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition cursor-pointer"
                            title={t('dash_new_ticket')}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
