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
  Archive,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Info,
} from 'lucide-react';
import { TETOUAN_NEIGHBORHOODS } from './Modals/RegisterClientModal';
import EditClientModal from './Modals/EditClientModal';

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
  const {
    clients,
    tickets,
    payments,
    deleteClient,
    t,
    language,
    localizePlanName,
    localizeStatus,
    getClientStatus,
    getDaysDiff,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | SubscriptionStatus>('ALL');

  // Edit & Delete modal states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now(), type, message });
  };

  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    const clientToDelete = deletingClient;
    try {
      await deleteClient(clientToDelete.id);
      setDeletingClient(null);
      showToast(
        t('delete_success_toast', { name: clientToDelete.name }),
        'success'
      );
    } catch (err) {
      console.error('Failed to delete client:', err);
      showToast(
        t('delete_error_toast', { name: clientToDelete.name }),
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Debounce search input by 200ms to scale smoothly across 500+ records
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Extract unique neighborhoods from existing clients or fallback to Tétouan areas
  const clientNeighborhoods = React.useMemo(() => {
    return Array.from(
      new Set(clients.map((c) => c.neighborhood).filter(Boolean) as string[])
    );
  }, [clients]);

  const neighborhoods = React.useMemo(() => {
    return [
      'ALL',
      ...(clientNeighborhoods.length > 0 ? clientNeighborhoods : TETOUAN_NEIGHBORHOODS),
    ];
  }, [clientNeighborhoods]);

  // Filtering (Memoized for high performance)
  const filteredClients = React.useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return clients.filter((client) => {
      // Search query
      const matchSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        client.phone.includes(term) ||
        Boolean(client.hardware?.antennaMac?.toLowerCase().includes(term)) ||
        Boolean(client.hardware?.pppoeUsername?.toLowerCase().includes(term));

      // Neighborhood filter
      const matchNeighborhood =
        selectedNeighborhood === 'ALL' || client.neighborhood === selectedNeighborhood;

      // Status filter
      const effectiveStatus = getClientStatus(client);
      const matchStatus =
        selectedStatusTab === 'ALL' || effectiveStatus === selectedStatusTab;

      return matchSearch && matchNeighborhood && matchStatus;
    });
  }, [clients, debouncedSearch, selectedNeighborhood, selectedStatusTab]);
  // Signal level badge helper
  const getSignalColor = (dbm: number) => {
    if (dbm >= -62) return 'text-emerald-700 bg-emerald-50 border-emerald-200/60 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (dbm >= -70) return 'text-blue-700 bg-blue-50 border-blue-200/60 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
    if (dbm >= -78) return 'text-amber-700 bg-amber-50 border-amber-200/60 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
    return 'text-rose-700 bg-rose-50 border-rose-200/60 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('dir_title')}
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              {clients.length} {t('all')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('dir_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full sm:w-auto">
          {/* Secondary CTA: تسجيل دفعة شهرية (Clean White Button) */}
          <button
            type="button"
            onClick={() => onOpenPaymentModal()}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="truncate">{t('dash_record_payment')}</span>
          </button>

          {/* Primary CTA: تسجيل مشترك جديد (Vibrant Orange Modern Button) */}
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white shrink-0" />
            <span className="truncate">{t('dash_new_installation')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box with ID for Ctrl+K integration */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
            <input
              id="client-directory-search-input"
              type="text"
              placeholder={t('dir_search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>

          {/* Neighborhood filter */}
          <div>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 transition cursor-pointer"
            >
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n === 'ALL' ? `🌍 ${t('filter_all_neighborhoods')}` : `📍 ${n}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pill Tabs (Light SaaS Pastel Palette) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-semibold text-[11px] uppercase mr-1 rtl:mr-0 rtl:ml-1">
            {t('status')}:
          </span>

          <button
            onClick={() => setSelectedStatusTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedStatusTab === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('all')} ({clients.length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('status_active')} ({clients.filter((c) => getClientStatus(c) === 'active').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('due_soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'due_soon'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700 hover:bg-amber-50/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t('status_due_soon')} ({clients.filter((c) => getClientStatus(c) === 'due_soon').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'overdue'
                ? 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 hover:bg-rose-50/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {t('status_overdue')} ({clients.filter((c) => getClientStatus(c) === 'overdue').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'suspended'
                ? 'bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-red-700 hover:bg-red-50/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {t('status_suspended')} ({clients.filter((c) => getClientStatus(c) === 'suspended').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('archived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              selectedStatusTab === 'archived'
                ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            {t('status_archived')} ({clients.filter((c) => getClientStatus(c) === 'archived').length})
          </button>
        </div>
      </div>

      {/* Directory Table - Carte Blanche Spacieuse */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        {clients.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center mx-auto">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('no_clients_found')}</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                {t('no_subscribers_registered_sub')}
              </p>
            </div>
            <button
              onClick={onOpenRegisterModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition inline-flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>{t('register_first_client')}</span>
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('no_clients_match_filters')}
          </div>
        ) : (
          <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left rtl:text-right text-xs border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-semibold tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">{t('col_subscriber_location')}</th>
                  <th className="py-3.5 px-4">{t('col_neighborhood')}</th>
                  <th className="py-3.5 px-4">{t('col_monthly_fee')}</th>
                  <th className="py-3.5 px-4">{t('col_status')}</th>
                  <th className="py-3.5 px-4">{t('col_cpe_antenna')}</th>
                  <th className="py-3.5 px-4">{t('col_pppoe_router')}</th>
                  <th className="py-3.5 px-4 text-right rtl:text-left min-w-[210px]">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredClients.map((client) => {
                  const status = getClientStatus(client);
                  const daysDiff = getDaysDiff(client.nextDueDate);
                  const isOverdue = status === 'overdue';

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Name & Phone */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => onOpenClientDetailModal(client)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="text-sm">{client.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition rtl:rotate-180" />
                        </button>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a
                            href={`tel:${client.phone}`}
                            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </td>

                      {/* Neighborhood - Étiquette gris neutre discrète */}
                      <td className="py-4 px-4">
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded-lg text-xs">
                          {client.neighborhood || 'Tétouan'}
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px] mt-1">
                          {client.address || 'N/A'}
                        </div>
                      </td>

                      {/* Plan & Fee */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {client.monthlyFee || 100}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">{t('currency')}/mo</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {localizePlanName(client.subscriptionPlan)}
                        </div>
                      </td>

                      {/* Due Date & Status - Pastilles pastel douces */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-slate-700 dark:text-slate-300 text-xs">
                          {client.nextDueDate}
                        </div>
                        <div className="mt-1">
                          {status === 'archived' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 flex items-center gap-1 w-fit">
                              <Archive className="w-3 h-3" />
                              {t('status_archived')}
                            </span>
                          ) : status === 'suspended' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 flex items-center gap-1 w-fit">
                              <ShieldAlert className="w-3 h-3" />
                              {t('status_suspended')}
                            </span>
                          ) : status === 'overdue' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.abs(daysDiff)}{language === 'ar' ? ' يوم ' : 'd '} {t('status_overdue')}
                            </span>
                          ) : status === 'due_soon' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              {t('status_due_soon')} ({daysDiff === 0 ? (language === 'ar' ? 'اليوم' : "Aujourd'hui") : `${daysDiff}${language === 'ar' ? 'ي' : 'd'}`})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              {t('status_active')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Hardware & Signal */}
                      <td className="py-4 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate">{client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${getSignalColor(
                              client.hardware?.signalStrengthDbm || -65
                            )}`}
                          >
                            {client.hardware?.signalStrengthDbm || -65} dBm
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {client.hardware?.antennaMac || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* PPPoE & Router */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-orange-600 dark:text-orange-400 font-bold text-xs">
                          {client.hardware?.pppoeUsername || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {client.hardware?.routerModel || 'Standard Router'}
                        </div>
                      </td>

                      {/* Actions - Icônes Circulaires Minimalistes */}
                      <td className="py-4 px-4 text-right rtl:text-left min-w-[210px]">
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => onOpenWhatsAppModal(client)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/60 hover:border-emerald-200 dark:bg-slate-800 dark:hover:bg-emerald-950/40 dark:text-slate-300 dark:hover:text-emerald-300 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shrink-0 touch-manipulation hover:scale-105 active:scale-95 shadow-2xs"
                            title={t('action_send_whatsapp')}
                            aria-label={`${t('action_send_whatsapp')} - ${client.name}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Payment */}
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(client.id)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200/60 hover:border-orange-200 dark:bg-slate-800 dark:hover:bg-orange-950/40 dark:text-slate-300 dark:hover:text-orange-400 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shrink-0 touch-manipulation hover:scale-105 active:scale-95 shadow-2xs"
                            title={t('action_record_payment')}
                            aria-label={`${t('action_record_payment')} - ${client.name}`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* Create Ticket */}
                          <button
                            type="button"
                            onClick={() => onOpenTicketModal(client.id)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 hover:border-blue-200 dark:bg-slate-800 dark:hover:bg-blue-950/40 dark:text-slate-300 dark:hover:text-blue-400 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shrink-0 touch-manipulation hover:scale-105 active:scale-95 shadow-2xs"
                            title={t('action_open_ticket')}
                            aria-label={`${t('action_open_ticket')} - ${client.name}`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Client */}
                          <button
                            type="button"
                            onClick={() => setEditingClient(client)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200/60 hover:border-sky-200 dark:bg-slate-800 dark:hover:bg-sky-950/40 dark:text-slate-300 dark:hover:text-sky-400 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shrink-0 touch-manipulation hover:scale-105 active:scale-95 shadow-2xs"
                            title={t('action_edit')}
                            aria-label={`${t('action_edit')} - ${client.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Client */}
                          <button
                            type="button"
                            onClick={() => setDeletingClient(client)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shrink-0 touch-manipulation hover:scale-105 active:scale-95 shadow-2xs"
                            title={t('action_delete')}
                            aria-label={`${t('action_delete')} - ${client.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Client Modal */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={(msg) => {
            setEditingClient(null);
            showToast(msg, 'success');
          }}
        />
      )}

      {/* Delete Confirmation Modal - Light SaaS Modern Dialog */}
      {deletingClient && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 id="delete-confirm-title" className="text-base font-bold text-rose-700 dark:text-rose-400">
                  {t('delete_modal_title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('delete_modal_sub')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {t('delete_modal_confirm_msg', { name: deletingClient.name })}
              </p>

              {/* Client & cascade summary pill */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('client_contact')} :</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{deletingClient.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('col_neighborhood')} :</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{deletingClient.neighborhood || 'Tétouan'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/80 dark:border-slate-700">
                  <span>{t('payment_history_count_label')}</span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                    {payments.filter((p) => p.clientId === deletingClient.id).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('tickets_count_label')}</span>
                  <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                    {tickets.filter((t) => t.clientId === deletingClient.id).length}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {t('delete_modal_cascade_warning')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('deleting_in_progress')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete_confirm_btn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification - Light SaaS Pill */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
        >
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 ${
              toast.type === 'success'
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 text-emerald-800 dark:text-emerald-300 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-white/95 dark:bg-slate-900/95 border-rose-200 text-rose-800 dark:text-rose-300 shadow-rose-500/10'
                : 'bg-white/95 dark:bg-slate-900/95 border-amber-200 text-amber-800 dark:text-amber-300 shadow-amber-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <Info className="w-4 h-4" />
                </div>
              )}
              <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
