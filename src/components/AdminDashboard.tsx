'use client';

import React from 'react';
import {
  useStore,
  getDaysDiffFromToday,
  getTodayDateStr,
  formatBillingMonthLabel,
  getHistoricalMonthList,
  buildHistoricalUnpaidReminderUrl,
} from '@/lib/store';
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
  Calendar,
  CalendarDays,
  Search,
  Sparkles,
} from 'lucide-react';
import InvoiceReceiptModal from './Modals/InvoiceReceiptModal';
import { PaymentLog } from '@/lib/types';

interface Props {
  onOpenRegisterModal: () => void;
  onOpenPaymentModal: (clientId?: string, billingMonth?: string) => void;
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

  const todayStr = getTodayDateStr();
  const currentYearMonth = todayStr.substring(0, 7); // 'YYYY-MM'

  // Metric 1: Active Subscribers (active + due_soon), excluding archived clients
  const nonArchivedClients = clients.filter((c) => c.status !== 'archived');
  const activeSubscribersCount = clients.filter(
    (c) => c.status === 'active' || c.status === 'due_soon'
  ).length;
  const overdueSubscribersCount = clients.filter(
    (c) => c.status === 'overdue' || c.status === 'suspended'
  ).length;

  // Metric 2: Monthly Revenue (strictly current YYYY-MM)
  // Naturally resets to 0.00 MAD on the 1st of every month without altering historical logs
  const currentMonthPayments = payments.filter(
    (p) => p.paymentDate && p.paymentDate.startsWith(currentYearMonth)
  );
  const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const currentMonthExtraFees = currentMonthPayments.reduce((sum, p) => sum + (p.extraAmount ?? 0), 0);

  // Dedicated Today's Revenue (exact todayStr)
  const todayPayments = payments.filter((p) => p.paymentDate === todayStr);
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Metric 3: Accurate Arrears Math (حساب المتأخرات الفعلي)
  // Accounts for cumulative overdue months rather than a single monthlyFee
  const overdueClients = clients.filter(
    (c) => c.status === 'overdue' || c.status === 'suspended'
  );
  const totalOverdueAmount = overdueClients.reduce((sum, c) => {
    const daysDiff = getDaysDiffFromToday(c.nextDueDate);
    const monthsLate = Math.max(1, Math.ceil(Math.abs(daysDiff) / 30));
    return sum + (monthsLate * (c.monthlyFee || 50));
  }, 0);

  // Metric 4: Open Support Tickets
  const openTickets = tickets.filter((tkt) => tkt.status !== 'resolved');
  const urgentTicketsCount = openTickets.filter((tkt) => tkt.priority === 'urgent').length;

  // Urgent Action Center: Clients due within 3 days or currently overdue (excluding archived)
  const urgentBillingClients = clients
    .filter((c) => {
      if (c.status === 'archived') return false;
      const days = getDaysDiffFromToday(c.nextDueDate);
      return days <= 3; // due soon (<= 3 days) or overdue (< 0)
    })
    .sort((a, b) => {
      // Sort most overdue first
      return getDaysDiffFromToday(a.nextDueDate) - getDaysDiffFromToday(b.nextDueDate);
    });

  // ─────────────────────────────────────────────────────────────
  // 4. HISTORICAL & FUTURE MONTHLY RECONCILIATION & ADVANCE LEDGER
  // (التدقيق المالي، الدفعات المسبقة، ورصد الاشتراكات)
  // ─────────────────────────────────────────────────────────────
  const financialMonthOptions = React.useMemo(() => {
    // Generate 18 past months and 12 future months
    const baseList = getHistoricalMonthList(18, 12);
    const existingSet = new Set(baseList.map((m) => m.value));

    // Ensure any custom billingMonth recorded in payments is included
    const additional: typeof baseList = [];
    payments.forEach((p) => {
      if (p.billingMonth && !existingSet.has(p.billingMonth)) {
        existingSet.add(p.billingMonth);
        additional.push({
          value: p.billingMonth,
          labelAr: formatBillingMonthLabel(p.billingMonth, 'ar'),
          labelFr: formatBillingMonthLabel(p.billingMonth, 'fr'),
          isFuture: p.billingMonth > currentYearMonth,
          isCurrent: p.billingMonth === currentYearMonth,
          isPast: p.billingMonth < currentYearMonth,
        });
      }
    });

    return [...additional, ...baseList].sort((a, b) => b.value.localeCompare(a.value));
  }, [payments, currentYearMonth]);

  const [selectedMonthStr, setSelectedMonthStr] = React.useState<string>(
    () => todayStr.substring(0, 7) // Defaults strictly to current calendar month (e.g. '2026-10')
  );
  const [historicalFilterTab, setHistoricalFilterTab] = React.useState<'all' | 'paid' | 'unpaid'>('all');
  const [historicalSearchQuery, setHistoricalSearchQuery] = React.useState<string>('');

  const isFutureMonth = selectedMonthStr > currentYearMonth;
  const isCurrentMonth = selectedMonthStr === currentYearMonth;
  const isPastMonth = selectedMonthStr < currentYearMonth;

  const selectedMonthLabelAr = React.useMemo(
    () => formatBillingMonthLabel(selectedMonthStr, 'ar'),
    [selectedMonthStr]
  );
  const selectedMonthLabelFr = React.useMemo(
    () => formatBillingMonthLabel(selectedMonthStr, 'fr'),
    [selectedMonthStr]
  );

  const {
    paidList,
    unpaidList,
    allEligibleList,
    totalCollected,
    totalUnpaid,
    totalProjectedRevenue,
    collectionRate,
  } = React.useMemo(() => {
    // Determine start & end date of selected month safely
    const [yStr, mStr] = selectedMonthStr.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const lastDay = new Date(y, m, 0).getDate();
    const startOfSelectedMonthStr = `${yStr}-${mStr}-01`;
    const endOfSelectedMonthStr = `${yStr}-${mStr}-${String(lastDay).padStart(2, '0')}`;

    // 1. Filter all eligible clients
    // Non-archived clients (or archived clients who have a payment transaction in this month)
    const eligible = clients.filter((c) => {
      const hasPaymentInMonth = payments.some(
        (p) =>
          p.clientId === c.id &&
          (p.billingMonth === selectedMonthStr ||
            (p.paymentDate && p.paymentDate.startsWith(selectedMonthStr)))
      );

      if (c.status === 'archived' && !hasPaymentInMonth) {
        return false;
      }

      // For past months, only clients installed on or before end of that month
      if (isPastMonth && c.installationDate && c.installationDate > endOfSelectedMonthStr) {
        return false;
      }

      return true;
    });

    const paid: {
      client: Client;
      payment?: PaymentLog;
      isPaid: true;
      isAdvance: boolean;
      coverageDetail?: string;
    }[] = [];

    const unpaid: {
      client: Client;
      payment?: undefined;
      isPaid: false;
      isDueInMonth: boolean;
      isOverdueFromPast: boolean;
    }[] = [];

    // 2. Cross-reference payments and subscription coverage for this billing month
    eligible.forEach((client) => {
      // Direct payment logged specifically for this month or paid in this month
      const matchPayment = payments.find((p) => {
        if (p.clientId !== client.id) return false;
        if (p.billingMonth && p.billingMonth === selectedMonthStr) return true;
        if (p.paymentDate && p.paymentDate.startsWith(selectedMonthStr)) return true;
        return false;
      });

      // Subscription already covered in advance via nextDueDate
      const isCoveredByDueDate = Boolean(
        client.nextDueDate && client.nextDueDate > endOfSelectedMonthStr
      );

      if (matchPayment || isCoveredByDueDate) {
        // Associated payment log for slip viewing:
        const relatedPayment =
          matchPayment ||
          payments.find((p) => p.clientId === client.id);

        paid.push({
          client,
          payment: relatedPayment,
          isPaid: true,
          isAdvance:
            isFutureMonth ||
            Boolean(matchPayment?.paymentDate && matchPayment.paymentDate < startOfSelectedMonthStr),
          coverageDetail: isCoveredByDueDate
            ? `مغطى حتى ${client.nextDueDate}`
            : matchPayment?.receiptNumber
            ? `وصل ${matchPayment.receiptNumber}`
            : undefined,
        });
      } else {
        const isDueInMonth = Boolean(
          client.nextDueDate && client.nextDueDate.startsWith(selectedMonthStr)
        );
        const isOverdueFromPast = Boolean(
          client.nextDueDate && client.nextDueDate < startOfSelectedMonthStr
        );

        unpaid.push({
          client,
          isPaid: false,
          isDueInMonth,
          isOverdueFromPast,
        });
      }
    });

    // Collected / Advance payments revenue
    const collected = paid.reduce((sum, item) => {
      return sum + (item.payment?.amount ?? (item.client.monthlyFee || 50));
    }, 0);

    // Uncollected / Projected revenue to collect
    const uncollected = unpaid.reduce((sum, item) => {
      return sum + (item.client.monthlyFee || 50);
    }, 0);

    const projectedRevenue = collected + uncollected;
    const totalCount = paid.length + unpaid.length;
    const rate = totalCount > 0 ? Math.round((paid.length / totalCount) * 100) : 100;

    return {
      paidList: paid,
      unpaidList: unpaid,
      allEligibleList: [...paid, ...unpaid],
      totalCollected: collected,
      totalUnpaid: uncollected,
      totalProjectedRevenue: projectedRevenue,
      collectionRate: rate,
    };
  }, [clients, payments, selectedMonthStr, isFutureMonth, isPastMonth]);

  const filteredReconciliationRows = React.useMemo(() => {
    let list =
      historicalFilterTab === 'paid'
        ? paidList
        : historicalFilterTab === 'unpaid'
        ? unpaidList
        : allEligibleList;

    if (historicalSearchQuery.trim()) {
      const q = historicalSearchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const c = item.client;
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.neighborhood && c.neighborhood.toLowerCase().includes(q)) ||
          Boolean(c.hardware?.pppoeUsername?.toLowerCase().includes(q)) ||
          Boolean(c.hardware?.antennaMac?.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [paidList, unpaidList, allEligibleList, historicalFilterTab, historicalSearchQuery]);

  const handleSendUnpaidWhatsApp = (client: Client) => {
    const { url } = buildHistoricalUnpaidReminderUrl(client, selectedMonthLabelAr, isFutureMonth);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#191522] p-4 sm:p-6 rounded-2xl border border-[#2D253B]/70 shadow-xl shadow-black/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#F4F0F8] tracking-tight">
              {t('dash_title')}
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t('live')}
            </span>
          </div>
          <p className="text-xs text-[#958B9F] mt-1">
            {t('dash_subtitle')}
          </p>
        </div>

        {/* 3 Quick Action Buttons: Grid on mobile (<640px) and tablet/desktop, min 48px touch height */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          {/* Secondary CTA: تسجيل دفعة شهرية (Left / Neutral) */}
          <button
            type="button"
            onClick={() => onOpenPaymentModal()}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] text-[#E0D8EB] font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#958B9F] shrink-0" />
            <span className="truncate">{t('dash_record_payment')}</span>
          </button>

          {/* Primary CTA: تسجيل مشترك جديد (Center / Warm Amber Yellow) */}
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="text-slate-950 truncate">{t('dash_new_installation')}</span>
          </button>

          {/* Utility Action: تذكرة عطل جديدة (Right / Dark Surface with Amber Icon) */}
          <button
            type="button"
            onClick={() => onOpenTicketModal()}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] text-[#E0D8EB] font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{t('dash_new_ticket')}</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS (4 CARDS: 2 COLUMNS ON MOBILE, 4 COLUMNS ON DESKTOP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Subscribers (Vibrant Emerald Green) */}
        <div
          onClick={onNavigateToClients}
          className="p-3.5 sm:p-5 rounded-2xl bg-[#191522] border border-[#2D253B]/70 hover:border-emerald-500/40 transition cursor-pointer group shadow-xl shadow-black/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#958B9F] truncate">
                {t('metric_active_subs')}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#F4F0F8] font-mono tracking-tight">
                {activeSubscribersCount}
              </span>
              <span className="text-[10px] sm:text-xs text-[#958B9F] truncate">/ {nonArchivedClients.length} {t('all').toLowerCase()}</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#2D253B]/70 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {activeSubscribersCount} {t('connected_label')}
            </span>
            <span className="text-rose-400 font-semibold truncate">
              {overdueSubscribersCount} {t('overdue_label')}
            </span>
          </div>
        </div>

        {/* Card 2: Revenue Collected This Month (Vibrant Emerald Green) */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#191522] border border-[#2D253B]/70 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#958B9F] truncate">
                {t('metric_monthly_revenue')}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-[#F4F0F8] font-mono tracking-tight">
                {currentMonthRevenue.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">{t('currency')}</span>
            </div>
            {/* Dedicated Today's Revenue Badge ("مداخيل اليوم") */}
            <div className="mt-2 flex items-center">
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{t('metric_today_revenue')}: {todayRevenue.toLocaleString()} {t('currency')}</span>
              </span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#2D253B]/70 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#958B9F]">
            {currentMonthExtraFees > 0 ? (
              <span className="text-emerald-400 font-medium truncate">
                +{currentMonthExtraFees.toLocaleString()} MAD extra
              </span>
            ) : (
              <span className="text-[#E0D8EB] font-medium flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                {currentMonthPayments.length} trans. ({currentYearMonth})
              </span>
            )}
            <span className="text-[#958B9F] font-mono text-[9px] sm:text-[10px]">
              {todayPayments.length} {t('done_today')}
            </span>
          </div>
        </div>

        {/* Card 3: Overdue / Uncollected Amount (Brand Red #F43F5E) */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#191522] border border-[#2D253B]/70 shadow-xl shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#958B9F] truncate">
                {t('metric_overdue_uncollected')}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight">
                {totalOverdueAmount.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-rose-400">{t('currency')}</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#2D253B]/70 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px]">
            <span className="text-rose-400 font-medium truncate">
              {overdueClients.length} pending
            </span>
            <span className="text-amber-400 font-medium">{t('actions')}</span>
          </div>
        </div>

        {/* Card 4: Open Support Tickets */}
        <div
          onClick={onNavigateToTickets}
          className="p-3.5 sm:p-5 rounded-2xl bg-[#191522] border border-[#2D253B]/70 hover:border-amber-500/40 transition cursor-pointer group shadow-xl shadow-black/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#958B9F] truncate">
                {t('metric_open_tickets')}
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition shrink-0">
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#F4F0F8] font-mono tracking-tight">
                {openTickets.length}
              </span>
              <span className="text-[10px] sm:text-xs text-[#958B9F] truncate">in field</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#2D253B]/70 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px]">
            <span className="text-amber-400 font-medium truncate">
              {urgentTicketsCount} {t('prio_urgent')}
            </span>
            <span className="text-[#958B9F] text-[9px] sm:text-[10px]">Active</span>
          </div>
        </div>
      </div>

      {/* URGENT ACTION CENTER: BILLING ALERTS & WHATSAPP DISPATCH */}
      <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F4F0F8] flex items-center gap-2">
                <span>{t('urgent_center_title')}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
                  {urgentBillingClients.length} {t('urgent_badge_accounts')}
                </span>
              </h2>
              <p className="text-xs text-[#958B9F]">
                {t('urgent_center_subtitle')}
              </p>
            </div>
          </div>

          <div className="text-xs text-[#958B9F] flex items-center gap-2 self-start sm:self-auto font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Auto-Sync Filter: ≤ 3 Days or Past Due
          </div>
        </div>

        {/* Table of Urgent Billing Clients */}
        {clients.length === 0 ? (
          <div className="p-10 text-center bg-[#130F1A] rounded-2xl border border-[#261E33]">
            <Users className="w-8 h-8 text-[#958B9F] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#F4F0F8]">{t('no_subscribers_registered')}</p>
            <p className="text-xs text-[#958B9F] mt-1 max-w-sm mx-auto mb-4">
              {t('no_subscribers_registered_sub')}
            </p>
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs transition inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/15 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>{t('register_first_client')}</span>
            </button>
          </div>
        ) : urgentBillingClients.length === 0 ? (
          <div className="p-8 text-center bg-[#130F1A] rounded-2xl border border-[#261E33]">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#F4F0F8]">{t('all_accounts_up_to_date')}</p>
            <p className="text-xs text-[#958B9F] mt-1">
              {t('all_accounts_up_to_date_sub')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="rounded-2xl border border-[#261E33] bg-[#130F1A] overflow-hidden min-w-[640px]">
              <table className="w-full text-left rtl:text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-[#130F1A] text-[#958B9F] border-b border-[#261E33] uppercase font-semibold tracking-wider text-[11px]">
                    <th className="py-3 px-4">{t('client_contact')}</th>
                    <th className="py-3 px-4">Quartier</th>
                    <th className="py-3 px-4">{t('status')}</th>
                    <th className="py-3 px-4">{t('metric_monthly_revenue')}</th>
                    <th className="py-3 px-4">{t('telemetry_title')}</th>
                    <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-[#261E33] bg-[#130F1A]">
                {urgentBillingClients.map((client) => {
                  const daysDiff = getDaysDiffFromToday(client.nextDueDate);
                  const isOverdue = daysDiff < 0;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-[#191522] transition group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onOpenClientDetailModal(client)}
                          className="font-bold text-[#F4F0F8] hover:text-amber-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {client.name}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                        <div className="text-[11px] text-[#958B9F] flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-[#958B9F]" />
                          <a
                            href={`tel:${client.phone}`}
                            className="hover:text-emerald-400 transition"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </td>

                      {/* Neighborhood */}
                      <td className="py-3.5 px-4 text-[#E0D8EB]">
                        <span className="px-2 py-0.5 rounded-lg bg-[#191522] text-[#E0D8EB] border border-[#2D253B]/70 font-medium">
                          {client.neighborhood || 'Tétouan'}
                        </span>
                      </td>

                      {/* Due Date & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-[#F4F0F8]">
                          {client.nextDueDate}
                        </div>
                        <div className="mt-1">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.abs(daysDiff)} Days {t('status_overdue')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#382647] text-[#F3E8FF] border border-[#523368]">
                              <Clock className="w-3 h-3" />
                              {t('status_due_soon')} ({daysDiff === 0 ? 'Today' : `${daysDiff}d`})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#F4F0F8] text-sm">
                          {client.monthlyFee}
                        </span>{' '}
                        <span className="text-[10px] text-[#958B9F] font-semibold">{t('currency')}</span>
                        <div className="text-[10px] text-[#958B9F] truncate max-w-[130px]">
                          {client.subscriptionPlan}
                        </div>
                      </td>

                      {/* Hardware Info */}
                      <td className="py-3.5 px-4 text-[11px] text-[#958B9F]">
                        <div className="flex items-center gap-1 text-[#E0D8EB] font-medium">
                          <Radio className="w-3 h-3 text-amber-400" />
                          {client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                        </div>
                        <div className="font-mono text-[10px] text-[#958B9F] mt-0.5">
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

                          {/* Record Payment (Secondary Neutral CTA) */}
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(client.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] font-medium text-xs transition flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                            title="Record monthly payment"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-[#958B9F]" />
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
        </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HISTORICAL MONTHLY BILLING & UNPAID SUBSCRIBERS LEDGER
          (التدقيق الشهري ومتابعة المستحقات - Bilan Mensuel)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/40 space-y-6">
        {/* Module Header & Month/Year Picker */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#261E33] pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0 shadow-lg shadow-amber-500/10">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#F4F0F8]">
                  التدقيق الشهري ومتابعة المستحقات (Bilan Mensuel)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#382647] text-[#F3E8FF] border border-[#523368]">
                  {selectedMonthLabelAr}
                </span>
                {isFutureMonth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>شهر مستقبلي • تتبع الدفعات المسبقة</span>
                  </span>
                )}
                {isCurrentMonth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>الشهر الحالي النشط</span>
                  </span>
                )}
                {isPastMonth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#261E33] text-[#958B9F] border border-[#3A2F4C]">
                    <span>أرشيف سابق</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#958B9F] mt-0.5">
                {isFutureMonth
                  ? 'رصد الدفعات المسبقة، تقدير المداخيل المرتقبة، ومتابعة الاشتراكات المستحقة للتجديد مسبقاً'
                  : 'كشف الحساب الشهري، رصد غير المؤدين، والتحقق التلقائي من تسوية اشتراكات كل شهر'}
              </p>
            </div>
          </div>

          {/* Month & Year Dropdown Selector */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto w-full lg:w-auto">
            <label className="text-xs text-[#958B9F] font-semibold shrink-0 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>الشهر المالي:</span>
            </label>
            <div className="relative flex-1 lg:w-64">
              <select
                value={selectedMonthStr}
                onChange={(e) => setSelectedMonthStr(e.target.value)}
                className="w-full appearance-none bg-[#130F1A] border border-[#2D253B] hover:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] font-bold focus:outline-none focus:border-amber-500 transition cursor-pointer pr-8"
              >
                <optgroup label="✨ الأشهر القادمة / Mois à venir (Avances)" className="bg-[#191522] text-amber-400 font-bold">
                  {financialMonthOptions
                    .filter((opt) => opt.isFuture)
                    .map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#191522] text-[#F4F0F8]">
                        {opt.labelAr} ({opt.value}) • دفعة مسبقة
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📍 الشهر الحالي / Mois actif" className="bg-[#191522] text-emerald-400 font-bold">
                  {financialMonthOptions
                    .filter((opt) => opt.isCurrent)
                    .map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#191522] text-[#F4F0F8]">
                        ★ {opt.labelAr} ({opt.value}) — الشهر الحالي
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📋 الأشهر السابقة / Historique (18 mois)" className="bg-[#191522] text-[#958B9F] font-bold">
                  {financialMonthOptions
                    .filter((opt) => opt.isPast)
                    .map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#191522] text-[#F4F0F8]">
                        {opt.labelAr} ({opt.value})
                      </option>
                    ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-2.5 text-[#958B9F] text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* 3 Summary KPI Cards for the Selected Month */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: Paid Subscriptions / Advance Payments */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#130F1A] border border-emerald-500/20 hover:border-emerald-500/40 transition shadow-lg shadow-black/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#958B9F]">
                  {isFutureMonth
                    ? 'إجمالي الدفعات المسبقة (Paiements d’avance)'
                    : isCurrentMonth
                    ? 'إجمالي المحصل للشهر (Encaissé)'
                    : 'إجمالي الاشتراكات المؤداة (Payés)'}
                </span>
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  {totalCollected.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-400">{t('currency')}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#261E33] flex items-center justify-between text-xs text-[#958B9F]">
              <span className="text-[#E0D8EB] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {paidList.length} {isFutureMonth ? 'مشترك سدد مسبقاً' : 'مشترك مسوى'}
                </span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400/90 font-semibold">
                {isFutureMonth ? 'مداخيل مسبقة محصلة' : 'مداخيل محصلة'}
              </span>
            </div>
          </div>

          {/* Card 2: Unpaid / Projected Revenue to Collect */}
          <div className={`p-4 sm:p-4.5 rounded-2xl bg-[#130F1A] border transition shadow-lg shadow-black/20 flex flex-col justify-between ${
            isFutureMonth
              ? 'border-amber-500/20 hover:border-amber-500/40'
              : 'border-rose-500/20 hover:border-rose-500/40'
          }`}>
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#958B9F]">
                  {isFutureMonth
                    ? 'المداخيل المتوقعة للتحصيل (Revenu projeté)'
                    : isCurrentMonth
                    ? 'مستحقات قيد التحصيل (En attente)'
                    : 'المتخلفون عن الأداء (Impayés)'}
                </span>
                <div className={`p-1.5 rounded-xl border ${
                  isFutureMonth
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {isFutureMonth ? (
                    <Clock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  isFutureMonth ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {totalUnpaid.toLocaleString()}
                </span>
                <span className={`text-xs font-bold ${
                  isFutureMonth ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {t('currency')}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#261E33] flex items-center justify-between text-xs text-[#958B9F]">
              <span className={`font-bold flex items-center gap-1.5 ${
                isFutureMonth ? 'text-amber-300' : 'text-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isFutureMonth ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                <span>
                  {unpaidList.length}{' '}
                  {isFutureMonth
                    ? 'اشتراك مستحق للتجديد'
                    : isCurrentMonth
                    ? 'اشتراك قيد التحصيل'
                    : 'مشتركين غير مؤدين'}
                </span>
              </span>
              <span className={`font-mono text-[11px] font-semibold ${
                isFutureMonth ? 'text-amber-400/90' : 'text-rose-400/90'
              }`}>
                {isFutureMonth ? 'مداخيل مرتقبة' : isCurrentMonth ? 'واجب السداد' : 'مستحقات معلقة'}
              </span>
            </div>
          </div>

          {/* Card 3: Collection / Advance Coverage Rate */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[#130F1A] border border-[#261E33] hover:border-amber-500/30 transition shadow-lg shadow-black/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#958B9F]">
                  {isFutureMonth
                    ? 'نسبة التغطية المسبقة (Couverture anticipée)'
                    : 'نسبة التحصيل (Collection Rate)'}
                </span>
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#F4F0F8] font-mono tracking-tight">
                  {collectionRate}%
                </span>
                <span className="text-xs text-[#958B9F] font-semibold">
                  ({paidList.length} / {allEligibleList.length})
                </span>
              </div>
              {/* Progress Bar */}
              <div className="mt-2 w-full bg-[#191522] rounded-full h-2 border border-[#2D253B] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    collectionRate >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : collectionRate >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-rose-500 to-rose-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, collectionRate))}%` }}
                />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#261E33] flex items-center justify-between text-xs text-[#958B9F]">
              <span>
                {isFutureMonth
                  ? `معدل التسوية المسبقة لشهر ${selectedMonthLabelAr}`
                  : `معدل تسوية اشتراكات ${selectedMonthLabelAr}`}
              </span>
              <span className="text-amber-400 font-mono text-[11px] font-bold">
                {isFutureMonth
                  ? `إجمالي المتوقع: ${totalProjectedRevenue.toLocaleString()} ${t('currency')}`
                  : collectionRate === 100
                  ? 'كامل 100%'
                  : `${100 - collectionRate}% متبقية`}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Tab Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setHistoricalFilterTab('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                historicalFilterTab === 'all'
                  ? 'bg-[#382647] text-[#F3E8FF] border border-[#523368] font-bold shadow-sm'
                  : 'text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30]/60'
              }`}
            >
              <span>{isFutureMonth ? 'جميع الاشتراكات (Tous)' : 'الجميع (All)'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#191522] text-[#E0D8EB]">
                {allEligibleList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoricalFilterTab('paid')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                historicalFilterTab === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                  : 'text-[#958B9F] hover:text-emerald-400 hover:bg-[#241E30]/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isFutureMonth ? 'دفعات مسبقة (Payés d’avance)' : 'المؤدون (Payés)'}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">
                {paidList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoricalFilterTab('unpaid')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                historicalFilterTab === 'unpaid'
                  ? isFutureMonth
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                  : isFutureMonth
                  ? 'text-[#958B9F] hover:text-amber-400 hover:bg-[#241E30]/60'
                  : 'text-[#958B9F] hover:text-rose-400 hover:bg-[#241E30]/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isFutureMonth ? 'bg-amber-400' : 'bg-rose-500'}`} />
              <span>
                {isFutureMonth
                  ? 'مستحق للتجديد (À renouveler)'
                  : isCurrentMonth
                  ? 'قيد التحصيل (En attente)'
                  : 'غير المؤدين (Impayés)'}
              </span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${
                isFutureMonth
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
              }`}>
                {unpaidList.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#958B9F] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`بحث في كشف ${selectedMonthLabelAr}...`}
              value={historicalSearchQuery}
              onChange={(e) => setHistoricalSearchQuery(e.target.value)}
              className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Ledger Table */}
        {filteredReconciliationRows.length === 0 ? (
          <div className="p-10 text-center bg-[#130F1A] rounded-2xl border border-[#261E33] space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-[#F4F0F8]">
              {historicalFilterTab === 'unpaid'
                ? isFutureMonth
                  ? `ممتاز! جميع المشتركين قاموا بالتسديد المسبق لشهر ${selectedMonthLabelAr}.`
                  : `تهانينا! جميع المشتركين سددوا اشتراك ${selectedMonthLabelAr}.`
                : historicalFilterTab === 'paid' && isFutureMonth
                ? `لا توجد دفعات مسبقة مسجلة بعد لشهر ${selectedMonthLabelAr}.`
                : 'لا توجد سجلات مطابقة في هذا التصنيف.'}
            </p>
            <p className="text-xs text-[#958B9F]">
              {historicalFilterTab === 'unpaid'
                ? isFutureMonth
                  ? 'لا توجد اشتراكات معلقة للتجديد في هذا الشهر المستقبلي.'
                  : 'نسبة التحصيل بلغت 100% لهذا الشهر المالي المحدد.'
                : 'يمكنك اختيار شهر آخر من القائمة أو تسجيل دفعة جديدة.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="rounded-2xl border border-[#261E33] bg-[#130F1A] overflow-hidden min-w-[720px]">
              <table className="w-full text-left rtl:text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-[#130F1A] text-[#958B9F] border-b border-[#261E33] uppercase font-semibold tracking-wider text-[11px]">
                    <th className="py-3 px-4">{t('client_contact')}</th>
                    <th className="py-3 px-4">Quartier & Adresse</th>
                    <th className="py-3 px-4">CPE & PPPoE</th>
                    <th className="py-3 px-4">الواجب الشهري</th>
                    <th className="py-3 px-4">
                      {isFutureMonth ? `وضعية شهر ${selectedMonthStr} (مستقبلي)` : `حالة شهر ${selectedMonthStr}`}
                    </th>
                    <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#261E33] bg-[#130F1A]">
                  {filteredReconciliationRows.map((row) => {
                    const { client, payment, isPaid } = row;
                    const coverageDetail = 'coverageDetail' in row ? (row as any).coverageDetail : undefined;
                    const fee = client.monthlyFee || 50;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-[#191522] transition group"
                      >
                        {/* Subscriber Name & Phone */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => onOpenClientDetailModal(client)}
                            className="font-bold text-[#F4F0F8] hover:text-amber-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{client.name}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                          <div className="text-[11px] text-[#958B9F] flex items-center gap-1.5 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-[#958B9F]" />
                            <a
                              href={`tel:${client.phone}`}
                              className="hover:text-emerald-400 transition"
                            >
                              {client.phone}
                            </a>
                          </div>
                        </td>

                        {/* Neighborhood */}
                        <td className="py-3.5 px-4 text-[#E0D8EB]">
                          <span className="px-2 py-0.5 rounded-lg bg-[#191522] text-[#E0D8EB] border border-[#2D253B]/70 font-medium">
                            {client.neighborhood || 'Tétouan'}
                          </span>
                          {client.address && (
                            <div className="text-[10px] text-[#958B9F] mt-0.5 truncate max-w-[140px]">
                              {client.address}
                            </div>
                          )}
                        </td>

                        {/* Hardware & PPPoE */}
                        <td className="py-3.5 px-4 text-[11px] text-[#958B9F]">
                          <div className="flex items-center gap-1 text-[#E0D8EB] font-medium">
                            <Radio className="w-3 h-3 text-amber-400" />
                            <span>{client.hardware?.antennaModel || 'Ubiquiti CPE'}</span>
                          </div>
                          <div className="font-mono text-[10px] text-[#958B9F] mt-0.5">
                            PPPoE: <span className="text-[#E0D8EB]">{client.hardware?.pppoeUsername || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Monthly Fee */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[#F4F0F8] text-sm">
                            {fee}
                          </span>{' '}
                          <span className="text-[10px] text-[#958B9F] font-semibold">{t('currency')}</span>
                          <div className="text-[10px] text-[#958B9F] truncate max-w-[130px]">
                            {client.subscriptionPlan || 'Pack Standard'}
                          </div>
                        </td>

                        {/* Monthly Status Badge */}
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>
                                  {isFutureMonth ? 'دفعة مسبقة (Payé d’avance)' : 'تم الأداء (Payé)'}
                                </span>
                              </span>
                              <div className="text-[10px] text-[#958B9F] font-mono mt-1">
                                {coverageDetail || (payment ? `${payment.paymentDate} • ${payment.receiptNumber}` : 'مسوى مسبقاً')}
                              </div>
                            </div>
                          ) : isFutureMonth ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>مستحق للتجديد (À renouveler)</span>
                              </span>
                              <div className="text-[10px] text-[#958B9F] font-mono mt-0.5">
                                تاريخ التجديد: {client.nextDueDate}
                              </div>
                              <div className="text-[10px] text-amber-400/90 font-mono font-semibold">
                                متوقع: {fee} {t('currency')}
                              </div>
                            </div>
                          ) : isCurrentMonth ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>قيد التحصيل (En attente)</span>
                              </span>
                              <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                                واجب السداد: {fee} {t('currency')}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                <span>غير مؤدى (Impayé)</span>
                              </span>
                              <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">
                                واجب السداد: {fee} {t('currency')}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right rtl:text-left">
                          <div className="flex items-center justify-end rtl:justify-start gap-2">
                            {!isPaid ? (
                              <>
                                {/* Action 1: WhatsApp Reminder */}
                                <button
                                  type="button"
                                  onClick={() => handleSendUnpaidWhatsApp(client)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-950 hover:scale-105 active:scale-95 cursor-pointer"
                                  title={
                                    isFutureMonth
                                      ? `إرسال تذكير مسبق لتجديد شهر ${selectedMonthLabelAr}`
                                      : `إرسال تذكير واتساب لشهر ${selectedMonthLabelAr}`
                                  }
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{isFutureMonth ? 'تذكير مسبق' : 'تذكير واتساب'}</span>
                                </button>

                                {/* Action 2: Record Payment */}
                                <button
                                  type="button"
                                  onClick={() => onOpenPaymentModal(client.id, selectedMonthStr)}
                                  className="px-3 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] font-semibold text-xs transition flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                  title={
                                    isFutureMonth
                                      ? `تسجيل دفعة مسبقة لشهر ${selectedMonthLabelAr}`
                                      : `تسجيل دفعة شهر ${selectedMonthLabelAr}`
                                  }
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{isFutureMonth ? 'أداء مسبق' : 'تسجيل الدفعة'}</span>
                                </button>
                              </>
                            ) : (
                              payment && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPaymentForSlip(payment)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Receipt className="w-3 h-3 text-[#958B9F]" />
                                  <span>وصل الأداء</span>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY & REVENUE LEDGER PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments Ledger (2 Cols) */}
        <div className="lg:col-span-2 bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F4F0F8] flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>{t('recent_payments_title')}</span>
              </h3>
              <p className="text-xs text-[#958B9F]">
                {t('recent_payments_subtitle')}
              </p>
            </div>
            <button
              onClick={() => onOpenPaymentModal()}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
            >
              + {t('dash_record_payment')}
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center bg-[#130F1A] rounded-2xl border border-[#261E33]">
              <Coins className="w-8 h-8 text-[#958B9F] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#F4F0F8]">{t('no_payments_found')}</p>
              <p className="text-xs text-[#958B9F] mt-1">
                {t('no_payments_found_sub')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="divide-y divide-[#261E33] rounded-2xl border border-[#261E33] overflow-hidden min-w-[480px]">
                {[...payments]
                  .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '') || b.id.localeCompare(a.id))
                  .slice(0, 5)
                  .map((pay) => {
                  const hasExtra = (pay.extraAmount ?? 0) > 0;
                  const itemBase = pay.baseFee ?? (pay.amount - (pay.extraAmount ?? 0));
                  return (
                    <div
                      key={pay.id}
                      className="p-3.5 bg-[#130F1A] hover:bg-[#191522] transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-[#F4F0F8] flex items-center gap-2">
                            <span>{pay.clientName}</span>
                            {hasExtra && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#191522] text-amber-300 border border-amber-500/30 font-semibold">
                                +Extra
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#958B9F] flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[#E0D8EB]">{pay.receiptNumber}</span>
                            <span>•</span>
                            <span className="capitalize">{pay.method.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{pay.paymentDate}</span>
                          </div>
                          {hasExtra && (
                            <div className="text-[10px] text-[#958B9F] font-mono mt-0.5">
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
                          <span className="text-[10px] text-[#958B9F] font-mono">
                            Due: {pay.newDueDate}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentForSlip(pay)}
                            className="px-2 py-0.5 rounded-lg bg-[#241E30] hover:bg-[#2C243B] text-amber-300 hover:text-white border border-[#3A2F4C] text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
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
            </div>
          )}
        </div>

        {/* Network Infrastructure Telemetry Summary (1 Col) */}
        <div className="bg-[#191522] border border-[#2D253B]/70 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#F4F0F8] flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>{t('infrastructure_title')}</span>
            </h3>
            <p className="text-xs text-[#958B9F]">
              {t('infrastructure_subtitle')}
            </p>
          </div>

          <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="space-y-3 text-xs min-w-[320px]">
              <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F0F8]">Relais Jbel Dersa (Tétouan Nord)</div>
                  <div className="text-[10px] text-[#958B9F]">Ubiquiti airFiber 60 Backhaul</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F0F8]">Pylône Wilaya / Sania Rmel</div>
                  <div className="text-[10px] text-[#958B9F]">Rocket 5AC Prism + 45° Sector</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F0F8]">Tour Boujarah (Relais Centre)</div>
                  <div className="text-[10px] text-[#958B9F]">MikroTik mANTBox 19s</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F0F8]">Station Martil / Cabo Negro</div>
                  <div className="text-[10px] text-[#958B9F]">LiteAP AC Sector</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Heavy Traffic
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#2D253B]/70 text-[11px] text-[#958B9F] flex items-center justify-between">
            <span>{t('bandwidth_consumption')}</span>
            <span className="font-mono text-emerald-400 font-bold">428 Mbps / 1 Gbps</span>
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
