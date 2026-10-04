'use client';

import React from 'react';
import { useStore, getDaysDiffFromToday } from '@/lib/store';
import { Client } from '@/lib/types';
import {
  Users,
  Coins,
  AlertTriangle,
  Wrench,
  MessageSquare,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Phone,
  CheckCircle,
  Radio,
  Receipt,
} from 'lucide-react';
import InvoiceReceiptModal from './Modals/InvoiceReceiptModal';
import { PaymentLog } from '@/lib/types';

interface Props {
  onOpenRegisterModal: () => void;
  onOpenPaymentModal: (clientId?: string) => void;
  onOpenTicketModal: (clientId?: string) => void;
  onOpenWhatsAppModal: (client: Client) => void;
  onOpenClientDetailModal: (client: Client) => void;
  onNavigateToClients: () => void;
  onNavigateToTickets: () => void;
}

export default function AdminDashboard({
  onOpenRegisterModal,
  onOpenPaymentModal,
  onOpenTicketModal,
  onOpenWhatsAppModal,
  onOpenClientDetailModal,
  onNavigateToClients,
  onNavigateToTickets,
}: Props) {
  const { clients, tickets, payments, t } = useStore();
  const [selectedPaymentForSlip, setSelectedPaymentForSlip] = React.useState<PaymentLog | null>(null);

  // Metric 1: Active Subscribers (active + due_soon)
  const activeSubscribersCount = clients.filter(
    (c) => c.status === 'active' || c.status === 'due_soon'
  ).length;
  const overdueSubscribersCount = clients.filter(
    (c) => c.status === 'overdue' || c.status === 'suspended'
  ).length;

  // Metric 2: Total Revenue Collected (Actual collected total: Base + Extra Fees)
  const currentMonthRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBaseRevenue = payments.reduce(
    (sum, p) => sum + (p.baseFee ?? (p.amount - (p.extraAmount ?? 0))),
    0
  );
  const totalExtraFees = payments.reduce((sum, p) => sum + (p.extraAmount ?? 0), 0);

  // Metric 3: Total Overdue / Uncollected Amount (Dynamic based on each subscriber's rate)
  const overdueClients = clients.filter(
    (c) => c.status === 'overdue' || c.status === 'suspended'
  );
  const totalOverdueAmount = overdueClients.reduce((sum, c) => sum + (c.monthlyFee || 100), 0);

  // Metric 4: Open Support Tickets
  const openTickets = tickets.filter((tkt) => tkt.status !== 'resolved');
  const urgentTicketsCount = openTickets.filter((tkt) => tkt.priority === 'urgent').length;

  // Urgent Action Center: Clients due within 3 days or currently overdue
  const urgentBillingClients = clients
    .filter((c) => {
      const days = getDaysDiffFromToday(c.nextDueDate);
      return days <= 3; // due soon (<= 3 days) or overdue (< 0)
    })
    .sort((a, b) => {
      // Sort most overdue first
      return getDaysDiffFromToday(a.nextDueDate) - getDaysDiffFromToday(b.nextDueDate);
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t('dash_title')}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t('live')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('dash_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            <Plus className="w-4 h-4" />
            <span>{t('dash_new_installation')}</span>
          </button>

          <button
            onClick={() => onOpenTicketModal()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{t('dash_new_ticket')}</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscribers */}
        <div
          onClick={onNavigateToClients}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('metric_active_subs')}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {activeSubscribersCount}
            </span>
            <span className="text-xs text-slate-400">/ {clients.length} {t('all').toLowerCase()}</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {activeSubscribersCount} {t('connected_label')}
            </span>
            <span className="text-rose-400 font-semibold">
              {overdueSubscribersCount} {t('overdue_label')}
            </span>
          </div>
        </div>

        {/* Card 2: Revenue Collected This Month */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('metric_monthly_revenue')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">
              {currentMonthRevenue.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-emerald-400">{t('currency')}</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            {totalExtraFees > 0 ? (
              <span className="text-emerald-400 font-medium">
                Base: {totalBaseRevenue.toLocaleString()} MAD • Extra: +{totalExtraFees.toLocaleString()} MAD
              </span>
            ) : (
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                {payments.length} transactions
              </span>
            )}
            <span className="text-slate-500 font-mono">Actual collected</span>
          </div>
        </div>

        {/* Card 3: Overdue / Uncollected Amount */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('metric_overdue_uncollected')}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-rose-400 font-mono">
              {totalOverdueAmount.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-rose-400">{t('currency')}</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-rose-300 font-medium">
              {overdueClients.length} accounts pending
            </span>
            <span className="text-amber-400 font-medium">{t('actions')}</span>
          </div>
        </div>

        {/* Card 4: Open Support Tickets */}
        <div
          onClick={onNavigateToTickets}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('metric_open_tickets')}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {openTickets.length}
            </span>
            <span className="text-xs text-slate-400">in field / dispatch</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-medium">
              {urgentTicketsCount} {t('prio_urgent')}
            </span>
            <span className="text-slate-500">FieldTech Active</span>
          </div>
        </div>
      </div>

      {/* URGENT ACTION CENTER: BILLING ALERTS & WHATSAPP DISPATCH */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t('urgent_center_title')}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  {urgentBillingClients.length} {t('urgent_badge_accounts')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t('urgent_center_subtitle')}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2 self-start sm:self-auto font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Auto-Sync Filter: ≤ 3 Days or Past Due
          </div>
        </div>

        {/* Table of Urgent Billing Clients */}
        {clients.length === 0 ? (
          <div className="p-10 text-center bg-slate-950 rounded-2xl border border-slate-800/80">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">{t('no_subscribers_registered')}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              {t('no_subscribers_registered_sub')}
            </p>
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('register_first_client')}</span>
            </button>
          </div>
        ) : urgentBillingClients.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">{t('all_accounts_up_to_date')}</p>
            <p className="text-xs text-slate-400 mt-1">
              {t('all_accounts_up_to_date_sub')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left rtl:text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold tracking-wider text-[11px]">
                  <th className="py-3 px-4">{t('client_contact')}</th>
                  <th className="py-3 px-4">Quartier</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4">{t('metric_monthly_revenue')}</th>
                  <th className="py-3 px-4">{t('telemetry_title')}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {urgentBillingClients.map((client) => {
                  const daysDiff = getDaysDiffFromToday(client.nextDueDate);
                  const isOverdue = daysDiff < 0;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/50 transition group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onOpenClientDetailModal(client)}
                          className="font-bold text-white hover:text-cyan-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {client.name}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
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
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-medium">
                          {client.neighborhood || 'Tétouan'}
                        </span>
                      </td>

                      {/* Due Date & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-white">
                          {client.nextDueDate}
                        </div>
                        <div className="mt-1">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.abs(daysDiff)} Days {t('status_overdue')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              {t('status_due_soon')} ({daysDiff === 0 ? 'Today' : `${daysDiff}d`})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-sm">
                          {client.monthlyFee}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-semibold">{t('currency')}</span>
                        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                          {client.subscriptionPlan}
                        </div>
                      </td>

                      {/* Hardware Info */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 text-slate-300 font-medium">
                          <Radio className="w-3 h-3 text-cyan-400" />
                          {client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          MAC: {client.hardware?.antennaMac || 'N/A'}
                        </div>
                      </td>

                      {/* Direct Actions */}
                      <td className="py-3.5 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-2">
                          {/* Send WhatsApp Reminder */}
                          <button
                            type="button"
                            onClick={() => onOpenWhatsAppModal(client)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-950 hover:scale-105 active:scale-95 cursor-pointer"
                            title="Send bilingual WhatsApp reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Record Payment */}
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(client.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-950 hover:scale-105 active:scale-95 cursor-pointer"
                            title="Record monthly payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{t('dash_record_payment')}</span>
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

      {/* RECENT ACTIVITY & REVENUE LEDGER PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments Ledger (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>{t('recent_payments_title')}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {t('recent_payments_subtitle')}
              </p>
            </div>
            <button
              onClick={() => onOpenPaymentModal()}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              + {t('dash_record_payment')}
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
              <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">{t('no_payments_found')}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t('no_payments_found_sub')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 overflow-hidden">
              {payments.slice(0, 5).map((pay) => {
                const hasExtra = (pay.extraAmount ?? 0) > 0;
                const itemBase = pay.baseFee ?? (pay.amount - (pay.extraAmount ?? 0));
                return (
                  <div
                    key={pay.id}
                    className="p-3.5 bg-slate-950/60 hover:bg-slate-950 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{pay.clientName}</span>
                          {hasExtra && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                              +Extra
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-300">{pay.receiptNumber}</span>
                          <span>•</span>
                          <span className="capitalize">{pay.method.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{pay.paymentDate}</span>
                        </div>
                        {hasExtra && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Base: {itemBase} MAD + {pay.extraAmount} MAD ({pay.extraReason || 'Ajustement'})
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right rtl:text-left flex flex-col items-end rtl:items-start gap-1">
                      <div className="font-mono font-black text-emerald-400 text-sm">
                        +{pay.amount} {t('currency')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Due: {pay.newDueDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForSlip(pay)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Network Infrastructure Telemetry Summary (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>{t('infrastructure_title')}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {t('infrastructure_subtitle')}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Relais Jbel Dersa (Tétouan Nord)</div>
                <div className="text-[10px] text-slate-400">Ubiquiti airFiber 60 Backhaul</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Online
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Pylône Wilaya / Sania Rmel</div>
                <div className="text-[10px] text-slate-400">Rocket 5AC Prism + 45° Sector</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Online
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Tour Boujarah (Relais Centre)</div>
                <div className="text-[10px] text-slate-400">MikroTik mANTBox 19s</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Online
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Station Martil / Cabo Negro</div>
                <div className="text-[10px] text-slate-400">LiteAP AC Sector</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Heavy Traffic
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{t('bandwidth_consumption')}</span>
            <span className="font-mono text-cyan-400 font-bold">428 Mbps / 1 Gbps</span>
          </div>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {selectedPaymentForSlip && (
        <InvoiceReceiptModal
          payment={selectedPaymentForSlip}
          client={clients.find((c) => c.id === selectedPaymentForSlip.clientId)}
          onClose={() => setSelectedPaymentForSlip(null)}
        />
      )}
    </div>
  );
}
