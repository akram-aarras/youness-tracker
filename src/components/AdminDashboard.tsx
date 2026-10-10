'use client';

import React from 'react';
import { useStore, getTodayDateStr, formatBillingMonthLabel, getHistoricalMonthList, buildHistoricalUnpaidReminderUrl } from '@/lib/store';
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
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import InvoiceReceiptModal from './Modals/InvoiceReceiptModal';
import BulkUnpaidReminderModal from './Modals/BulkUnpaidReminderModal';
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
  const {
    clients,
    tickets,
    payments,
    t,
    language,
    localizePlanName,
    getClientStatus,
    getDaysDiff,
    exportBilanCSV,
  } = useStore();
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;
  const [selectedPaymentForSlip, setSelectedPaymentForSlip] = React.useState<PaymentLog | null>(null);
  const [isBulkReminderOpen, setIsBulkReminderOpen] = React.useState(false);

  // Current calendar date
  const todayStr = getTodayDateStr();
  const currentYearMonth = todayStr.substring(0, 7); // 'YYYY-MM'

  // Metric 1: Active Subscribers (active + due_soon), excluding archived clients
  const nonArchivedClients = clients.filter((c) => c.status !== 'archived');
  const activeSubscribersCount = nonArchivedClients.filter((c) => {
    const s = getClientStatus(c);
    return s === 'active' || s === 'due_soon';
  }).length;

  // Metric 2: Monthly Revenue (strictly current YYYY-MM)
  // Naturally resets to 0.00 MAD on the 1st of every month without altering historical logs
  const currentMonthPayments = payments.filter(
    (p) => p.paymentDate && p.paymentDate.startsWith(currentYearMonth)
  );
  const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Expected monthly revenue & collection rate (based on active subscription fees)
  const expectedMonthlyRevenue = nonArchivedClients.reduce((sum, c) => sum + (c.monthlyFee || 50), 0);
  const monthCollectionRate = expectedMonthlyRevenue > 0
    ? Math.round((currentMonthRevenue / expectedMonthlyRevenue) * 100)
    : 0;

  // Dedicated Today's Revenue (exact todayStr)
  const todayPayments = payments.filter((p) => p.paymentDate === todayStr);
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Metric 3: Accurate Arrears Math (حساب المتأخرات الفعلي)
  // Accounts for cumulative overdue months rather than a single monthlyFee
  const overdueClients = nonArchivedClients.filter((c) => {
    const s = getClientStatus(c);
    return s === 'overdue' || s === 'suspended';
  });
  const totalOverdueAmount = overdueClients.reduce((sum, c) => {
    const daysDiff = getDaysDiff(c.nextDueDate);
    const monthsLate = Math.max(1, Math.ceil(Math.abs(daysDiff) / 30));
    return sum + (monthsLate * (c.monthlyFee || 50));
  }, 0);

  // Metric 4: Open Support Tickets
  const openTickets = tickets.filter((tkt) => tkt.status !== 'resolved');
  const urgentTicketsCount = openTickets.filter((tkt) => tkt.priority === 'urgent').length;

  // Urgent Action Center: Clients due within 3 days or currently overdue (excluding archived)
  const urgentBillingClients = nonArchivedClients
    .filter((c) => {
      const days = getDaysDiff(c.nextDueDate);
      return days <= 3; // due soon (<= 3 days) or overdue (< 0)
    })
    .sort((a, b) => {
      // Sort most overdue first
      return getDaysDiff(a.nextDueDate) - getDaysDiff(b.nextDueDate);
    });

  const URGENT_PAGE_SIZE = 10;
  const [urgentPage, setUrgentPage] = React.useState(1);
  const totalUrgentPages = Math.max(1, Math.ceil(urgentBillingClients.length / URGENT_PAGE_SIZE));

  React.useEffect(() => {
    if (urgentPage > totalUrgentPages) {
      setUrgentPage(totalUrgentPages);
    }
  }, [urgentPage, totalUrgentPages]);

  const startUrgentIdx = (urgentPage - 1) * URGENT_PAGE_SIZE;
  const paginatedUrgentClients = React.useMemo(() => {
    return urgentBillingClients.slice(startUrgentIdx, startUrgentIdx + URGENT_PAGE_SIZE);
  }, [urgentBillingClients, startUrgentIdx]);
  // ─────────────────────────────────────────────────────────────
  // 4. HISTORICAL & FUTURE MONTHLY RECONCILIATION & ADVANCE LEDGER
  // (التدقيق المالي، الدفعات المسبقة، ورصد الاشتراكات)
  // ─────────────────────────────────────────────────────────────
  const financialMonthOptions = (() => {
    // Generate 18 past months and 12 future months relative to current date
    const baseList = getHistoricalMonthList(18, 12, todayStr);
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
  })();

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
  const selectedMonthLabel = formatBillingMonthLabel(selectedMonthStr, language);

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
            ? (language === 'ar' ? `مغطى حتى ${client.nextDueDate}` : `Couvert jusqu'au ${client.nextDueDate}`)
            : matchPayment?.receiptNumber
            ? (language === 'ar' ? `وصل ${matchPayment.receiptNumber}` : `Reçu ${matchPayment.receiptNumber}`)
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
  }, [clients, payments, selectedMonthStr, isFutureMonth, isPastMonth, language]);

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

  const RECON_PAGE_SIZE = 10;
  const [reconPage, setReconPage] = React.useState(1);

  React.useEffect(() => {
    setReconPage(1);
  }, [historicalFilterTab, historicalSearchQuery, selectedMonthStr]);

  const totalReconPages = Math.max(1, Math.ceil(filteredReconciliationRows.length / RECON_PAGE_SIZE));

  React.useEffect(() => {
    if (reconPage > totalReconPages) {
      setReconPage(totalReconPages);
    }
  }, [reconPage, totalReconPages]);

  const startReconIdx = (reconPage - 1) * RECON_PAGE_SIZE;
  const paginatedReconciliationRows = React.useMemo(() => {
    return filteredReconciliationRows.slice(startReconIdx, startReconIdx + RECON_PAGE_SIZE);
  }, [filteredReconciliationRows, startReconIdx]);

  const reconPageNumbers = React.useMemo(() => {
    if (totalReconPages <= 7) {
      return Array.from({ length: totalReconPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [];
    pages.push(1);
    if (reconPage > 3) {
      pages.push('ellipsis');
    }
    const start = Math.max(2, reconPage - 1);
    const end = Math.min(totalReconPages - 1, reconPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (reconPage < totalReconPages - 2) {
      pages.push('ellipsis');
    }
    pages.push(totalReconPages);
    return pages;
  }, [totalReconPages, reconPage]);

  const handleSendUnpaidWhatsApp = (client: Client) => {
    if (!client.phone || !client.phone.trim()) return;
    const { url } = buildHistoricalUnpaidReminderUrl(client, selectedMonthLabelAr, isFutureMonth);
    window.open(url, '_blank');
  };

  return (
    <div className="page-view dashboard-view">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="page-heading flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
              {t('dash_title')}
            </h1>
            <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'ar' ? 'هذا الشهر' : language === 'en' ? 'This month' : 'Ce mois'}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            {t('dash_subtitle')}
          </p>
        </div>

        {/* 3 Quick Action Buttons: Modern Light SaaS buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          {/* Secondary CTA: استخلاص الاشتراك */}
          <button
            type="button"
            onClick={() => onOpenPaymentModal()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] text-[var(--text-secondary)] font-semibold text-sm sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[var(--muted)] shrink-0" />
            <span className="truncate">{t('dash_record_payment')}</span>
          </button>

          {/* Primary CTA: تسجيل مشترك جديد (Youness Orange Accent) */}
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-sm transition shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            <span className="truncate">{t('dash_new_installation')}</span>
          </button>

          {/* Utility Action: تذكرة عطل جديدة */}
          <button
            type="button"
            onClick={() => onOpenTicketModal()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] text-[var(--text-secondary)] font-semibold text-sm sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">{t('dash_new_ticket')}</span>
          </button>
        </div>
      </div>

      {/* 4 INDEPENDENT CRISP WHITE KPI CARDS */}
      <div className="metric-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Active Subscribers (Orange Icon Badge) */}
        <div
          onClick={onNavigateToClients}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onNavigateToClients();
            }
          }}
          className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] truncate">
                {t('metric_active_subs')}
              </span>
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/60 text-[var(--primary)] dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/60 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--text)] font-mono tracking-tight">
                {activeSubscribersCount}
              </span>
              <span className="text-sm text-[var(--muted)] font-medium truncate">
                / {nonArchivedClients.length} {t('all').toLowerCase()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-1 text-[12px]">
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {nonArchivedClients.length ? Math.round(activeSubscribersCount / nonArchivedClients.length * 100) : 0}% {t('status_active')}
            </span>
            <span className="text-[var(--muted)] font-medium truncate">
              {activeSubscribersCount} {t('connected_label')}
            </span>
          </div>
        </div>

        {/* Card 2: Revenue Collected This Month (Emerald Icon Badge) */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] truncate">
                {t('metric_monthly_revenue')}
              </span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[var(--text)] font-mono tracking-tight">
                {currentMonthRevenue.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-[var(--muted)]">{t('currency')}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5 text-[12px]">
            <div className="flex items-center justify-between gap-1">
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('metric_today_revenue')}: {todayRevenue.toLocaleString()} {t('currency')}</span>
              </span>
              <span className="text-[var(--muted)] font-mono text-[12px] shrink-0">
                {currentMonthPayments.length} trans.
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[var(--muted)] pt-0.5 border-t border-slate-50 dark:border-slate-800/50">
              <span>{t('expected_monthly_label')}: <strong className="font-mono text-[var(--text-secondary)]">{expectedMonthlyRevenue.toLocaleString()} {t('currency')}</strong></span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{monthCollectionRate}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Overdue / Arrears (Rose Icon Badge) */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] truncate">
                {t('metric_overdue_uncollected')}
              </span>
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800/60 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                {totalOverdueAmount.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{t('currency')}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-1 text-[12px]">
            <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              {overdueClients.length} {t('overdue_label')}
            </span>
            <span className="text-[var(--muted)] text-[12px]">
              {t('arrears_real_time_label')}
            </span>
          </div>
        </div>

        {/* Card 4: Open Support Tickets (Blue Icon Badge) */}
        <div
          onClick={onNavigateToTickets}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onNavigateToTickets();
            }
          }}
          className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] truncate">
                {t('metric_open_tickets')}
              </span>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--text)] font-mono tracking-tight">
                {openTickets.length}
              </span>
              <span className="text-sm text-[var(--muted)] font-medium truncate">
                {text('en intervention', 'in progress', 'قيد التدخل')}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-1 text-[12px]">
            <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              {urgentTicketsCount} {t('prio_urgent')}
            </span>
            <span className="text-[var(--muted)] text-[12px]">
              {text('Terrain assigné', 'Field assignments', 'تدخلات ميدانية')}
            </span>
          </div>
        </div>
      </div>

      {/* URGENT ACTION CENTER: BILLING ALERTS & WHATSAPP DISPATCH */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <span>{t('urgent_center_title')}</span>
                <span className="px-2 py-0.5 rounded-full text-sm font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                  {urgentBillingClients.length} {t('urgent_badge_accounts')}
                </span>
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {t('urgent_center_subtitle')}
              </p>
            </div>
          </div>

          <div className="text-sm text-[var(--muted)] flex items-center gap-2 self-start sm:self-auto font-mono">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            {language === 'ar' ? 'الاستحقاقات والمتأخرات' : language === 'en' ? 'Due soon & overdue' : 'Échéances & retards'}
          </div>
        </div>

        {/* Table of Urgent Billing Clients */}
        {clients.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-[var(--border)]">
            <Users className="w-8 h-8 text-[var(--muted)] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text)]">{t('no_subscribers_registered')}</p>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-sm mx-auto mb-4">
              {t('no_subscribers_registered_sub')}
            </p>
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm transition inline-flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{t('register_first_client')}</span>
            </button>
          </div>
        ) : urgentBillingClients.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-[var(--border)]">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text)]">{t('all_accounts_up_to_date')}</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {t('all_accounts_up_to_date_sub')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden min-w-[640px]">
              <table className="client-table w-full text-left rtl:text-right text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[var(--muted)] border-b border-[var(--border)] uppercase font-semibold tracking-wider text-[12px]">
                    <th className="py-3 px-4">{t('col_subscriber_location')}</th>
                    <th className="py-3 px-4">{t('col_neighborhood')}</th>
                    <th className="py-3 px-4">{t('col_status')}</th>
                    <th className="py-3 px-4">{t('col_monthly_fee')}</th>
                    <th className="py-3 px-4">{t('telemetry_title')}</th>
                    <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-[var(--surface)]">
                {paginatedUrgentClients.map((client) => {
                  const daysDiff = getDaysDiff(client.nextDueDate);
                  const isOverdue = daysDiff < 0;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4" data-label={t('col_subscriber_location')}>
                        <button
                          type="button"
                          onClick={() => onOpenClientDetailModal(client)}
                          className="font-bold text-[var(--text)] hover:text-orange-600 dark:hover:text-orange-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {client.name}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition rtl:rotate-180" />
                        </button>
                        <div className="text-[12px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-[var(--muted)]" />
                          {client.phone && client.phone.trim() ? (
                            <a
                              href={`tel:${client.phone}`}
                              className="hover:text-emerald-600 transition"
                            >
                              {client.phone}
                            </a>
                          ) : (
                            <span className="text-[var(--muted)] italic font-sans">—</span>
                          )}
                        </div>
                      </td>

                      {/* Neighborhood */}
                      <td className="py-3.5 px-4" data-label={t('col_neighborhood')}>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-medium text-sm">
                          {client.neighborhood || 'Tétouan'}
                        </span>
                      </td>

                      {/* Due Date & Badge */}
                      <td className="py-3.5 px-4" data-label={t('col_status')}>
                        <div className="font-mono text-sm font-semibold text-[var(--text)]">
                          {client.nextDueDate}
                        </div>
                        <div className="mt-1">
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                              <AlertTriangle className="w-3 h-3" />
                              {Math.abs(daysDiff)}{language === 'ar' ? ' يوم ' : 'd '} {t('status_overdue')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                              <Clock className="w-3 h-3" />
                              {t('status_due_soon')} ({daysDiff === 0 ? (language === 'ar' ? 'اليوم' : "Aujourd'hui") : `${daysDiff}${language === 'ar' ? 'ي' : 'd'}`})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3.5 px-4" data-label={t('col_monthly_fee')}>
                        <span className="font-mono font-bold text-[var(--text)] text-sm">
                          {client.monthlyFee}
                        </span>{' '}
                        <span className="text-[12px] text-[var(--muted)] font-semibold">{t('currency')}</span>
                        <div className="text-[12px] text-[var(--muted)] truncate max-w-[130px]">
                          {localizePlanName(client.subscriptionPlan)}
                        </div>
                      </td>

                      {/* Hardware Info */}
                      <td className="py-3.5 px-4 text-[12px] text-[var(--muted)]" data-label={t('telemetry_title')}>
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <Radio className="w-3 h-3 text-[var(--primary)]" />
                          {client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                        </div>
                        <div className="font-mono text-[12px] text-[var(--muted)] mt-0.5">
                          MAC: {client.hardware?.antennaMac || 'N/A'}
                        </div>
                      </td>

                      {/* Direct Actions */}
                      <td className="py-3.5 px-4 text-right rtl:text-left" data-label={t('actions')}>
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                          {/* Send WhatsApp Reminder */}
                          {client.phone && client.phone.trim() ? (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsAppModal(client)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                              title={t('action_send_whatsapp')}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100/50 text-slate-400 border border-slate-200/40 opacity-40 font-semibold text-xs flex items-center gap-1.5 shadow-none cursor-not-allowed"
                              title="Numéro de téléphone non renseigné"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          {/* Record Payment (Secondary Neutral CTA) */}
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(client.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--text-secondary)] border border-[var(--border)] font-semibold text-sm transition flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                            title={t('action_record_payment')}
                          >
                            <CreditCard className="w-3.5 h-3.5 text-[var(--muted)]" />
                            <span>{t('action_record_payment')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Urgent Table Pagination Bar if > 10 */}
            {urgentBillingClients.length > URGENT_PAGE_SIZE && (
              <div className="px-4 py-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20 text-xs sm:text-sm">
                <span className="text-[var(--muted)] font-medium">
                  {t('pagination_showing', {
                    from: startUrgentIdx + 1,
                    to: Math.min(startUrgentIdx + URGENT_PAGE_SIZE, urgentBillingClients.length),
                    total: urgentBillingClients.length,
                  })}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUrgentPage((p) => Math.max(1, p - 1))}
                    disabled={urgentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                    aria-label={t('pagination_previous')}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{t('pagination_previous')}</span>
                  </button>
                  <span className="font-semibold px-2 text-[var(--text)]">
                    {urgentPage} / {totalUrgentPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUrgentPage((p) => Math.min(totalUrgentPages, p + 1))}
                    disabled={urgentPage === totalUrgentPages}
                    className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                    aria-label={t('pagination_next')}
                  >
                    <span>{t('pagination_next')}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HISTORICAL MONTHLY BILLING & UNPAID SUBSCRIBERS LEDGER
          (التدقيق الشهري ومتابعة المستحقات - Bilan Mensuel)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/40 space-y-6">
        {/* Module Header & Month/Year Picker */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/25 shrink-0 shadow-lg shadow-amber-500/10">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--warning)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
                  {t('reconciliation_title')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[12px] font-mono font-bold bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]">
                  {selectedMonthLabel}
                </span>
                {isFutureMonth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/15 text-[var(--warning)] border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-[var(--warning)]" />
                    <span>{t('future_month_badge')}</span>
                  </span>
                )}
                {isCurrentMonth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-emerald-500/15 text-[var(--success)] border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{t('current_active_month')}</span>
                  </span>
                )}
                {isPastMonth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[var(--border)] text-[var(--muted)] border border-[var(--border)]">
                    <span>{t('past_archive_badge')}</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {isFutureMonth
                  ? t('reconciliation_future_desc')
                  : t('reconciliation_active_desc')}
              </p>
            </div>
          </div>

          {/* Month & Year Dropdown Selector and Bulk Reminder Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 self-start lg:self-auto w-full lg:w-auto">
            {/* Action: Relancer Tous les Impayés */}
            <button
              type="button"
              onClick={() => setIsBulkReminderOpen(true)}
              disabled={unpaidList.length === 0}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer shrink-0"
              title={t('remind_all_unpaid_btn')}
            >
              <MessageSquare className="w-4 h-4 text-white shrink-0" />
              <span className="whitespace-nowrap">{t('remind_all_unpaid_btn')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-[var(--success)] font-mono text-[12px] font-bold border border-emerald-400/30">
                {unpaidList.length}
              </span>
            </button>

            {/* Action: Exporter le Bilan CSV */}
            <button
              type="button"
              onClick={() => exportBilanCSV(selectedMonthStr, allEligibleList)}
              disabled={allEligibleList.length === 0}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#241E30] hover:bg-[#2D253B] disabled:opacity-40 disabled:cursor-not-allowed text-[#E0D8EB] hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-[#3A2F4C] shadow-md shadow-black/30 cursor-pointer shrink-0"
              title={t('export_bilan_csv_btn')}
            >
              <Download className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">{t('export_bilan_csv_btn')}</span>
            </button>

            <div className="flex items-center gap-2.5 flex-1 sm:flex-initial">
              <label className="text-sm text-[var(--muted)] font-semibold shrink-0 flex items-center gap-1.5" htmlFor="AdminDashboard-field-0">
                <Calendar className="w-3.5 h-3.5 text-[var(--warning)]" />
                <span>{t('financial_month_label')}</span>
              </label>
              <div className="relative flex-1 lg:w-64">
                <select
                  value={selectedMonthStr}
                  onChange={(e) => setSelectedMonthStr(e.target.value)}
                  className="w-full appearance-none bg-[var(--surface-muted)] border border-[var(--border)] hover:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] font-bold focus:outline-none focus:border-amber-500 transition cursor-pointer pr-8"
                  id="AdminDashboard-field-0">
                  <optgroup label={text('Mois à venir (avances)', 'Upcoming months (advances)', 'الأشهر القادمة (دفعات مسبقة)')} className="bg-[var(--surface)] text-[var(--warning)] font-bold">
                    {financialMonthOptions
                      .filter((opt) => opt.isFuture)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text)]">
                          {formatBillingMonthLabel(opt.value, language)} ({opt.value}) • {text('Avance', 'Advance', 'دفعة مسبقة')}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={text('Mois actif', 'Current month', 'الشهر الحالي')} className="bg-[var(--surface)] text-[var(--success)] font-bold">
                    {financialMonthOptions
                      .filter((opt) => opt.isCurrent)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text)]">
                          ★ {formatBillingMonthLabel(opt.value, language)} ({opt.value}) — {text('Mois actif', 'Current month', 'الشهر الحالي')}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={text('Historique (18 mois)', 'History (18 months)', 'الأشهر السابقة (18 شهراً)')} className="bg-[var(--surface)] text-[var(--muted)] font-bold">
                    {financialMonthOptions
                      .filter((opt) => opt.isPast)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text)]">
                          {formatBillingMonthLabel(opt.value, language)} ({opt.value})
                        </option>
                      ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-2.5 text-[var(--muted)] text-sm">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Summary KPI Cards for the Selected Month */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: Paid Subscriptions / Advance Payments */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[var(--surface-muted)] border border-emerald-500/20 hover:border-emerald-500/40 transition shadow-lg shadow-black/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {isFutureMonth
                    ? t('total_advance_collected')
                    : isCurrentMonth
                    ? t('total_month_collected')
                    : t('total_paid_subs')}
                </span>
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[var(--success)] font-mono tracking-tight">
                  {totalCollected.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[var(--success)]">{t('currency')}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted)]">
              <span className="text-[var(--text-secondary)] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {paidList.length} {isFutureMonth ? (language === 'ar' ? 'مشترك سدد مسبقاً' : 'avances réglées') : (language === 'ar' ? 'مشترك مسوى' : 'abonnés réglés')}
                </span>
              </span>
              <span className="font-mono text-[12px] text-[var(--success)] font-semibold">
                {isFutureMonth ? (language === 'ar' ? 'مداخيل مسبقة محصلة' : 'Revenus anticipés') : (language === 'ar' ? 'مداخيل محصلة' : 'Revenus encaissés')}
              </span>
            </div>
          </div>

          {/* Card 2: Unpaid / Projected Revenue to Collect */}
          <div className={`p-4 sm:p-4.5 rounded-2xl bg-[var(--surface-muted)] border transition shadow-lg shadow-black/20 flex flex-col justify-between ${
            isFutureMonth
              ? 'border-amber-500/20 hover:border-amber-500/40'
              : 'border-rose-500/20 hover:border-rose-500/40'
          }`}>
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {isFutureMonth
                    ? t('projected_revenue_label')
                    : isCurrentMonth
                    ? t('unpaid_due_label')
                    : t('filter_unpaid')}
                </span>
                <div className={`p-1.5 rounded-xl border ${
                  isFutureMonth
                    ? 'bg-amber-500/10 text-[var(--warning)] border-amber-500/25'
                    : 'bg-rose-500/10 text-[var(--error)] border-rose-500/30'
                }`}>
                  {isFutureMonth ? (
                    <Clock className="w-4 h-4 text-[var(--warning)]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[var(--error)]" />
                  )}
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  isFutureMonth ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                }`}>
                  {totalUnpaid.toLocaleString()}
                </span>
                <span className={`text-sm font-bold ${
                  isFutureMonth ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                }`}>
                  {t('currency')}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted)]">
              <span className={`font-bold flex items-center gap-1.5 ${
                isFutureMonth ? 'text-[var(--warning)]' : 'text-[var(--error)]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isFutureMonth ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                <span>
                  {unpaidList.length}{' '}
                  {isFutureMonth
                    ? (language === 'ar' ? 'اشتراك مستحق للتجديد' : 'à renouveler')
                    : isCurrentMonth
                    ? (language === 'ar' ? 'اشتراك قيد التحصيل' : 'en attente')
                    : (language === 'ar' ? 'مشتركين غير مؤدين' : 'impayés')}
                </span>
              </span>
              <span className={`font-mono text-[12px] font-semibold ${
                isFutureMonth ? 'text-[var(--warning)]' : 'text-[var(--error)]'
              }`}>
                {isFutureMonth ? (language === 'ar' ? 'مداخيل مرتقبة' : 'Prévisionnel') : isCurrentMonth ? (language === 'ar' ? 'واجب السداد' : 'À encaisser') : (language === 'ar' ? 'مستحقات معلقة' : 'Arriérés')}
              </span>
            </div>
          </div>

          {/* Card 3: Collection / Advance Coverage Rate */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] hover:border-amber-500/30 transition shadow-lg shadow-black/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {isFutureMonth
                    ? t('advance_coverage_label')
                    : t('collection_rate_label')}
                </span>
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/20">
                  <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[var(--text)] font-mono tracking-tight">
                  {collectionRate}%
                </span>
                <span className="text-sm text-[var(--muted)] font-semibold">
                  ({paidList.length} / {allEligibleList.length})
                </span>
              </div>
              {/* Progress Bar */}
              <div className="mt-2 w-full bg-[var(--surface)] rounded-full h-2 border border-[var(--border)] overflow-hidden">
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
            <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted)]">
              <span>
                {isFutureMonth
                  ? text(`Avances pour ${selectedMonthLabel}`, `Advance coverage for ${selectedMonthLabel}`, `معدل التسوية المسبقة لشهر ${selectedMonthLabel}`)
                  : text(`Recouvrement de ${selectedMonthLabel}`, `Collection for ${selectedMonthLabel}`, `معدل تسوية اشتراكات ${selectedMonthLabel}`)}
              </span>
              <span className="text-[var(--warning)] font-mono text-[12px] font-bold">
                {isFutureMonth
                  ? `${text('Prévision', 'Projected', 'إجمالي المتوقع')}: ${totalProjectedRevenue.toLocaleString()} ${t('currency')}`
                  : collectionRate === 100
                  ? text('100% réglé', '100% collected', 'كامل 100%')
                  : `${100 - collectionRate}% ${text('restant', 'remaining', 'متبقية')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Tab Pills */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setHistoricalFilterTab('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                historicalFilterTab === 'all'
                  ? 'bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)] font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)]/60'
              }`}
            >
              <span>{t('filter_all_subs')}</span>
              <span className="font-mono text-[12px] px-1.5 py-0.2 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
                {allEligibleList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoricalFilterTab('paid')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                historicalFilterTab === 'paid'
                  ? 'bg-emerald-500/20 text-[var(--success)] border border-emerald-500/40 font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-emerald-400 hover:bg-[var(--surface-muted)]/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isFutureMonth ? t('filter_advance_paid') : t('filter_paid')}</span>
              <span className="font-mono text-[12px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-[var(--success)] border border-emerald-800/60 font-bold">
                {paidList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoricalFilterTab('unpaid')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                historicalFilterTab === 'unpaid'
                  ? isFutureMonth
                    ? 'bg-amber-500/20 text-[var(--warning)] border border-amber-500/40 font-bold shadow-sm'
                    : 'bg-rose-500/20 text-[var(--error)] border border-rose-500/40 font-bold shadow-sm'
                  : isFutureMonth
                  ? 'text-[var(--muted)] hover:text-amber-400 hover:bg-[var(--surface-muted)]/60'
                  : 'text-[var(--muted)] hover:text-rose-400 hover:bg-[var(--surface-muted)]/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isFutureMonth ? 'bg-amber-400' : 'bg-rose-500'}`} />
              <span>
                {isFutureMonth
                  ? t('filter_due_renewal')
                  : isCurrentMonth
                  ? (language === 'ar' ? 'قيد التحصيل' : 'En attente')
                  : t('filter_unpaid')}
              </span>
              <span className={`font-mono text-[12px] px-1.5 py-0.2 rounded-full font-bold border ${
                isFutureMonth
                  ? 'bg-amber-500/10 text-[var(--warning)] border-amber-800/60'
                  : 'bg-rose-500/10 text-[var(--error)] border-rose-800/60'
              }`}>
                {unpaidList.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'ar' ? `بحث في كشف ${selectedMonthLabelAr}...` : `Rechercher dans le bilan de ${selectedMonthLabelFr}...`}
              value={historicalSearchQuery}
              onChange={(e) => setHistoricalSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-1.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
             aria-label={language === 'ar' ? `بحث في كشف ${selectedMonthLabelAr}...` : `Rechercher dans le bilan de ${selectedMonthLabelFr}...`}/>
          </div>
        </div>

        {/* Ledger Table */}
        {filteredReconciliationRows.length === 0 ? (
          <div className="p-10 text-center bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)] space-y-2">
            <CheckCircle className="w-8 h-8 text-[var(--success)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--text)]">
              {historicalFilterTab === 'unpaid'
                ? isFutureMonth
                  ? (language === 'ar' ? `ممتاز! جميع المشتركين قاموا بالتسديد المسبق لشهر ${selectedMonthLabelAr}.` : `Tous les abonnés ont réglé d'avance pour ${selectedMonthLabelFr}.`)
                  : (language === 'ar' ? `تهانينا! جميع المشتركين سددوا اشتراك ${selectedMonthLabelAr}.` : `Tous les abonnés ont réglé pour ${selectedMonthLabelFr}.`)
                : historicalFilterTab === 'paid' && isFutureMonth
                ? (language === 'ar' ? `لا توجد دفعات مسبقة مسجلة بعد لشهر ${selectedMonthLabelAr}.` : `Aucun paiement d'avance pour ${selectedMonthLabelFr}.`)
                : (language === 'ar' ? 'لا توجد سجلات مطابقة في هذا التصنيف.' : 'Aucun enregistrement correspondant.')}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {historicalFilterTab === 'unpaid'
                ? isFutureMonth
                  ? (language === 'ar' ? 'لا توجد اشتراكات معلقة للتجديد في هذا الشهر المستقبلي.' : 'Aucun renouvellement en attente.')
                  : (language === 'ar' ? 'نسبة التحصيل بلغت 100% لهذا الشهر المالي المحدد.' : 'Taux de recouvrement de 100% pour ce mois.')
                : (language === 'ar' ? 'يمكنك اختيار شهر آخر من القائمة أو تسجيل دفعة جديدة.' : 'Sélectionnez un autre mois ou enregistrez un paiement.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden min-w-[720px]">
              <table className="client-table w-full text-left rtl:text-right text-sm border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-muted)] text-[var(--muted)] border-b border-[var(--border)] uppercase font-semibold tracking-wider text-[12px]">
                    <th className="py-3 px-4">{t('col_subscriber_location')}</th>
                    <th className="py-3 px-4">{t('col_neighborhood_address')}</th>
                    <th className="py-3 px-4">{t('col_cpe_pppoe')}</th>
                    <th className="py-3 px-4">{t('col_monthly_due')}</th>
                    <th className="py-3 px-4">
                      {isFutureMonth ? (language === 'ar' ? `وضعية شهر ${selectedMonthStr} (مستقبلي)` : `Statut ${selectedMonthStr} (Avance)`) : (language === 'ar' ? `حالة شهر ${selectedMonthStr}` : `Statut ${selectedMonthStr}`)}
                    </th>
                    <th className="py-3 px-4 text-right rtl:text-left">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-muted)]">
                  {paginatedReconciliationRows.map((row) => {
                    const { client, payment, isPaid } = row;
                    const coverageDetail = 'coverageDetail' in row ? row.coverageDetail : undefined;
                    const fee = client.monthlyFee || 50;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-[var(--surface)] transition group"
                      >
                        {/* Subscriber Name & Phone */}
                        <td className="py-3.5 px-4" data-label={t('col_subscriber_location')}>
                          <button
                            type="button"
                            onClick={() => onOpenClientDetailModal(client)}
                            className="font-bold text-[var(--text)] hover:text-amber-400 text-left rtl:text-right transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{client.name}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                          <div className="text-[12px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-[var(--muted)]" />
                            {client.phone && client.phone.trim() ? (
                              <a
                                href={`tel:${client.phone}`}
                                className="hover:text-emerald-400 transition"
                              >
                                {client.phone}
                              </a>
                            ) : (
                              <span className="text-[var(--muted)] italic font-sans">—</span>
                            )}
                          </div>
                        </td>

                        {/* Neighborhood */}
                        <td className="py-3.5 px-4 text-[var(--text-secondary)]" data-label={t('col_neighborhood_address')}>
                          <span className="px-2 py-0.5 rounded-lg bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]/70 font-medium">
                            {client.neighborhood || 'Tétouan'}
                          </span>
                          {client.address && (
                            <div className="text-[12px] text-[var(--muted)] mt-0.5 truncate max-w-[140px]">
                              {client.address}
                            </div>
                          )}
                        </td>

                        {/* Hardware & PPPoE */}
                        <td className="py-3.5 px-4 text-[12px] text-[var(--muted)]" data-label={t('col_cpe_pppoe')}>
                          <div className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                            <Radio className="w-3 h-3 text-[var(--warning)]" />
                            <span>{client.hardware?.antennaModel || 'Ubiquiti CPE'}</span>
                          </div>
                          <div className="font-mono text-[12px] text-[var(--muted)] mt-0.5">
                            PPPoE: <span className="text-[var(--text-secondary)]">{client.hardware?.pppoeUsername || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Monthly Fee */}
                        <td className="py-3.5 px-4" data-label={t('col_monthly_due')}>
                          <span className="font-mono font-bold text-[var(--text)] text-sm">
                            {fee}
                          </span>{' '}
                          <span className="text-[12px] text-[var(--muted)] font-semibold">{t('currency')}</span>
                          <div className="text-[12px] text-[var(--muted)] truncate max-w-[130px]">
                            {client.subscriptionPlan || 'Pack Standard'}
                          </div>
                        </td>

                        {/* Monthly Status Badge */}
                        <td className="py-3.5 px-4" data-label={isFutureMonth ? (language === 'ar' ? `وضعية شهر ${selectedMonthStr} (مستقبلي)` : `Statut ${selectedMonthStr} (Avance)`) : (language === 'ar' ? `حالة شهر ${selectedMonthStr}` : `Statut ${selectedMonthStr}`)}>
                          {isPaid ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-emerald-500/15 text-[var(--success)] border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3 text-[var(--success)]" />
                                <span>
                                  {isFutureMonth ? text('Payé d’avance', 'Paid in advance', 'دفعة مسبقة') : text('Payé', 'Paid', 'تم الأداء')}
                                </span>
                              </span>
                              <div className="text-[12px] text-[var(--muted)] font-mono mt-1">
                                {coverageDetail || (payment ? `${payment.paymentDate} • ${payment.receiptNumber}` : text('Couvert d’avance', 'Covered in advance', 'مسوى مسبقاً'))}
                              </div>
                            </div>
                          ) : isFutureMonth ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/15 text-[var(--warning)] border border-amber-500/30">
                                <Clock className="w-3 h-3 text-[var(--warning)]" />
                                <span>{text('À renouveler', 'Renewal due', 'مستحق للتجديد')}</span>
                              </span>
                              <div className="text-[12px] text-[var(--muted)] font-mono mt-0.5">
                                {text('Renouvellement', 'Renewal date', 'تاريخ التجديد')}: {client.nextDueDate}
                              </div>
                              <div className="text-[12px] text-[var(--warning)] font-mono font-semibold">
                                {text('Prévision', 'Projected', 'متوقع')}: {fee} {t('currency')}
                              </div>
                            </div>
                          ) : isCurrentMonth ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/15 text-[var(--warning)] border border-amber-500/30">
                                <Clock className="w-3 h-3 text-[var(--warning)]" />
                                <span>{text('En attente', 'Pending', 'قيد التحصيل')}</span>
                              </span>
                              <div className="text-[12px] text-[var(--warning)] font-mono mt-0.5">
                                {text('À régler', 'Amount due', 'واجب السداد')}: {fee} {t('currency')}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-rose-500/15 text-[var(--error)] border border-rose-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{text('Impayé', 'Unpaid', 'غير مؤدى')}</span>
                              </span>
                              <div className="text-[12px] text-[var(--error)] font-mono mt-0.5">
                                {text('À régler', 'Amount due', 'واجب السداد')}: {fee} {t('currency')}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right rtl:text-left" data-label={t('actions')}>
                          <div className="flex items-center justify-end rtl:justify-start gap-2">
                            {!isPaid ? (
                              <>
                                {/* Action 1: WhatsApp Reminder */}
                                {client.phone && client.phone.trim() ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSendUnpaidWhatsApp(client)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center gap-1.5 shadow-sm shadow-emerald-950 hover:scale-105 active:scale-95 cursor-pointer"
                                    title={
                                      isFutureMonth
                                        ? (language === 'ar' ? `إرسال تذكير مسبق لتجديد شهر ${selectedMonthLabelAr}` : `Envoyer rappel anticipé pour ${selectedMonthLabelFr}`)
                                        : (language === 'ar' ? `إرسال تذكير واتساب لشهر ${selectedMonthLabelAr}` : `Envoyer rappel WhatsApp pour ${selectedMonthLabelFr}`)
                                    }
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{isFutureMonth ? t('send_advance_reminder') : t('send_whatsapp_reminder')}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-3 py-1.5 rounded-xl bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border)] font-semibold text-sm flex items-center gap-1.5 cursor-not-allowed opacity-50 shadow-none"
                                    title={language === 'ar' ? 'لا يوجد رقم هاتف' : 'Numéro non renseigné'}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{language === 'ar' ? 'بدون هاتف' : 'Sans tél'}</span>
                                  </button>
                                )}

                                {/* Action 2: Record Payment */}
                                <button
                                  type="button"
                                  onClick={() => onOpenPaymentModal(client.id, selectedMonthStr)}
                                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] font-semibold text-sm transition flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                  title={
                                    isFutureMonth
                                      ? (language === 'ar' ? `تسجيل دفعة مسبقة لشهر ${selectedMonthLabelAr}` : `Encaisser avance pour ${selectedMonthLabelFr}`)
                                      : (language === 'ar' ? `تسجيل دفعة شهر ${selectedMonthLabelAr}` : `Encaisser pour ${selectedMonthLabelFr}`)
                                  }
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-[var(--warning)]" />
                                  <span>{isFutureMonth ? t('record_advance_payment') : t('dash_record_payment')}</span>
                                </button>
                              </>
                            ) : (
                              payment && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPaymentForSlip(payment)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] text-[12px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Receipt className="w-3 h-3 text-[var(--muted)]" />
                                  <span>{t('payment_slip')}</span>
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

              {/* Monthly Reconciliation Pagination Controls */}
              {filteredReconciliationRows.length > 0 && (
                <div className="px-4 py-3.5 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface)]/50 text-xs sm:text-sm">
                  <span className="text-[var(--muted)] font-medium">
                    {t('pagination_showing', {
                      from: startReconIdx + 1,
                      to: Math.min(startReconIdx + RECON_PAGE_SIZE, filteredReconciliationRows.length),
                      total: filteredReconciliationRows.length,
                    })}
                  </span>

                  {totalReconPages > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => setReconPage((p) => Math.max(1, p - 1))}
                        disabled={reconPage === 1}
                        className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs font-medium"
                        aria-label={t('pagination_previous')}
                      >
                        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                        <span>{t('pagination_previous')}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {reconPageNumbers.map((page, idx) => {
                          if (page === 'ellipsis') {
                            return (
                              <span key={`recon-ell-${idx}`} className="w-7 text-center text-[var(--muted)] select-none">
                                …
                              </span>
                            );
                          }
                          const isCurrent = page === reconPage;
                          return (
                            <button
                              key={`recon-p-${page}`}
                              type="button"
                              onClick={() => setReconPage(page as number)}
                              className={`w-8 h-8 rounded-xl font-semibold transition flex items-center justify-center cursor-pointer ${
                                isCurrent
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                                  : 'border border-[var(--border)] bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] shadow-2xs'
                              }`}
                              aria-current={isCurrent ? 'page' : undefined}
                              aria-label={`${t('pagination_page')} ${page}`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setReconPage((p) => Math.min(totalReconPages, p + 1))}
                        disabled={reconPage === totalReconPages}
                        className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs font-medium"
                        aria-label={t('pagination_next')}
                      >
                        <span>{t('pagination_next')}</span>
                        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY & REVENUE LEDGER PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments Ledger (2 Cols) */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <Coins className="w-4 h-4 text-[var(--success)]" />
                <span>{t('recent_payments_title')}</span>
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {t('recent_payments_subtitle')}
              </p>
            </div>
            <button
              onClick={() => onOpenPaymentModal()}
              className="text-sm font-semibold text-[var(--warning)] hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
            >
              + {t('dash_record_payment')}
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)]">
              <Coins className="w-8 h-8 text-[var(--muted)] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[var(--text)]">{t('no_payments_found')}</p>
              <p className="text-sm text-[var(--muted)] mt-1">
                {t('no_payments_found_sub')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] overflow-hidden min-w-[480px]">
                {[...payments]
                  .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '') || b.id.localeCompare(a.id))
                  .slice(0, 5)
                  .map((pay) => {
                  const hasExtra = (pay.extraAmount ?? 0) > 0;
                  const itemBase = pay.baseFee ?? (pay.amount - (pay.extraAmount ?? 0));
                  return (
                    <div
                      key={pay.id}
                      className="p-3.5 bg-[var(--surface-muted)] hover:bg-[var(--surface)] transition flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text)] flex items-center gap-2">
                            <span>{pay.clientName}</span>
                            {hasExtra && (
                              <span className="text-[12px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] text-[var(--warning)] border border-amber-500/30 font-semibold">
                                +Extra
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[var(--text-secondary)]">{pay.receiptNumber}</span>
                            <span>•</span>
                            <span className="capitalize">{pay.method.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{pay.paymentDate}</span>
                          </div>
                          {hasExtra && (
                            <div className="text-[12px] text-[var(--muted)] font-mono mt-0.5">
                              Base: {itemBase} MAD + {pay.extraAmount} MAD ({pay.extraReason || 'Ajustement'})
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right rtl:text-left flex flex-col items-end rtl:items-start gap-1">
                        <div className="font-mono font-black text-[var(--success)] text-sm">
                          +{pay.amount} {t('currency')}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[var(--muted)] font-mono">
                            Due: {pay.newDueDate}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentForSlip(pay)}
                            className="px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--warning)] hover:text-white border border-[var(--border)] text-[12px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>{t('payment_slip')}</span>
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
        <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-6 shadow-xl shadow-black/40 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--warning)]" />
              <span>{t('infrastructure_title')}</span>
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {t('infrastructure_subtitle')} · {language === 'ar' ? 'بيانات توضيحية' : language === 'en' ? 'Illustrative data' : 'Données indicatives'}
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            <div className="space-y-3 text-sm min-w-[320px]">
              <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text)]">Relais Jbel Dersa (Tétouan Nord)</div>
                  <div className="text-[12px] text-[var(--muted)]">Ubiquiti airFiber 60 Backhaul</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-emerald-500/20 text-[var(--success)] border border-emerald-500/30">
                  100% Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text)]">Pylône Wilaya / Sania Rmel</div>
                  <div className="text-[12px] text-[var(--muted)]">Rocket 5AC Prism + 45° Sector</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-emerald-500/20 text-[var(--success)] border border-emerald-500/30">
                  100% Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text)]">Tour Boujarah (Relais Centre)</div>
                  <div className="text-[12px] text-[var(--muted)]">MikroTik mANTBox 19s</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-emerald-500/20 text-[var(--success)] border border-emerald-500/30">
                  100% Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text)]">Station Martil / Cabo Negro</div>
                  <div className="text-[12px] text-[var(--muted)]">LiteAP AC Sector</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/20 text-[var(--warning)] border border-amber-500/30">
                  Heavy Traffic
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)]/70 text-[12px] text-[var(--muted)] flex items-center justify-between">
            <span>{t('bandwidth_consumption')}</span>
            <span className="font-mono text-[var(--success)] font-bold">428 Mbps / 1 Gbps</span>
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

      {/* Bulk Unpaid WhatsApp Reminder Modal */}
      {isBulkReminderOpen && (
        <BulkUnpaidReminderModal
          monthStr={selectedMonthStr}
          monthLabel={language === 'ar' ? selectedMonthLabelAr : selectedMonthLabelFr}
          isFutureMonth={isFutureMonth}
          unpaidList={unpaidList}
          totalUnpaidAmount={totalUnpaid}
          onClose={() => setIsBulkReminderOpen(false)}
          onRecordPayment={(clientId) => {
            setIsBulkReminderOpen(false);
            onOpenPaymentModal(clientId, selectedMonthStr);
          }}
        />
      )}
    </div>
  );
}
