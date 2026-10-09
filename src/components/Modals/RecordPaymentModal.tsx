'use client';

import React, { useState, useEffect } from 'react';
import { Client, PaymentMethod, PaymentLog } from '@/lib/types';
import { useStore, getTodayDateStr, addMonthsToDateStr, formatBillingMonthLabel } from '@/lib/store';
import {
  X,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  ArrowRight,
  Plus,
  Trash2,
  Calculator,
  Sparkles,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import InvoiceReceiptModal from './InvoiceReceiptModal';

interface Props {
  initialClientId?: string;
  initialBillingMonth?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXTRA_FEE_PRESETS = [
  'Late payment fee',
  'Extra days prorated',
  'Replacement cable / adapter',
  'Temporary speed boost',
  'Technical maintenance',
  'Custom adjustment',
];

export default function RecordPaymentModal({
  initialClientId,
  initialBillingMonth,
  onClose,
  onSuccess,
}: Props) {
  const { clients, recordPayment, t, language, dir } = useStore();
  const defaultDateStr = getTodayDateStr();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || (clients[0]?.id ?? '')
  );
  const [billingMonth, setBillingMonth] = useState<string>(
    initialBillingMonth || defaultDateStr.substring(0, 7)
  );
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Pricing & Override states
  const [baseFee, setBaseFee] = useState<number>(
    selectedClient ? (selectedClient.monthlyFee || 100) : 100
  );
  const [updateRecurringRate, setUpdateRecurringRate] = useState<boolean>(false);

  // Extra charges states
  const [hasExtraCharges, setHasExtraCharges] = useState<boolean>(false);
  const [extraAmount, setExtraAmount] = useState<number>(20);
  const [extraReason, setExtraReason] = useState<string>('Late payment fee');
  const [customReason, setCustomReason] = useState<string>('');

  // Payment details
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState<string>(defaultDateStr);
  const [extendDays, setExtendDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state for displaying invoice slip modal
  const [createdPayment, setCreatedPayment] = useState<PaymentLog | null>(null);

  const extraFeePresetOptions = [
    { id: 'Late payment fee', label: t('preset_fee_late') },
    { id: 'Extra days prorated', label: t('preset_fee_prorated') },
    { id: 'Replacement cable / adapter', label: t('preset_fee_hardware') },
    { id: 'Temporary speed boost', label: t('preset_fee_boost') },
    { id: 'Technical maintenance', label: t('preset_fee_maintenance') },
    { id: 'Custom adjustment', label: t('preset_fee_custom') },
  ];

  // When client changes, update baseFee
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setBaseFee(client.monthlyFee || 100);
    }
  };

  // Keep baseFee in sync when client first loads
  useEffect(() => {
    if (selectedClient) {
      setBaseFee(selectedClient.monthlyFee || 100);
    }
  }, [selectedClient?.id]);

  // Total auto-calculation
  const effectiveExtra = hasExtraCharges && Number(extraAmount) > 0 ? Number(extraAmount) : 0;
  const totalAmount = (Number(baseFee) || 100) + effectiveExtra;
  const effectiveReason =
    extraReason === 'Custom adjustment'
      ? (customReason.trim() || t('preset_fee_custom'))
      : extraReason;

  // Preview calculated new due date (advances from previous due date by proper calendar months)
  const computeNewDueDatePreview = (): string => {
    if (!selectedClient) return '';
    const prev = selectedClient.nextDueDate;
    const months = Math.max(1, Math.round(extendDays / 30));
    return addMonthsToDateStr(prev, months);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedClient) return;

    setIsSubmitting(true);
    try {
      const paymentLog = recordPayment({
        clientId: selectedClientId,
        amount: totalAmount,
        baseFee: Number(baseFee) || 100,
        extraAmount: effectiveExtra,
        extraReason: effectiveExtra > 0 ? effectiveReason : undefined,
        method,
        paymentDate,
        billingMonth,
        extendDays,
        notes: notes.trim() || undefined,
        updateClientBaseFee: updateRecurringRate,
      });

      setCreatedPayment(paymentLog);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If payment was recorded, render the full printable Invoice/Receipt Slip!
  if (createdPayment) {
    return (
      <InvoiceReceiptModal
        payment={createdPayment}
        client={selectedClient}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-white dark:bg-slate-900 sm:border sm:border-slate-200/80 dark:sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('record_payment_modal_title')}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {t('record_payment_subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If targeted billing month reconciliation (historical or advance future) */}
        {initialBillingMonth && (
          <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between text-xs shrink-0 ${
            initialBillingMonth > defaultDateStr.substring(0, 7)
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <span className="font-semibold flex items-center gap-1.5">
              <span>{initialBillingMonth > defaultDateStr.substring(0, 7) ? '🔮' : '📅'}</span>
              <span>
                {t('target_billing_month')}{' '}
                <strong>{formatBillingMonthLabel(initialBillingMonth, language)} ({initialBillingMonth})</strong>
              </span>
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              initialBillingMonth > defaultDateStr.substring(0, 7)
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
            }`}>
              {initialBillingMonth > defaultDateStr.substring(0, 7)
                ? t('advance_payment_badge')
                : t('monthly_reconciliation_badge')}
            </span>
          </div>
        )}

        {clients.length === 0 ? (
          <div className="p-10 text-center space-y-4 bg-[#130F1A]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#F4F0F8]">{t('no_subscribers_title')}</h4>
              <p className="text-xs text-[#958B9F] max-w-xs mx-auto mt-1">
                {t('no_subscribers_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Subscriber select */}
            <div>
              <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                {t('select_subscriber')} <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.neighborhood || 'Tétouan'} ({c.monthlyFee || 100} MAD | {c.nextDueDate})
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION 1: FLEXIBLE MONTHLY PRICING (DEFAULT 100 MAD + CUSTOM OVERRIDE) */}
            <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E0D8EB] flex items-center gap-1.5">
                    <span>{t('base_fee_title')}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {t('base_fee_default_badge')}
                    </span>
                  </span>
                  <p className="text-[11px] text-[#958B9F] mt-0.5">
                    {t('base_fee_hint')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={baseFee}
                    onChange={(e) => setBaseFee(Number(e.target.value))}
                    className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] font-mono font-bold focus:outline-none focus:border-amber-500/50 transition pr-16 rtl:pr-3.5 rtl:pl-16"
                    required
                  />
                  <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-xs text-[#958B9F] font-bold">
                    MAD
                  </span>
                </div>

                {/* Quick override presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[50, 100, 120, 150, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBaseFee(preset)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
                        baseFee === preset
                          ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                          : 'bg-[#0F0C14] border-[#2D253B]/70 text-[#E0D8EB] hover:border-[#3A2F4C]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurring rate update checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-[#E0D8EB] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={updateRecurringRate}
                  onChange={(e) => setUpdateRecurringRate(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>
                  {t('update_permanent_rate_checkbox', { amount: baseFee })}
                </span>
              </label>
            </div>

            {/* SECTION 2: EXTRA CHARGES / AD-HOC ADJUSTMENTS */}
            <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>{t('extra_fees_title')}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('extra_fees_subtitle')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHasExtraCharges(!hasExtraCharges)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    hasExtraCharges
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {hasExtraCharges ? (
                    <>
                      <Trash2 className="w-3 h-3" />
                      <span>{t('btn_remove')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>{t('btn_add_extra')}</span>
                    </>
                  )}
                </button>
              </div>

              {hasExtraCharges && (
                <div className="space-y-3 pt-2 border-t border-[#261E33] animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#958B9F] mb-1">
                        {t('extra_amount_label')} (MAD) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={extraAmount}
                          onChange={(e) => setExtraAmount(Number(e.target.value))}
                          placeholder="e.g. 20"
                          className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-xl px-3 py-2 text-sm text-[#F4F0F8] font-mono font-bold focus:outline-none focus:border-amber-500/50 transition pr-14 rtl:pr-3 rtl:pl-14"
                          required
                        />
                        <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2 text-xs text-[#958B9F] font-bold">
                          MAD
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#958B9F] mb-1">
                        {t('extra_reason_label')} <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={extraReason}
                        onChange={(e) => setExtraReason(e.target.value)}
                        className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-xl px-3 py-2 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500/50 transition"
                      >
                        {extraFeePresetOptions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {extraReason === 'Custom adjustment' && (
                    <div>
                      <input
                        type="text"
                        placeholder={t('custom_extra_placeholder')}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-xl px-3 py-2 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500/50 transition"
                        required
                      />
                    </div>
                  )}

                  {/* Quick fee buttons */}
                  <div className="flex items-center gap-1.5 text-xs text-[#958B9F]">
                    <span>{language === 'ar' ? 'سريع:' : 'Quick:'}</span>
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setExtraAmount(amt)}
                        className={`px-2 py-0.5 rounded border text-[11px] font-mono transition cursor-pointer ${
                          extraAmount === amt
                            ? 'bg-[#382647] border-[#523368] text-[#F3E8FF] font-bold'
                            : 'bg-[#0F0C14] border-[#261E33] text-[#958B9F] hover:text-[#F4F0F8]'
                        }`}
                      >
                        +{amt} MAD
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LIVE ITEMIZED AUTO-CALCULATED BREAKDOWN */}
            <div className="p-4 rounded-xl bg-[#130F1A] border border-[#2D253B]/70 shadow-lg">
              <div className="flex items-center justify-between text-xs text-[#958B9F] pb-2 border-b border-[#261E33]">
                <span className="font-bold uppercase tracking-wider text-[#E0D8EB] flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  {t('itemized_calculation_title')}
                </span>
                <span className="font-mono text-amber-400 text-[11px]">{t('auto_calculated_badge')}</span>
              </div>

              <div className="divide-y divide-[#261E33] py-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#E0D8EB] pt-1">
                  <span>{t('base_subscription_item')}</span>
                  <span className="font-mono font-bold text-[#F4F0F8]">
                    {baseFee || 100} MAD
                  </span>
                </div>

                {hasExtraCharges && effectiveExtra > 0 && (
                  <div className="flex items-center justify-between text-amber-300 pt-1.5">
                    <span className="flex items-center gap-1">
                      <span>{t('extra_charges_item')}</span>
                      <span className="text-[10px] text-[#958B9F] font-sans italic">
                        ({effectiveReason})
                      </span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      +{effectiveExtra} MAD
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-[#261E33] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#958B9F]">
                    {t('total_due_collect')}
                  </div>
                  <div className="text-[10px] text-[#958B9F]/70">
                    {baseFee || 100} {hasExtraCharges && effectiveExtra > 0 ? `+ ${effectiveExtra}` : ''} MAD
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="font-mono font-black text-2xl text-emerald-400">
                    {totalAmount}
                  </span>{' '}
                  <span className="text-xs font-bold text-emerald-300">MAD</span>
                </div>
              </div>
            </div>

            {/* Payment Date & Extension */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('payment_date_label')} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                  {t('extend_period_label')}
                </label>
                <div className="flex gap-2">
                  {[
                    { days: 30, label: language === 'ar' ? '+1 شهر (30 يوماً)' : language === 'fr' ? '+1 Mois (30j)' : '+1 Month (30d)' },
                    { days: 60, label: language === 'ar' ? '+2 شهران (60 يوماً)' : language === 'fr' ? '+2 Mois (60j)' : '+2 Months (60d)' },
                    { days: 90, label: language === 'ar' ? '+3 أشهر (90 يوماً)' : language === 'fr' ? '+3 Mois (90j)' : '+3 Months (90d)' },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setExtendDays(item.days)}
                      className={`flex-1 py-2 text-xs rounded-xl border font-semibold transition cursor-pointer ${
                        extendDays === item.days
                          ? 'bg-[#382647] border-[#523368] text-[#F3E8FF] font-bold shadow-md shadow-black/40'
                          : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:bg-[#241E30]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Period Preview Banner */}
            {selectedClient && (
              <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] text-xs">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#958B9F] block">{t('current_due_label')}</span>
                    <span className="font-mono font-semibold text-amber-400">
                      {selectedClient.nextDueDate}
                    </span>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-[#958B9F]/60 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  <div className="text-right rtl:text-left">
                    <span className="text-[#958B9F] block">{t('new_renewal_preview', { days: extendDays })}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {computeNewDueDatePreview()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Channel Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                {t('payment_channel_label')} <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left rtl:text-right cursor-pointer ${
                    method === 'cash'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold shadow-md shadow-black/30'
                      : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[#F4F0F8]">{t('method_cash_name')}</div>
                    <div className="text-[10px] text-[#958B9F]">{t('method_cash_sub')}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cih_bank')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left rtl:text-right cursor-pointer ${
                    method === 'cih_bank'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-md shadow-black/30'
                      : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[#F4F0F8]">{t('method_cih_name')}</div>
                    <div className="text-[10px] text-[#958B9F]">{t('method_cih_sub')}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('bank_transfer')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left rtl:text-right cursor-pointer ${
                    method === 'bank_transfer'
                      ? 'bg-[#382647] border-[#523368] text-[#F3E8FF] font-semibold shadow-md shadow-black/30'
                      : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#F3E8FF] shrink-0" />
                  <div>
                    <div className="text-[#F4F0F8]">{t('method_bank_name')}</div>
                    <div className="text-[10px] text-[#958B9F]">{t('method_bank_sub')}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('wafacash')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left rtl:text-right cursor-pointer ${
                    method === 'wafacash'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-md shadow-black/30'
                      : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[#F4F0F8]">{t('method_agency_name')}</div>
                    <div className="text-[10px] text-[#958B9F]">{t('method_agency_sub')}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Notes / Ref */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('notes_label')}
              </label>
              <input
                type="text"
                placeholder={t('notes_placeholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            </div>

            {/* Sticky Modal Footer CTA Button Bar */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between sm:justify-end gap-3 z-10 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial min-h-[46px] px-6 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                    <span>{language === 'ar' ? 'جاري التسجيل...' : 'Enregistrement...'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">{t('confirm_payment_btn_text', { amount: totalAmount })}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
