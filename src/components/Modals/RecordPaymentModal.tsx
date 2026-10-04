'use client';

import React, { useState, useEffect } from 'react';
import { Client, PaymentMethod, PaymentLog } from '@/lib/types';
import { useStore } from '@/lib/store';
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
} from 'lucide-react';
import InvoiceReceiptModal from './InvoiceReceiptModal';

interface Props {
  initialClientId?: string;
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
  onClose,
  onSuccess,
}: Props) {
  const { clients, recordPayment } = useStore();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || (clients[0]?.id ?? '')
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
  const [paymentDate, setPaymentDate] = useState<string>('2026-10-04');
  const [extendDays, setExtendDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state for displaying invoice slip modal
  const [createdPayment, setCreatedPayment] = useState<PaymentLog | null>(null);

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
      ? (customReason.trim() || 'Ajustement personnalisé')
      : extraReason;

  // Preview calculated new due date
  const computeNewDueDatePreview = (): string => {
    if (!selectedClient) return '';
    const prev = selectedClient.nextDueDate;
    const baseDate = new Date(
      new Date(prev) > new Date(paymentDate) ? prev : paymentDate
    );
    baseDate.setDate(baseDate.getDate() + extendDays);
    return baseDate.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Monthly Payment & Invoice</h3>
              <p className="text-xs text-slate-400">
                Flexible base subscription, extra fees & itemized calculation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">No Subscribers Registered</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                You must register at least one client before logging a payment transaction.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Subscriber select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Subscriber <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.neighborhood || 'Tétouan'} ({c.monthlyFee || 100} MAD/mo | Due: {c.nextDueDate})
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION 1: FLEXIBLE MONTHLY PRICING (DEFAULT 100 MAD + CUSTOM OVERRIDE) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>Base Monthly Subscription Fee</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Default: 100 MAD
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Adjust or override the monthly fee for special bandwidth agreements
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={baseFee}
                    onChange={(e) => setBaseFee(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500 transition pr-16"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                    MAD
                  </span>
                </div>

                {/* Quick override presets */}
                <div className="flex items-center gap-1.5">
                  {[100, 120, 150, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBaseFee(preset)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-mono font-semibold border transition ${
                        baseFee === preset
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurring rate update checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={updateRecurringRate}
                  onChange={(e) => setUpdateRecurringRate(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <span>
                  Update subscriber's permanent monthly rate to <strong className="text-white font-mono">{baseFee} MAD</strong> for future months
                </span>
              </label>
            </div>

            {/* SECTION 2: EXTRA CHARGES / AD-HOC ADJUSTMENTS */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>Extra Charges / Adjustments (Frais Supplémentaires)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Late payment fees, equipment replacement, speed boost, or prorated days
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
                      <span>Remove</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Add Extra Fee</span>
                    </>
                  )}
                </button>
              </div>

              {hasExtraCharges && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Extra Amount (MAD) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="5"
                          value={extraAmount}
                          onChange={(e) => setExtraAmount(Number(e.target.value))}
                          placeholder="e.g. 20"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500 transition pr-14"
                          required
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">
                          MAD
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Reason / Description <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={extraReason}
                        onChange={(e) => setExtraReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                      >
                        {EXTRA_FEE_PRESETS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {extraReason === 'Custom adjustment' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Specify custom reason (e.g., Installation 2nd access point)..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  )}

                  {/* Quick fee buttons */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>Quick:</span>
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setExtraAmount(amt)}
                        className={`px-2 py-0.5 rounded border text-[11px] font-mono transition ${
                          extraAmount === amt
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
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
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-blue-500/30 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  Itemized Invoice Calculation
                </span>
                <span className="font-mono text-cyan-400 text-[11px]">Auto-Calculated</span>
              </div>

              <div className="divide-y divide-slate-800/60 py-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 pt-1">
                  <span>Base Monthly Subscription:</span>
                  <span className="font-mono font-bold text-white">
                    {baseFee || 100} MAD
                  </span>
                </div>

                {hasExtraCharges && effectiveExtra > 0 && (
                  <div className="flex items-center justify-between text-blue-300 pt-1.5">
                    <span className="flex items-center gap-1">
                      <span>Extra Charges:</span>
                      <span className="text-[10px] text-slate-400 font-sans italic">
                        ({effectiveReason})
                      </span>
                    </span>
                    <span className="font-mono font-bold text-blue-400">
                      +{effectiveExtra} MAD
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Amount Due / To Collect
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Formula: Base ({baseFee || 100}) {hasExtraCharges && effectiveExtra > 0 ? `+ Extra (${effectiveExtra})` : ''}
                  </div>
                </div>
                <div className="text-right">
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
                  Payment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Extension Duration
                </label>
                <div className="flex gap-2">
                  {[30, 60, 90].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setExtendDays(days)}
                      className={`flex-1 py-2 text-xs rounded-xl border font-semibold transition ${
                        extendDays === days
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      +{days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Period Preview Banner */}
            {selectedClient && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Current Due:</span>
                    <span className="font-mono font-semibold text-amber-400">
                      {selectedClient.nextDueDate}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <div className="text-right">
                    <span className="text-slate-500 block">New Renewal Date (+{extendDays}d):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {computeNewDueDatePreview()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Channel Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Channel <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                    method === 'cash'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div>Cash (Espèces)</div>
                    <div className="text-[10px] text-slate-500">Main propre</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cih_bank')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                    method === 'cih_bank'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <div>
                    <div>CIH Mobile</div>
                    <div className="text-[10px] text-slate-500">Virement instantané</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('bank_transfer')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                    method === 'bank_transfer'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <div>
                    <div>Bank Transfer</div>
                    <div className="text-[10px] text-slate-500">Attijari / BMCE</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('wafacash')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition text-left cursor-pointer ${
                    method === 'wafacash'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div>Wafacash / CashPlus</div>
                    <div className="text-[10px] text-slate-500">Agence de transfert</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Notes / Ref */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="Ex: Reçu par Omar / Ref virement #88391"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-900/40 transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Confirm & Generate Invoice ({totalAmount} MAD)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
